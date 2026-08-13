import { useStore } from "@/context/store-context";
import type { Product } from "@/data/products";
import { money } from "@/lib/format";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useStore();

  return (
    <article className="group relative rounded-[16px] border border-line bg-surface p-[10px] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(88,61,43,0.08)]">
      <div
        className="relative grid h-[235px] place-items-center overflow-hidden rounded-[12px]"
        style={{ background: product.media }}
      >
        <span
          className={`absolute left-[9px] top-[9px] rounded-full px-2 py-1 text-[0.61rem] font-extrabold ${
            product.sale
              ? "bg-[#F0DFDA] text-danger"
              : "border border-[rgba(107,77,57,0.08)] bg-[#F6EFE4] text-dark"
          }`}
        >
          {product.badge}
        </span>
        <div className={`product-art ${product.art === "default" ? "" : product.art}`}>
          <span className="product-art-spine" />
          {product.artLines[0]}
          <br />
          {product.artLines[1]}
        </div>
        <button
          aria-label="Guardar producto"
          className="absolute right-[18px] top-[18px] grid h-[30px] w-[30px] place-items-center rounded-full bg-surface/90 text-dark opacity-0 transition-opacity group-hover:opacity-100"
        >
          ♥
        </button>
      </div>
      <div className="px-[3px] pb-[3px] pt-[14px]">
        <span className="text-[0.6rem] font-extrabold uppercase tracking-[0.14em] text-primary">
          {product.brand}
        </span>
        <h3 className="mb-1 mt-[5px] text-[0.9rem] font-bold text-dark">
          {product.name}
        </h3>
        <p className="min-h-[19px] text-[0.68rem] text-muted">{product.subtitle}</p>
        <div className="mt-[11px] flex items-center justify-between gap-[9px]">
          <b className="text-base font-extrabold text-dark">{money(product.price)}</b>
          <button
            onClick={() => addItem(product.id, product.name, product.price)}
            className="rounded-[9px] border border-line bg-white px-[10px] py-2 text-[0.69rem] font-extrabold text-dark transition-colors hover:bg-dark hover:text-white"
          >
            + Cotizar
          </button>
        </div>
      </div>
    </article>
  );
}
