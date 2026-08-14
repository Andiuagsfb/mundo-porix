"use client";

import { useEffect, useState } from "react";
import ProductFormModal from "./ProductFormModal";
import { api, ApiError, toQueryString } from "@/lib/api";
import {
  formatDateTime,
  moneyStr,
  QUOTE_STATUS_LABELS,
  QUOTE_STATUS_TONES,
} from "@/lib/format";
import { toProductVisual } from "@/lib/product-visual";
import { canCancel, nextStatusLabel, QUOTE_NEXT_ACTION } from "@/lib/quote-flow";
import type {
  Brand,
  Category,
  InventoryEntry,
  Paginated,
  Product,
  Quote,
  QuoteStatus,
} from "@/lib/types";

type Tab = "quotes" | "inventory" | "products";

const inputClass =
  "rounded-[11px] border border-line bg-bg px-[12px] py-[9px] text-[0.76rem] text-[#3D332D] outline-none transition-colors focus:border-primary";

export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>("quotes");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [quotesKey, setQuotesKey] = useState(0);
  const [quotes, setQuotes] = useState<Paginated<Quote> | null>(null);
  const [quotesError, setQuotesError] = useState<string | null>(null);
  const [quotesApplied, setQuotesApplied] = useState<string | null>(null);

  const [inventoryKey, setInventoryKey] = useState(0);
  const [inventory, setInventory] = useState<Paginated<InventoryEntry> | null>(
    null,
  );
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [inventoryApplied, setInventoryApplied] = useState<string | null>(null);

  const [productsKey, setProductsKey] = useState(0);
  const [products, setProducts] = useState<Paginated<Product> | null>(null);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [productsApplied, setProductsApplied] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const quotesQueryKey = JSON.stringify([quotesKey, page, search, statusFilter]);
  const inventoryQueryKey = JSON.stringify([inventoryKey]);
  const productsQueryKey = JSON.stringify([productsKey]);

  useEffect(() => {
    let cancelled = false;
    const query = toQueryString({
      page,
      limit: 8,
      search: search.trim() || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
    });
    api
      .get<Paginated<Quote>>(`/admin/quotes${query}`)
      .then((data) => {
        if (cancelled) return;
        setQuotes(data);
        setQuotesError(null);
        setQuotesApplied(quotesQueryKey);
      })
      .catch((e) => {
        if (cancelled) return;
        setQuotesError(
          e instanceof ApiError
            ? e.message
            : "No se pudieron cargar las cotizaciones.",
        );
        setQuotesApplied(quotesQueryKey);
      });
    return () => {
      cancelled = true;
    };
  }, [quotesQueryKey, page, search, statusFilter, quotesKey]);

  useEffect(() => {
    if (tab !== "inventory") return;
    let cancelled = false;
    api
      .get<Paginated<InventoryEntry>>("/admin/inventory?limit=50")
      .then((data) => {
        if (cancelled) return;
        setInventory(data);
        setInventoryError(null);
        setInventoryApplied(inventoryQueryKey);
      })
      .catch((e) => {
        if (cancelled) return;
        setInventoryError(
          e instanceof ApiError ? e.message : "No se pudo cargar el inventario.",
        );
        setInventoryApplied(inventoryQueryKey);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, inventoryQueryKey, inventoryKey]);

  useEffect(() => {
    if (tab !== "products") return;
    let cancelled = false;
    api
      .get<Paginated<Product>>("/admin/products?limit=50")
      .then((data) => {
        if (cancelled) return;
        setProducts(data);
        setProductsError(null);
        setProductsApplied(productsQueryKey);
      })
      .catch((e) => {
        if (cancelled) return;
        setProductsError(
          e instanceof ApiError ? e.message : "No se pudieron cargar los productos.",
        );
        setProductsApplied(productsQueryKey);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, productsQueryKey, productsKey]);

  useEffect(() => {
    if (categories.length > 0 || brands.length > 0) return;
    let cancelled = false;
    Promise.all([
      api.get<Category[]>("/categories"),
      api.get<Brand[]>("/brands"),
    ])
      .then(([cats, brs]) => {
        if (cancelled) return;
        setCategories(cats);
        setBrands(brs);
      })
      .catch(() => {
        /* los selects simplemente quedarán vacíos */
      });
    return () => {
      cancelled = true;
    };
  }, [categories.length, brands.length]);

  const quotesLoading = quotesApplied !== quotesQueryKey;
  const inventoryLoading =
    tab === "inventory" && inventoryApplied !== inventoryQueryKey;
  const productsLoading =
    tab === "products" && productsApplied !== productsQueryKey;

  const runAction = async (
    action: () => Promise<unknown>,
    onDone: () => void,
  ) => {
    setActionError(null);
    try {
      await action();
      onDone();
    } catch (e) {
      setActionError(
        e instanceof ApiError ? e.message : "La acción no pudo completarse.",
      );
    }
  };

  const advanceQuote = (quote: Quote) => {
    const next = QUOTE_NEXT_ACTION[quote.status];
    if (!next) return;
    runAction(
      () => api.patch(`/admin/quotes/${quote.id}/status`, { status: next }),
      () => setQuotesKey((k) => k + 1),
    );
  };

  const cancelQuote = (quote: Quote) => {
    runAction(
      () => api.post(`/admin/quotes/${quote.id}/cancel`, {}),
      () => setQuotesKey((k) => k + 1),
    );
  };

  const adjustStock = (productId: string, current: number, delta: number) => {
    const quantity = Math.max(0, current + delta);
    runAction(
      () => api.patch(`/admin/inventory/${productId}`, { quantity }),
      () => setInventoryKey((k) => k + 1),
    );
  };

  const openCreateProduct = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const toggleActive = (product: Product) => {
    runAction(
      () => api.patch(`/admin/products/${product.id}`, { isActive: !product.isActive }),
      () => setProductsKey((k) => k + 1),
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1080px] px-5 py-8 sm:px-8">
      <div className="mb-[22px] flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="eyebrow">Gestión</span>
          <h2 id="admin-title" className="mt-[6px] font-display text-[2rem] text-dark">
            Panel de la tienda
          </h2>
        </div>
        <div className="rounded-[11px] border border-line bg-bg p-[4px]">
          {(
            [
              ["quotes", "Cotizaciones"],
              ["inventory", "Inventario"],
              ["products", "Productos"],
            ] as [Tab, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`rounded-[9px] px-[13px] py-[8px] text-[0.72rem] font-extrabold transition-colors ${
                tab === id
                  ? "bg-dark text-white"
                  : "text-muted hover:text-dark"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {actionError && (
        <p className="mb-[13px] rounded-[10px] bg-[#F8E9E4] px-[13px] py-[9px] text-[0.72rem] font-bold text-danger">
          {actionError}
        </p>
      )}

      {tab === "quotes" ? (
        <>
          <div className="mb-[14px] flex flex-wrap gap-[9px]">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar cliente, teléfono o número…"
              className={`${inputClass} min-w-[220px] flex-1`}
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className={inputClass}
            >
              <option value="all">Todos los estados</option>
              {(
                Object.keys(QUOTE_STATUS_LABELS) as QuoteStatus[]
              ).map((s) => (
                <option key={s} value={s}>
                  {QUOTE_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          {quotesLoading ? (
            <p className="py-[40px] text-center text-[0.76rem] text-muted">
              Cargando cotizaciones…
            </p>
          ) : quotesError ? (
            <p className="rounded-[10px] bg-[#F8E9E4] px-[13px] py-[10px] text-[0.72rem] font-bold text-danger">
              {quotesError}
            </p>
          ) : quotes && quotes.data.length === 0 ? (
            <p className="py-[40px] text-center text-[0.76rem] text-muted">
              No hay cotizaciones para mostrar.
            </p>
          ) : (
            <ul className="flex flex-col gap-[10px]">
              {quotes?.data.map((q) => (
                <li
                  key={q.id}
                  className="rounded-[14px] border border-line bg-bg p-[13px]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-[10px]">
                    <div>
                      <p className="font-display text-[1.15rem] text-dark">
                        {q.quoteNumber}
                      </p>
                      <p className="text-[0.68rem] text-muted">
                        {q.customerName} · {q.customerPhone}
                        {q.createdBy ? ` · por ${q.createdBy.fullName}` : ""}
                      </p>
                      <p className="mt-[2px] text-[0.64rem] text-muted">
                        {formatDateTime(q.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block rounded-full px-[10px] py-[4px] text-[0.6rem] font-extrabold uppercase tracking-[0.1em] ${QUOTE_STATUS_TONES[q.status]}`}
                      >
                        {QUOTE_STATUS_LABELS[q.status]}
                      </span>
                      <p className="mt-[6px] text-[0.8rem] font-extrabold text-dark">
                        {moneyStr(q.total)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-[11px] flex flex-wrap items-center gap-[8px] border-t border-line pt-[11px]">
                    {nextStatusLabel(q.status) && (
                      <button
                        onClick={() => advanceQuote(q)}
                        disabled={quotesLoading}
                        className="rounded-[9px] border border-dark bg-dark px-[11px] py-[7px] text-[0.66rem] font-extrabold text-white transition-colors hover:bg-[#4A3325] disabled:opacity-50"
                      >
                        {nextStatusLabel(q.status)} →
                      </button>
                    )}
                    {canCancel(q.status) && (
                      <button
                        onClick={() => cancelQuote(q)}
                        disabled={quotesLoading}
                        className="rounded-[9px] border border-line bg-surface px-[11px] py-[7px] text-[0.66rem] font-extrabold text-danger transition-colors hover:bg-[#F8E9E4] disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    )}
                    {q.reservation && q.status === "RESERVED" && (
                      <span className="text-[0.64rem] text-muted">
                        Reserva vence {formatDateTime(q.reservation.expiresAt)}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {quotes && quotes.meta.totalPages > 1 && (
            <div className="mt-[16px] flex items-center justify-center gap-[8px]">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || quotesLoading}
                className="grid h-[34px] w-[34px] place-items-center rounded-[10px] border border-line bg-surface text-dark disabled:opacity-40"
                aria-label="Anterior"
              >
                ←
              </button>
              <span className="rounded-[10px] border border-line bg-surface px-[12px] py-[6px] text-[0.7rem] font-extrabold text-dark">
                {page} / {quotes.meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(quotes.meta.totalPages, p + 1))}
                disabled={page === quotes.meta.totalPages || quotesLoading}
                className="grid h-[34px] w-[34px] place-items-center rounded-[10px] border border-line bg-surface text-dark disabled:opacity-40"
                aria-label="Siguiente"
              >
                →
              </button>
            </div>
          )}
        </>
      ) : tab === "inventory" ? (
        <>
          {inventoryLoading ? (
            <p className="py-[40px] text-center text-[0.76rem] text-muted">
              Cargando inventario…
            </p>
          ) : inventoryError ? (
            <p className="rounded-[10px] bg-[#F8E9E4] px-[13px] py-[10px] text-[0.72rem] font-bold text-danger">
              {inventoryError}
            </p>
          ) : (
            <ul className="flex flex-col gap-[9px]">
              {inventory?.data.map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-wrap items-center justify-between gap-[10px] rounded-[14px] border border-line bg-bg px-[14px] py-[11px]"
                >
                  <div>
                    <p className="text-[0.82rem] font-bold text-dark">
                      {entry.product.name}
                    </p>
                    <p className="text-[0.66rem] text-muted">
                      {entry.product.brand.name} · {entry.product.category.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-[14px]">
                    <div className="flex gap-[12px] text-[0.7rem] text-muted">
                      <span>
                        Total <b className="text-dark">{entry.quantity}</b>
                      </span>
                      <span>
                        Reservado{" "}
                        <b className="text-dark">{entry.reservedQuantity}</b>
                      </span>
                      <span>
                        Disponible{" "}
                        <b
                          className={
                            entry.availableQuantity > 0
                              ? "text-[#4C5A44]"
                              : "text-danger"
                          }
                        >
                          {entry.availableQuantity}
                        </b>
                      </span>
                    </div>
                    <div className="flex items-center gap-[6px]">
                      <button
                        onClick={() =>
                          adjustStock(entry.product.id, entry.quantity, -1)
                        }
                        disabled={inventoryLoading}
                        aria-label="Restar stock"
                        className="grid h-[26px] w-[26px] place-items-center rounded-[8px] border border-line bg-surface text-[0.85rem] font-extrabold text-dark hover:bg-dark hover:text-white disabled:opacity-40"
                      >
                        −
                      </button>
                      <button
                        onClick={() =>
                          adjustStock(entry.product.id, entry.quantity, 1)
                        }
                        disabled={inventoryLoading}
                        aria-label="Sumar stock"
                        className="grid h-[26px] w-[26px] place-items-center rounded-[8px] border border-line bg-surface text-[0.85rem] font-extrabold text-dark hover:bg-dark hover:text-white disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <>
          <div className="mb-[14px] flex flex-wrap items-center justify-between gap-[10px]">
            <p className="text-[0.72rem] text-muted">
              {products?.meta.total ?? 0} producto(s) en la tienda
            </p>
            <button
              onClick={openCreateProduct}
              className="rounded-[10px] bg-dark px-[13px] py-[8px] text-[0.7rem] font-extrabold text-white transition-colors hover:bg-[#4A3325]"
            >
              + Nuevo producto
            </button>
          </div>

          {productsLoading ? (
            <p className="py-[40px] text-center text-[0.76rem] text-muted">
              Cargando productos…
            </p>
          ) : productsError ? (
            <p className="rounded-[10px] bg-[#F8E9E4] px-[13px] py-[10px] text-[0.72rem] font-bold text-danger">
              {productsError}
            </p>
          ) : (
            <ul className="flex flex-col gap-[9px]">
              {products?.data.map((product) => {
                const visual = toProductVisual(product);
                return (
                  <li
                    key={product.id}
                    className="flex flex-wrap items-center justify-between gap-[10px] rounded-[14px] border border-line bg-bg px-[13px] py-[10px]"
                  >
                    <div className="flex min-w-0 items-center gap-[12px]">
                      <div
                        className="grid h-[44px] w-[44px] shrink-0 place-items-center overflow-hidden rounded-[10px] text-dark"
                        style={{ background: visual.media }}
                      >
                        {product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="font-display text-[1rem]">
                            {product.name.trim()[0] || "?"}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[0.82rem] font-bold text-dark">
                          {product.name}
                        </p>
                        <p className="text-[0.66rem] text-muted">
                          {product.brand.name} · {product.category.name}
                          {product.availableQuantity !== undefined &&
                            ` · ${product.availableQuantity} disponibles`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-[10px]">
                      <span
                        className={`rounded-full px-[9px] py-[3px] text-[0.58rem] font-extrabold uppercase tracking-[0.1em] ${
                          product.isActive
                            ? "bg-[#E3E8DF] text-[#4C5A44]"
                            : "bg-[#F0EDEA] text-muted"
                        }`}
                      >
                        {product.isActive ? "Activo" : "Inactivo"}
                      </span>
                      <span className="text-[0.82rem] font-extrabold text-dark">
                        {moneyStr(product.price)}
                      </span>
                      <div className="flex gap-[6px]">
                        <button
                          onClick={() => openEditProduct(product)}
                          className="rounded-[9px] border border-line bg-surface px-[10px] py-[6px] text-[0.64rem] font-extrabold text-dark transition-colors hover:bg-dark hover:text-white"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => toggleActive(product)}
                          disabled={productsLoading}
                          className="rounded-[9px] border border-line bg-surface px-[10px] py-[6px] text-[0.64rem] font-extrabold text-muted transition-colors hover:bg-[#F8E9E4] hover:text-danger disabled:opacity-40"
                        >
                          {product.isActive ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      <ProductFormModal
        key={`${formOpen ? "open" : "closed"}-${editingProduct?.id ?? "new"}`}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        product={editingProduct}
        categories={categories}
        brands={brands}
        onSaved={() => setProductsKey((k) => k + 1)}
      />
    </div>
  );
}
