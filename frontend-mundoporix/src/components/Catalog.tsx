"use client";

import { useMemo, useState } from "react";
import { products } from "@/data/products";
import { money } from "@/lib/format";
import ProductCard from "./ProductCard";

const categories = [
  { id: "all", label: "Todos" },
  { id: "escolar", label: "Escolar" },
  { id: "escritura", label: "Escritura" },
  { id: "arte", label: "Arte & manualidades" },
  { id: "oficina", label: "Oficina" },
  { id: "ofertas", label: "Ofertas" },
];

export default function Catalog() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState(30000);
  const [sort, setSort] = useState("destacados");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products
      .filter((p) => {
        const okQ = p.name.toLowerCase().includes(q);
        const okC =
          category === "all" ||
          p.category === category ||
          (category === "ofertas" && p.sale);
        const okP = p.price <= maxPrice;
        return okQ && okC && okP;
      })
      .sort((a, b) =>
        sort === "asc"
          ? a.price - b.price
          : sort === "desc"
            ? b.price - a.price
            : a.order - b.order,
      );
  }, [search, category, maxPrice, sort]);

  const reset = () => {
    setSearch("");
    setCategory("all");
    setMaxPrice(30000);
    setSort("destacados");
  };

  const resultLabel = `${filtered.length} producto${filtered.length === 1 ? "" : "s"}`;

  return (
    <>
      <section id="categorias" className="pb-2 pt-6">
        <div className="container">
          <div className="grid items-center gap-[14px] md:grid-cols-[1fr_auto]">
            <label className="flex min-h-[45px] items-center rounded-[12px] border border-line bg-surface px-[14px]">
              <span className="mr-2 text-[#9A8A7C]">⌕</span>
              <input
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar cuadernos, lápices, colores..."
                className="w-full bg-transparent text-[0.8rem] text-[#3D332D] outline-none"
              />
            </label>
            <div className="grid grid-cols-2 gap-[10px] md:flex">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-[45px] rounded-[12px] border border-line bg-surface px-[13px] text-[0.76rem] text-muted"
              >
                <option value="destacados">Ordenar: destacados</option>
                <option value="asc">Precio: menor a mayor</option>
                <option value="desc">Precio: mayor a menor</option>
              </select>
              <button
                onClick={reset}
                className="h-[45px] rounded-[12px] border border-line bg-surface px-[13px] text-[0.76rem] text-muted"
              >
                Restablecer
              </button>
            </div>
          </div>
          <div className="flex gap-2 overflow-auto py-[14px] pb-[22px]">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`whitespace-nowrap rounded-full border border-line px-[13px] py-[9px] text-[0.72rem] font-bold transition-colors ${
                  category === c.id
                    ? "border-dark bg-dark text-white"
                    : "bg-surface/60 text-muted hover:border-dark hover:bg-dark hover:text-white"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="catalogo" className="pt-2">
        <div className="container lg:grid lg:grid-cols-[230px_1fr] lg:items-start lg:gap-6">
          <aside className="mb-4 rounded-[16px] border border-line bg-surface/80 p-[19px] lg:sticky lg:top-[105px] lg:mb-0">
            <div className="mb-[17px] flex items-center justify-between">
              <h3 className="text-[0.88rem] font-bold text-dark">Filtrar productos</h3>
              <button onClick={reset} className="bg-transparent text-[0.7rem] text-danger">
                Limpiar
              </button>
            </div>
            <div className="border-t border-line py-4 first:border-t-0">
              <span className="mb-[9px] block text-[0.72rem] font-extrabold text-dark">
                Precio máximo
              </span>
              <input
                type="range"
                min={3000}
                max={30000}
                step={500}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-dark"
              />
              <div className="mt-[5px] flex justify-between text-[0.67rem] text-[#8C7D6F]">
                <span>$3.000</span>
                <b>{money(maxPrice)}</b>
              </div>
            </div>
            <div className="border-t border-line py-4">
              <span className="mb-[9px] block text-[0.72rem] font-extrabold text-dark">
                Disponibilidad
              </span>
              <label className="mb-[9px] flex items-center gap-2 text-[0.74rem] text-muted">
                <input type="checkbox" defaultChecked className="accent-dark" /> En stock
              </label>
              <label className="mb-[9px] flex items-center gap-2 text-[0.74rem] text-muted">
                <input type="checkbox" className="accent-dark" /> Próximamente
              </label>
            </div>
            <div className="border-t border-line py-4">
              <span className="mb-[9px] block text-[0.72rem] font-extrabold text-dark">
                Preferencias
              </span>
              <label className="mb-[9px] flex items-center gap-2 text-[0.74rem] text-muted">
                <input type="checkbox" className="accent-dark" /> Más vendidos
              </label>
              <label className="mb-[9px] flex items-center gap-2 text-[0.74rem] text-muted">
                <input type="checkbox" className="accent-dark" /> Novedades
              </label>
              <label className="mb-[9px] flex items-center gap-2 text-[0.74rem] text-muted">
                <input type="checkbox" className="accent-dark" /> Ofertas
              </label>
            </div>
          </aside>
          <div>
            <div className="mb-4 flex items-end justify-between gap-5">
              <div>
                <span className="eyebrow">Tienda</span>
                <h2 className="font-display text-[2.45rem] text-dark lg:text-[2.8rem]">
                  Todo el catálogo
                </h2>
              </div>
              <span className="text-[0.72rem] text-muted">{resultLabel}</span>
            </div>
            <div className="grid grid-cols-1 gap-[15px] min-[481px]:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
