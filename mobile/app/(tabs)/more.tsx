import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  clearMihonHistory,
  getReaderSettings,
  saveReaderSettings,
  type ReaderSettings,
} from "../../lib/mihonStorage";
import { useAdultGate } from "../../lib/adultGate";

export default function MihonMoreScreen() {
  const router = useRouter();
  const { isAdultUnlocked, openModal, lockAdult } = useAdultGate();
  const [settings, setSettings] = useState<ReaderSettings>({
    readingMode: "webtoon",
    backgroundColor: "black",
    cropBorders: false,
  });

  useEffect(() => {
    getReaderSettings().then(setSettings);
  }, []);

  const updateSetting = async <K extends keyof ReaderSettings>(
    key: K,
    value: ReaderSettings[K]
  ) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await saveReaderSettings({ [key]: value });
  };

  const handleClearHistory = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to erase all reading and watching history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await clearMihonHistory();
            Alert.alert("Success", "History has been cleared.");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>More</Text>
        <Text style={styles.headerSubtitle}>Settings and preferences</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile / App Banner */}
        <View style={styles.appBanner}>
          <View style={styles.appIconBox}>
            <Ionicons name="book" size={24} color="#a855f7" />
          </View>
          <View style={styles.appInfo}>
            <Text style={styles.appName}>AnimeWatch</Text>
            <Text style={styles.appSubtitle}>Netflix • Crunchyroll • Mihon Hybrid</Text>
          </View>
        </View>

        {/* Section: Activity & History */}
        <Text style={styles.sectionHeader}>Activity</Text>

        <View style={styles.settingGroup}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push("/history")}
            activeOpacity={0.8}
          >
            <View style={[styles.settingIcon, { backgroundColor: "rgba(168, 85, 247, 0.15)" }]}>
              <Ionicons name="time-outline" size={18} color="#a855f7" />
            </View>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>Reading & Watch History</Text>
              <Text style={styles.settingDesc}>
                View completed and in-progress chapters and episodes
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#71717a" />
          </TouchableOpacity>
        </View>

        {/* Section: Reader Configuration */}
        <Text style={styles.sectionHeader}>Reader Settings</Text>

        <View style={styles.settingGroup}>
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="phone-portrait-outline" size={18} color="#a855f7" />
            </View>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>Default Reading Mode</Text>
              <Text style={styles.settingDesc}>
                {settings.readingMode === "webtoon"
                  ? "Webtoon (Continuous Vertical)"
                  : settings.readingMode === "paged_ltr"
                  ? "Paged (Left to Right)"
                  : "Paged (Right to Left)"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.cycleBtn}
              onPress={() => {
                const nextMode =
                  settings.readingMode === "webtoon"
                    ? "paged_ltr"
                    : settings.readingMode === "paged_ltr"
                    ? "paged_rtl"
                    : "webtoon";
                updateSetting("readingMode", nextMode);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.cycleBtnText}>Cycle</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="color-palette-outline" size={18} color="#a855f7" />
            </View>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>Background Theme</Text>
              <Text style={styles.settingDesc}>
                {settings.backgroundColor === "black"
                  ? "Pure AMOLED Black"
                  : settings.backgroundColor === "dark_gray"
                  ? "Dark Gray"
                  : "White"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.cycleBtn}
              onPress={() => {
                const nextBg =
                  settings.backgroundColor === "black"
                    ? "dark_gray"
                    : settings.backgroundColor === "dark_gray"
                    ? "white"
                    : "black";
                updateSetting("backgroundColor", nextBg);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.cycleBtnText}>Switch</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: Content & Security */}
        <Text style={styles.sectionHeader}>Content Filter & Security</Text>

        <View style={styles.settingGroup}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={isAdultUnlocked ? lockAdult : openModal}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.settingIcon,
                {
                  backgroundColor: isAdultUnlocked
                    ? "rgba(229, 9, 20, 0.15)"
                    : "rgba(34, 197, 94, 0.15)",
                },
              ]}
            >
              <Ionicons
                name={isAdultUnlocked ? "lock-open" : "shield-checkmark"}
                size={18}
                color={isAdultUnlocked ? "#ef4444" : "#22c55e"}
              />
            </View>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>
                {isAdultUnlocked ? "18+ Content Unlocked" : "Safe Mode Active"}
              </Text>
              <Text style={styles.settingDesc}>
                {isAdultUnlocked
                  ? "Mature and adult series are visible. Tap to lock."
                  : "Adult series are locked. Tap to verify age."}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#71717a" />
          </TouchableOpacity>
        </View>

        {/* Section: Data & Storage */}
        <Text style={styles.sectionHeader}>Data Management</Text>

        <View style={styles.settingGroup}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleClearHistory}
            activeOpacity={0.8}
          >
            <View style={[styles.settingIcon, { backgroundColor: "rgba(239, 68, 68, 0.15)" }]}>
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
            </View>
            <View style={styles.settingTextCol}>
              <Text style={[styles.settingTitle, { color: "#ef4444" }]}>
                Clear Reading & Watch History
              </Text>
              <Text style={styles.settingDesc}>
                Remove all reading timeline entries
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* About Info */}
        <View style={styles.aboutContainer}>
          <Text style={styles.aboutText}>AnimeWatch v1.0.0 (Mihon Edition)</Text>
          <Text style={styles.aboutSubtext}>
            Sources powered by AsuraScans & AniList
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#18181b",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: "#71717a",
    fontSize: 12,
    marginTop: 2,
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  appBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18181b",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#27272a",
    gap: 14,
    marginBottom: 24,
  },
  appIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(168, 85, 247, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  appSubtitle: {
    color: "#71717a",
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeader: {
    color: "#a1a1aa",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 6,
    marginLeft: 4,
  },
  settingGroup: {
    backgroundColor: "#18181b",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272a",
    overflow: "hidden",
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
    gap: 12,
  },
  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#27272a",
    alignItems: "center",
    justifyContent: "center",
  },
  settingTextCol: {
    flex: 1,
  },
  settingTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  settingDesc: {
    color: "#71717a",
    fontSize: 11,
    marginTop: 2,
  },
  cycleBtn: {
    backgroundColor: "#27272a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cycleBtnText: {
    color: "#a855f7",
    fontSize: 12,
    fontWeight: "700",
  },
  aboutContainer: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 4,
  },
  aboutText: {
    color: "#71717a",
    fontSize: 12,
    fontWeight: "600",
  },
  aboutSubtext: {
    color: "#52525b",
    fontSize: 11,
  },
});
