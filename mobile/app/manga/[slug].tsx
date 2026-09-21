import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { getAsuraComic } from "../../lib/asura";
import type { AsuraComicDetail } from "../../lib/types";
import {
  getBookmarkedChapters,
  getMihonLibraryItem,
  getReadChapters,
  markChapterRead,
  removeMihonLibraryItem,
  saveMihonLibraryItem,
  toggleChapterBookmark,
  type LibraryCategory,
  type MihonLibraryItem,
} from "../../lib/mihonStorage";

export default function MihonMangaDetailScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [comic, setComic] = useState<AsuraComicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [libraryItem, setLibraryItem] = useState<MihonLibraryItem | null>(null);
  const [categoryModal, setCategoryModal] = useState(false);
  const [readChapters, setReadChapters] = useState<string[]>([]);
  const [bookmarkedChapters, setBookmarkedChapters] = useState<string[]>([]);
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [filterBookmarkedOnly, setFilterBookmarkedOnly] = useState(false);
  const [descending, setDescending] = useState(true);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  const loadData = async () => {
    if (!slug) return;
    const [comicData, libItem, reads, bookmarks] = await Promise.all([
      getAsuraComic(slug),
      getMihonLibraryItem(slug),
      getReadChapters(slug),
      getBookmarkedChapters(slug),
    ]);
    setComic(comicData);
    setLibraryItem(libItem);
    setReadChapters(reads);
    setBookmarkedChapters(bookmarks);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [slug]);

  const handleSetCategory = async (cat: LibraryCategory) => {
    if (!comic) return;
    const unread = comic.chapters.filter((c) => !readChapters.includes(c.number)).length;
    await saveMihonLibraryItem({
      id: comic.slug,
      type: "manga",
      title: comic.title,
      cover: comic.cover,
      category: cat,
      totalChaptersOrEps: comic.chapters.length,
      unreadCount: unread,
    });
    setCategoryModal(false);
    loadData();
  };

  const handleRemoveFromLibrary = async () => {
    if (!comic) return;
    await removeMihonLibraryItem(comic.slug);
    setCategoryModal(false);
    loadData();
  };

  const handleToggleRead = async (chNum: string) => {
    if (!comic) return;
    const isRead = readChapters.includes(chNum);
    await markChapterRead(comic.slug, chNum, !isRead);
    setReadChapters((prev) =>
      isRead ? prev.filter((c) => c !== chNum) : [...prev, chNum]
    );
  };

  const handleToggleBookmark = async (chNum: string) => {
    if (!comic) return;
    const added = await toggleChapterBookmark(comic.slug, chNum);
    setBookmarkedChapters((prev) =>
      added ? [...prev, chNum] : prev.filter((c) => c !== chNum)
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#a855f7" />
        <Text style={styles.loadingText}>Loading series info...</Text>
      </View>
    );
  }

  if (!comic) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Series not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Determine Resume Chapter (first unread chapter, or chapter 1)
  const firstUnread = comic.chapters.find((c) => !readChapters.includes(c.number));
  const resumeChapter = firstUnread ? firstUnread.number : comic.chapters[0]?.number;

  // Filter and sort chapters
  const filteredChapters = comic.chapters.filter((ch) => {
    if (filterUnreadOnly && readChapters.includes(ch.number)) return false;
    if (filterBookmarkedOnly && !bookmarkedChapters.includes(ch.number)) return false;
    if (searchFilter.trim() && !ch.number.includes(searchFilter.trim())) return false;
    return true;
  });

  const sortedChapters = [...filteredChapters].sort((a, b) => {
    const numA = parseFloat(a.number) || 0;
    const numB = parseFloat(b.number) || 0;
    return descending ? numB - numA : numA - numB;
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedChapters}
        keyExtractor={(item) => item.number}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {/* Parallax Header Banner with Ambient Blur */}
            <View style={styles.bannerContainer}>
              <Image
                source={{ uri: comic.cover }}
                style={styles.bannerImage}
                contentFit="cover"
              />
              <View style={styles.bannerOverlay} />

              <TouchableOpacity
                style={styles.floatingBackBtn}
                onPress={() => router.back()}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-back" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Poster & Header Info */}
            <View style={styles.headerInfo}>
              <Image
                source={{ uri: comic.cover }}
                style={styles.poster}
                contentFit="cover"
              />

              <View style={styles.titleColumn}>
                <Text style={styles.title} numberOfLines={3}>
                  {comic.title}
                </Text>

                <View style={styles.metaRow}>
                  <View style={styles.sourceTag}>
                    <Text style={styles.sourceTagText}>AsuraScans</Text>
                  </View>
                  <Text style={styles.statusText}>{comic.status}</Text>
                </View>
              </View>
            </View>

            {/* Mihon Action Bar: In Library & Resume Reading */}
            <View style={styles.actionBar}>
              <TouchableOpacity
                style={[styles.libraryBtn, libraryItem && styles.libraryBtnActive]}
                onPress={() => setCategoryModal(true)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={libraryItem ? "heart" : "heart-outline"}
                  size={18}
                  color={libraryItem ? "#a855f7" : "#ffffff"}
                />
                <Text
                  style={[
                    styles.libraryBtnText,
                    libraryItem && styles.libraryBtnTextActive,
                  ]}
                >
                  {libraryItem
                    ? libraryItem.category.replace(/_/g, " ").toUpperCase()
                    : "ADD TO LIBRARY"}
                </Text>
              </TouchableOpacity>

              {resumeChapter && (
                <TouchableOpacity
                  style={styles.resumeBtn}
                  onPress={() =>
                    router.push(`/manga/read/${comic.slug}/${resumeChapter}`)
                  }
                  activeOpacity={0.8}
                >
                  <Ionicons name="play" size={16} color="#ffffff" />
                  <Text style={styles.resumeBtnText}>
                    {firstUnread ? `RESUME CH. ${resumeChapter}` : "READ AGAIN"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Expandable Description */}
            <View style={styles.synopsisSection}>
              <Text
                style={styles.synopsisText}
                numberOfLines={synopsisExpanded ? undefined : 3}
              >
                {comic.synopsis}
              </Text>
              <TouchableOpacity
                style={styles.moreBtn}
                onPress={() => setSynopsisExpanded(!synopsisExpanded)}
              >
                <Text style={styles.moreBtnText}>
                  {synopsisExpanded ? "LESS" : "MORE"}
                </Text>
                <Ionicons
                  name={synopsisExpanded ? "chevron-up" : "chevron-down"}
                  size={14}
                  color="#a855f7"
                />
              </TouchableOpacity>
            </View>

            {/* Genre Chips */}
            {comic.genres.length > 0 && (
              <View style={styles.genresRow}>
                {comic.genres.map((g) => (
                  <View key={g} style={styles.genrePill}>
                    <Text style={styles.genreText}>{g}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Mihon Chapter Directory Header & Filters */}
            <View style={styles.chapterHeader}>
              <View style={styles.chapterCountRow}>
                <Text style={styles.chapterCountTitle}>
                  {comic.chapters.length} Chapters
                </Text>
                <Text style={styles.unreadCountText}>
                  {comic.chapters.length - readChapters.length} unread
                </Text>
              </View>

              {/* Mihon Filter Pill Bar */}
              <View style={styles.filterRow}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    filterUnreadOnly && styles.filterChipActive,
                  ]}
                  onPress={() => setFilterUnreadOnly(!filterUnreadOnly)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filterUnreadOnly && styles.filterChipTextActive,
                    ]}
                  >
                    Unread
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    filterBookmarkedOnly && styles.filterChipActive,
                  ]}
                  onPress={() => setFilterBookmarkedOnly(!filterBookmarkedOnly)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filterBookmarkedOnly && styles.filterChipTextActive,
                    ]}
                  >
                    Bookmarked
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.filterChip}
                  onPress={() => setDescending(!descending)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={descending ? "arrow-down" : "arrow-up"}
                    size={12}
                    color="#d4d4d8"
                  />
                  <Text style={styles.filterChipText}>
                    {descending ? "Newest" : "Oldest"}
                  </Text>
                </TouchableOpacity>

                {/* Filter Number Search */}
                <TextInput
                  style={styles.filterInput}
                  placeholder="#..."
                  placeholderTextColor="#71717a"
                  value={searchFilter}
                  onChangeText={setSearchFilter}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const isRead = readChapters.includes(item.number);
          const isBookmarked = bookmarkedChapters.includes(item.number);

          return (
            <TouchableOpacity
              style={[styles.chapterRow, isRead && styles.chapterRowRead]}
              onPress={() => router.push(`/manga/read/${comic.slug}/${item.number}`)}
              onLongPress={() => handleToggleRead(item.number)}
              activeOpacity={0.8}
            >
              <View style={styles.chapterDetails}>
                <Text
                  style={[styles.chapterTitle, isRead && styles.chapterTitleRead]}
                  numberOfLines={1}
                >
                  Chapter {item.number}
                </Text>
                {item.publishedAt ? (
                  <Text style={styles.chapterDate}>{item.publishedAt}</Text>
                ) : null}
              </View>

              <View style={styles.chapterActions}>
                {/* Bookmark Star */}
                <TouchableOpacity
                  style={styles.iconAction}
                  onPress={() => handleToggleBookmark(item.number)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={isBookmarked ? "bookmark" : "bookmark-outline"}
                    size={18}
                    color={isBookmarked ? "#a855f7" : "#52525b"}
                  />
                </TouchableOpacity>

                {/* Mark Read Checkmark */}
                <TouchableOpacity
                  style={styles.iconAction}
                  onPress={() => handleToggleRead(item.number)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={isRead ? "checkmark-circle" : "ellipse-outline"}
                    size={18}
                    color={isRead ? "#a855f7" : "#52525b"}
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Category Selection Modal */}
      <Modal
        visible={categoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCategoryModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Library Category</Text>
            <Text style={styles.modalSubtitle}>Organize in your library:</Text>

            {(["reading", "plan_to_read", "completed", "on_hold"] as LibraryCategory[]).map(
              (cat) => (
                <TouchableOpacity
                  key={cat}
                  style={styles.modalOption}
                  onPress={() => handleSetCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      libraryItem?.category === cat && styles.modalOptionActive,
                    ]}
                  >
                    {cat.replace(/_/g, " ").toUpperCase()}
                  </Text>
                  {libraryItem?.category === cat && (
                    <Ionicons name="checkmark" size={18} color="#a855f7" />
                  )}
                </TouchableOpacity>
              )
            )}

            {libraryItem && (
              <TouchableOpacity
                style={[styles.modalOption, styles.modalDeleteOption]}
                onPress={handleRemoveFromLibrary}
                activeOpacity={0.8}
              >
                <Text style={styles.modalDeleteText}>Remove from Library</Text>
                <Ionicons name="trash-outline" size={16} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  listContent: {
    paddingBottom: 40,
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
    color: "#71717a",
    fontSize: 13,
  },
  errorText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  backBtn: {
    backgroundColor: "#a855f7",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backBtnText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  bannerContainer: {
    height: 180,
    width: "100%",
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    opacity: 0.35,
  },
  bannerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
  },
  floatingBackBtn: {
    position: "absolute",
    top: 44,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
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
  poster: {
    width: 110,
    height: 160,
    borderRadius: 10,
    backgroundColor: "#18181b",
    borderWidth: 1.5,
    borderColor: "#27272a",
  },
  titleColumn: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 4,
  },
  title: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 22,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sourceTag: {
    backgroundColor: "rgba(168, 85, 247, 0.15)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sourceTagText: {
    color: "#a855f7",
    fontSize: 10,
    fontWeight: "800",
  },
  statusText: {
    color: "#a1a1aa",
    fontSize: 11,
    fontWeight: "600",
  },
  actionBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 18,
    gap: 10,
  },
  libraryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  libraryBtnActive: {
    borderColor: "#a855f7",
    backgroundColor: "rgba(168, 85, 247, 0.1)",
  },
  libraryBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  libraryBtnTextActive: {
    color: "#a855f7",
  },
  resumeBtn: {
    flex: 1.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#a855f7",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  resumeBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  synopsisSection: {
    paddingHorizontal: 16,
    marginTop: 14,
  },
  synopsisText: {
    color: "#a1a1aa",
    fontSize: 12,
    lineHeight: 18,
  },
  moreBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    marginTop: 4,
    gap: 2,
  },
  moreBtnText: {
    color: "#a855f7",
    fontSize: 11,
    fontWeight: "800",
  },
  genresRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    marginTop: 10,
    gap: 6,
  },
  genrePill: {
    backgroundColor: "#18181b",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  genreText: {
    color: "#71717a",
    fontSize: 10,
    fontWeight: "600",
  },
  chapterHeader: {
    paddingHorizontal: 16,
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#18181b",
    paddingBottom: 12,
    gap: 10,
  },
  chapterCountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chapterCountTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  unreadCountText: {
    color: "#71717a",
    fontSize: 12,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: "#a855f7",
    borderColor: "#a855f7",
  },
  filterChipText: {
    color: "#d4d4d8",
    fontSize: 11,
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: "#ffffff",
  },
  filterInput: {
    width: 60,
    height: 32,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 8,
    color: "#ffffff",
    paddingHorizontal: 8,
    fontSize: 11,
  },
  chapterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#18181b",
  },
  chapterRowRead: {
    opacity: 0.4,
  },
  chapterDetails: {
    flex: 1,
  },
  chapterTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  chapterTitleRead: {
    color: "#71717a",
  },
  chapterDate: {
    color: "#71717a",
    fontSize: 11,
    marginTop: 2,
  },
  chapterActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconAction: {
    padding: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#18181b",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#27272a",
    padding: 20,
    gap: 6,
  },
  modalTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  modalSubtitle: {
    color: "#71717a",
    fontSize: 12,
    marginBottom: 8,
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
  },
  modalOptionText: {
    color: "#d4d4d8",
    fontSize: 13,
    fontWeight: "600",
  },
  modalOptionActive: {
    color: "#a855f7",
    fontWeight: "800",
  },
  modalDeleteOption: {
    borderBottomWidth: 0,
    marginTop: 4,
  },
  modalDeleteText: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "700",
  },
});
