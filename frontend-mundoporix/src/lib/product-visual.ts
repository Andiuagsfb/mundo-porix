import type { Product } from "@/lib/types";

export type ArtVariant = "default" | "alt" | "pink";
export type ArtLines = [string, string];

export interface ProductVisual {
  media: string;
  art: ArtVariant;
  artLines: ArtLines;
  badge: string;
  inStock: boolean;
}

const CATEGORY_MEDIA: Record<string, string> = {
  "Arte y Manualidades": "#DCE4D7",
  Escolar: "#E9DDCF",
  Escritura: "#E8D7D1",
  Oficina: "#DFE4E6",
  Papelería: "#E9DDCF",
  Regalos: "#E8DCC8",
  Tecnología: "#DDE4D9",
};

const VARIANTS: ArtVariant[] = ["default", "alt", "pink"];

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function splitArtLines(name: string): ArtLines {
  const words = name.trim().split(/\s+/);
  if (words.length <= 2) {
    return [words[0] ?? "Producto", words[1] ?? ""];
  }
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

export function toProductVisual(product: Product): ProductVisual {
  const hash = hashId(product.id);
  const inStock = product.availableQuantity > 0;
  return {
    media: product.imageUrl
      ? "#E9DDCF"
      : (CATEGORY_MEDIA[product.category.name] ?? "#E9DDCF"),
    art: VARIANTS[hash % VARIANTS.length],
    artLines: splitArtLines(product.name),
    badge: product.imageUrl
      ? product.brand.name
      : inStock
        ? "Disponible"
        : "Agotado",
    inStock,
  };
}
