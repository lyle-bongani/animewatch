import AsyncStorage from "@react-native-async-storage/async-storage";

export type LibraryCategory = "reading" | "plan_to_read" | "completed" | "on_hold" | "dropped";

export interface MihonLibraryItem {
  id: string; // slug or anime id
  type: "manga" | "anime";
  title: string;
  cover: string;
  category: LibraryCategory;
  lastReadChapterOrEp?: string;
  lastReadPage?: number;
  totalChaptersOrEps?: number;
  unreadCount?: number;
  updatedAt: number;
}

export interface MihonHistoryItem {
  id: string;
  type: "manga" | "anime";
  title: string;
  cover: string;
  chapterOrEp: string;
  progress?: string;
  readAt: number;
}

export interface MihonUpdateItem {
  id: string;
  type: "manga" | "anime";
  title: string;
  cover: string;
  chapterOrEp: string;
  releasedAt: string;
}

export interface ReaderSettings {
  readingMode: "webtoon" | "paged_ltr" | "paged_rtl";
  backgroundColor: "black" | "dark_gray" | "white";
  cropBorders: boolean;
}

const LIBRARY_KEY = "@mihon:library";
const READ_CHAPTERS_KEY = "@mihon:read_chapters";
const BOOKMARKED_CHAPTERS_KEY = "@mihon:bookmarked_chapters";
const HISTORY_KEY = "@mihon:history";
const SETTINGS_KEY = "@mihon:reader_settings";

// --- Library Functions ---

export async function getMihonLibrary(): Promise<MihonLibraryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(LIBRARY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveMihonLibraryItem(
  item: Omit<MihonLibraryItem, "updatedAt">
): Promise<void> {
  try {
    const list = await getMihonLibrary();
    const filtered = list.filter((i) => i.id !== item.id);
    filtered.unshift({ ...item, updatedAt: Date.now() });
    await AsyncStorage.setItem(LIBRARY_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error("Error saving library item", e);
  }
}

export async function removeMihonLibraryItem(id: string): Promise<void> {
  try {
    const list = await getMihonLibrary();
    const filtered = list.filter((i) => i.id !== id);
    await AsyncStorage.setItem(LIBRARY_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error("Error removing library item", e);
  }
}

export async function getMihonLibraryItem(id: string): Promise<MihonLibraryItem | null> {
  try {
    const list = await getMihonLibrary();
    return list.find((i) => i.id === id) || null;
  } catch {
    return null;
  }
}

export async function updateLibraryCategory(
  id: string,
  category: LibraryCategory
): Promise<void> {
  try {
    const list = await getMihonLibrary();
    const item = list.find((i) => i.id === id);
    if (item) {
      item.category = category;
      item.updatedAt = Date.now();
      await AsyncStorage.setItem(LIBRARY_KEY, JSON.stringify(list));
    }
  } catch (e) {
    console.error("Error updating library category", e);
  }
}

// --- Read & Bookmarked Chapters (Mihon Read Indicators) ---

export async function getReadChapters(seriesId: string): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(`${READ_CHAPTERS_KEY}:${seriesId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function markChapterRead(
  seriesId: string,
  chapterNum: string,
  isRead = true
): Promise<void> {
  try {
    const list = await getReadChapters(seriesId);
    let updated: string[];
    if (isRead) {
      updated = Array.from(new Set([...list, String(chapterNum)]));
    } else {
      updated = list.filter((c) => c !== String(chapterNum));
    }
    await AsyncStorage.setItem(`${READ_CHAPTERS_KEY}:${seriesId}`, JSON.stringify(updated));
  } catch (e) {
    console.error("Error marking chapter read", e);
  }
}

export async function getBookmarkedChapters(seriesId: string): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(`${BOOKMARKED_CHAPTERS_KEY}:${seriesId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function toggleChapterBookmark(
  seriesId: string,
  chapterNum: string
): Promise<boolean> {
  try {
    const list = await getBookmarkedChapters(seriesId);
    const exists = list.includes(String(chapterNum));
    const updated = exists
      ? list.filter((c) => c !== String(chapterNum))
      : [...list, String(chapterNum)];
    await AsyncStorage.setItem(`${BOOKMARKED_CHAPTERS_KEY}:${seriesId}`, JSON.stringify(updated));
    return !exists;
  } catch {
    return false;
  }
}

// --- History Functions ---

export async function getMihonHistory(): Promise<MihonHistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function recordMihonHistory(item: Omit<MihonHistoryItem, "readAt">): Promise<void> {
  try {
    const list = await getMihonHistory();
    const filtered = list.filter((i) => !(i.id === item.id && i.chapterOrEp === item.chapterOrEp));
    filtered.unshift({ ...item, readAt: Date.now() });
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(filtered.slice(0, 100)));

    // Also update library item last read progress if present
    const libList = await getMihonLibrary();
    const libItem = libList.find((i) => i.id === item.id);
    if (libItem) {
      libItem.lastReadChapterOrEp = item.chapterOrEp;
      libItem.updatedAt = Date.now();
      await AsyncStorage.setItem(LIBRARY_KEY, JSON.stringify(libList));
    }
  } catch (e) {
    console.error("Error recording history", e);
  }
}

export async function clearMihonHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.error("Error clearing history", e);
  }
}

export async function removeMihonHistoryItem(id: string, chapterOrEp: string): Promise<void> {
  try {
    const list = await getMihonHistory();
    const filtered = list.filter((i) => !(i.id === id && i.chapterOrEp === chapterOrEp));
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error("Error removing history item", e);
  }
}

// --- Reader Settings ---

const DEFAULT_READER_SETTINGS: ReaderSettings = {
  readingMode: "webtoon",
  backgroundColor: "black",
  cropBorders: false,
};

export async function getReaderSettings(): Promise<ReaderSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_READER_SETTINGS, ...JSON.parse(raw) } : DEFAULT_READER_SETTINGS;
  } catch {
    return DEFAULT_READER_SETTINGS;
  }
}

export async function saveReaderSettings(settings: Partial<ReaderSettings>): Promise<void> {
  try {
    const current = await getReaderSettings();
    const merged = { ...current, ...settings };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
  } catch (e) {
    console.error("Error saving reader settings", e);
  }
}
