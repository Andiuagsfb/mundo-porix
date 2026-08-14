"use client";

import { useState, type FormEvent } from "react";
import Modal from "./Modal";
import { api, ApiError } from "@/lib/api";
import {
  formatDate,
  moneyStr,
  QUOTE_STATUS_LABELS,
  QUOTE_STATUS_TONES,
} from "@/lib/format";
import type { Quote } from "@/lib/types";

interface QuoteTrackModalProps {
  open: boolean;
  onClose: () => void;
}

const inputClass =
  "w-full rounded-[12px] border border-line bg-bg px-[14px] py-[11px] text-[0.82rem] text-[#3D332D] outline-none transition-colors placeholder:text-[#A99A8C] focus:border-primary";

export default function QuoteTrackModal({
  open,
  onClose,
}: QuoteTrackModalProps) {
  const [number, setNumber] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    onClose();
    setNumber("");
    setQuote(null);
    setError(null);
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    const q = number.trim().toUpperCase();
    if (!q) return;
    setSearching(true);
    setError(null);
    setQuote(null);
    try {
      const found = await api.get<Quote>(`/quotes/${encodeURIComponent(q)}`);
      setQuote(found);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo consultar la cotización.",
      );
    } finally {
      setSearching(false);
    }
  };

  return (
    <Modal open={open} onClose={close} labelledBy="quote-track-title">
      <div className="mb-[20px]">
        <span className="eyebrow">Seguimiento</span>
        <h2
          id="quote-track-title"
          className="mt-[6px] font-display text-[2rem] text-dark"
        >
          Consulta tu cotización
        </h2>
        <p className="mt-[8px] text-[0.78rem] text-muted">
          Ingresa el número que recibiste al generar tu cotización, por ejemplo{" "}
          <b className="text-dark">COT-2026-000001</b>.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-[9px]">
        <input
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="COT-2026-000001"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={!number.trim() || searching}
          className="btn btn-primary shrink-0 px-[18px] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {searching ? (
            <span className="inline-block h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            "Buscar"
          )}
        </button>
      </form>

      {error && (
        <p className="mt-[13px] rounded-[10px] bg-[#F8E9E4] px-[13px] py-[10px] text-[0.72rem] font-bold text-danger">
          {error}
        </p>
      )}

      {quote && (
        <div className="mt-[16px] rounded-[14px] border border-line bg-bg p-[16px]">
          <div className="flex items-center justify-between gap-3 border-b border-line pb-[12px]">
            <div>
              <p className="font-display text-[1.5rem] text-dark">
                {quote.quoteNumber}
              </p>
              <p className="text-[0.68rem] text-muted">
                {quote.customerName} · {quote.customerPhone}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-[12px] py-[6px] text-[0.64rem] font-extrabold uppercase tracking-[0.1em] ${QUOTE_STATUS_TONES[quote.status]}`}
            >
              {QUOTE_STATUS_LABELS[quote.status]}
            </span>
          </div>

          <div className="py-[10px]">
            {quote.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 border-b border-line py-[8px] text-[0.74rem] last:border-0"
              >
                <span className="text-muted">
                  {item.product.name}
                  <small className="block text-[0.65rem]">
                    {item.quantity} × {moneyStr(item.unitPrice)}
                  </small>
                </span>
                <b className="text-dark">{moneyStr(item.subtotal)}</b>
              </div>
            ))}
          </div>

          <div className="space-y-[7px] text-[0.72rem] text-muted">
            <p className="flex justify-between">
              <span>Recogida estimada</span>
              <b className="text-dark">{formatDate(quote.pickupDate)}</b>
            </p>
            {quote.reservation && (
              <p className="flex justify-between">
                <span>Reserva válida hasta</span>
                <b className="text-dark">
                  {formatDate(quote.reservation.expiresAt)}
                </b>
              </p>
            )}
            <p className="flex justify-between border-t border-line pt-[7px] text-[0.82rem]">
              <span className="font-extrabold text-dark">Total</span>
              <b className="font-extrabold text-dark">{moneyStr(quote.total)}</b>
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
