import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAdultGate } from "../lib/adultGate";

export function AdultGateModal() {
  const { modalVisible, closeModal, unlockAdult, isAdultUnlocked, lockAdult } =
    useAdultGate();
  const [acknowledged, setAcknowledged] = useState(false);

  const handleConfirm = async () => {
    if (isAdultUnlocked) {
      await lockAdult();
    } else {
      if (!acknowledged) return;
      await unlockAdult();
      setAcknowledged(false);
    }
  };

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="fade"
      onRequestClose={closeModal}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons
                name={isAdultUnlocked ? "lock-open" : "shield-checkmark"}
                size={24}
                color={isAdultUnlocked ? "#913FE2" : "#e50914"}
              />
            </View>
            <Text style={styles.title}>
              {isAdultUnlocked ? "Lock 18+ Content" : "Adult Content Verification"}
            </Text>
          </View>

          <Text style={styles.body}>
            {isAdultUnlocked
              ? "18+ content is currently unlocked. Switching back to Safe Mode will restrict all mature and adult titles."
              : "AnimeWatch includes optional mature and adult titles. In accordance with safety policies, you must confirm you are 18 years of age or older to view uncensored adult content."}
          </Text>

          {!isAdultUnlocked && (
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setAcknowledged(!acknowledged)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, acknowledged && styles.checkboxActive]}>
                {acknowledged && <Ionicons name="checkmark" size={14} color="#ffffff" />}
              </View>
              <Text style={styles.checkboxLabel}>
                I acknowledge that I am 18 years of age or older and agree to view mature material.
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={closeModal}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmBtn,
                !isAdultUnlocked && !acknowledged && styles.confirmBtnDisabled,
              ]}
              onPress={handleConfirm}
              disabled={!isAdultUnlocked && !acknowledged}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmBtnText}>
                {isAdultUnlocked ? "Enable Safe Mode" : "Unlock 18+ Content"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  container: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#161b22",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#30363d",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: "center",
    marginBottom: 14,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#21262d",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  title: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  body: {
    color: "#8b949e",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#0d1117",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#30363d",
    marginBottom: 20,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#8b949e",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkboxActive: {
    backgroundColor: "#e50914",
    borderColor: "#e50914",
  },
  checkboxLabel: {
    flex: 1,
    color: "#f0f6fc",
    fontSize: 12,
    lineHeight: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#30363d",
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#8b949e",
    fontSize: 13,
    fontWeight: "600",
  },
  confirmBtn: {
    flex: 1.5,
    backgroundColor: "#e50914",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmBtnDisabled: {
    opacity: 0.4,
  },
  confirmBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
});
