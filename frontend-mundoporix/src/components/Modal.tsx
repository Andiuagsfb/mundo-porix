"use client";

import { useEffect, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  labelledBy?: string;
  maxWidth?: string;
}

export default function Modal({
  open,
  onClose,
  children,
  labelledBy,
  maxWidth = "max-w-[480px]",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[130] grid place-items-center overflow-y-auto p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <button
        aria-label="Cerrar ventana"
        onClick={onClose}
        className="fixed inset-0 cursor-default bg-dark/45 backdrop-blur-[3px]"
      />
      <div
        className={`relative w-full ${maxWidth} rounded-[22px] border border-line bg-surface p-7 shadow-[0_30px_80px_rgba(61,43,30,0.3)]`}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-[16px] top-[16px] grid h-8 w-8 place-items-center rounded-full bg-[#F0E5D7] text-[1.1rem] leading-none text-dark transition-colors hover:bg-[#E7D8C4]"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
