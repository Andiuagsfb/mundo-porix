"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { api, ApiError, fetchProducts } from "@/lib/api";
import type { Brand, Category, Paginated, Product } from "@/lib/types";
import { money } from "@/lib/format";
import ProductCard from "./ProductCard";

const MAX_PRICE_LIMIT = 100000;

export default function Catalog() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("all");
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE_LIMIT);
  const [sort, setSort] = useState("destacados");
  const [inStockOnly, setInStockOnly] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [result, setResult] = useState<Paginated<Product> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appliedQuery, setAppliedQuery] = useState<string | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get<Category[]>("/categories"),
      api.get<Brand[]>("/brands"),
    ])
      .then(([cats, brs]) => {
        if (!active) return;
        setCategories(cats);
        setBrands(brs);
      })
      .catch(() => {
        if (active) setCategories([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const [page, setPage] = useState(1);
  const [retryKey, setRetryKey] = useState(0);

  const queryKey = JSON.stringify([
    page,
    debouncedSearch,
    category,
    brand,
    maxPrice,
    sort,
    retryKey,
  ]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    const sortBy =
      sort === "asc" ? "price" : sort === "desc" ? "price" : "createdAt";
    const sortOrder = sort === "asc" ? "asc" : "desc";
    fetchProducts({
      page,
      limit: 12,
      search: debouncedSearch || undefined,
      categoryId: category === "all" ? undefined : category,
      brandId: brand === "all" ? undefined : brand,
      maxPrice: maxPrice < MAX_PRICE_LIMIT ? maxPrice : undefined,
      sortBy,
      sortOrder,
    })
      .then((data) => {
        if (cancelled) return;
        setResult(data);
        setError(null);
        setAppliedQuery(queryKey);
      })
      .catch((e) => {
        if (cancelled) return;
        const message =
          e instanceof ApiError ? e.message : "No se pudo cargar el catálogo.";
        setError(message);
        setAppliedQuery(queryKey);
      });
    return () => {
      cancelled = true;
    };
  }, [queryKey, page, debouncedSearch, category, brand, maxPrice, sort, retryKey]);

  const loading = appliedQuery !== queryKey;

  const reset = () => {
    setSearch("");
    setDebouncedSearch("");
    setCategory("all");
    setBrand("all");
    setMaxPrice(MAX_PRICE_LIMIT);
    setSort("destacados");
    setInStockOnly(false);
    setPage(1);
  };

  const visibleProducts = useMemo(() => {
    if (!result) return [];
    return inStockOnly
      ? result.data.filter((p) => p.availableQuantity > 0)
      : result.data;
  }, [result, inStockOnly]);

  const totalShown = inStockOnly
    ? visibleProducts.length
    : (result?.meta.total ?? 0);
  const resultLabel = `${totalShown} producto${totalShown === 1 ? "" : "s"}`;

  const categoryPills = [
    { id: "all", label: "Todos" },
    ...categories.map((c) => ({ id: c.id, label: c.name })),
  ];

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
            {categoryPills.map((c) => (
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
                max={MAX_PRICE_LIMIT}
                step={500}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-dark"
              />
              <div className="mt-[5px] flex justify-between text-[0.67rem] text-[#8C7D6F]">
                <span>{money(3000)}</span>
                <b>{maxPrice >= MAX_PRICE_LIMIT ? "Sin límite" : money(maxPrice)}</b>
              </div>
            </div>
            <div className="border-t border-line py-4">
              <span className="mb-[9px] block text-[0.72rem] font-extrabold text-dark">
                Marca
              </span>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full rounded-[10px] border border-line bg-white px-[11px] py-[9px] text-[0.74rem] text-muted"
              >
                <option value="all">Todas</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="border-t border-line py-4">
              <span className="mb-[9px] block text-[0.72rem] font-extrabold text-dark">
                Disponibilidad
              </span>
              <label className="flex items-center gap-2 text-[0.74rem] text-muted">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="accent-dark"
                />{" "}
                Solo en stock
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

            {error ? (
              <div className="rounded-[16px] border border-line bg-surface p-8 text-center">
                <p className="text-[0.82rem] text-muted">{error}</p>
                <button
                  onClick={() => setRetryKey((k) => k + 1)}
                  className="btn btn-primary mt-4 inline-flex"
                >
                  Reintentar
                </button>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-1 gap-[15px] min-[481px]:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-[16px] border border-line bg-surface p-[10px]"
                  >
                    <div className="h-[235px] rounded-[12px] bg-[#EFE4D5]" />
                    <div className="mt-[14px] h-[10px] w-1/3 rounded bg-[#EFE4D5]" />
                    <div className="mt-[8px] h-[14px] w-2/3 rounded bg-[#EFE4D5]" />
                    <div className="mt-[14px] h-[34px] rounded-[9px] bg-[#EFE4D5]" />
                  </div>
                ))}
              </div>
            ) : visibleProducts.length === 0 ? (
              <div className="rounded-[16px] border border-line bg-surface p-8 text-center">
                <p className="font-display text-[1.6rem] text-dark">
                  Sin resultados
                </p>
                <p className="mx-auto mt-2 max-w-[380px] text-[0.78rem] text-muted">
                  No encontramos productos con esos filtros. Ajusta la búsqueda o
                  restablece el catálogo.
                </p>
                <button onClick={reset} className="btn btn-primary mt-5 inline-flex">
                  Restablecer filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-[15px] min-[481px]:grid-cols-2 lg:grid-cols-3">
                {visibleProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}

            {result && result.meta.totalPages > 1 && (
              <div className="mt-[26px] flex items-center justify-center gap-[8px]">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="grid h-[38px] w-[38px] place-items-center rounded-[11px] border border-line bg-surface text-dark transition-colors hover:bg-dark hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface disabled:hover:text-dark"
                  aria-label="Página anterior"
                >
                  ←
                </button>
                <span className="rounded-[11px] border border-line bg-surface px-[14px] py-[8px] text-[0.74rem] font-extrabold text-dark">
                  {page} / {result.meta.totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(result.meta.totalPages, p + 1))
                  }
                  disabled={page === result.meta.totalPages || loading}
                  className="grid h-[38px] w-[38px] place-items-center rounded-[11px] border border-line bg-surface text-dark transition-colors hover:bg-dark hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface disabled:hover:text-dark"
                  aria-label="Página siguiente"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
