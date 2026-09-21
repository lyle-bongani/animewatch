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
  clearMihonHistory,
  getMihonHistory,
  type MihonHistoryItem,
  removeMihonHistoryItem,
} from "../../lib/mihonStorage";

export default function MihonHistoryScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<MihonHistoryItem[]>([]);

  const loadHistory = async () => {
    const data = await getMihonHistory();
    setHistory(data);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleRemove = async (id: string, chapterOrEp: string) => {
    await removeMihonHistoryItem(id, chapterOrEp);
    setHistory((prev) => prev.filter((i) => !(i.id === id && i.chapterOrEp === chapterOrEp)));
  };

  const handleClearAll = async () => {
    await clearMihonHistory();
    setHistory([]);
  };

  const handleResume = (item: MihonHistoryItem) => {
    if (item.type === "manga") {
      const chNum = item.chapterOrEp.replace(/[^0-9.]/g, "");
      router.push(`/manga/read/${item.id}/${chNum || "1"}`);
    } else {
      const epNum = item.chapterOrEp.replace(/[^0-9]/g, "");
      router.push(`/watch/${item.id}?ep=${epNum || "1"}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>History</Text>
          {history.length > 0 && (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={handleClearAll}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={16} color="#ef4444" />
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.headerSubtitle}>
          Resume your reading and watching sessions
        </Text>
      </View>

      {/* History List */}
      <FlatList
        data={history}
        keyExtractor={(item, index) => `${item.id}-${item.chapterOrEp}-${index}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.historyRow}>
            <TouchableOpacity
              style={styles.clickableArea}
              onPress={() => handleResume(item)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: item.cover }}
                style={styles.thumbnail}
                contentFit="cover"
              />

              <View style={styles.infoCol}>
                <Text style={styles.seriesTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.chapterText}>
                  {item.chapterOrEp}
                </Text>
                <Text style={styles.timestampText}>
                  {new Date(item.readAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.actionCol}>
              <TouchableOpacity
                style={styles.resumeBtn}
                onPress={() => handleResume(item)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={item.type === "manga" ? "book" : "play"}
                  size={16}
                  color="#ffffff"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleRemove(item.id, item.chapterOrEp)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={16} color="#71717a" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Ionicons name="time-outline" size={48} color="#27272a" />
            <Text style={styles.emptyTitle}>No History</Text>
            <Text style={styles.emptyDesc}>
              Titles you read or watch will automatically be tracked here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#18181b",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: "#71717a",
    fontSize: 12,
    marginTop: 2,
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  clearBtnText: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "700",
  },
  listContent: {
    padding: 12,
    gap: 8,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181b",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#27272a",
    justifyContent: "space-between",
  },
  clickableArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  thumbnail: {
    width: 48,
    height: 68,
    borderRadius: 8,
    backgroundColor: "#09090b",
  },
  infoCol: {
    flex: 1,
  },
  seriesTitle: {
    color: "#f4f4f5",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  chapterText: {
    color: "#a855f7",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },
  timestampText: {
    color: "#71717a",
    fontSize: 10,
  },
  actionCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  resumeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#a855f7",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: {
    padding: 4,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 8,
    marginTop: 60,
  },
  emptyTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  emptyDesc: {
    color: "#71717a",
    fontSize: 12,
    textAlign: "center",
  },
});
