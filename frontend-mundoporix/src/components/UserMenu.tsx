"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useStore } from "@/context/store-context";

export default function UserMenu() {
  const { user, status, logout, openLogin } = useAuth();
  const { notify } = useStore();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (status === "loading") {
    return (
      <button
        disabled
        aria-label="Cargando sesión"
        className="grid h-[42px] w-[42px] place-items-center rounded-[11px] border border-line bg-surface text-dark"
      >
        <span className="h-[16px] w-[16px] animate-spin rounded-full border-2 border-[#E5D9CA] border-t-dark" />
      </button>
    );
  }

  if (!user) {
    return (
      <button
        onClick={openLogin}
        className="rounded-[11px] border border-line bg-surface px-[13px] py-[10px] text-[0.78rem] font-extrabold text-dark transition-colors hover:border-dark hover:bg-dark hover:text-white"
      >
        Iniciar sesión
      </button>
    );
  }

  const initials = user.fullName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
    setOpen(false);
    notify("Sesión cerrada");
  };

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Mi cuenta"
          className="flex items-center gap-[9px] rounded-[11px] border border-line bg-surface py-[5px] pl-[5px] pr-[12px] text-dark transition-colors hover:border-dark"
        >
          <span className="grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-dark font-display text-[0.85rem] text-white">
            {initials}
          </span>
          <span className="max-w-[110px] truncate text-[0.72rem] font-extrabold">
            {user.fullName.split(" ")[0]}
          </span>
        </button>

        {open && (
          <div className="absolute right-0 top-[calc(100%+9px)] z-40 w-[210px] rounded-[14px] border border-line bg-surface p-[7px] shadow-[0_18px_45px_rgba(61,43,30,0.18)]">
            <div className="border-b border-line px-[11px] pb-[10px] pt-[8px]">
              <p className="truncate text-[0.74rem] font-extrabold text-dark">
                {user.fullName}
              </p>
              <p className="truncate text-[0.66rem] text-muted">{user.email}</p>
              <span className="mt-[7px] inline-block rounded-full bg-[#E3E8DF] px-[9px] py-[3px] text-[0.58rem] font-extrabold uppercase tracking-[0.12em] text-[#4C5A44]">
                {user.roleName === "ADMIN" ? "Administrador" : "Vendedor"}
              </span>
            </div>
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="mt-[6px] block w-full rounded-[10px] px-[11px] py-[9px] text-left text-[0.74rem] font-bold text-dark transition-colors hover:bg-[#F0E5D7]"
            >
              Panel de gestión
            </Link>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full rounded-[10px] px-[11px] py-[9px] text-left text-[0.74rem] font-bold text-danger transition-colors hover:bg-[#F8E9E4] disabled:opacity-60"
            >
              {loggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
