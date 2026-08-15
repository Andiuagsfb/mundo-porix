"use client";

import Modal from "./Modal";
import { useStore } from "@/context/store-context";

const details = [
  {
    label: "WhatsApp / Teléfono",
    value: "+57 300 123 4567",
    href: "tel:+573001234567",
  },
  {
    label: "Correo",
    value: "contacto@mundoporix.com",
    href: "mailto:contacto@mundoporix.com",
  },
  {
    label: "Dirección",
    value: "Cra 12 #34-56, Local 2, Bogotá",
  },
  {
    label: "Horario",
    value: "Lun – Sáb · 8:00 – 18:00",
  },
];

export default function ContactModal() {
  const { contactOpen, closeContact, toggleDrawer } = useStore();

  const startQuote = () => {
    closeContact();
    toggleDrawer();
  };

  return (
    <Modal open={contactOpen} onClose={closeContact} labelledBy="contact-title">
      <div className="mb-[20px]">
        <span className="eyebrow">Hablemos</span>
        <h2
          id="contact-title"
          className="mt-[6px] font-display text-[2.1rem] text-dark"
        >
          Contacto
        </h2>
        <p className="mt-[8px] text-[0.78rem] text-muted">
          Escríbenos o arma una cotización sin compromiso: un asesor te confirma
          la disponibilidad y el total.
        </p>
      </div>

      <div className="flex flex-col gap-[9px]">
        {details.map((d) => (
          <div
            key={d.label}
            className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-line bg-bg px-[14px] py-[11px]"
          >
            <span className="text-[0.7rem] font-extrabold uppercase tracking-[0.1em] text-primary">
              {d.label}
            </span>
            {d.href ? (
              <a
                href={d.href}
                className="break-all text-[0.8rem] font-bold text-dark hover:underline"
              >
                {d.value}
              </a>
            ) : (
              <span className="text-[0.8rem] font-bold text-dark">
                {d.value}
              </span>
            )}
          </div>
        ))}
      </div>

      <button onClick={startQuote} className="btn btn-primary mt-[18px] w-full">
        Armar una cotización →
      </button>
    </Modal>
  );
}
