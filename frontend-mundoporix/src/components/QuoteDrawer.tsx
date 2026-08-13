"use client";

import { useStore } from "@/context/store-context";
import { money } from "@/lib/format";

export default function QuoteDrawer() {
  const { items, total, drawerOpen, closeDrawer } = useStore();

  const continueQuote = () => {
    if (items.length === 0) {
      window.alert("Agrega al menos un producto.");
      return;
    }
    window.alert(
      "Demo front-end: aquí se conectará el formulario real de cotización / WhatsApp / backend.",
    );
  };

  return (
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
              className="flex justify-between gap-3 border-t border-line py-[11px] text-[0.76rem]"
            >
              <span>
                {i.name}
                <br />
                <small className="text-muted">Cantidad: {i.qty}</small>
              </span>
              <strong className="text-dark">{money(i.price * i.qty)}</strong>
            </div>
          ))
        )}
      </div>
      <div className="flex justify-between border-t border-line pt-[13px] text-[0.84rem] font-extrabold text-dark">
        <span>Total estimado</span>
        <span>{money(total)}</span>
      </div>
      <button onClick={continueQuote} className="btn btn-primary mt-[13px] w-full">
        Continuar →
      </button>
    </div>
  );
}
