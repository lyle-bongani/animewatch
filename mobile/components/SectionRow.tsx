import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SectionRowProps<T> {
  title: string;
  data: T[];
  renderItem: ({ item }: { item: T }) => React.ReactElement;
  keyExtractor: (item: T) => string;
  onSeeAll?: () => void;
  accentColor?: string;
}

export function SectionRow<T>({
  title,
  data,
  renderItem,
  keyExtractor,
  onSeeAll,
  accentColor = "#e50914",
}: SectionRowProps<T>) {
  if (!data || data.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
          <Text style={styles.title}>{title}</Text>
        </View>

        {onSeeAll && (
          <TouchableOpacity
            onPress={onSeeAll}
            style={styles.seeAllBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.seeAllText}>See All</Text>
            <Ionicons name="chevron-forward" size={12} color="#8b949e" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        horizontal
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  accentBar: {
    width: 3.5,
    height: 16,
    borderRadius: 2,
  },
  title: {
    color: "#f0f6fc",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  seeAllText: {
    color: "#8b949e",
    fontSize: 12,
    fontWeight: "600",
  },
  listContent: {
    paddingLeft: 16,
    paddingRight: 4,
  },
});
