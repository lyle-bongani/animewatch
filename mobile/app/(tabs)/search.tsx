import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { searchAnime } from "../../lib/anilist";
import { searchAsura } from "../../lib/asura";
import { ALL_GENRES } from "../../lib/genres";
import type { Anime, AsuraSeriesCard } from "../../lib/types";
import { AnimeCard } from "../../components/AnimeCard";
import { MangaCard } from "../../components/MangaCard";

type SearchMode = "anime" | "manga";

export default function SearchScreen() {
  const [mode, setMode] = useState<SearchMode>("anime");
  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [animeResults, setAnimeResults] = useState<Anime[]>([]);
  const [mangaResults, setMangaResults] = useState<AsuraSeriesCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const executeSearch = async (q: string, genre: string | null) => {
    setLoading(true);
    setSearched(true);
    try {
      if (mode === "anime") {
        const res = await searchAnime(q, genre || undefined, 1, 24);
        setAnimeResults(res);
      } else {
        const res = await searchAsura(q);
        setMangaResults(res);
      }
    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    executeSearch(query, selectedGenre);
  };

  const handleGenrePress = (genreName: string) => {
    const newGenre = selectedGenre === genreName ? null : genreName;
    setSelectedGenre(newGenre);
    if (mode === "anime") {
      executeSearch(query, newGenre);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header with Mode Toggle & Search Bar */}
      <View style={styles.header}>
        {/* Anime / Manga Selector */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === "anime" && styles.modeBtnActive]}
            onPress={() => {
              setMode("anime");
              setSearched(false);
            }}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.modeText, mode === "anime" && styles.modeTextActive]}
            >
              Search Anime
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeBtn,
              mode === "manga" && [styles.modeBtnActive, { backgroundColor: "#913FE2" }],
            ]}
            onPress={() => {
              setMode("manga");
              setSearched(false);
            }}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.modeText, mode === "manga" && styles.modeTextActive]}
            >
              Search Manga
            </Text>
          </TouchableOpacity>
        </View>

        {/* Input Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#8b949e" />
          <TextInput
            style={styles.searchInput}
            placeholder={
              mode === "anime"
                ? "Search anime by title, romaji, keywords..."
                : "Search manhwa and manga by title..."
            }
            placeholderTextColor="#8b949e"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
          />
          {query ? (
            <TouchableOpacity
              onPress={() => {
                setQuery("");
                setAnimeResults([]);
                setMangaResults([]);
                setSearched(false);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color="#8b949e" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Genre Pills (Shown in Anime mode) */}
        {mode === "anime" && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.genreRow}
          >
            {ALL_GENRES.map((g) => {
              const isSelected = selectedGenre === g.name;
              return (
                <TouchableOpacity
                  key={g.name}
                  style={[styles.genrePill, isSelected && styles.genrePillActive]}
                  onPress={() => handleGenrePress(g.name)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.genrePillText,
                      isSelected && styles.genrePillTextActive,
                    ]}
                  >
                    {g.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Results View */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator
            size="large"
            color={mode === "manga" ? "#913FE2" : "#e50914"}
          />
          <Text style={styles.loadingText}>Searching catalog...</Text>
        </View>
      ) : mode === "anime" ? (
        <FlatList
          data={animeResults}
          numColumns={2}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <AnimeCard anime={item} width={165} />
            </View>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons
                name="search-outline"
                size={36}
                color="#30363d"
              />
              <Text style={styles.emptyTitle}>
                {searched ? "No matching anime found" : "Explore the Catalog"}
              </Text>
              <Text style={styles.emptyDesc}>
                {searched
                  ? "Try using different keywords or genre filters."
                  : "Search for your favorite anime series or pick a genre above."}
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={mangaResults}
          numColumns={2}
          keyExtractor={(item) => item.slug}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <MangaCard comic={item} width={165} />
            </View>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons name="book-outline" size={36} color="#30363d" />
              <Text style={styles.emptyTitle}>
                {searched ? "No matching manhwa found" : "Search AsuraScans"}
              </Text>
              <Text style={styles.emptyDesc}>
                {searched
                  ? "Check spelling or search for alternative titles."
                  : "Type any manhwa or manga title to search live."}
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
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#21262d",
    gap: 10,
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161b22",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: "#30363d",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 13,
    paddingVertical: 0,
  },
  genreRow: {
    gap: 6,
    paddingVertical: 2,
  },
  genrePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#30363d",
  },
  genrePillActive: {
    backgroundColor: "#e50914",
    borderColor: "#e50914",
  },
  genrePillText: {
    color: "#8b949e",
    fontSize: 11,
    fontWeight: "600",
  },
  genrePillTextActive: {
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
    gap: 8,
  },
  loadingText: {
    color: "#8b949e",
    fontSize: 12,
    marginTop: 8,
  },
  emptyTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 8,
  },
  emptyDesc: {
    color: "#8b949e",
    fontSize: 12,
    textAlign: "center",
    maxWidth: 260,
  },
});
