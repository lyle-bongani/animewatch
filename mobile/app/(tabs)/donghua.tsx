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
import { getDonghua } from "../../lib/anilist";
import type { Anime } from "../../lib/types";
import { AnimeCard } from "../../components/AnimeCard";

type TabMode = "all" | "2d" | "3d";

export default function DonghuaScreen() {
  const [tab, setTab] = useState<TabMode>("all");
  const [items, setItems] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDonghua = async (selectedTab: TabMode) => {
    try {
      const is3D = selectedTab === "all" ? undefined : selectedTab === "3d";
      const data = await getDonghua(is3D, 40);
      setItems(data);
    } catch (e) {
      console.error("Failed to load donghua", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchDonghua(tab);
  }, [tab]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDonghua(tab);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.accentBar} />
          <Text style={styles.title}>Chinese Animation</Text>
        </View>
        <Text style={styles.subtitle}>
          Explore top 2D & 3D Chinese Donghua series
        </Text>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === "all" && styles.tabBtnActive]}
            onPress={() => setTab("all")}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, tab === "all" && styles.tabTextActive]}>
              All Donghua
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, tab === "2d" && styles.tabBtnActive]}
            onPress={() => setTab("2d")}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, tab === "2d" && styles.tabTextActive]}>
              2D Animation
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, tab === "3d" && styles.tabBtnActive]}
            onPress={() => setTab("3d")}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, tab === "3d" && styles.tabTextActive]}>
              3D CGI Cultivation
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Series Grid */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#e50914" />
          <Text style={styles.loadingText}>Loading Donghua directory...</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          numColumns={2}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <AnimeCard anime={item} width={165} />
            </View>
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#e50914"
              colors={["#e50914"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No Donghua series found</Text>
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
  subtitle: {
    color: "#8b949e",
    fontSize: 12,
    marginTop: 2,
    marginBottom: 12,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#161b22",
    borderRadius: 8,
    padding: 3,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: "center",
    borderRadius: 6,
  },
  tabBtnActive: {
    backgroundColor: "#e50914",
  },
  tabText: {
    color: "#8b949e",
    fontSize: 11,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  listContent: {
    padding: 12,
    paddingBottom: 24,
  },
  cardWrapper: {
    flex: 1,
    alignItems: "center",
    marginBottom: 16,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 10,
  },
  loadingText: {
    color: "#8b949e",
    fontSize: 12,
  },
  emptyText: {
    color: "#8b949e",
    fontSize: 13,
  },
});
