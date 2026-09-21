import AsyncStorage from "@react-native-async-storage/async-storage";
import type { WatchlistItem, WatchHistoryItem } from "./types";

const WATCHLIST_KEY = "@animewatch:watchlist";
const HISTORY_KEY = "@animewatch:history";
const ADULT_KEY = "@animewatch:adult_unlocked";

export async function getWatchlist(): Promise<WatchlistItem[]> {
  try {
    const raw = await AsyncStorage.getItem(WATCHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function addToWatchlist(item: Omit<WatchlistItem, "updatedAt">): Promise<void> {
  try {
    const list = await getWatchlist();
    const filtered = list.filter((i) => String(i.id) !== String(item.id));
    filtered.unshift({ ...item, updatedAt: Date.now() });
    await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error("Error adding to watchlist", e);
  }
}

export async function removeFromWatchlist(id: string | number): Promise<void> {
  try {
    const list = await getWatchlist();
    const filtered = list.filter((i) => String(i.id) !== String(id));
    await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error("Error removing from watchlist", e);
  }
}

export async function isInWatchlist(id: string | number): Promise<boolean> {
  try {
    const list = await getWatchlist();
    return list.some((i) => String(i.id) !== "" && String(i.id) === String(id));
  } catch {
    return false;
  }
}

export async function getHistory(): Promise<WatchHistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function recordHistory(item: Omit<WatchHistoryItem, "watchedAt">): Promise<void> {
  try {
    const list = await getHistory();
    const filtered = list.filter((i) => String(i.id) !== String(item.id));
    filtered.unshift({ ...item, watchedAt: Date.now() });
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(filtered.slice(0, 50)));
  } catch (e) {
    console.error("Error saving history", e);
  }
}

export async function clearHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.error("Error clearing history", e);
  }
}

export async function getAdultUnlocked(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(ADULT_KEY);
    return val === "true";
  } catch {
    return false;
  }
}

export async function setAdultUnlocked(unlocked: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(ADULT_KEY, unlocked ? "true" : "false");
  } catch (e) {
    console.error("Error setting adult gate", e);
  }
}
