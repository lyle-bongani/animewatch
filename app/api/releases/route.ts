import { NextResponse } from "next/server";
import {
  classifyAudioTrack,
  classifyFormat,
  classifyQuality,
  classifyReleaseGroup,
  buildMagnetLink,
  type AnimeRelease,
  type ReleaseGroupType,
} from "@/lib/animeReleases";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");
  const episode = searchParams.get("episode");
  const groupFilter = searchParams.get("group") as ReleaseGroupType | null;
  const isBatchOnly = searchParams.get("batch") === "true";

  if (!title) {
    return NextResponse.json({ error: "Missing title parameter" }, { status: 400 });
  }

  // Construct search query for Nyaa RSS
  let query = title.trim();
  if (groupFilter && groupFilter !== "general") {
    const groupNameMap: Record<string, string> = {
      subsplease: "SubsPlease",
      "erai-raws": "Erai-raws",
      judas: "Judas",
      ember: "EMBER",
      ndk: "NanDesuKa",
    };
    const grpName = groupNameMap[groupFilter] || groupFilter;
    query = `${grpName} ${title}`;
  }

  if (isBatchOnly) {
    query += " batch";
  }

  try {
    const rssUrl = `https://nyaa.si/?page=rss&q=${encodeURIComponent(query)}&c=1_2`;
    const res = await fetch(rssUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      next: { revalidate: 180 }, // Cache for 3 minutes
    });

    if (!res.ok) {
      return NextResponse.json(
        { releases: [], message: `Failed to fetch from release tracker (HTTP ${res.status})` },
        { status: 200 }
      );
    }

    const xml = await res.text();
    const items = xml.split("<item>").slice(1);

    const releases: AnimeRelease[] = [];

    for (let i = 0; i < items.length; i++) {
      const itemStr = items[i];
      const titleMatch = itemStr.match(/<title>(.*?)<\/title>/);
      const hashMatch = itemStr.match(/<nyaa:infoHash>(.*?)<\/nyaa:infoHash>/);
      const sizeMatch = itemStr.match(/<nyaa:size>(.*?)<\/nyaa:size>/);
      const seedsMatch = itemStr.match(/<nyaa:seeders>(.*?)<\/nyaa:seeders>/);
      const leechsMatch = itemStr.match(/<nyaa:leechers>(.*?)<\/nyaa:leechers>/);
      const linkMatch = itemStr.match(/<link>(.*?)<\/link>/);
      const guidMatch = itemStr.match(/<guid[^>]*>(.*?)<\/guid>/);

      if (!titleMatch || !hashMatch) continue;

      const itemTitle = titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim();
      const infoHash = hashMatch[1].trim();
      const size = sizeMatch ? sizeMatch[1].trim() : "Unknown";
      const seeders = seedsMatch ? parseInt(seedsMatch[1], 10) : undefined;
      const leechers = leechsMatch ? parseInt(leechsMatch[1], 10) : undefined;
      const torrentUrl = linkMatch ? linkMatch[1].trim() : `https://nyaa.si/download/${infoHash}.torrent`;
      const pageUrl = guidMatch ? guidMatch[1].trim() : `https://nyaa.si/view/${infoHash}`;

      const groupInfo = classifyReleaseGroup(itemTitle);
      const audioInfo = classifyAudioTrack(itemTitle);
      const quality = classifyQuality(itemTitle);
      const format = classifyFormat(itemTitle);
      const magnetUrl = buildMagnetLink(infoHash, itemTitle);
      const isBatch = itemTitle.toLowerCase().includes("batch") || itemTitle.toLowerCase().includes("season");

      // Filter by requested episode if provided (unless it's a batch)
      if (episode && !isBatchOnly && !isBatch) {
        const epPadded = episode.padStart(2, "0");
        const epRegex = new RegExp(`(?:e|ep|episode|\\s|-)${episode}|${epPadded}\\b`, "i");
        // Skip if episode clearly doesn't match and title contains standard episode markers
        if (itemTitle.match(/S\d+E\d+/i) || itemTitle.match(/-\s*\d+/i)) {
          if (!epRegex.test(itemTitle)) {
            continue;
          }
        }
      }

      releases.push({
        id: infoHash || String(i),
        title: itemTitle,
        group: groupInfo.groupName,
        groupType: groupInfo.groupType,
        groupBadge: groupInfo.badge,
        groupColor: groupInfo.color,
        audio: audioInfo.audio,
        audioColor: audioInfo.color,
        quality,
        format,
        size,
        seeders,
        leechers,
        infoHash,
        magnetUrl,
        torrentUrl,
        pageUrl,
        isBatch,
      });
    }

    return NextResponse.json({
      releases,
      total: releases.length,
      query,
    });
  } catch (err) {
    console.error("Error resolving anime releases:", err);
    return NextResponse.json(
      { releases: [], message: "Internal server error fetching releases" },
      { status: 500 }
    );
  }
}
