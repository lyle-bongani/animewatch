import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { AsuraSeriesCard } from "../lib/types";

interface MangaCardProps {
  comic: AsuraSeriesCard;
  width?: number;
}

export function MangaCard({ comic, width = 135 }: MangaCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/manga/${comic.slug}`);
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: comic.cover }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />

        {/* Top Badges */}
        <View style={styles.topRow}>
          {comic.rating ? (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={10} color="#fbbf24" />
              <Text style={styles.ratingText}>{comic.rating}</Text>
            </View>
          ) : (
            <View />
          )}

          {comic.latestChapter && (
            <View style={styles.chBadge}>
              <Text style={styles.chText}>Ch. {comic.latestChapter}</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {comic.title}
      </Text>
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
  chBadge: {
    backgroundColor: "#913FE2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  chText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "800",
  },
  title: {
    color: "#f0f6fc",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
    lineHeight: 16,
  },
});
