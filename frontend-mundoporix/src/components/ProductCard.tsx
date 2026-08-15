"use client";

import { useState } from "react";
import { useStore } from "@/context/store-context";
import { moneyStr } from "@/lib/format";
import { toProductVisual } from "@/lib/product-visual";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useStore();
  const [qty, setQty] = useState(1);
  const visual = toProductVisual(product);
  const price = Number(product.price);

  const decrement = () => setQty((q) => Math.max(1, q - 1));
  const increment = () => setQty((q) => q + 1);

  const addToQuote = () => {
    if (!visual.inStock) return;
    addItem(product.id, product.name, price, qty);
    setQty(1);
  };

  return (
    <article className="group relative rounded-[16px] border border-line bg-surface p-[10px] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(88,61,43,0.08)]">
      <div
        className="relative grid h-[200px] place-items-center overflow-hidden rounded-[12px] sm:h-[235px]"
        style={{ background: visual.media }}
      >
        <span
          className={`absolute left-[9px] top-[9px] rounded-full px-2 py-1 text-[0.61rem] font-extrabold ${
            !visual.inStock
              ? "bg-[#ECE1D8] text-muted"
              : "border border-[rgba(107,77,57,0.08)] bg-[#F6EFE4] text-dark"
          }`}
        >
          {visual.badge}
        </span>
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className={`product-art ${
              visual.art === "default" ? "" : visual.art
            }`}
          >
            <span className="product-art-spine" />
            {visual.artLines[0]}
            {visual.artLines[1] ? (
              <>
                <br />
                {visual.artLines[1]}
              </>
            ) : null}
          </div>
        )}
        <button
          aria-label="Guardar producto"
          className="absolute right-[18px] top-[18px] grid h-[30px] w-[30px] place-items-center rounded-full bg-surface/90 text-dark opacity-0 transition-opacity group-hover:opacity-100"
        >
          ♥
        </button>
      </div>
      <div className="px-[3px] pb-[3px] pt-[14px]">
        <span className="text-[0.6rem] font-extrabold uppercase tracking-[0.14em] text-primary">
          {product.brand.name}
        </span>
        <h3 className="mb-1 mt-[5px] text-[0.9rem] font-bold text-dark">
          {product.name}
        </h3>
        <p className="min-h-[19px] text-[0.68rem] text-muted">
          {visual.inStock
            ? `${product.category.name} · ${product.availableQuantity} disponibles`
            : "Sin stock disponible"}
        </p>
        <div className="mt-[11px]">
          <div className="flex items-center justify-center gap-[6px] rounded-[9px] border border-line bg-white py-[4px]">
            <button
              onClick={decrement}
              aria-label="Quitar uno"
              className="grid h-6 w-6 place-items-center rounded-md text-[0.9rem] font-extrabold text-dark transition-colors hover:bg-dark hover:text-white"
            >
              −
            </button>
            <span className="w-7 text-center text-[0.72rem] font-extrabold text-dark">
              {qty}
            </span>
            <button
              onClick={increment}
              aria-label="Añadir uno"
              className="grid h-6 w-6 place-items-center rounded-md text-[0.9rem] font-extrabold text-dark transition-colors hover:bg-dark hover:text-white"
            >
              +
            </button>
          </div>
          <div className="mt-[9px] flex items-center justify-between gap-[9px]">
            <b className="text-base font-extrabold text-dark">
              {moneyStr(product.price)}
            </b>
            <button
              onClick={addToQuote}
              disabled={!visual.inStock}
              className="rounded-[9px] border border-line bg-white px-[10px] py-2 text-[0.69rem] font-extrabold text-dark transition-colors hover:bg-dark hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
            >
              {visual.inStock ? "Añadir" : "Sin stock"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
