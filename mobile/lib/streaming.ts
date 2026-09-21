export interface StreamServer {
  name: string;
  url: string;
  type: "embed" | "hls" | "mp4";
}

export function getAnimeStreamSources(id: number | string, episode = 1): StreamServer[] {
  return [
    {
      name: "Server Alpha (HD)",
      url: `https://vidsrc.to/embed/anime/${id}/${episode}`,
      type: "embed",
    },
    {
      name: "Server Mega (Embed)",
      url: `https://2embed.cc/embed/${id}/${episode}`,
      type: "embed",
    },
    {
      name: "Server Nova (Multi-Sub)",
      url: `https://autoembed.to/anime/${id}/${episode}`,
      type: "embed",
    },
  ];
}
