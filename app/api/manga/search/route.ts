import { NextResponse } from "next/server";
import { searchAsura } from "@/lib/asura";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchAsura(q);
    return NextResponse.json({ results });
  } catch (err) {
    console.error("Manga search route error:", err);
    return NextResponse.json({ results: [], error: "Search failed" }, { status: 500 });
  }
}
