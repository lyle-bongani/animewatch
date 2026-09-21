import React, { useEffect, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { Anime } from "../lib/types";
import { displayTitle, formatLabel } from "../lib/types";
import {
  getMihonLibraryItem,
  removeMihonLibraryItem,
  saveMihonLibraryItem,
} from "../lib/mihonStorage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface HeroBannerProps {
  anime: Anime;
}

export function HeroBanner({ anime }: HeroBannerProps) {
  const router = useRouter();
  const [inLibrary, setInLibrary] = useState(false);

  useEffect(() => {
    getMihonLibraryItem(String(anime.id)).then((item) => {
      setInLibrary(!!item);
    });
  }, [anime.id]);

  const toggleLibrary = async () => {
    if (inLibrary) {
      await removeMihonLibraryItem(String(anime.id));
      setInLibrary(false);
    } else {
      await saveMihonLibraryItem({
        id: String(anime.id),
        type: "anime",
        title: displayTitle(anime),
        cover: anime.coverImage.large || anime.coverImage.extraLarge || "",
        category: "reading",
        totalChaptersOrEps: anime.episodes || 12,
      });
      setInLibrary(true);
    }
  };

  const imageUri =
    anime.bannerImage ||
    anime.coverImage.extraLarge ||
    anime.coverImage.large ||
    "";

  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;
  const genreStr = (anime.genres || []).slice(0, 3).join(" • ");

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: imageUri }}
        style={styles.backgroundImage}
        contentFit="cover"
        transition={500}
      />

      {/* Deep cinematic gradient fade to pure black */}
      <View style={styles.gradientTop} />
      <View style={styles.gradientBottom} />

      <View style={styles.content}>
        {/* Netflix Spotlight & Quality Badges */}
        <View style={styles.badgeRow}>
          <View style={styles.netflixTop10Tag}>
            <Text style={styles.top10Text}>TOP 10</Text>
          </View>

          <Text style={styles.matchText}>98% Match</Text>

          <View style={styles.qualityTag}>
            <Text style={styles.qualityText}>4K HDR</Text>
          </View>

          {score && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={11} color="#fbbf24" />
              <Text style={styles.ratingText}>{score}</Text>
            </View>
          )}

          <Text style={styles.formatText}>{formatLabel(anime.format)}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {displayTitle(anime)}
        </Text>

        {/* Genres */}
        {genreStr ? (
          <Text style={styles.genreText} numberOfLines={1}>
            {genreStr}
          </Text>
        ) : null}

        {/* Action Button Row: Play, My List, Info */}
        <View style={styles.buttonRow}>
          {/* Netflix Signature Solid White Play Button */}
          <TouchableOpacity
            style={styles.playBtn}
            onPress={() => router.push(`/watch/${anime.id}?ep=1`)}
            activeOpacity={0.8}
          >
            <Ionicons name="play" size={18} color="#000000" />
            <Text style={styles.playBtnText}>Play</Text>
          </TouchableOpacity>

          {/* Mihon + My List Toggle Button */}
          <TouchableOpacity
            style={[styles.myListBtn, inLibrary && styles.inLibraryBtn]}
            onPress={toggleLibrary}
            activeOpacity={0.8}
          >
            <Ionicons
              name={inLibrary ? "checkmark" : "add"}
              size={18}
              color="#ffffff"
            />
            <Text style={styles.myListBtnText}>
              {inLibrary ? "In Library" : "My List"}
            </Text>
          </TouchableOpacity>

          {/* Details Button */}
          <TouchableOpacity
            style={styles.infoBtn}
            onPress={() => router.push(`/anime/${anime.id}`)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#f4f4f5"
            />
            <Text style={styles.infoBtnText}>Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: 440,
    position: "relative",
    backgroundColor: "#000000",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  gradientTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  gradientBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 240,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
  },
  content: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  netflixTop10Tag: {
    backgroundColor: "#e50914",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  top10Text: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  matchText: {
    color: "#46d369", // Netflix green match percentage
    fontSize: 12,
    fontWeight: "800",
  },
  qualityTag: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  qualityText: {
    color: "#f4f4f5",
    fontSize: 9,
    fontWeight: "800",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    gap: 3,
  },
  ratingText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  formatText: {
    color: "#a1a1aa",
    fontSize: 11,
    fontWeight: "600",
  },
  title: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 30,
    marginBottom: 6,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  genreText: {
    color: "#d4d4d8",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  playBtn: {
    flex: 1.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff", // Signature Netflix white play button
    paddingVertical: 11,
    borderRadius: 6,
    gap: 6,
  },
  playBtnText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "800",
  },
  myListBtn: {
    flex: 1.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 11,
    borderRadius: 6,
    gap: 6,
  },
  inLibraryBtn: {
    backgroundColor: "#a855f7",
  },
  myListBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  infoBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 11,
    borderRadius: 6,
    gap: 5,
  },
  infoBtnText: {
    color: "#f4f4f5",
    fontSize: 13,
    fontWeight: "600",
  },
});
