import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { AsuraChapterData } from "../lib/types";
import {
  getReaderSettings,
  markChapterRead,
  saveReaderSettings,
  type ReaderSettings,
} from "../lib/mihonStorage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface MihonReaderProps {
  data: AsuraChapterData;
  allChapters?: { number: string }[];
}

export function MihonReader({ data }: MihonReaderProps) {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [showControls, setShowControls] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [settingsModal, setSettingsModal] = useState(false);
  const [settings, setSettings] = useState<ReaderSettings>({
    readingMode: "webtoon",
    backgroundColor: "black",
    cropBorders: false,
  });

  useEffect(() => {
    getReaderSettings().then(setSettings);
  }, []);

  const totalPages = data.pages.length;

  const handleUpdateSetting = async <K extends keyof ReaderSettings>(
    key: K,
    val: ReaderSettings[K]
  ) => {
    const updated = { ...settings, [key]: val };
    setSettings(updated);
    await saveReaderSettings({ [key]: val });
  };

  const handlePageChange = (index: number) => {
    setCurrentPage(index + 1);
    // When user reaches the last page, automatically mark chapter as read!
    if (index + 1 >= totalPages && data.slug && data.chapter) {
      markChapterRead(data.slug, data.chapter, true);
    }
  };

  const jumpToPage = (target: number) => {
    const validPage = Math.max(1, Math.min(target, totalPages));
    setCurrentPage(validPage);
    flatListRef.current?.scrollToIndex({
      index: validPage - 1,
      animated: true,
    });
  };

  const bgColor =
    settings.backgroundColor === "black"
      ? "#000000"
      : settings.backgroundColor === "dark_gray"
      ? "#18181b"
      : "#ffffff";

  const isHorizontal =
    settings.readingMode === "paged_ltr" || settings.readingMode === "paged_rtl";

  const renderItem = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => setShowControls(!showControls)}
      style={[
        styles.pageBox,
        isHorizontal && { width: SCREEN_WIDTH, height: "100%", justifyContent: "center" },
      ]}
    >
      <Image
        source={{ uri: item }}
        style={[
          styles.pageImage,
          isHorizontal && { height: "100%", width: SCREEN_WIDTH },
        ]}
        contentFit={isHorizontal ? "contain" : "contain"}
        priority={index < 3 ? "high" : "normal"}
      />
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (isHorizontal || data.pages.length === 0) return null;

    return (
      <View style={styles.endCard}>
        <Text style={styles.endTitle}>End of Chapter {data.chapter}</Text>
        <Text style={styles.endSubtitle}>
          Completed all {totalPages} pages • Chapter marked as read
        </Text>

        <View style={styles.endActions}>
          {data.prevChapter && (
            <TouchableOpacity
              style={styles.endBtn}
              onPress={() =>
                router.replace(`/manga/read/${data.slug}/${data.prevChapter}`)
              }
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={16} color="#f4f4f5" />
              <Text style={styles.endBtnText}>Ch. {data.prevChapter}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.endBtn}
            onPress={() => router.replace(`/manga/${data.slug}`)}
            activeOpacity={0.8}
          >
            <Ionicons name="list" size={16} color="#f4f4f5" />
            <Text style={styles.endBtnText}>Overview</Text>
          </TouchableOpacity>

          {data.nextChapter ? (
            <TouchableOpacity
              style={[styles.endBtn, styles.nextChapterBtn]}
              onPress={() =>
                router.replace(`/manga/read/${data.slug}/${data.nextChapter}`)
              }
              activeOpacity={0.8}
            >
              <Text style={styles.nextChapterText}>Next Ch. {data.nextChapter}</Text>
              <Ionicons name="arrow-forward" size={16} color="#ffffff" />
            </TouchableOpacity>
          ) : (
            <View style={styles.caughtUpBadge}>
              <Text style={styles.caughtUpText}>Latest Chapter</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Floating Top Header */}
      {showControls && (
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#ffffff" />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.seriesTitle} numberOfLines={1}>
              {data.seriesTitle || data.slug.replace(/-[0-9a-f]+$/i, "").replace(/-/g, " ")}
            </Text>
            <Text style={styles.chapterSubtitle}>
              Chapter {data.chapter} • AsuraScans
            </Text>
          </View>

          <TouchableOpacity
            style={styles.settingsIconBtn}
            onPress={() => setSettingsModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="settings-outline" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Pages Container */}
      <FlatList
        ref={flatListRef}
        data={data.pages}
        renderItem={renderItem}
        keyExtractor={(_, index) => String(index)}
        horizontal={isHorizontal}
        pagingEnabled={isHorizontal}
        inverted={settings.readingMode === "paged_rtl"}
        ListFooterComponent={renderFooter}
        onMomentumScrollEnd={(e) => {
          if (isHorizontal) {
            const index = Math.round(
              e.nativeEvent.contentOffset.x / SCREEN_WIDTH
            );
            handlePageChange(index);
          }
        }}
        onScroll={(e) => {
          if (!isHorizontal && totalPages > 0) {
            const scrollY = e.nativeEvent.contentOffset.y;
            const approxPage = Math.min(
              totalPages,
              Math.max(1, Math.floor(scrollY / (SCREEN_WIDTH * 1.3)) + 1)
            );
            setCurrentPage(approxPage);
            if (approxPage >= totalPages && data.slug && data.chapter) {
              markChapterRead(data.slug, data.chapter, true);
            }
          }
        }}
        initialNumToRender={2}
        maxToRenderPerBatch={3}
        windowSize={5}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />

      {/* Mihon Floating Bottom Scrubber */}
      {showControls && (
        <View style={styles.bottomScrubber}>
          {/* Previous Chapter */}
          <TouchableOpacity
            style={[styles.scrubberNavBtn, !data.prevChapter && styles.disabledNavBtn]}
            disabled={!data.prevChapter}
            onPress={() =>
              data.prevChapter &&
              router.replace(`/manga/read/${data.slug}/${data.prevChapter}`)
            }
          >
            <Ionicons
              name="play-skip-back"
              size={16}
              color={data.prevChapter ? "#ffffff" : "#52525b"}
            />
          </TouchableOpacity>

          {/* Page Scrubber Indicator */}
          <View style={styles.scrubberCenter}>
            <TouchableOpacity
              onPress={() => jumpToPage(currentPage - 1)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={14} color="#a1a1aa" />
            </TouchableOpacity>

            <Text style={styles.scrubberText}>
              {currentPage} / {totalPages || 1}
            </Text>

            <TouchableOpacity
              onPress={() => jumpToPage(currentPage + 1)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-forward" size={14} color="#a1a1aa" />
            </TouchableOpacity>
          </View>

          {/* Next Chapter */}
          <TouchableOpacity
            style={[styles.scrubberNavBtn, !data.nextChapter && styles.disabledNavBtn]}
            disabled={!data.nextChapter}
            onPress={() =>
              data.nextChapter &&
              router.replace(`/manga/read/${data.slug}/${data.nextChapter}`)
            }
          >
            <Ionicons
              name="play-skip-forward"
              size={16}
              color={data.nextChapter ? "#ffffff" : "#52525b"}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Reader Settings Modal */}
      <Modal
        visible={settingsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setSettingsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSettingsModal(false)}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalSheetTitle}>Reader Settings</Text>

            {/* Reading Mode Selection */}
            <Text style={styles.sheetSectionHeader}>Reading Mode</Text>
            <View style={styles.modeOptionRow}>
              {(
                [
                  { key: "webtoon", label: "Webtoon" },
                  { key: "paged_ltr", label: "LTR (Paged)" },
                  { key: "paged_rtl", label: "RTL (Manga)" },
                ] as const
              ).map((mode) => (
                <TouchableOpacity
                  key={mode.key}
                  style={[
                    styles.modeChoice,
                    settings.readingMode === mode.key && styles.modeChoiceActive,
                  ]}
                  onPress={() => handleUpdateSetting("readingMode", mode.key)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.modeChoiceText,
                      settings.readingMode === mode.key && styles.modeChoiceTextActive,
                    ]}
                  >
                    {mode.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Background Color Selection */}
            <Text style={styles.sheetSectionHeader}>Background Color</Text>
            <View style={styles.modeOptionRow}>
              {(
                [
                  { key: "black", label: "AMOLED Black" },
                  { key: "dark_gray", label: "Dark Gray" },
                  { key: "white", label: "White" },
                ] as const
              ).map((bg) => (
                <TouchableOpacity
                  key={bg.key}
                  style={[
                    styles.modeChoice,
                    settings.backgroundColor === bg.key && styles.modeChoiceActive,
                  ]}
                  onPress={() => handleUpdateSetting("backgroundColor", bg.key)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.modeChoiceText,
                      settings.backgroundColor === bg.key && styles.modeChoiceTextActive,
                    ]}
                  >
                    {bg.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.closeSheetBtn}
              onPress={() => setSettingsModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.closeSheetBtnText}>Apply & Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
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
    backgroundColor: "#18181b",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  seriesTitle: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
  },
  chapterSubtitle: {
    color: "#a1a1aa",
    fontSize: 11,
    marginTop: 1,
  },
  settingsIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#18181b",
    alignItems: "center",
    justifyContent: "center",
  },
  pageBox: {
    width: SCREEN_WIDTH,
    minHeight: SCREEN_WIDTH * 1.3,
  },
  pageImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.5,
  },
  bottomScrubber: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    height: 50,
    backgroundColor: "rgba(24, 24, 27, 0.95)",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#3f3f46",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    zIndex: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  scrubberNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#27272a",
    alignItems: "center",
    justifyContent: "center",
  },
  disabledNavBtn: {
    opacity: 0.3,
  },
  scrubberCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  scrubberText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
  },
  endCard: {
    padding: 24,
    backgroundColor: "#09090b",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#27272a",
    marginVertical: 20,
  },
  endTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  endSubtitle: {
    color: "#71717a",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  endActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  endBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  endBtnText: {
    color: "#f4f4f5",
    fontSize: 12,
    fontWeight: "700",
  },
  nextChapterBtn: {
    backgroundColor: "#a855f7",
    borderColor: "#a855f7",
  },
  nextChapterText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  caughtUpBadge: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#18181b",
    borderRadius: 8,
  },
  caughtUpText: {
    color: "#71717a",
    fontSize: 12,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#18181b",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#27272a",
    gap: 12,
  },
  modalSheetTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  sheetSectionHeader: {
    color: "#a1a1aa",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  modeOptionRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  modeChoice: {
    flex: 1,
    backgroundColor: "#27272a",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  modeChoiceActive: {
    backgroundColor: "#a855f7",
    borderColor: "#a855f7",
  },
  modeChoiceText: {
    color: "#a1a1aa",
    fontSize: 12,
    fontWeight: "700",
  },
  modeChoiceTextActive: {
    color: "#ffffff",
  },
  closeSheetBtn: {
    backgroundColor: "#27272a",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  closeSheetBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
});
