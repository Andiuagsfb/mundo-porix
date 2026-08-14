import type { QuoteStatus } from "@/lib/types";

export const QUOTE_NEXT_ACTION: Partial<Record<QuoteStatus, QuoteStatus>> = {
  NEW: "RESERVED",
  RESERVED: "PREPARING",
  PREPARING: "READY_FOR_PICKUP",
  READY_FOR_PICKUP: "PICKED_UP",
};

export function nextStatusLabel(from: QuoteStatus): string {
  switch (QUOTE_NEXT_ACTION[from]) {
    case "RESERVED":
      return "Confirmar reserva";
    case "PREPARING":
      return "Iniciar preparación";
    case "READY_FOR_PICKUP":
      return "Marcar lista";
    case "PICKED_UP":
      return "Completar recogida";
    default:
      return "";
  }
}

export function canCancel(status: QuoteStatus): boolean {
  return status === "NEW" || status === "RESERVED" || status === "PREPARING";
}
