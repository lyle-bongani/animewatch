import { NextResponse } from "next/server";
import { searchAnime } from "@/lib/anilist";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }
  const { media } = await searchAnime(q, 1, 8);
  return NextResponse.json({ results: media });
}
