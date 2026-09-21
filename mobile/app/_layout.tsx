import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AdultGateProvider } from "../lib/adultGate";
import { AdultGateModal } from "../components/AdultGateModal";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AdultGateProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0b0c10" },
            animation: "fade_from_bottom",
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="anime/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="watch/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="manga/[slug]" options={{ headerShown: false }} />
          <Stack.Screen
            name="manga/read/[slug]/[chapter]"
            options={{ headerShown: false }}
          />
        </Stack>
        <AdultGateModal />
      </AdultGateProvider>
    </SafeAreaProvider>
  );
}
