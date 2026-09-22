import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getAnimeDetails } from "../../lib/anilist";
import { recordHistory } from "../../lib/storage";
import { recordMihonHistory } from "../../lib/mihonStorage";
import type { Anime } from "../../lib/types";
import { displayTitle } from "../../lib/types";
import { VideoPlayer } from "../../components/VideoPlayer";

export default function WatchScreen() {
  const router = useRouter();
  const {
    id,
    ep,
    type = "anime",
    season,
    imdbId,
    slug,
    title,
  } = useLocalSearchParams<{
    id: string;
    ep?: string;
    type?: "anime" | "movie" | "tv" | "donghua";
    season?: string;
    imdbId?: string;
    slug?: string;
    title?: string;
  }>();

  const [currentEp, setCurrentEp] = useState<number>(ep ? Number(ep) : 1);
  const [anime, setAnime] = useState<Anime | null>(null);

  useEffect(() => {
    if (id && type === "anime") {
      getAnimeDetails(Number(id)).then((data) => {
        setAnime(data);
        if (data) {
          recordHistory({
            id: data.id,
            type: "anime",
            title: displayTitle(data),
            cover: data.coverImage.large || data.coverImage.extraLarge || "",
            currentEpisodeOrChapter: `Episode ${currentEp}`,
          });
          recordMihonHistory({
            id: String(data.id),
            type: "anime",
            title: displayTitle(data),
            cover: data.coverImage.large || data.coverImage.extraLarge || "",
            chapterOrEp: String(currentEp),
            progress: `Ep. ${currentEp}`,
          });
        }
      });
    }
  }, [id, currentEp, type]);

  const totalEpisodes = anime?.episodes || 12;
  const episodeList = Array.from({ length: totalEpisodes }, (_, i) => i + 1);
  const mediaTitle = title || (anime ? displayTitle(anime) : type.toUpperCase());

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={20} color="#ffffff" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.animeTitle} numberOfLines={1}>
            {mediaTitle}
          </Text>
          <Text style={styles.epSubtitle}>
            {type === "movie" ? "Movie Stream" : `Episode ${currentEp}`}
          </Text>
        </View>
      </View>

      {/* Video Player Frame */}
      {id && (
        <VideoPlayer
          id={id}
          imdbId={imdbId}
          type={type}
          season={season ? Number(season) : 1}
          episode={currentEp}
          slug={slug}
          title={mediaTitle}
        />
      )}

      {/* Player Navigation Controls for Series/Anime */}
      {type !== "movie" && (
        <View style={styles.navControls}>
          <TouchableOpacity
            style={[styles.epNavBtn, currentEp <= 1 && styles.epNavBtnDisabled]}
            disabled={currentEp <= 1}
            onPress={() => setCurrentEp((prev) => Math.max(1, prev - 1))}
            activeOpacity={0.8}
          >
            <Ionicons name="play-skip-back" size={14} color="#ffffff" />
            <Text style={styles.epNavText}>Previous Episode</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.epNavBtn,
              currentEp >= totalEpisodes && styles.epNavBtnDisabled,
            ]}
            disabled={currentEp >= totalEpisodes}
            onPress={() => setCurrentEp((prev) => prev + 1)}
            activeOpacity={0.8}
          >
            <Text style={styles.epNavText}>Next Episode</Text>
            <Ionicons name="play-skip-forward" size={14} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Episode Selector Grid */}
      {type !== "movie" && (
        <View style={styles.episodeSection}>
          <Text style={styles.epListHeading}>Select Episode</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.epScrollRow}
          >
            {episodeList.map((epNum) => {
              const isCurrent = epNum === currentEp;
              return (
                <TouchableOpacity
                  key={epNum}
                  style={[styles.epBadge, isCurrent && styles.epBadgeActive]}
                  onPress={() => setCurrentEp(epNum)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.epBadgeText, isCurrent && styles.epBadgeTextActive]}
                  >
                    {epNum}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0b0c10",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#0b0c10",
    borderBottomWidth: 1,
    borderBottomColor: "#21262d",
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#161b22",
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flex: 1,
  },
  animeTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  epSubtitle: {
    color: "#e50914",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 1,
  },
  navControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#21262d",
    gap: 10,
  },
  epNavBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#30363d",
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
  },
  epNavBtnDisabled: {
    opacity: 0.35,
  },
  epNavText: {
    color: "#f0f6fc",
    fontSize: 12,
    fontWeight: "700",
  },
  episodeSection: {
    padding: 16,
  },
  epListHeading: {
    color: "#8b949e",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  epScrollRow: {
    gap: 8,
  },
  epBadge: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#30363d",
    alignItems: "center",
    justifyContent: "center",
  },
  epBadgeActive: {
    backgroundColor: "#e50914",
    borderColor: "#e50914",
  },
  epBadgeText: {
    color: "#8b949e",
    fontSize: 13,
    fontWeight: "700",
  },
  epBadgeTextActive: {
    color: "#ffffff",
  },
});
