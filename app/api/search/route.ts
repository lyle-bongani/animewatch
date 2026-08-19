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
      const searchUrl = `https://luciferdonghua.org/?s=${encodeURIComponent(q)}`;
      const searchRes = await fetch(searchUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        next: { revalidate: 1800 },
      });

      if (!searchRes.ok) return NextResponse.json({ servers: [] });
      const searchHtml = await searchRes.text();

      // Find all anime series pages: /anime/{slug}/
      const seriesMatches = Array.from(
        searchHtml.matchAll(/href=["'](https:\/\/luciferdonghua\.org\/anime\/[^"']+)["']/gi)
      ).map((m) => m[1]);
      const uniqueSeries = Array.from(new Set(seriesMatches));

      let targetEpUrl: string | null = null;

      // 1. Search series pages first to find matching episode
      for (const seriesUrl of uniqueSeries.slice(0, 3)) {
        try {
          const seriesRes = await fetch(seriesUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
            next: { revalidate: 3600 },
          });
          if (!seriesRes.ok) continue;
          const seriesHtml = await seriesRes.text();

          // Parse eplister: <li ...><a href="...">...<div class="epl-num">X</div>...</a></li>
          const liMatches = Array.from(
            seriesHtml.matchAll(
              /<li[^>]*>\s*<a href=["']([^"']+)["'][\s\S]*?<div class=["']epl-num["']>(\d+)<\/div>/gi
            )
          );

          if (ep) {
            const matched = liMatches.find((m) => m[2] === String(ep));
            if (matched) {
              targetEpUrl = matched[1];
              break;
            }
          } else if (liMatches.length > 0) {
            targetEpUrl = liMatches[0][1];
            break;
          }
        } catch {
          // ignore series fetch error
        }
      }

      // 2. Direct episode link fallback if not found in series page
      if (!targetEpUrl) {
        const directMatches = Array.from(
          searchHtml.matchAll(
            /href=["'](https:\/\/luciferdonghua\.org\/[^"']*episode[^"']*)["']/gi
          )
        ).map((m) => m[1]);

        if (ep) {
          targetEpUrl =
            directMatches.find(
              (u) =>
                u.includes(`episode-${ep}-`) ||
                u.includes(`episod-${ep}-`) ||
                u.endsWith(`episode-${ep}/`)
            ) || directMatches[0] || null;
        } else {
          targetEpUrl = directMatches[0] || null;
        }
      }

      if (!targetEpUrl) return NextResponse.json({ servers: [] });

      const epRes = await fetch(targetEpUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        next: { revalidate: 3600 },
      });

      if (!epRes.ok) return NextResponse.json({ servers: [] });
      const epHtml = await epRes.text();

      const optionMatches = Array.from(
        epHtml.matchAll(
          /<option[\s\S]*?value=["']([\s\S]*?)["'][^>]*>([\s\S]*?)<\/option>/gi
        )
      );
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
          if (src && label && !label.toLowerCase().includes("select")) {
            servers.push({ label, embedUrl: src });
          }
        } catch {
          /* ignore non-base64 */
        }
      }

      return NextResponse.json({ servers, episodeUrl: targetEpUrl });
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
