import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  getMihonLibrary,
  type LibraryCategory,
  type MihonLibraryItem,
  updateLibraryCategory,
  removeMihonLibraryItem,
} from "../../lib/mihonStorage";

const CATEGORIES: { key: LibraryCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "reading", label: "Reading & Watching" },
  { key: "plan_to_read", label: "Plan to Watch/Read" },
  { key: "completed", label: "Completed" },
  { key: "on_hold", label: "On Hold" },
];

export default function MihonLibraryScreen() {
  const router = useRouter();
  const [library, setLibrary] = useState<MihonLibraryItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<LibraryCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MihonLibraryItem | null>(null);

  const loadLibrary = async () => {
    const data = await getMihonLibrary();
    setLibrary(data);
  };

  useEffect(() => {
    loadLibrary();
  }, []);

  const filteredItems = library.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      !searchQuery.trim() || item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCategoryChange = async (cat: LibraryCategory) => {
    if (!selectedItem) return;
    await updateLibraryCategory(selectedItem.id, cat);
    setSelectedItem(null);
    loadLibrary();
  };

  const handleRemoveFromLibrary = async () => {
    if (!selectedItem) return;
    await removeMihonLibraryItem(selectedItem.id);
    setSelectedItem(null);
    loadLibrary();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Mihon Library Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Library</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setSearchOpen(!searchOpen)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={searchOpen ? "close" : "search"}
                size={20}
                color="#ffffff"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Input Bar */}
        {searchOpen && (
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color="#71717a" />
            <TextInput
              style={styles.searchInput}
              placeholder="Filter library items..."
              placeholderTextColor="#71717a"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={16} color="#71717a" />
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const count =
              cat.key === "all"
                ? library.length
                : library.filter((i) => i.category === cat.key).length;
            const isActive = activeCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                onPress={() => setActiveCategory(cat.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                  {cat.label} {count > 0 ? `(${count})` : ""}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Grid of Manga & Anime in Library */}
      <FlatList
        data={filteredItems}
        numColumns={3}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.gridContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.cardContainer}
            onPress={() => {
              if (item.type === "manga") {
                router.push(`/manga/${item.id}`);
              } else {
                router.push(`/anime/${item.id}`);
              }
            }}
            onLongPress={() => setSelectedItem(item)}
            activeOpacity={0.8}
          >
            <View style={styles.imageBox}>
              <Image
                source={{ uri: item.cover }}
                style={styles.coverImage}
                contentFit="cover"
                transition={200}
              />

              {/* Unread / Progress Badge */}
              {item.unreadCount && item.unreadCount > 0 ? (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unreadCount}</Text>
                </View>
              ) : null}

              {/* Type Badge */}
              <View
                style={[
                  styles.typeBadge,
                  item.type === "manga" ? styles.mangaType : styles.animeType,
                ]}
              >
                <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
              </View>
            </View>

            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>

            {item.lastReadChapterOrEp ? (
              <Text style={styles.lastReadText} numberOfLines={1}>
                {item.lastReadChapterOrEp}
              </Text>
            ) : null}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={48} color="#27272a" />
            <Text style={styles.emptyTitle}>Your Library is Empty</Text>
            <Text style={styles.emptySubtitle}>
              Save Anime, Manhwa, and Donghua to your personal collection to track episodes and chapters.
            </Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => router.push("/browse")}
              activeOpacity={0.8}
            >
              <Ionicons name="compass-outline" size={16} color="#ffffff" />
              <Text style={styles.exploreBtnText}>Browse Titles</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Category Management Modal (Long-Press) */}
      <Modal
        visible={Boolean(selectedItem)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedItem(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedItem(null)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {selectedItem?.title}
            </Text>
            <Text style={styles.modalSubtitle}>Move to category:</Text>

            {(["reading", "plan_to_read", "completed", "on_hold"] as LibraryCategory[]).map(
              (cat) => (
                <TouchableOpacity
                  key={cat}
                  style={styles.modalOption}
                  onPress={() => handleCategoryChange(cat)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      selectedItem?.category === cat && styles.modalOptionActive,
                    ]}
                  >
                    {cat.replace(/_/g, " ").toUpperCase()}
                  </Text>
                  {selectedItem?.category === cat && (
                    <Ionicons name="checkmark" size={18} color="#a855f7" />
                  )}
                </TouchableOpacity>
              )
            )}

            <TouchableOpacity
              style={[styles.modalOption, styles.modalDeleteOption]}
              onPress={handleRemoveFromLibrary}
              activeOpacity={0.8}
            >
              <Text style={styles.modalDeleteText}>Remove from Library</Text>
              <Ionicons name="trash-outline" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    backgroundColor: "#000000",
    borderBottomWidth: 1,
    borderBottomColor: "#18181b",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 12,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#18181b",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181b",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  searchInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 13,
    paddingVertical: 0,
  },
  categoryScroll: {
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
  },
  categoryChipActive: {
    backgroundColor: "#a855f7",
    borderColor: "#a855f7",
  },
  categoryText: {
    color: "#a1a1aa",
    fontSize: 12,
    fontWeight: "700",
  },
  categoryTextActive: {
    color: "#ffffff",
  },
  gridContent: {
    padding: 12,
    paddingBottom: 24,
  },
  cardContainer: {
    flex: 1 / 3,
    padding: 4,
    marginBottom: 8,
  },
  imageBox: {
    aspectRatio: 2 / 3,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#18181b",
    position: "relative",
    borderWidth: 1,
    borderColor: "#27272a",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  unreadBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#a855f7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
  },
  typeBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  animeType: {
    backgroundColor: "#e50914",
  },
  mangaType: {
    backgroundColor: "#913FE2",
  },
  typeText: {
    color: "#ffffff",
    fontSize: 8,
    fontWeight: "800",
  },
  cardTitle: {
    color: "#f4f4f5",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
    lineHeight: 16,
  },
  lastReadText: {
    color: "#71717a",
    fontSize: 10,
    marginTop: 2,
  },
  emptyContainer: {
    padding: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 60,
  },
  emptyTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
  },
  emptySubtitle: {
    color: "#71717a",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  exploreBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#a855f7",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  exploreBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
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
