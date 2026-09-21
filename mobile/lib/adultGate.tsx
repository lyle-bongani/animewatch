import React, { createContext, useContext, useEffect, useState } from "react";
import { getAdultUnlocked, setAdultUnlocked } from "./storage";

interface AdultGateContextType {
  isAdultUnlocked: boolean;
  unlockAdult: () => Promise<void>;
  lockAdult: () => Promise<void>;
  modalVisible: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const AdultGateContext = createContext<AdultGateContextType>({
  isAdultUnlocked: false,
  unlockAdult: async () => {},
  lockAdult: async () => {},
  modalVisible: false,
  openModal: () => {},
  closeModal: () => {},
});

export function AdultGateProvider({ children }: { children: React.ReactNode }) {
  const [isAdultUnlocked, setIsAdultUnlocked] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    getAdultUnlocked().then(setIsAdultUnlocked);
  }, []);

  const unlockAdult = async () => {
    await setAdultUnlocked(true);
    setIsAdultUnlocked(true);
    setModalVisible(false);
  };

  const lockAdult = async () => {
    await setAdultUnlocked(false);
    setIsAdultUnlocked(false);
    setModalVisible(false);
  };

  return (
    <AdultGateContext.Provider
      value={{
        isAdultUnlocked,
        unlockAdult,
        lockAdult,
        modalVisible,
        openModal: () => setModalVisible(true),
        closeModal: () => setModalVisible(false),
      }}
    >
      {children}
    </AdultGateContext.Provider>
  );
}

export function useAdultGate() {
  return useContext(AdultGateContext);
}
