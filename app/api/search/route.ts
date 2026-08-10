import { NextResponse } from "next/server";
import { searchAnime } from "@/lib/anilist";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const ep = url.searchParams.get("ep")?.trim() ?? "";
  const mode = url.searchParams.get("mode") ?? "";

  // Dynamic LuciferDonghua resolver mode
  if (mode === "lucifer" && q) {
    try {
      const searchUrl = `https://luciferdonghua.org/?s=${encodeURIComponent(q + (ep ? " episode " + ep : ""))}`;
      const searchRes = await fetch(searchUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        next: { revalidate: 1800 },
      });

      if (!searchRes.ok) return NextResponse.json({ servers: [] });
      const searchHtml = await searchRes.text();

      const linkMatches = Array.from(searchHtml.matchAll(/href=["'](https:\/\/luciferdonghua\.org\/[^"']*episode[^"']*)["']/gi));
      if (linkMatches.length === 0) return NextResponse.json({ servers: [] });

      let targetLink = linkMatches[0][1];
      if (ep) {
        for (const m of linkMatches) {
          if (m[1].includes(`episode-${ep}-`) || m[1].includes(`episod-${ep}-`)) {
            targetLink = m[1];
            break;
          }
        }
      }

      const epRes = await fetch(targetLink, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        next: { revalidate: 3600 },
      });

      if (!epRes.ok) return NextResponse.json({ servers: [] });
      const epHtml = await epRes.text();

      const optionMatches = Array.from(epHtml.matchAll(/<option[\s\S]*?value=["']([\s\S]*?)["'][^>]*>([\s\S]*?)<\/option>/gi));
      const servers: { label: string; embedUrl: string }[] = [];

      for (const [, base64Val, labelRaw] of optionMatches) {
        const cleaned = base64Val.replace(/\s+/g, "").trim();
        if (!cleaned) continue;
        try {
          const decodedHtml = Buffer.from(cleaned, "base64").toString("utf-8");
          const srcMatch = decodedHtml.match(/src=["']([^"']+)["']/i);
          let src = srcMatch ? srcMatch[1] : null;
          if (src && src.startsWith("//")) src = "https:" + src;
          const label = labelRaw.replace(/<[^>]+>/g, "").trim();
          if (src && label) {
            servers.push({ label, embedUrl: src });
          }
        } catch (e) {
          /* ignore non-base64 */
        }
      }

      return NextResponse.json({ servers, episodeUrl: targetLink });
    } catch (err) {
      console.error("Lucifer resolver error:", err);
      return NextResponse.json({ servers: [] });
    }
  }

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }
  const { media } = await searchAnime(q, 1, 8);
  return NextResponse.json({ results: media });
}
