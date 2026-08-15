"use client";

import { useState } from "react";
import { useStore } from "@/context/store-context";
import UserMenu from "./UserMenu";

const navLinks = [
  { href: "#catalogo", label: "Tienda" },
  { href: "#categorias", label: "Categorías" },
  { href: "#destacados", label: "Destacados" },
  { href: "#temporada", label: "Temporada" },
];

export default function Header() {
  const { count, toggleDrawer, openContact } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const focusSearch = () => document.getElementById("search")?.focus();

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-bg/[0.93] backdrop-blur-[14px]">
      <nav className="container grid h-[72px] grid-cols-[auto_1fr_auto] items-center gap-[9px] sm:h-[76px] sm:gap-3 md:gap-7">
        <a href="#inicio" className="flex items-center gap-[10px] font-extrabold text-dark">
          <span className="grid h-10 w-10 -rotate-[4deg] place-items-center rounded-xl bg-dark font-display text-[1.2rem] text-white">
            M
          </span>
          <span>Mundo Pórix</span>
        </a>
        <div className="hidden justify-center gap-[25px] text-[0.82rem] font-bold text-muted md:flex">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-dark">
              {l.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-[5px] sm:gap-[9px]">
          <button
            onClick={focusSearch}
            aria-label="Buscar"
            className="hidden h-[42px] w-[42px] place-items-center rounded-[11px] border border-line bg-surface text-dark lg:grid"
          >
            ⌕
          </button>
          <button
            onClick={openContact}
            className="hidden h-[42px] items-center gap-[7px] rounded-[11px] border border-line bg-surface px-[13px] text-[0.78rem] font-extrabold text-dark transition-colors hover:border-dark hover:bg-dark hover:text-white lg:flex"
          >
            Contacto
          </button>
          <button
            onClick={openContact}
            aria-label="Contacto"
            className="grid h-[42px] w-[42px] place-items-center rounded-[11px] border border-line bg-surface text-[1rem] text-dark lg:hidden"
          >
            ✉
          </button>
          <UserMenu />
          <button
            onClick={toggleDrawer}
            aria-label="Mi cotización"
            className="relative flex items-center gap-[7px] rounded-[11px] border border-line bg-surface px-[11px] py-[10px] text-[0.78rem] font-extrabold text-dark sm:gap-[9px] sm:px-[13px]"
          >
            🛒 <span className="hidden sm:inline">Mi cotización</span>
            <b className="absolute -right-[7px] -top-[7px] grid h-5 w-5 place-items-center rounded-full bg-dark text-[0.64rem] text-white">
              {count}
            </b>
          </button>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menú"
            className="text-[1.4rem] text-dark md:hidden"
          >
            ☰
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div className="flex max-h-[calc(100vh-72px)] flex-col gap-3 overflow-y-auto border-t border-line px-6 py-4 text-[0.82rem] font-bold text-muted md:hidden">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="hover:text-dark"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => {
              setMenuOpen(false);
              openContact();
            }}
            className="text-left font-extrabold text-dark"
          >
            ✉ Contacto
          </button>
        </div>
      )}
    </header>
  );
}
