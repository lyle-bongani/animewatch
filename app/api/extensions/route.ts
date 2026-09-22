import { NextResponse } from "next/server";
import { DEFAULT_EXTENSION_REPOS, POPULAR_MANGA_SOURCES, syncExtensionRepo } from "@/lib/extensions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const repoUrl = searchParams.get("repoUrl") || DEFAULT_EXTENSION_REPOS[0].url;

  try {
    const result = await syncExtensionRepo(repoUrl);
    return NextResponse.json({
      success: true,
      repoUrl,
      sourcesCount: result.count,
      sources: result.sources,
      defaultRepos: DEFAULT_EXTENSION_REPOS,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to sync extension repository",
        sources: POPULAR_MANGA_SOURCES,
        defaultRepos: DEFAULT_EXTENSION_REPOS,
      },
      { status: 500 }
    );
  }
}
