import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getAsuraChapterPages, getAsuraComic } from "../../../../lib/asura";
import type { AsuraChapterData, AsuraComicDetail } from "../../../../lib/types";
import { MihonReader } from "../../../../components/MihonReader";
import { recordMihonHistory } from "../../../../lib/mihonStorage";

export default function WebtoonReaderScreen() {
  const router = useRouter();
  const { slug, chapter } = useLocalSearchParams<{
    slug: string;
    chapter: string;
  }>();

  const [data, setData] = useState<AsuraChapterData | null>(null);
  const [comic, setComic] = useState<AsuraComicDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug && chapter) {
      setLoading(true);
      Promise.all([
        getAsuraChapterPages(slug, chapter),
        getAsuraComic(slug),
      ]).then(([chapterData, comicData]) => {
        setComic(comicData);

        let prev = chapterData?.prevChapter || null;
        let next = chapterData?.nextChapter || null;

        if (comicData?.chapters && comicData.chapters.length > 0) {
          const idx = comicData.chapters.findIndex(
            (c) => c.number === chapter || parseFloat(c.number) === parseFloat(chapter)
          );
          if (idx > -1) {
            if (!prev && idx > 0) prev = comicData.chapters[idx - 1].number;
            if (!next && idx < comicData.chapters.length - 1)
              next = comicData.chapters[idx + 1].number;
          }
        }

        const resolved: AsuraChapterData = {
          slug,
          chapter,
          seriesTitle: comicData?.title || chapterData?.seriesTitle,
          pages: chapterData?.pages || [],
          prevChapter: prev,
          nextChapter: next,
        };

        setData(resolved);
        setLoading(false);

        if (comicData) {
          recordMihonHistory({
            id: comicData.slug,
            type: "manga",
            title: comicData.title,
            cover: comicData.cover,
            chapterOrEp: chapter,
            progress: `Ch. ${chapter}`,
          });
        }
      });
    }
  }, [slug, chapter]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#a855f7" />
        <Text style={styles.loadingText}>
          Loading Chapter {chapter} pages...
        </Text>
      </View>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={40} color="#e50914" />
        <Text style={styles.errorTitle}>Chapter Not Found</Text>
        <Text style={styles.errorDesc}>
          Unable to retrieve pages for Chapter {chapter}.
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <MihonReader
        data={data}
        allChapters={comic?.chapters.map((c) => ({ number: c.number }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  loadingText: {
    color: "#8b949e",
    fontSize: 13,
    fontWeight: "600",
  },
  errorTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 8,
  },
  errorDesc: {
    color: "#8b949e",
    fontSize: 13,
    textAlign: "center",
  },
  backBtn: {
    backgroundColor: "#913FE2",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    marginTop: 8,
  },
  backBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
});
