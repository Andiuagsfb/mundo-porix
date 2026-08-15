"use client";

import { useCallback, useEffect, useState } from "react";
import Modal from "./Modal";
import { useStore } from "@/context/store-context";
import { cancelClientQuote, fetchMyQuotes, ApiError } from "@/lib/api";
import {
  formatDate,
  moneyStr,
  QUOTE_STATUS_LABELS,
  QUOTE_STATUS_TONES,
} from "@/lib/format";
import { canCancel } from "@/lib/quote-flow";
import type { Quote } from "@/lib/types";

interface MyOrdersModalProps {
  open: boolean;
  onClose: () => void;
}

const PAGE_SIZE = 5;

export default function MyOrdersModal({
  open,
  onClose,
}: MyOrdersModalProps) {
  const { notify } = useStore();
  const [orders, setOrders] = useState<Quote[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (targetPage = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMyQuotes({
        page: targetPage,
        limit: PAGE_SIZE,
      });
      setOrders(res.data);
      setPage(targetPage);
      setTotalPages(res.meta.totalPages);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudieron cargar tus pedidos.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      void load(1);
    }, 0);
    return () => clearTimeout(t);
  }, [open, load]);

  const handleCancel = async (id: string, quoteNumber: string) => {
    setCancellingId(id);
    setError(null);
    try {
      await cancelClientQuote(id);
      notify(`Pedido ${quoteNumber} cancelado`);
      await load(page);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo cancelar el pedido.",
      );
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy="my-orders-title"
      maxWidth="max-w-[600px]"
    >
      <div className="mb-[18px]">
        <span className="eyebrow">Tu cuenta</span>
        <h2
          id="my-orders-title"
          className="mt-[6px] font-display text-[2rem] text-dark"
        >
          Mis pedidos
        </h2>
        <p className="mt-[8px] text-[0.78rem] text-muted">
          Tus cotizaciones quedan guardadas en tu cuenta para consultarlas o
          cancelarlas cuando quieras.
        </p>
      </div>

      {error && (
        <p className="mb-[13px] rounded-[10px] bg-[#F8E9E4] px-[13px] py-[10px] text-[0.72rem] font-bold text-danger">
          {error}
        </p>
      )}

      <div className="max-h-[46vh] overflow-y-auto pr-1">
        {loading && orders.length === 0 ? (
          <div className="grid place-items-center py-[42px]">
            <span className="h-[24px] w-[24px] animate-spin rounded-full border-2 border-[#E5D9CA] border-t-dark" />
          </div>
        ) : orders.length === 0 ? (
          <p className="rounded-[14px] border border-dashed border-line bg-bg px-[16px] py-[34px] text-center text-[0.78rem] text-muted">
            Aún no tienes pedidos. Agrega productos al carrito y finaliza tu
            primer pedido.
          </p>
        ) : (
          <div className="flex flex-col gap-[10px]">
            {orders.map((q) => (
              <div
                key={q.id}
                className="rounded-[14px] border border-line bg-bg p-[13px]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-[1.15rem] text-dark">
                      {q.quoteNumber}
                    </p>
                    <p className="text-[0.66rem] text-muted">
                      {formatDate(q.createdAt)} · {q.items.length} producto
                      {q.items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-[11px] py-[5px] text-[0.62rem] font-extrabold uppercase tracking-[0.1em] ${QUOTE_STATUS_TONES[q.status]}`}
                  >
                    {QUOTE_STATUS_LABELS[q.status]}
                  </span>
                </div>

                <div className="mt-[9px] flex items-center justify-between border-t border-line pt-[9px] text-[0.76rem]">
                  <div className="flex flex-wrap gap-x-[12px] gap-y-[3px] text-muted">
                    <span>
                      Recogida:{" "}
                      <b className="text-dark">{formatDate(q.pickupDate)}</b>
                    </span>
                    <span>
                      Reserva hasta:{" "}
                      <b className="text-dark">
                        {formatDate(q.reservation?.expiresAt ?? q.pickupDate)}
                      </b>
                    </span>
                  </div>
                  <b className="text-dark">{moneyStr(q.total)}</b>
                </div>

                {canCancel(q.status) && (
                  <button
                    onClick={() => handleCancel(q.id, q.quoteNumber)}
                    disabled={cancellingId === q.id}
                    className="mt-[9px] w-full rounded-[10px] border border-[#E0C7BE] px-[10px] py-[7px] text-[0.68rem] font-extrabold text-danger transition-colors hover:bg-[#F8E9E4] disabled:opacity-60"
                  >
                    {cancellingId === q.id
                      ? "Cancelando…"
                      : "Cancelar pedido"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-[14px] flex items-center justify-between text-[0.74rem] font-bold text-dark">
          <button
            onClick={() => void load(page - 1)}
            disabled={page <= 1 || loading}
            className="rounded-[10px] border border-line bg-surface px-[13px] py-[8px] transition-colors hover:border-dark disabled:opacity-40"
          >
            ← Anterior
          </button>
          <span className="text-muted">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => void load(page + 1)}
            disabled={page >= totalPages || loading}
            className="rounded-[10px] border border-line bg-surface px-[13px] py-[8px] transition-colors hover:border-dark disabled:opacity-40"
          >
            Siguiente →
          </button>
        </div>
      )}

      <button onClick={onClose} className="btn btn-primary mt-[18px] w-full">
        Cerrar
      </button>
    </Modal>
  );
}
