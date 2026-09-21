import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  getMihonHistory,
  type MihonHistoryItem,
} from "../lib/mihonStorage";

export function ContinueWatchingRow() {
  const router = useRouter();
  const [history, setHistory] = useState<MihonHistoryItem[]>([]);

  useEffect(() => {
    getMihonHistory().then((items) => {
      setHistory(items.slice(0, 10));
    });
  }, []);

  if (history.length === 0) return null;

  const handleResume = (item: MihonHistoryItem) => {
    if (item.type === "manga") {
      router.push(`/manga/read/${item.id}/${item.chapterOrEp}`);
    } else {
      router.push(`/watch/${item.id}?ep=${item.chapterOrEp}`);
    }
  };

  const renderItem = ({ item }: { item: MihonHistoryItem }) => {
    const isManga = item.type === "manga";

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleResume(item)}
        activeOpacity={0.8}
      >
        <View style={styles.thumbnailContainer}>
          <Image
            source={{ uri: item.cover }}
            style={styles.thumbnail}
            contentFit="cover"
            transition={300}
          />

          {/* Type Tag */}
          <View
            style={[
              styles.typeBadge,
              isManga ? styles.mangaBadge : styles.animeBadge,
            ]}
          >
            <Text style={styles.typeBadgeText}>
              {isManga ? "MANGA" : "ANIME"}
            </Text>
          </View>

          {/* Play Icon Circle Overlay */}
          <View style={styles.playOverlay}>
            <View style={styles.playCircle}>
              <Ionicons
                name={isManga ? "book-outline" : "play"}
                size={16}
                color="#ffffff"
              />
            </View>
          </View>

          {/* Netflix/Crunchyroll Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor: isManga ? "#a855f7" : "#e50914",
                  width: "65%", // Representative progress indicator
                },
              ]}
            />
          </View>
        </View>

        {/* Title & Progress Label */}
        <View style={styles.metaBox}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.progressText}>
            {isManga ? `Ch. ${item.chapterOrEp}` : `Ep. ${item.chapterOrEp}`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.accentBar} />
          <Text style={styles.sectionTitle}>Continue Watching & Reading</Text>
        </View>
      </View>

      <FlatList
        horizontal
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.id}-${item.chapterOrEp}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 26,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  accentBar: {
    width: 3.5,
    height: 16,
    backgroundColor: "#e50914",
    borderRadius: 2,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  listContent: {
    paddingLeft: 16,
    paddingRight: 4,
  },
  card: {
    width: 155,
    marginRight: 12,
  },
  thumbnailContainer: {
    width: 155,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  typeBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 5,
  },
  animeBadge: {
    backgroundColor: "#e50914",
  },
  mangaBadge: {
    backgroundColor: "#913FE2",
  },
  typeBadgeText: {
    color: "#ffffff",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  playOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  playCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  progressBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3.5,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  progressBarFill: {
    height: "100%",
  },
  metaBox: {
    marginTop: 6,
  },
  title: {
    color: "#f4f4f5",
    fontSize: 12,
    fontWeight: "700",
  },
  progressText: {
    color: "#a1a1aa",
    fontSize: 11,
    marginTop: 2,
    fontWeight: "500",
  },
});
