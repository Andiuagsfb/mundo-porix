import type { QuoteStatus } from "@/lib/types";

export const money = (n: number): string =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

export const parsePrice = (value: string | number): number =>
  typeof value === "number" ? value : Number(value);

export const moneyStr = (value: string | number): string =>
  money(parsePrice(value));

export const formatDate = (value: string | Date): string =>
  new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

export const formatDateTime = (value: string | Date): string =>
  new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  NEW: "Nueva",
  RESERVED: "Reservada",
  PREPARING: "En preparación",
  READY_FOR_PICKUP: "Lista para recoger",
  PICKED_UP: "Recogida",
  CANCELLED: "Cancelada",
  EXPIRED: "Expirada",
};

export const QUOTE_STATUS_TONES: Record<QuoteStatus, string> = {
  NEW: "bg-[#F0E5D7] text-dark",
  RESERVED: "bg-[#E3E8DF] text-[#4C5A44]",
  PREPARING: "bg-[#EFE6D8] text-[#7A6238]",
  READY_FOR_PICKUP: "bg-[#DDE7E9] text-[#3E6068]",
  PICKED_UP: "bg-[#E2E8DF] text-[#46543E]",
  CANCELLED: "bg-[#F0DFDA] text-danger",
  EXPIRED: "bg-[#ECE1D8] text-muted",
};
