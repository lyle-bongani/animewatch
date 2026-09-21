import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { AsuraChapterData } from "../lib/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface WebtoonReaderProps {
  data: AsuraChapterData;
  allChapters?: { number: string }[];
}

export function WebtoonReader({ data }: WebtoonReaderProps) {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [showControls, setShowControls] = useState(true);

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const renderPage = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity
      activeOpacity={1}
      onPress={toggleControls}
      style={styles.pageContainer}
    >
      <Image
        source={{ uri: item }}
        style={styles.pageImage}
        contentFit="contain"
        priority={index < 3 ? "high" : "normal"}
      />
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (data.pages.length === 0) return null;

    return (
      <View style={styles.footerContainer}>
        <Text style={styles.footerTitle}>End of Chapter {data.chapter}</Text>
        <Text style={styles.footerSubtitle}>
          Completed {data.pages.length} pages
        </Text>

        <View style={styles.footerActions}>
          {data.prevChapter && (
            <TouchableOpacity
              style={styles.footerBtn}
              onPress={() =>
                router.replace(`/manga/read/${data.slug}/${data.prevChapter}`)
              }
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={16} color="#f0f6fc" />
              <Text style={styles.footerBtnText}>Ch. {data.prevChapter}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.footerBtn}
            onPress={() => router.replace(`/manga/${data.slug}`)}
            activeOpacity={0.8}
          >
            <Ionicons name="list" size={16} color="#f0f6fc" />
            <Text style={styles.footerBtnText}>Chapters</Text>
          </TouchableOpacity>

          {data.nextChapter ? (
            <TouchableOpacity
              style={[styles.footerBtn, styles.nextBtn]}
              onPress={() =>
                router.replace(`/manga/read/${data.slug}/${data.nextChapter}`)
              }
              activeOpacity={0.8}
            >
              <Text style={styles.nextBtnText}>Next Ch. {data.nextChapter}</Text>
              <Ionicons name="arrow-forward" size={16} color="#ffffff" />
            </TouchableOpacity>
          ) : (
            <View style={styles.latestBadge}>
              <Text style={styles.latestText}>Latest Chapter</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.topBtn}
          onPress={scrollToTop}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-up" size={16} color="#913FE2" />
          <Text style={styles.topBtnText}>Back to Top</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Floating Top Controls Header */}
      {showControls && (
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={20} color="#ffffff" />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {data.seriesTitle || data.slug.replace(/-[0-9a-f]+$/i, "").replace(/-/g, " ")}
            </Text>
            <Text style={styles.headerSubtitle}>
              Chapter {data.chapter} • {data.pages.length} Pages
            </Text>
          </View>

          <View style={styles.navRow}>
            {data.prevChapter && (
              <TouchableOpacity
                style={styles.navBtn}
                onPress={() =>
                  router.replace(`/manga/read/${data.slug}/${data.prevChapter}`)
                }
              >
                <Ionicons name="chevron-back" size={18} color="#ffffff" />
              </TouchableOpacity>
            )}

            {data.nextChapter && (
              <TouchableOpacity
                style={[styles.navBtn, styles.nextNavBtn]}
                onPress={() =>
                  router.replace(`/manga/read/${data.slug}/${data.nextChapter}`)
                }
              >
                <Ionicons name="chevron-forward" size={18} color="#ffffff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Pages List */}
      <FlatList
        ref={flatListRef}
        data={data.pages}
        renderItem={renderPage}
        keyExtractor={(_, index) => String(index)}
        ListFooterComponent={renderFooter}
        initialNumToRender={2}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: "rgba(11, 12, 16, 0.92)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    zIndex: 50,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#161b22",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#8b949e",
    fontSize: 11,
    marginTop: 1,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#21262d",
    alignItems: "center",
    justifyContent: "center",
  },
  nextNavBtn: {
    backgroundColor: "#913FE2",
  },
  pageContainer: {
    width: SCREEN_WIDTH,
    minHeight: SCREEN_WIDTH * 1.4,
    backgroundColor: "#000000",
  },
  pageImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.5,
  },
  footerContainer: {
    padding: 24,
    backgroundColor: "#0b0c10",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#21262d",
    marginVertical: 16,
  },
  footerTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  footerSubtitle: {
    color: "#8b949e",
    fontSize: 12,
    marginBottom: 20,
  },
  footerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  footerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#30363d",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  footerBtnText: {
    color: "#f0f6fc",
    fontSize: 12,
    fontWeight: "600",
  },
  nextBtn: {
    backgroundColor: "#913FE2",
    borderColor: "#913FE2",
  },
  nextBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  latestBadge: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#161b22",
    borderRadius: 8,
  },
  latestText: {
    color: "#8b949e",
    fontSize: 12,
    fontWeight: "600",
  },
  topBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  topBtnText: {
    color: "#913FE2",
    fontSize: 12,
    fontWeight: "700",
  },
});
