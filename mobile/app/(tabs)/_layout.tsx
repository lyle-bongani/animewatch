import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#000000",
          borderTopColor: "#18181b",
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: "#e50914", // Netflix Red / Vibrant Accent
        tabBarInactiveTintColor: "#71717a",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 0.1,
        },
      }}
    >
      {/* 1. Home: Netflix + Crunchyroll + Mihon flagship experience */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={21}
              color={color}
            />
          ),
        }}
      />

      {/* 2. Browse: Catalogs, Sources & Genres */}
      <Tabs.Screen
        name="browse"
        options={{
          title: "Browse",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "compass" : "compass-outline"}
              size={21}
              color={color}
            />
          ),
        }}
      />

      {/* 3. Library: Mihon Category-Based Collection */}
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarActiveTintColor: "#a855f7",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "book" : "book-outline"}
              size={21}
              color={color}
            />
          ),
        }}
      />

      {/* 4. Updates: Latest Releases Feed */}
      <Tabs.Screen
        name="updates"
        options={{
          title: "Updates",
          tabBarActiveTintColor: "#f97316",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "flash" : "flash-outline"}
              size={21}
              color={color}
            />
          ),
        }}
      />

      {/* 5. More: History, Reader & Stream Settings */}
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "ellipsis-horizontal-circle" : "ellipsis-horizontal-circle-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* Direct routes accessible via router.push but not taking a tab bar slot */}
      <Tabs.Screen name="history" options={{ href: null }} />
      <Tabs.Screen name="donghua" options={{ href: null }} />
      <Tabs.Screen name="manga" options={{ href: null }} />
      <Tabs.Screen name="search" options={{ href: null }} />
      <Tabs.Screen name="watchlist" options={{ href: null }} />
    </Tabs>
  );
}
