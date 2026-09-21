import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getAsuraLatest } from "../../lib/asura";
import type { AsuraSeriesCard } from "../../lib/types";

export default function MihonUpdatesScreen() {
  const router = useRouter();
  const [updates, setUpdates] = useState<AsuraSeriesCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadUpdates = async () => {
    try {
      const data = await getAsuraLatest();
      setUpdates(data);
    } catch (e) {
      console.error("Failed to load updates", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUpdates();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadUpdates();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Updates</Text>
        <Text style={styles.headerSubtitle}>
          Latest releases from your sources
        </Text>
      </View>

      {/* Updates List */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#a855f7" />
          <Text style={styles.loadingText}>Fetching chapter releases...</Text>
        </View>
      ) : (
        <FlatList
          data={updates}
          keyExtractor={(item) => item.slug}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#a855f7"
              colors={["#a855f7"]}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.updateRow}
              onPress={() => {
                if (item.latestChapter) {
                  router.push(`/manga/read/${item.slug}/${item.latestChapter}`);
                } else {
                  router.push(`/manga/${item.slug}`);
                }
              }}
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

                <View style={styles.metaRow}>
                  <Text style={styles.chapterBadge}>
                    {item.latestChapter ? `Ch. ${item.latestChapter}` : "New Chapter"}
                  </Text>
                  <Text style={styles.sourceTag}>AsuraScans</Text>
                </View>
              </View>

              <View style={styles.readAction}>
                <Ionicons name="book-outline" size={18} color="#a855f7" />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons name="notifications-off-outline" size={40} color="#27272a" />
              <Text style={styles.emptyTitle}>No Recent Updates</Text>
              <Text style={styles.emptyDesc}>
                Pull down to check for newly published chapters.
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
    backgroundColor: "#000000",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#18181b",
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
  listContent: {
    padding: 12,
    gap: 8,
  },
  updateRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181b",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#27272a",
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
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chapterBadge: {
    color: "#a855f7",
    fontSize: 11,
    fontWeight: "800",
  },
  sourceTag: {
    color: "#71717a",
    fontSize: 10,
    fontWeight: "600",
  },
  readAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(168, 85, 247, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 8,
    marginTop: 60,
  },
  loadingText: {
    color: "#71717a",
    fontSize: 12,
    marginTop: 8,
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
