import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { getAnimeDetails } from "../../lib/anilist";
import type { Anime } from "../../lib/types";
import { displayTitle, formatLabel } from "../../lib/types";
import {
  addToWatchlist,
  isInWatchlist,
  removeFromWatchlist,
} from "../../lib/storage";
import {
  saveMihonLibraryItem,
  removeMihonLibraryItem,
  getMihonLibraryItem,
} from "../../lib/mihonStorage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function AnimeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (id) {
      getAnimeDetails(Number(id)).then((data) => {
        setAnime(data);
        setLoading(false);
      });
      getMihonLibraryItem(id).then((item) => {
        if (item) {
          setBookmarked(true);
        } else {
          isInWatchlist(id).then(setBookmarked);
        }
      });
    }
  }, [id]);

  const toggleBookmark = async () => {
    if (!anime) return;
    if (bookmarked) {
      await removeFromWatchlist(anime.id);
      await removeMihonLibraryItem(String(anime.id));
      setBookmarked(false);
    } else {
      await addToWatchlist({
        id: anime.id,
        type: "anime",
        title: displayTitle(anime),
        cover: anime.coverImage.large || anime.coverImage.extraLarge || "",
      });
      await saveMihonLibraryItem({
        id: String(anime.id),
        type: "anime",
        title: displayTitle(anime),
        cover: anime.coverImage.large || anime.coverImage.extraLarge || "",
        category: "reading",
        totalChaptersOrEps: anime.episodes || 12,
      });
      setBookmarked(true);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#e50914" />
        <Text style={styles.loadingText}>Loading Anime details...</Text>
      </View>
    );
  }

  if (!anime) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Anime not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;
  const epCount = anime.episodes || 12;
  const episodes = Array.from({ length: epCount }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner with Floating Back Button */}
        <View style={styles.bannerContainer}>
          <Image
            source={{
              uri:
                anime.bannerImage ||
                anime.coverImage.extraLarge ||
                anime.coverImage.large,
            }}
            style={styles.bannerImage}
            contentFit="cover"
          />
          <View style={styles.bannerOverlay} />

          <TouchableOpacity
            style={styles.floatingBackBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Poster & Header Info */}
        <View style={styles.headerInfo}>
          <View style={styles.posterContainer}>
            <Image
              source={{
                uri:
                  anime.coverImage.large ||
                  anime.coverImage.extraLarge ||
                  anime.coverImage.medium,
              }}
              style={styles.posterImage}
              contentFit="cover"
            />
          </View>

          <View style={styles.titleColumn}>
            <Text style={styles.title} numberOfLines={3}>
              {displayTitle(anime)}
            </Text>

            <View style={styles.metadataRow}>
              {score && (
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={11} color="#fbbf24" />
                  <Text style={styles.ratingText}>{score}</Text>
                </View>
              )}
              <Text style={styles.formatBadge}>
                {formatLabel(anime.format)}
              </Text>
              <Text style={styles.statusBadge}>{anime.status || "Finished"}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons: Watch & Bookmark */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.watchNowBtn}
            onPress={() => router.push(`/watch/${anime.id}?ep=1`)}
            activeOpacity={0.8}
          >
            <Ionicons name="play" size={18} color="#ffffff" />
            <Text style={styles.watchNowText}>Watch Episode 1</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bookmarkBtn, bookmarked && styles.bookmarkBtnActive]}
            onPress={toggleBookmark}
            activeOpacity={0.8}
          >
            <Ionicons
              name={bookmarked ? "bookmark" : "bookmark-outline"}
              size={18}
              color={bookmarked ? "#e50914" : "#ffffff"}
            />
          </TouchableOpacity>
        </View>

        {/* Genres */}
        {anime.genres && anime.genres.length > 0 && (
          <View style={styles.genresRow}>
            {anime.genres.map((genre) => (
              <View key={genre} style={styles.genrePill}>
                <Text style={styles.genreText}>{genre}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Synopsis */}
        <View style={styles.synopsisContainer}>
          <Text style={styles.sectionHeading}>Synopsis</Text>
          <Text style={styles.synopsisText}>
            {anime.description
              ? anime.description.replace(/<[^>]+>/g, "").trim()
              : "No synopsis available."}
          </Text>
        </View>

        {/* Episode List */}
        <View style={styles.episodesContainer}>
          <Text style={styles.sectionHeading}>
            Episodes ({epCount})
          </Text>
          <View style={styles.episodeGrid}>
            {episodes.map((epNum) => (
              <TouchableOpacity
                key={epNum}
                style={styles.epCard}
                onPress={() => router.push(`/watch/${anime.id}?ep=${epNum}`)}
                activeOpacity={0.8}
              >
                <Ionicons name="play-circle" size={16} color="#e50914" />
                <Text style={styles.epCardText}>Episode {epNum}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0c10",
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#0b0c10",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  loadingText: {
    color: "#8b949e",
    fontSize: 13,
  },
  errorText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  backBtn: {
    backgroundColor: "#e50914",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backBtnText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  bannerContainer: {
    width: SCREEN_WIDTH,
    height: 220,
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(11, 12, 16, 0.6)",
  },
  floatingBackBtn: {
    position: "absolute",
    top: 44,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: -50,
    gap: 14,
  },
  posterContainer: {
    width: 105,
    height: 155,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#21262d",
    backgroundColor: "#161b22",
  },
  posterImage: {
    width: "100%",
    height: "100%",
  },
  titleColumn: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 6,
  },
  title: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 22,
    marginBottom: 8,
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(251, 191, 36, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 3,
  },
  ratingText: {
    color: "#fbbf24",
    fontSize: 10,
    fontWeight: "800",
  },
  formatBadge: {
    color: "#8b949e",
    fontSize: 11,
    backgroundColor: "#161b22",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusBadge: {
    color: "#2ea44f",
    fontSize: 11,
    backgroundColor: "rgba(46, 164, 79, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    fontWeight: "700",
  },
  actionRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  watchNowBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e50914",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  watchNowText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  bookmarkBtn: {
    width: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#30363d",
    borderRadius: 10,
  },
  bookmarkBtnActive: {
    borderColor: "#e50914",
    backgroundColor: "rgba(229, 9, 20, 0.1)",
  },
  genresRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    marginTop: 14,
    gap: 6,
  },
  genrePill: {
    backgroundColor: "#161b22",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#21262d",
  },
  genreText: {
    color: "#8b949e",
    fontSize: 11,
    fontWeight: "600",
  },
  synopsisContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionHeading: {
    color: "#f0f6fc",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  synopsisText: {
    color: "#8b949e",
    fontSize: 12,
    lineHeight: 18,
  },
  episodesContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
    paddingBottom: 36,
  },
  episodeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  epCard: {
    width: (SCREEN_WIDTH - 48) / 3,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#30363d",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  epCardText: {
    color: "#f0f6fc",
    fontSize: 11,
    fontWeight: "700",
  },
});
