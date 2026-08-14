"use client";

import { useState } from "react";
import { useStore } from "@/context/store-context";
import { money } from "@/lib/format";
import QuoteFormModal from "./QuoteFormModal";
import QuoteTrackModal from "./QuoteTrackModal";

export default function QuoteDrawer() {
  const { items, total, drawerOpen, closeDrawer, removeItem } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);

  const continueQuote = () => {
    if (items.length === 0) {
      window.alert("Agrega al menos un producto.");
      return;
    }
    setFormOpen(true);
  };

  return (
    <>
      <div className={`drawer ${drawerOpen ? "open" : ""}`}>
        <div className="mb-[13px] flex items-center justify-between">
          <h3 className="font-display text-[1.7rem] font-normal text-dark">
            Mi cotización
          </h3>
          <button
            onClick={closeDrawer}
            aria-label="Cerrar"
            className="grid h-8 w-8 place-items-center rounded-full bg-[#F0E5D7] text-dark"
          >
            ×
          </button>
        </div>
        <div>
          {items.length === 0 ? (
            <p className="text-[0.78rem] text-muted">
              Agrega productos desde el catálogo.
            </p>
          ) : (
            items.map((i) => (
              <div
                key={i.id}
                className="flex items-center justify-between gap-3 border-t border-line py-[11px] text-[0.76rem]"
              >
                <span>
                  {i.name}
                  <br />
                  <small className="text-muted">Cantidad: {i.qty}</small>
                </span>
                <div className="flex items-center gap-2">
                  <strong className="text-dark">{money(i.price * i.qty)}</strong>
                  <button
                    onClick={() => removeItem(i.id)}
                    aria-label={`Eliminar ${i.name}`}
                    className="grid h-6 w-6 place-items-center rounded-full text-[0.95rem] leading-none text-muted transition-colors hover:bg-[#F0DFDA] hover:text-danger"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-between border-t border-line pt-[13px] text-[0.84rem] font-extrabold text-dark">
          <span>Total estimado</span>
          <span>{money(total)}</span>
        </div>
        <button
          onClick={continueQuote}
          disabled={items.length === 0}
          className="btn btn-primary mt-[13px] w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continuar →
        </button>
        <button
          onClick={() => {
            closeDrawer();
            setTrackOpen(true);
          }}
          className="mt-[9px] w-full text-center text-[0.7rem] font-bold text-muted transition-colors hover:text-dark"
        >
          ¿Ya tienes una cotización? Consulta su estado
        </button>
      </div>

      <QuoteFormModal open={formOpen} onClose={() => setFormOpen(false)} />
      <QuoteTrackModal open={trackOpen} onClose={() => setTrackOpen(false)} />
    </>
  );
}
