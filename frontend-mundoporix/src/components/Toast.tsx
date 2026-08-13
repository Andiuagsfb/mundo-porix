"use client";

import { useStore } from "@/context/store-context";

export default function Toast() {
  const { toast } = useStore();
  return <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>;
}
