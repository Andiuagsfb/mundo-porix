"use client";

import { useMemo, useState, type FormEvent } from "react";
import Modal from "./Modal";
import { useStore } from "@/context/store-context";
import { api, ApiError } from "@/lib/api";
import { formatDate, money, moneyStr, QUOTE_STATUS_LABELS, QUOTE_STATUS_TONES } from "@/lib/format";
import type { Quote } from "@/lib/types";

interface QuoteFormModalProps {
  open: boolean;
  onClose: () => void;
}

const inputClass =
  "w-full rounded-[12px] border border-line bg-bg px-[14px] py-[11px] text-[0.82rem] text-[#3D332D] outline-none transition-colors placeholder:text-[#A99A8C] focus:border-primary";

function tomorrowISO(): string {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
}

export default function QuoteFormModal({ open, onClose }: QuoteFormModalProps) {
  const { items, total, removeItem, notify } = useStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pickup, setPickup] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Quote | null>(null);

  const canSubmit = useMemo(
    () =>
      items.length > 0 &&
      name.trim().length > 0 &&
      phone.trim().length > 0 &&
      pickup.length > 0 &&
      !submitting,
    [items.length, name, phone, pickup, submitting],
  );

  const close = () => {
    onClose();
    setError(null);
    setSuccess(null);
    setNotes("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const quote = await api.post<Quote>("/quotes", {
        customerName: name.trim(),
        customerPhone: phone.trim(),
        pickupDate: new Date(pickup).toISOString(),
        notes: notes.trim() || undefined,
        items: items.map((i) => ({ productId: i.id, quantity: i.qty })),
      });
      setSuccess(quote);
      notify(`Cotización ${quote.quoteNumber} creada`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo generar la cotización. Inténtalo de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      labelledBy="quote-form-title"
      maxWidth="max-w-[560px]"
    >
      {success ? (
        <div className="text-center">
          <div className="mx-auto grid h-[52px] w-[52px] place-items-center rounded-full bg-[#E3E8DF] text-[1.4rem] text-[#4C5A44]">
            ✓
          </div>
          <span className="eyebrow mt-[16px] block">¡Cotización lista!</span>
          <h2
            id="quote-form-title"
            className="mt-[6px] font-display text-[2rem] text-dark"
          >
            {success.quoteNumber}
          </h2>
          <p className="mx-auto mt-[10px] max-w-[380px] text-[0.78rem] text-muted">
            Hola <b className="text-dark">{success.customerName}</b>, tus
            productos quedaron reservados hasta{" "}
            <b className="text-dark">
              {formatDate(
                success.reservation?.expiresAt ?? success.pickupDate,
              )}
            </b>
            . Preséntate en la tienda con este número para la recogida.
          </p>

          <div className="mt-[18px] rounded-[14px] border border-line bg-bg p-[16px] text-left">
            {success.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 border-b border-line py-[9px] text-[0.76rem] last:border-0"
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
            <div className="flex items-center justify-between pt-[11px] text-[0.84rem] font-extrabold text-dark">
              <span>Total reservado</span>
              <span>{moneyStr(success.total)}</span>
            </div>
          </div>

          <span
            className={`mt-[14px] inline-block rounded-full px-[12px] py-[6px] text-[0.66rem] font-extrabold uppercase tracking-[0.1em] ${QUOTE_STATUS_TONES[success.status]}`}
          >
            {QUOTE_STATUS_LABELS[success.status]}
          </span>

          <button
            onClick={close}
            className="btn btn-primary mt-[20px] w-full"
          >
            Listo
          </button>
        </div>
      ) : (
        <>
          <div className="mb-[20px]">
            <span className="eyebrow">Contacto del cliente</span>
            <h2
              id="quote-form-title"
              className="mt-[6px] font-display text-[2rem] text-dark"
            >
              Arma tu cotización
            </h2>
            <p className="mt-[8px] text-[0.78rem] text-muted">
              Déjanos tus datos para reservar los{" "}
              <b className="text-dark">{items.length}</b> producto
              {items.length === 1 ? "" : "s"} y confirmar la recogida.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-[13px]">
            <label className="block">
              <span className="mb-[7px] block text-[0.72rem] font-extrabold text-dark">
                Nombre completo *
              </span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. María Pérez"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-[7px] block text-[0.72rem] font-extrabold text-dark">
                Teléfono / WhatsApp *
              </span>
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+57 300 000 0000"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-[7px] block text-[0.72rem] font-extrabold text-dark">
                Fecha de recogida *
              </span>
              <input
                required
                type="datetime-local"
                min={tomorrowISO()}
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-[7px] block text-[0.72rem] font-extrabold text-dark">
                Notas (opcional)
              </span>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detalles, colores, observaciones…"
                className={`${inputClass} resize-none`}
              />
            </label>

            <div className="rounded-[14px] border border-line bg-bg p-[14px]">
              {items.map((i) => (
                <div
                  key={i.id}
                  className="flex items-center justify-between gap-3 border-b border-line py-[8px] text-[0.74rem] last:border-0"
                >
                  <span className="text-muted">
                    {i.name} · <b className="text-dark">×{i.qty}</b>
                  </span>
                  <div className="flex items-center gap-2">
                    <b className="text-dark">{money(i.price * i.qty)}</b>
                    <button
                      type="button"
                      onClick={() => removeItem(i.id)}
                      aria-label={`Quitar ${i.name}`}
                      className="grid h-6 w-6 place-items-center rounded-full text-[0.95rem] leading-none text-muted transition-colors hover:bg-[#F0DFDA] hover:text-danger"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-[10px] text-[0.82rem] font-extrabold text-dark">
                <span>Total estimado</span>
                <span>{money(total)}</span>
              </div>
            </div>

            {error && (
              <p className="rounded-[10px] bg-[#F8E9E4] px-[13px] py-[10px] text-[0.72rem] font-bold text-danger">
                {error}
              </p>
            )}

            <div className="mt-[2px] flex gap-[10px]">
              <button
                type="button"
                onClick={close}
                className="btn btn-light flex-1"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="btn btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <span className="inline-block h-[18px] w-[18px] animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : (
                  "Enviar cotización →"
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
}
