import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  clearHistory,
  getHistory,
  getWatchlist,
  removeFromWatchlist,
} from "../../lib/storage";
import type { WatchHistoryItem, WatchlistItem } from "../../lib/types";

type ViewMode = "watchlist" | "history";

export default function WatchlistScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<ViewMode>("watchlist");
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);

  const loadData = async () => {
    const [wl, hist] = await Promise.all([getWatchlist(), getHistory()]);
    setWatchlist(wl);
    setHistory(hist);
  };

  useEffect(() => {
    loadData();
  }, [mode]);

  const handleRemove = async (id: string | number) => {
    await removeFromWatchlist(id);
    setWatchlist((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearHistory = async () => {
    await clearHistory();
    setHistory([]);
  };

  const navigateItem = (item: WatchlistItem | WatchHistoryItem) => {
    if (item.type === "anime") {
      router.push(`/anime/${item.id}`);
    } else {
      router.push(`/manga/${item.id}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.accentBar} />
          <Text style={styles.title}>Library & History</Text>
        </View>

        {/* View Mode Toggle */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === "watchlist" && styles.modeBtnActive]}
            onPress={() => setMode("watchlist")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.modeText,
                mode === "watchlist" && styles.modeTextActive,
              ]}
            >
              Watchlist ({watchlist.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeBtn, mode === "history" && styles.modeBtnActive]}
            onPress={() => setMode("history")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.modeText,
                mode === "history" && styles.modeTextActive,
              ]}
            >
              Recent History ({history.length})
            </Text>
          </TouchableOpacity>
        </View>

        {mode === "history" && history.length > 0 ? (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={handleClearHistory}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={14} color="#8b949e" />
            <Text style={styles.clearBtnText}>Clear History</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* List */}
      {mode === "watchlist" ? (
        <FlatList
          data={watchlist}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.itemRow}
              onPress={() => navigateItem(item)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: item.cover }}
                style={styles.itemImage}
                contentFit="cover"
              />
              <View style={styles.itemInfo}>
                <View style={styles.badgeRow}>
                  <Text style={styles.typeBadge}>
                    {item.type.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.itemTitle} numberOfLines={2}>
                  {item.title}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => handleRemove(item.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={18} color="#8b949e" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons name="bookmark-outline" size={40} color="#30363d" />
              <Text style={styles.emptyTitle}>Your Watchlist is Empty</Text>
              <Text style={styles.emptyDesc}>
                Save your favorite anime series and manga to easily track them here.
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.itemRow}
              onPress={() => navigateItem(item)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: item.cover }}
                style={styles.itemImage}
                contentFit="cover"
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.progressText}>
                  Last: {item.currentEpisodeOrChapter}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#8b949e" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons name="time-outline" size={40} color="#30363d" />
              <Text style={styles.emptyTitle}>No Watch History</Text>
              <Text style={styles.emptyDesc}>
                Episodes and chapters you stream will automatically appear here.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0b0c10",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#21262d",
    gap: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  accentBar: {
    width: 3.5,
    height: 18,
    borderRadius: 2,
    backgroundColor: "#e50914",
  },
  title: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
  },
  modeToggle: {
    flexDirection: "row",
    backgroundColor: "#161b22",
    borderRadius: 8,
    padding: 3,
    gap: 4,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: "center",
    borderRadius: 6,
  },
  modeBtnActive: {
    backgroundColor: "#e50914",
  },
  modeText: {
    color: "#8b949e",
    fontSize: 12,
    fontWeight: "700",
  },
  modeTextActive: {
    color: "#ffffff",
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 4,
  },
  clearBtnText: {
    color: "#8b949e",
    fontSize: 11,
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161b22",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#21262d",
    gap: 12,
  },
  itemImage: {
    width: 50,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#0d1117",
  },
  itemInfo: {
    flex: 1,
  },
  badgeRow: {
    marginBottom: 4,
  },
  typeBadge: {
    color: "#e50914",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  itemTitle: {
    color: "#f0f6fc",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  progressText: {
    color: "#8b949e",
    fontSize: 11,
    marginTop: 4,
  },
  removeBtn: {
    padding: 6,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 8,
  },
  emptyTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
  },
  emptyDesc: {
    color: "#8b949e",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
});
