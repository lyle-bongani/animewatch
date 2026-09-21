import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { Anime } from "../lib/types";
import { displayTitle, isStraight18 } from "../lib/types";
import { useAdultGate } from "../lib/adultGate";

interface AnimeCardProps {
  anime: Anime;
  width?: number;
}

export function AnimeCard({ anime, width = 135 }: AnimeCardProps) {
  const router = useRouter();
  const { isAdultUnlocked, openModal } = useAdultGate();

  const isAdultContent = isStraight18(anime);
  const isLocked = isAdultContent && !isAdultUnlocked;

  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;
  const ep = anime.nextAiringEpisode?.episode
    ? anime.nextAiringEpisode.episode - 1
    : anime.episodes;

  const handlePress = () => {
    if (isLocked) {
      openModal();
    } else {
      router.push(`/anime/${anime.id}`);
    }
  };

  const imageUri =
    anime.coverImage.large ||
    anime.coverImage.extraLarge ||
    anime.coverImage.medium ||
    "";

  return (
    <TouchableOpacity
      style={[styles.container, { width }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri }}
          style={[styles.image, isLocked && styles.blurredImage]}
          contentFit="cover"
          transition={300}
        />

        {/* Top Badges */}
        <View style={styles.topRow}>
          {score && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={10} color="#fbbf24" />
              <Text style={styles.ratingText}>{score}</Text>
            </View>
          )}

          {!!ep && !isLocked && (
            <View style={styles.epBadge}>
              <Text style={styles.epText}>EP {ep}</Text>
            </View>
          )}
        </View>

        {/* Crunchyroll SUB / DUB Pill */}
        {!isLocked && (
          <View style={styles.crAudioBadge}>
            <Text style={styles.crAudioText}>SUB | DUB</Text>
          </View>
        )}

        {/* 18+ Locked Overlay */}
        {isLocked && (
          <View style={styles.lockOverlay}>
            <View style={styles.lockCircle}>
              <Ionicons name="lock-closed" size={16} color="#e50914" />
            </View>
            <Text style={styles.lockLabel}>18+ Locked</Text>
            <Text style={styles.unlockSubtext}>Tap to Unlock</Text>
          </View>
        )}
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {displayTitle(anime)}
      </Text>

      {anime.genres && anime.genres.length > 0 && (
        <Text style={styles.subgenre} numberOfLines={1}>
          {anime.genres.slice(0, 2).join(" • ")}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
  },
  imageContainer: {
    aspectRatio: 2 / 3,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#161b22",
    position: "relative",
    borderWidth: 1,
    borderColor: "#21262d",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  blurredImage: {
    opacity: 0.25,
  },
  topRow: {
    position: "absolute",
    top: 6,
    left: 6,
    right: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    gap: 3,
  },
  ratingText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },
  epBadge: {
    backgroundColor: "#e50914",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  epText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "800",
  },
  lockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  lockCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(229, 9, 20, 0.2)",
    borderWidth: 1,
    borderColor: "#e50914",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  lockLabel: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  unlockSubtext: {
    color: "#8b949e",
    fontSize: 9,
    marginTop: 2,
    textDecorationLine: "underline",
  },
  title: {
    color: "#f0f6fc",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 6,
    lineHeight: 16,
  },
  subgenre: {
    color: "#71717a",
    fontSize: 10,
    marginTop: 2,
    fontWeight: "500",
  },
  crAudioBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(24, 24, 27, 0.85)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  crAudioText: {
    color: "#f97316", // Crunchyroll signature orange
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
});
