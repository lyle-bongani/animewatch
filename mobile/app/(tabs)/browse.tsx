import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ALL_GENRES } from "../../lib/genres";

interface SourceItem {
  id: string;
  name: string;
  lang: string;
  type: "manga" | "anime";
  description: string;
  icon: string;
  route: string;
  accent: string;
}

const SOURCES: SourceItem[] = [
  {
    id: "asurascans",
    name: "AsuraScans",
    lang: "EN",
    type: "manga",
    description: "Official high-quality manhwa, webtoons, and scanlations",
    icon: "book",
    route: "/manga",
    accent: "#a855f7",
  },
  {
    id: "anilist",
    name: "AniList Anime",
    lang: "SUB/DUB",
    type: "anime",
    description: "Global streaming directory with trending and seasonal releases",
    icon: "play-circle",
    route: "/search?mode=anime",
    accent: "#e50914",
  },
  {
    id: "donghua",
    name: "Chinese Animation (Donghua)",
    lang: "CN/SUB",
    type: "anime",
    description: "High-octane 3D CGI cultivation and 2D donghua series",
    icon: "tv",
    route: "/donghua",
    accent: "#3b82f6",
  },
];

export default function BrowseScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleGlobalSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Browse</Text>
        <Text style={styles.headerSubtitle}>
          Explore anime, manhwa, donghua and genre categories
        </Text>

        {/* Global Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color="#71717a" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search anime, manhwa, donghua..."
            placeholderTextColor="#71717a"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleGlobalSearch}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={16} color="#71717a" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Streaming & Reading Sources */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sources & Extensions</Text>
          <Text style={styles.sourceCount}>{SOURCES.length} Sources</Text>
        </View>

        {SOURCES.map((source) => (
          <TouchableOpacity
            key={source.id}
            style={styles.sourceCard}
            onPress={() => router.push(source.route as any)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.sourceIconBox,
                { backgroundColor: `${source.accent}20` },
              ]}
            >
              <Ionicons
                name={
                  source.icon === "book"
                    ? "book"
                    : source.icon === "tv"
                    ? "tv"
                    : "play"
                }
                size={20}
                color={source.accent}
              />
            </View>

            <View style={styles.sourceInfo}>
              <View style={styles.titleRow}>
                <Text style={styles.sourceName}>{source.name}</Text>
                <View
                  style={[
                    styles.langBadge,
                    { backgroundColor: `${source.accent}30` },
                  ]}
                >
                  <Text style={[styles.langText, { color: source.accent }]}>
                    {source.lang}
                  </Text>
                </View>
              </View>
              <Text style={styles.sourceDesc}>{source.description}</Text>
            </View>

            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.actionPill}
                onPress={() => router.push(source.route as any)}
              >
                <Text style={styles.actionPillText}>Explore</Text>
                <Ionicons name="chevron-forward" size={12} color="#a1a1aa" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {/* Netflix / Crunchyroll Style Popular Genres Grid */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Popular Genres & Themes</Text>
        </View>

        <View style={styles.genresGrid}>
          {ALL_GENRES.filter((g) => g.name !== "Hentai").map((genre) => (
            <TouchableOpacity
              key={genre.name}
              style={styles.genrePill}
              onPress={() =>
                router.push(`/search?genre=${encodeURIComponent(genre.name)}`)
              }
              activeOpacity={0.8}
            >
              <Text style={styles.genreName}>{genre.name}</Text>
              <Ionicons name="arrow-forward" size={12} color="#52525b" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
    gap: 12,
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
    marginTop: -8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181b",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: "#27272a",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 13,
    paddingVertical: 0,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    color: "#a1a1aa",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sourceCount: {
    color: "#71717a",
    fontSize: 11,
  },
  sourceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181b",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#27272a",
    marginBottom: 10,
    gap: 12,
  },
  sourceIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sourceInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  sourceName: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  langBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  langText: {
    fontSize: 9,
    fontWeight: "800",
  },
  sourceDesc: {
    color: "#71717a",
    fontSize: 11,
    lineHeight: 15,
  },
  quickActions: {
    flexDirection: "row",
    gap: 6,
  },
  actionPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#3f3f46",
    backgroundColor: "#27272a",
    gap: 4,
  },
  actionPillText: {
    color: "#f4f4f5",
    fontSize: 11,
    fontWeight: "700",
  },
  genresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  genrePill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "48%",
    backgroundColor: "#18181b",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  genreName: {
    color: "#f4f4f5",
    fontSize: 13,
    fontWeight: "600",
  },
});
