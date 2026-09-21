import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { getAnimeStreamSources, type StreamServer } from "../lib/streaming";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface VideoPlayerProps {
  id: number | string;
  episode?: number;
  title?: string;
}

export function VideoPlayer({ id, episode = 1, title }: VideoPlayerProps) {
  const servers = getAnimeStreamSources(id, episode);
  const [selectedServer, setSelectedServer] = useState<StreamServer>(servers[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [key, setKey] = useState(1);

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    setKey((prev) => prev + 1);
  };

  return (
    <View style={styles.container}>
      {/* 16:9 Video Frame */}
      <View style={styles.playerFrame}>
        <WebView
          key={`${selectedServer.url}-${key}`}
          source={{ uri: selectedServer.url }}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          allowsFullscreenVideo
          mediaPlaybackRequiresUserAction={false}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          userAgent="Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
        />

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#e50914" />
            <Text style={styles.loadingText}>Connecting to stream...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorOverlay}>
            <Ionicons name="alert-circle-outline" size={36} color="#e50914" />
            <Text style={styles.errorTitle}>Stream Connection Failed</Text>
            <Text style={styles.errorSubtitle}>
              Please switch to another server below or try again.
            </Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={handleRetry}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={14} color="#ffffff" />
              <Text style={styles.retryText}>Retry Stream</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Stream Server Switcher */}
      <View style={styles.serverSection}>
        <View style={styles.serverHeader}>
          <Ionicons name="server-outline" size={14} color="#8b949e" />
          <Text style={styles.serverLabel}>Select Video Server</Text>
        </View>

        <View style={styles.serverList}>
          {servers.map((server) => {
            const isSelected = selectedServer.url === server.url;
            return (
              <TouchableOpacity
                key={server.name}
                style={[
                  styles.serverBadge,
                  isSelected && styles.serverBadgeActive,
                ]}
                onPress={() => {
                  if (!isSelected) {
                    setSelectedServer(server);
                    setLoading(true);
                    setError(false);
                  }
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.serverBadgeText,
                    isSelected && styles.serverBadgeTextActive,
                  ]}
                >
                  {server.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0b0c10",
  },
  playerFrame: {
    width: SCREEN_WIDTH,
    height: (SCREEN_WIDTH * 9) / 16,
    backgroundColor: "#000000",
    position: "relative",
  },
  webview: {
    flex: 1,
    backgroundColor: "#000000",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    color: "#f0f6fc",
    fontSize: 12,
    fontWeight: "600",
  },
  errorOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 6,
  },
  errorTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  errorSubtitle: {
    color: "#8b949e",
    fontSize: 11,
    textAlign: "center",
    marginBottom: 8,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e50914",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  retryText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  serverSection: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#21262d",
  },
  serverHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  serverLabel: {
    color: "#8b949e",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  serverList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  serverBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#30363d",
  },
  serverBadgeActive: {
    backgroundColor: "#e50914",
    borderColor: "#e50914",
  },
  serverBadgeText: {
    color: "#8b949e",
    fontSize: 11,
    fontWeight: "600",
  },
  serverBadgeTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
