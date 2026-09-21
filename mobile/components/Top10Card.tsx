import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface Top10CardProps {
  rank: number; // 1 to 10
  id: string | number;
  type: "anime" | "manga";
  title: string;
  cover: string;
  score?: string | number | null;
  subtitle?: string;
  badgeText?: string;
}

export function Top10Card({
  rank,
  id,
  type,
  title,
  cover,
  score,
  subtitle,
  badgeText,
}: Top10CardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (type === "manga") {
      router.push(`/manga/${id}`);
    } else {
      router.push(`/anime/${id}`);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Netflix-Style Giant Stylized Number */}
      <View style={styles.rankNumberContainer}>
        <Text style={styles.rankNumberStroke}>{rank}</Text>
        <Text style={styles.rankNumberFill}>{rank}</Text>
      </View>

      {/* Poster Card */}
      <View style={styles.posterWrapper}>
        <Image
          source={{ uri: cover }}
          style={styles.posterImage}
          contentFit="cover"
          transition={300}
        />

        {/* Top Badges */}
        <View style={styles.badgeRow}>
          {badgeText && (
            <View style={styles.topBadge}>
              <Text style={styles.topBadgeText}>{badgeText}</Text>
            </View>
          )}

          {score && (
            <View style={styles.scoreBadge}>
              <Ionicons name="star" size={10} color="#fbbf24" />
              <Text style={styles.scoreText}>{score}</Text>
            </View>
          )}
        </View>

        {/* Bottom Gradient Fade */}
        <View style={styles.posterGradient} />

        {subtitle ? (
          <View style={styles.subtitleBox}>
            <Text style={styles.subtitleText} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 175,
    marginRight: 16,
    flexDirection: "column",
  },
  rankNumberContainer: {
    position: "absolute",
    left: -8,
    bottom: 24,
    zIndex: 10,
    width: 80,
    height: 120,
    justifyContent: "flex-end",
  },
  rankNumberStroke: {
    position: "absolute",
    left: 0,
    bottom: 0,
    fontSize: 96,
    fontWeight: "900",
    color: "#000000",
    textShadowColor: "#3f3f46",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 6,
    lineHeight: 96,
  },
  rankNumberFill: {
    fontSize: 96,
    fontWeight: "900",
    color: "#27272a",
    lineHeight: 96,
  },
  posterWrapper: {
    width: 130,
    height: 190,
    borderRadius: 8,
    overflow: "hidden",
    alignSelf: "flex-end",
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    position: "relative",
  },
  posterImage: {
    width: "100%",
    height: "100%",
  },
  badgeRow: {
    position: "absolute",
    top: 6,
    left: 6,
    right: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 5,
  },
  topBadge: {
    backgroundColor: "#e50914",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  topBadgeText: {
    color: "#ffffff",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  scoreText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },
  posterGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  subtitleBox: {
    position: "absolute",
    bottom: 6,
    left: 6,
    right: 6,
  },
  subtitleText: {
    color: "#e4e4e7",
    fontSize: 10,
    fontWeight: "700",
  },
  title: {
    color: "#f4f4f5",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
    alignSelf: "flex-end",
    width: 130,
  },
});
