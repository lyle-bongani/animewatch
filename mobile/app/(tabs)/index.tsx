import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  getAiringNow,
  getDonghua,
  getPopular,
  getTrending,
} from "../../lib/anilist";
import { getAsuraLatest } from "../../lib/asura";
import type { Anime, AsuraSeriesCard } from "../../lib/types";
import { HeroBanner } from "../../components/HeroBanner";
import { ContinueWatchingRow } from "../../components/ContinueWatchingRow";
import { Top10Card } from "../../components/Top10Card";
import { AnimeCard } from "../../components/AnimeCard";
import { MangaCard } from "../../components/MangaCard";
import { SectionRow } from "../../components/SectionRow";

type ContentFilter = "all" | "anime" | "manga" | "donghua";

export default function HomeScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<ContentFilter>("all");

  const [spotlight, setSpotlight] = useState<Anime | null>(null);
  const [trendingAnime, setTrendingAnime] = useState<Anime[]>([]);
  const [simulcasts, setSimulcasts] = useState<Anime[]>([]);
  const [popularAnime, setPopularAnime] = useState<Anime[]>([]);
  const [donghuaList, setDonghuaList] = useState<Anime[]>([]);
  const [asuraManga, setAsuraManga] = useState<AsuraSeriesCard[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [trend, airing, pop, dong, asura] = await Promise.all([
        getTrending(15),
        getAiringNow(15),
        getPopular(15),
        getDonghua(false, 15),
        getAsuraLatest(1),
      ]);

      if (trend.length > 0) {
        setSpotlight(trend[0]);
        setTrendingAnime(trend.slice(1, 11));
      }
      setSimulcasts(airing);
      setPopularAnime(pop);
      setDonghuaList(dong);
      setAsuraManga(asura);
    } catch (e) {
      console.error("Home feed fetch error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e50914" />
        <Text style={styles.loadingText}>Loading AnimeWatch...</Text>
      </View>
    );
  }

  const showAnime = filter === "all" || filter === "anime";
  const showManga = filter === "all" || filter === "manga";
  const showDonghua = filter === "all" || filter === "donghua";

  return (
    <View style={styles.container}>
      {/* Floating Netflix / Crunchyroll Top Header */}
      <SafeAreaView style={styles.topHeader} edges={["top"]}>
        <View style={styles.topRow}>
          {/* Logo */}
          <View style={styles.logoRow}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoLetter}>A</Text>
            </View>
            <Text style={styles.brandTitle}>ANIMEWATCH</Text>
          </View>

          {/* Header Action Buttons */}
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => router.push("/browse")}
              activeOpacity={0.8}
            >
              <Ionicons name="search" size={20} color="#ffffff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => router.push("/library")}
              activeOpacity={0.8}
            >
              <Ionicons name="bookmark-outline" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Filter Category Pills */}
        <View style={styles.filterPillsRow}>
          {(
            [
              { key: "all", label: "All" },
              { key: "anime", label: "Anime" },
              { key: "manga", label: "Manga & Manhwa" },
              { key: "donghua", label: "Donghua" },
            ] as const
          ).map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.filterPill,
                filter === item.key && styles.filterPillActive,
              ]}
              onPress={() => setFilter(item.key)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterPillText,
                  filter === item.key && styles.filterPillTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#e50914"
          />
        }
      >
        {/* Netflix Hero Billboard */}
        {spotlight && filter === "all" && (
          <HeroBanner anime={spotlight} />
        )}

        {/* Continue Watching & Reading (Netflix / Crunchyroll / Mihon Progress Bar) */}
        <ContinueWatchingRow />

        {/* Netflix-Style Top 10 Anime Today (Large Overlapping Numbers) */}
        {showAnime && trendingAnime.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <View style={styles.netflixAccent} />
                <Text style={styles.sectionTitle}>Top 10 Anime in Japan Today</Text>
              </View>
            </View>

            <FlatList
              horizontal
              data={trendingAnime.slice(0, 10)}
              keyExtractor={(item) => String(item.id)}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.top10ListContent}
              renderItem={({ item, index }) => (
                <Top10Card
                  rank={index + 1}
                  id={item.id}
                  type="anime"
                  title={item.title.english || item.title.romaji || "Anime"}
                  cover={item.coverImage.large || item.coverImage.extraLarge || ""}
                  score={item.averageScore ? (item.averageScore / 10).toFixed(1) : undefined}
                  badgeText="TOP 10"
                />
              )}
            />
          </View>
        )}

        {/* Crunchyroll-Style Simulcasts This Season (SUB / DUB Badges) */}
        {showAnime && simulcasts.length > 0 && (
          <SectionRow
            title="Simulcasts This Season"
            data={simulcasts}
            accentColor="#f97316" // Crunchyroll orange
            renderItem={({ item }) => <AnimeCard anime={item} />}
            keyExtractor={(item) => String(item.id)}
          />
        )}

        {/* Netflix-Style Top 10 Manga & Manhwa (Large Overlapping Numbers) */}
        {showManga && asuraManga.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <View style={styles.mihonAccent} />
                <Text style={styles.sectionTitle}>Top 10 Manhwa & Manga</Text>
              </View>
            </View>

            <FlatList
              horizontal
              data={asuraManga.slice(0, 10)}
              keyExtractor={(item) => item.slug}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.top10ListContent}
              renderItem={({ item, index }) => (
                <Top10Card
                  rank={index + 1}
                  id={item.slug}
                  type="manga"
                  title={item.title}
                  cover={item.cover}
                  badgeText="HOT"
                  subtitle={item.latestChapter ? `Ch. ${item.latestChapter}` : undefined}
                />
              )}
            />
          </View>
        )}

        {/* Mihon-Style Latest AsuraScans Chapters (Webtoon / Manhwa) */}
        {showManga && asuraManga.length > 10 && (
          <SectionRow
            title="Latest Manhwa Chapters • AsuraScans"
            data={asuraManga.slice(10)}
            accentColor="#a855f7" // Mihon purple
            renderItem={({ item }) => <MangaCard comic={item} />}
            keyExtractor={(item) => item.slug}
          />
        )}

        {/* Popular Anime of All Time */}
        {showAnime && popularAnime.length > 0 && (
          <SectionRow
            title="Popular Anime"
            data={popularAnime}
            accentColor="#e50914"
            renderItem={({ item }) => <AnimeCard anime={item} />}
            keyExtractor={(item) => String(item.id)}
          />
        )}

        {/* Chinese Donghua Catalog */}
        {showDonghua && donghuaList.length > 0 && (
          <SectionRow
            title="Trending Chinese Donghua"
            data={donghuaList}
            accentColor="#3b82f6"
            renderItem={({ item }) => <AnimeCard anime={item} />}
            keyExtractor={(item) => String(item.id)}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: "#a1a1aa",
    fontSize: 13,
    fontWeight: "600",
  },
  topHeader: {
    backgroundColor: "rgba(0, 0, 0, 0.92)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 16,
    paddingBottom: 10,
    zIndex: 50,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 6,
    paddingBottom: 8,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#e50914",
    alignItems: "center",
    justifyContent: "center",
  },
  logoLetter: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
  brandTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#18181b",
    alignItems: "center",
    justifyContent: "center",
  },
  filterPillsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
  },
  filterPillActive: {
    backgroundColor: "#ffffff",
    borderColor: "#ffffff",
  },
  filterPillText: {
    color: "#a1a1aa",
    fontSize: 12,
    fontWeight: "700",
  },
  filterPillTextActive: {
    color: "#000000",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionContainer: {
    marginBottom: 26,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  netflixAccent: {
    width: 3.5,
    height: 16,
    backgroundColor: "#e50914",
    borderRadius: 2,
  },
  mihonAccent: {
    width: 3.5,
    height: 16,
    backgroundColor: "#a855f7",
    borderRadius: 2,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  top10ListContent: {
    paddingLeft: 16,
    paddingRight: 4,
  },
});
