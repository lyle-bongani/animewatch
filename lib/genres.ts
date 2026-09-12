export interface GenreMeta {
  name: string;
  slug: string;
  tag: string;
  description: string;
  featured?: boolean;
  href: string;
}

export const ALL_GENRES: GenreMeta[] = [
  // Core & Featured Categories
  { name: "Action", slug: "Action", tag: "Action", description: "High-octane fights, dynamic martial arts, and epic battles.", featured: true, href: "/search?genre=Action" },
  { name: "Fantasy", slug: "Fantasy", tag: "Fantasy", description: "Mythical lands, swords, magic spells, and legendary creatures.", featured: true, href: "/search?genre=Fantasy" },
  { name: "Drama", slug: "Drama", tag: "Emotional", description: "Emotionally charged plots, deep relationships, and heartfelt struggles.", featured: true, href: "/search?genre=Drama" },
  { name: "Slice of Life", slug: "Slice of Life", tag: "Daily Life", description: "Comforting day-to-day moments, relaxing friendships, and warmth.", featured: true, href: "/search?genre=Slice+of+Life" },
  { name: "Adventure", slug: "Adventure", tag: "Exploration", description: "Epic journeys, wilderness exploration, and grand quests.", featured: true, href: "/search?genre=Adventure" },
  { name: "Comedy", slug: "Comedy", tag: "Humor", description: "Laugh-out-loud humor, hilarious parodies, and fun antics.", featured: true, href: "/search?genre=Comedy" },
  { name: "Romance", slug: "Romance", tag: "Love", description: "Love stories, romantic chemistry, courtship, and emotional warmth.", featured: true, href: "/search?genre=Romance" },
  { name: "Sci-Fi", slug: "Sci-Fi", tag: "Science Fiction", description: "Futuristic technology, space travel, AI, and scientific discoveries.", featured: true, href: "/search?genre=Sci-Fi" },
  { name: "Isekai", slug: "Isekai", tag: "Other World", description: "Transported or reincarnated into an alternate fantasy realm.", featured: true, href: "/isekai" },
  { name: "Donghua", slug: "Donghua", tag: "Chinese Anime", description: "Chinese 3D and 2D animation, cultivation sagas, and martial arts.", featured: true, href: "/donghua" },
  { name: "Ecchi", slug: "Ecchi", tag: "Humor", description: "Cheeky humor and playful situations.", href: "/search?genre=Ecchi" },
  { name: "Erotica", slug: "Erotica", tag: "Romance", description: "Sensual narratives and adult romance.", href: "/search?genre=Erotica" },
  { name: "Mature", slug: "Mature", tag: "Realism", description: "Grit, graphic realism, and mature themes.", href: "/search?genre=Mature" },
  { name: "Harem", slug: "Harem", tag: "Romance", description: "A lead surrounded by multiple romantic interests.", href: "/search?genre=Harem" },
  { name: "Reverse Harem", slug: "Reverse Harem", tag: "Female Lead", description: "A female protagonist pursued by several attractive suitors.", href: "/search?genre=Reverse+Harem" },

  // Full A-Z Genre & Theme Directory
  { name: "Aliens", slug: "Aliens", tag: "Extraterrestrial", description: "Extraterrestrial beings, invasions, and cosmic encounters.", href: "/search?genre=Aliens" },
  { name: "Anthro", slug: "Anthro", tag: "Animal Characters", description: "Anthropomorphic animal characters and beast-folk societies.", href: "/search?genre=Anthro" },
  { name: "Avant Garde", slug: "Avant Garde", tag: "Experimental", description: "Surreal imagery, abstract concepts, and experimental art.", href: "/search?genre=Avant+Garde" },
  { name: "Award Winning", slug: "Award Winning", tag: "Critically Acclaimed", description: "Critically acclaimed masterworks and festival prize winners.", href: "/search?genre=Award+Winning" },
  { name: "Boys Love", slug: "Boys Love", tag: "BL", description: "Romantic and affectionate bonds between male leads.", href: "/search?genre=Boys+Love" },
  { name: "Cars", slug: "Cars", tag: "Vehicles", description: "Automobile racing, drifting, tuners, and high-speed motorsport.", href: "/search?genre=Cars" },
  { name: "Comedy", slug: "Comedy", tag: "Humor", description: "Laugh-out-loud humor, hilarious parodies, and fun antics.", href: "/search?genre=Comedy" },
  { name: "Cooking", slug: "Cooking", tag: "Culinary", description: "Delicious gastronomy, gourmet battles, and culinary mastery.", href: "/search?genre=Cooking" },
  { name: "Crime", slug: "Crime", tag: "Underworld", description: "Underworld syndicates, heists, mafias, and criminal investigations.", href: "/search?genre=Crime" },
  { name: "Cultivation", slug: "Cultivation", tag: "Daoist Mastery", description: "Ascension to godhood through spiritual qi and Daoist training.", href: "/search?genre=Cultivation" },
  { name: "Cyberpunk", slug: "Cyberpunk", tag: "High-Tech Low-Life", description: "Neon dystopias, cyborg augmentations, and AI megacorporations.", href: "/search?genre=Cyberpunk" },
  { name: "Delinquents", slug: "Delinquents", tag: "Rebels", description: "Rebellious youths, street gangs, and brawl rivalries.", href: "/search?genre=Delinquents" },
  { name: "Dementia", slug: "Dementia", tag: "Mind Bending", description: "Psychological distortion, paranoia, and fragmented realities.", href: "/search?genre=Dementia" },
  { name: "Demons", slug: "Demons", tag: "Supernatural", description: "Underworld beings, exorcists, demonic pacts, and dark lore.", href: "/search?genre=Demons" },
  { name: "Detective", slug: "Detective", tag: "Investigation", description: "Clever sleuths, crime solving, and deducing mysterious cases.", href: "/search?genre=Detective" },
  { name: "Drama", slug: "Drama", tag: "Emotional", description: "Emotionally charged plots, deep relationships, and heartfelt struggles.", href: "/search?genre=Drama" },
  { name: "Family", slug: "Family", tag: "Kinship", description: "Heartwarming parent-child relationships and household dynamics.", href: "/search?genre=Family" },
  { name: "Game", slug: "Game", tag: "Gaming", description: "Card tournaments, board strategies, and high-stakes matches.", href: "/search?genre=Game" },
  { name: "Gender Bender", slug: "Gender Bender", tag: "Identity", description: "Body swaps, disguises, and gender transformations.", href: "/search?genre=Gender+Bender" },
  { name: "Girls Love", slug: "Girls Love", tag: "GL", description: "Delicate romance and affectionate bonds between female leads.", href: "/search?genre=Girls+Love" },
  { name: "Gothic", slug: "Gothic", tag: "Dark Victorian", description: "Victorian aesthetics, haunted manors, and dark romanticism.", href: "/search?genre=Gothic" },
  { name: "Gourmet", slug: "Gourmet", tag: "Food", description: "Sensory appreciation of fine dishes and restaurant life.", href: "/search?genre=Gourmet" },
  { name: "Healing", slug: "Healing", tag: "Soothing", description: "Gentle pacing, comforting vistas, and therapeutic tranquility.", href: "/search?genre=Healing" },
  { name: "Historical", slug: "Historical", tag: "Period", description: "Feudal eras, samurai clans, historic wars, and ancient dynasties.", href: "/search?genre=Historical" },
  { name: "Horror", slug: "Horror", tag: "Fear", description: "Spine-chilling terror, macabre mysteries, and eerie survival.", href: "/search?genre=Horror" },
  { name: "Idols", slug: "Idols", tag: "Performers", description: "Musical performers, choreography, concerts, and stardom.", href: "/search?genre=Idols" },
  { name: "Iyashikei", slug: "Iyashikei", tag: "Therapeutic", description: "Peaceful daily moments designed to heal the viewer's soul.", href: "/search?genre=Iyashikei" },
  { name: "Josei", slug: "Josei", tag: "Adult Women", description: "Mature romance, adult life realities, and sophisticated drama.", href: "/search?genre=Josei" },
  { name: "Kids", slug: "Kids", tag: "Children", description: "Wholesome, colorful fun suitable for young audiences.", href: "/search?genre=Kids" },
  { name: "Magic", slug: "Magic", tag: "Arcane", description: "Ancient spells, wizard academies, grimoires, and arcane arts.", href: "/search?genre=Magic" },
  { name: "Magical Girl", slug: "Magical Girl", tag: "Mahou Shoujo", description: "Magical girl transformations, celestial power, and destiny.", href: "/search?genre=Magical+Girl" },
  { name: "Martial Arts", slug: "Martial Arts", tag: "Combat", description: "Kung fu, hand-to-hand combat, dojo rivalries, and discipline.", href: "/search?genre=Martial+Arts" },
  { name: "Mecha", slug: "Mecha", tag: "Robots", description: "Giant armored robots, high-tech war machines, and cockpit pilots.", href: "/search?genre=Mecha" },
  { name: "Medical", slug: "Medical", tag: "Healthcare", description: "Surgeons, hospitals, emergency triage, and medical mysteries.", href: "/search?genre=Medical" },
  { name: "Military", slug: "Military", tag: "Tactical", description: "Armed conflicts, tactical warfare, commanders, and soldiers.", href: "/search?genre=Military" },
  { name: "Monsters", slug: "Monsters", tag: "Creatures", description: "Beasts, kaiju, monster tamers, and dangerous fauna.", href: "/search?genre=Monsters" },
  { name: "Music", slug: "Music", tag: "Soundtrack", description: "Orchestras, rock bands, vocalists, and musical growth.", href: "/search?genre=Music" },
  { name: "Mystery", slug: "Mystery", tag: "Enigma", description: "Detectives, suspense, unsolved crimes, and clever clues.", href: "/search?genre=Mystery" },
  { name: "Mythology", slug: "Mythology", tag: "Folklore", description: "Ancient deities, legendary pantheons, and folklore myths.", href: "/search?genre=Mythology" },
  { name: "Otaku", slug: "Otaku", tag: "Fandom", description: "Manga creators, gaming culture, conventions, and fan hobbies.", href: "/search?genre=Otaku" },
  { name: "Parody", slug: "Parody", tag: "Satire", description: "Satire, pop-culture mockery, and absurd comedic tropes.", href: "/search?genre=Parody" },
  { name: "Performing Arts", slug: "Performing Arts", tag: "Stage", description: "Theater, ballet, traditional instruments, and stagecraft.", href: "/search?genre=Performing+Arts" },
  { name: "Police", slug: "Police", tag: "Law Enforcement", description: "Officers, squad detectives, precincts, and criminal apprehensions.", href: "/search?genre=Police" },
  { name: "Post-Apocalyptic", slug: "Post-Apocalyptic", tag: "Wasteland", description: "Ruined civilizations, fallout survival, and rebuilding humanity.", href: "/search?genre=Post-Apocalyptic" },
  { name: "Psychological", slug: "Psychological", tag: "Mind Games", description: "Mind games, moral crises, mental duels, and plot twists.", href: "/search?genre=Psychological" },
  { name: "Racing", slug: "Racing", tag: "Speed", description: "Speed contests on asphalt, tracks, circuits, and velodromes.", href: "/search?genre=Racing" },
  { name: "Reincarnation", slug: "Reincarnation", tag: "Rebirth", description: "Reborn into a new life with past memories intact.", href: "/search?genre=Reincarnation" },
  { name: "Romance", slug: "Romance", tag: "Love", description: "Love stories, romantic chemistry, courtship, and emotional warmth.", href: "/search?genre=Romance" },
  { name: "Samurai", slug: "Samurai", tag: "Bushido", description: "Katanas, ronin, the way of the warrior, and feudal duels.", href: "/search?genre=Samurai" },
  { name: "School", slug: "School", tag: "Campus", description: "High school youth, club adventures, friendships, and exams.", href: "/search?genre=School" },
  { name: "Sci-Fi", slug: "Sci-Fi", tag: "Science Fiction", description: "Futuristic technology, space travel, AI, and scientific discoveries.", href: "/search?genre=Sci-Fi" },
  { name: "Seinen", slug: "Seinen", tag: "Adult Men", description: "Dark narratives, psychological depth, and complex adult themes.", href: "/search?genre=Seinen" },
  { name: "Shoujo", slug: "Shoujo", tag: "Young Women", description: "Delicate romance, blossoming youth, and emotional bonds.", href: "/search?genre=Shoujo" },
  { name: "Shounen", slug: "Shounen", tag: "Heroic", description: "Friendship, hard work, inspiring heroes, and power-ups.", href: "/search?genre=Shounen" },
  { name: "Slice of Life", slug: "Slice of Life", tag: "Daily Life", description: "Comforting day-to-day moments, relaxing friendships, and warmth.", href: "/search?genre=Slice+of+Life" },
  { name: "Space", slug: "Space", tag: "Cosmos", description: "Intergalactic fleets, space exploration, and star voyages.", href: "/search?genre=Space" },
  { name: "Sports", slug: "Sports", tag: "Athletics", description: "Athletic rivalries, team tournaments, perseverance, and triumph.", href: "/search?genre=Sports" },
  { name: "Super Power", slug: "Super Power", tag: "Abilities", description: "Superhuman gifts, energy blasts, and unnatural powers.", href: "/search?genre=Super+Power" },
  { name: "Superhero", slug: "Superhero", tag: "Justice", description: "Costumed champions defending society against villainy.", href: "/search?genre=Superhero" },
  { name: "Supernatural", slug: "Supernatural", tag: "Paranormal", description: "Spirits, curses, deities, ghosts, and esoteric powers.", href: "/search?genre=Supernatural" },
  { name: "Survival", slug: "Survival", tag: "Life or Death", description: "Desperate struggles against death games, wilderness, and calamity.", href: "/search?genre=Survival" },
  { name: "Suspense", slug: "Suspense", tag: "Tension", description: "Nail-biting tension, ticking clocks, and unpredictable turns.", href: "/search?genre=Suspense" },
  { name: "Swordplay", slug: "Swordplay", tag: "Blades", description: "Mastery of blades, sword dueling tournaments, and fencing.", href: "/search?genre=Swordplay" },
  { name: "Time Travel", slug: "Time Travel", tag: "Temporal", description: "Timeloops, altering timelines, and temporal paradoxes.", href: "/search?genre=Time+Travel" },
  { name: "Thriller", slug: "Thriller", tag: "High Stakes", description: "Edge-of-your-seat suspense, dangerous stakes, and conspiracy.", href: "/search?genre=Thriller" },
  { name: "Urban Fantasy", slug: "Urban Fantasy", tag: "Hidden Magic", description: "Magic and mythical creatures hidden within modern metropolises.", href: "/search?genre=Urban+Fantasy" },
  { name: "Vampire", slug: "Vampire", tag: "Bloodlines", description: "Bloodlines, gothic crypts, immortal aristocrats, and hunters.", href: "/search?genre=Vampire" },
  { name: "Video Game", slug: "Video Game", tag: "Virtual World", description: "MMORPG worlds, leveling systems, and trapped players.", href: "/search?genre=Video+Game" },
  { name: "Virtual Reality", slug: "Virtual Reality", tag: "VR", description: "Full-dive headsets, simulated universes, and digital avatars.", href: "/search?genre=Virtual+Reality" },
  { name: "War", slug: "War", tag: "Conflict", description: "Nation-state battles, battlefields, geopolitics, and soldiers.", href: "/search?genre=War" },
  { name: "Workplace", slug: "Workplace", tag: "Professional", description: "Office careers, adult professions, and corporate life.", href: "/search?genre=Workplace" },
  { name: "Wuxia", slug: "Wuxia", tag: "Martial Heroes", description: "Chinese traditional martial arts heroes, chivalry, and codes of honor.", href: "/search?genre=Wuxia" },
  { name: "Xianxia", slug: "Xianxia", tag: "Immortal Cultivation", description: "Chinese fantasy of Daoist immortals, spiritual beasts, and heavens.", href: "/search?genre=Xianxia" },
  { name: "Yaoi", slug: "Yaoi", tag: "Male Romance", description: "Explicit male-male romantic and passionate stories.", href: "/search?genre=Yaoi" },
  { name: "Yuri", slug: "Yuri", tag: "Female Romance", description: "Passionate female-female romance and affection.", href: "/search?genre=Yuri" },
  { name: "Zombies", slug: "Zombies", tag: "Undead", description: "Undead hordes, bio-apocalypses, and barricaded survival.", href: "/search?genre=Zombies" },
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
