export interface GenreItem {
  name: string;
  tag: string;
  featured?: boolean;
}

export const ALL_GENRES: GenreItem[] = [
  { name: "Action", tag: "High-octane fights & battles", featured: true },
  { name: "Adventure", tag: "Epic quests & expeditions", featured: true },
  { name: "Comedy", tag: "Hilarious & heartwarming", featured: true },
  { name: "Drama", tag: "Emotional & character-driven" },
  { name: "Fantasy", tag: "Magic, myths & otherworldly", featured: true },
  { name: "Horror", tag: "Dark, eerie & supernatural" },
  { name: "Mahou Shoujo", tag: "Magical girls & wonder" },
  { name: "Mecha", tag: "Giant robots & sci-fi warfare" },
  { name: "Music", tag: "Bands, idols & performances" },
  { name: "Mystery", tag: "Puzzles, suspense & crime" },
  { name: "Psychological", tag: "Mind games & psychological thrills" },
  { name: "Romance", tag: "Love stories & sweet couples", featured: true },
  { name: "Sci-Fi", tag: "Futuristic & cybernetic worlds", featured: true },
  { name: "Slice of Life", tag: "Cozy everyday life" },
  { name: "Sports", tag: "Tournaments & team spirit" },
  { name: "Supernatural", tag: "Spirits, curses & demons" },
  { name: "Thriller", tag: "High tension & survival" },
  { name: "Ecchi", tag: "Provocative & fanservice" },
  { name: "Harem", tag: "Multiple suitors & chaotic romances" },
  { name: "Isekai", tag: "Reincarnated into another world", featured: true },
  { name: "Hentai", tag: "18+ Adult content (Locked in Safe Mode)" },
];
