export interface GenreMeta {
  name: string;
  slug: string;
  tag: string;
  description: string;
  featured?: boolean;
  href: string;
}

export const ALL_GENRES: GenreMeta[] = [
  { name: "Isekai", slug: "Isekai", tag: "Other World", description: "Transported or reincarnated into an alternate fantasy realm.", featured: true, href: "/isekai" },
  { name: "Donghua", slug: "Donghua", tag: "Chinese Anime", description: "Chinese 3D and 2D animation, cultivation sagas, and martial arts.", featured: true, href: "/donghua" },
  { name: "Ecchi", slug: "Ecchi", tag: "Mature / Fanservice", description: "Playful fanservice, spicy comedy, and mature themes.", featured: true, href: "/search?genre=Ecchi" },
  { name: "Harem", slug: "Harem", tag: "Multi-Romance", description: "Protagonists surrounded by multiple romantic suitors and rivals.", featured: true, href: "/search?genre=Harem" },
  { name: "Fantasy", slug: "Fantasy", tag: "Magic & Lore", description: "Mythical lands, swords, magic spells, and legendary creatures.", featured: true, href: "/search?genre=Fantasy" },
  { name: "Action", slug: "Action", tag: "Combat & Fights", description: "High-octane fights, dynamic martial arts, and epic battles.", featured: true, href: "/search?genre=Action" },
  { name: "Adventure", slug: "Adventure", tag: "Quests", description: "Epic journeys, wilderness exploration, and grand quests.", href: "/search?genre=Adventure" },
  { name: "Comedy", slug: "Comedy", tag: "Humor", description: "Laugh-out-loud humor, hilarious parodies, and fun antics.", href: "/search?genre=Comedy" },
  { name: "Demons", slug: "Demons", tag: "Dark Fantasy", description: "Underworld beings, exorcists, demonic pacts, and dark lore.", href: "/search?genre=Demons" },
  { name: "Drama", slug: "Drama", tag: "Emotional", description: "Emotionally charged plots, deep relationships, and heartfelt struggles.", href: "/search?genre=Drama" },
  { name: "Historical", slug: "Historical", tag: "Period", description: "Feudal eras, samurai clans, historic wars, and ancient dynasties.", href: "/search?genre=Historical" },
  { name: "Horror", slug: "Horror", tag: "Suspense", description: "Spine-chilling terror, macabre mysteries, and eerie survival.", href: "/search?genre=Horror" },
  { name: "Josei", slug: "Josei", tag: "Adult Women", description: "Mature romance, adult life realities, and sophisticated drama.", href: "/search?genre=Josei" },
  { name: "Magic", slug: "Magic", tag: "Arcane", description: "Ancient spells, wizard academies, grimoires, and arcane arts.", href: "/search?genre=Magic" },
  { name: "Mahou Shoujo", slug: "Mahou Shoujo", tag: "Magical Girl", description: "Magical girl transformations, celestial power, and destiny.", href: "/search?genre=Mahou+Shoujo" },
  { name: "Martial Arts", slug: "Martial Arts", tag: "Combat Arts", description: "Kung fu, hand-to-hand combat, dojo rivalries, and martial mastery.", href: "/search?genre=Martial+Arts" },
  { name: "Mecha", slug: "Mecha", tag: "Robots", description: "Giant armored robots, high-tech war machines, and cockpit pilots.", href: "/search?genre=Mecha" },
  { name: "Military", slug: "Military", tag: "Tactical", description: "Armed conflicts, tactical warfare, commanders, and soldiers.", href: "/search?genre=Military" },
  { name: "Music", slug: "Music", tag: "Idols & Bands", description: "Bands, idols, classical mastery, and stage performances.", href: "/search?genre=Music" },
  { name: "Mystery", slug: "Mystery", tag: "Detective", description: "Detectives, suspense, unsolved crimes, and clever clues.", href: "/search?genre=Mystery" },
  { name: "Parody", slug: "Parody", tag: "Satire", description: "Satire, pop-culture mockery, and absurd comedic tropes.", href: "/search?genre=Parody" },
  { name: "Psychological", slug: "Psychological", tag: "Mind Games", description: "Mind games, moral crises, mental duels, and plot twists.", href: "/search?genre=Psychological" },
  { name: "Romance", slug: "Romance", tag: "Love Stories", description: "Love stories, romantic chemistry, courtship, and emotional warmth.", href: "/search?genre=Romance" },
  { name: "School", slug: "School", tag: "Campus Life", description: "High school youth, club adventures, friendships, and exams.", href: "/search?genre=School" },
  { name: "Sci-Fi", slug: "Sci-Fi", tag: "Futuristic", description: "Cyberpunk, space travel, AI, futuristic cities, and aliens.", href: "/search?genre=Sci-Fi" },
  { name: "Seinen", slug: "Seinen", tag: "Adult Men", description: "Dark narratives, psychological depth, and complex adult themes.", href: "/search?genre=Seinen" },
  { name: "Shoujo", slug: "Shoujo", tag: "Young Women", description: "Delicate romance, blossoming youth, and emotional bonds.", href: "/search?genre=Shoujo" },
  { name: "Shounen", slug: "Shounen", tag: "Heroic", description: "Friendship, hard work, inspiring heroes, and power-ups.", href: "/search?genre=Shounen" },
  { name: "Slice of Life", slug: "Slice of Life", tag: "Daily Life", description: "Comforting day-to-day moments, relaxing friendships, and warmth.", href: "/search?genre=Slice+of+Life" },
  { name: "Space", slug: "Space", tag: "Cosmic", description: "Intergalactic fleets, space exploration, and star voyages.", href: "/search?genre=Space" },
  { name: "Sports", slug: "Sports", tag: "Athletics", description: "Athletic rivalries, team tournaments, perseverance, and triumph.", href: "/search?genre=Sports" },
  { name: "Super Power", slug: "Super Power", tag: "Superhuman", description: "Superheroes, mutations, energy blasts, and superhuman abilities.", href: "/search?genre=Super+Power" },
  { name: "Supernatural", slug: "Supernatural", tag: "Spiritual", description: "Spirits, curses, deities, ghosts, and esoteric powers.", href: "/search?genre=Supernatural" },
  { name: "Thriller", slug: "Thriller", tag: "High Stakes", description: "Edge-of-your-seat suspense, ticking clocks, and high stakes.", href: "/search?genre=Thriller" },
  { name: "Vampire", slug: "Vampire", tag: "Gothic", description: "Bloodlines, gothic crypts, immortal aristocrats, and hunters.", href: "/search?genre=Vampire" },
];

export const GENRES = ALL_GENRES.map((g) => g.name);

export const FORMATS = [
  { value: "TV", label: "TV Show" },
  { value: "MOVIE", label: "Movie" },
  { value: "TV_SHORT", label: "TV Short" },
  { value: "SPECIAL", label: "Special" },
  { value: "OVA", label: "OVA" },
  { value: "ONA", label: "ONA" },
  { value: "MUSIC", label: "Music Video" },
];

export const STATUSES = [
  { value: "FINISHED", label: "Finished" },
  { value: "RELEASING", label: "Airing" },
  { value: "NOT_YET_RELEASED", label: "Upcoming" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "HIATUS", label: "Hiatus" },
];

export const SEASONS = ["WINTER", "SPRING", "SUMMER", "FALL"];

export const SORTS = [
  { value: "POPULARITY_DESC", label: "Popularity" },
  { value: "SCORE_DESC", label: "Average Score" },
  { value: "TRENDING_DESC", label: "Trending" },
  { value: "START_DATE_DESC", label: "Release Date" },
  { value: "UPDATED_AT_DESC", label: "Recently Updated" },
];
