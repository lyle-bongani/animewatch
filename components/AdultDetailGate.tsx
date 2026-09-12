"use client";

import React from "react";
import Link from "next/link";
import { useAdultGate } from "./AdultGateContext";

export function AdultDetailGate({
  children,
}: {
  isAdultContent?: boolean;
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
