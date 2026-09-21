import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getAsuraLatest, searchAsura } from "../../lib/asura";
import type { AsuraSeriesCard } from "../../lib/types";
import { MangaCard } from "../../components/MangaCard";

export default function MangaScreen() {
  const [items, setItems] = useState<AsuraSeriesCard[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (searchQuery?: string) => {
    try {
      if (searchQuery?.trim()) {
        const results = await searchAsura(searchQuery.trim());
        setItems(results);
      } else {
        const latest = await getAsuraLatest();
        setItems(latest);
      }
    } catch (e) {
      console.error("Failed to load manga", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearchSubmit = () => {
    setLoading(true);
    loadData(query);
  };

  const handleClear = () => {
    setQuery("");
    setLoading(true);
    loadData("");
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData(query);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.accentBar} />
          <Text style={styles.title}>Manga & Manhwa</Text>
        </View>
        <Text style={styles.subtitle}>
          Continuous Webtoon reader directly from AsuraScans
        </Text>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color="#8b949e" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search manhwa by title (Solo Max-Level, Return)..."
            placeholderTextColor="#8b949e"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {query ? (
            <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={16} color="#8b949e" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Grid */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#913FE2" />
          <Text style={styles.loadingText}>Fetching AsuraScans catalog...</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          numColumns={2}
          keyExtractor={(item) => item.slug}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <MangaCard comic={item} width={165} />
            </View>
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#913FE2"
              colors={["#913FE2"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons name="book-outline" size={32} color="#30363d" />
              <Text style={styles.emptyText}>No series found</Text>
              {query ? (
                <TouchableOpacity style={styles.resetBtn} onPress={handleClear}>
                  <Text style={styles.resetBtnText}>Clear Search</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0b0c10",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#21262d",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  accentBar: {
    width: 3.5,
    height: 18,
    borderRadius: 2,
    backgroundColor: "#913FE2",
  },
  title: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
  },
  subtitle: {
    color: "#8b949e",
    fontSize: 12,
    marginTop: 2,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161b22",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: "#30363d",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 13,
    paddingVertical: 0,
  },
  listContent: {
    padding: 12,
    paddingBottom: 24,
  },
  cardWrapper: {
    flex: 1,
    alignItems: "center",
    marginBottom: 16,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 10,
  },
  loadingText: {
    color: "#8b949e",
    fontSize: 12,
  },
  emptyText: {
    color: "#8b949e",
    fontSize: 13,
  },
  resetBtn: {
    marginTop: 8,
    backgroundColor: "#913FE2",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
  },
  resetBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
});
