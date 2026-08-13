export type ProductCategory = "escolar" | "escritura" | "arte" | "oficina";
export type ArtVariant = "default" | "alt" | "pink";

export interface Product {
  id: string;
  name: string;
  brand: string;
  subtitle: string;
  price: number;
  category: ProductCategory;
  badge: string;
  sale?: boolean;
  order: number;
  art: ArtVariant;
  artLines: [string, string];
  media: string;
}

export const products: Product[] = [
  {
    id: "cuaderno-universitario",
    name: "Cuaderno universitario",
    brand: "Norma",
    subtitle: "100 hojas · rayado",
    price: 8500,
    category: "escolar",
    badge: "Más vendido",
    order: 1,
    art: "default",
    artLines: ["Cuaderno", "universitario"],
    media: "#E9DDCF",
  },
  {
    id: "colores-x12",
    name: "Colores x12",
    brand: "Faber-Castell",
    subtitle: "Colores de alta intensidad",
    price: 12000,
    category: "arte",
    badge: "Favorito",
    order: 2,
    art: "alt",
    artLines: ["Colores", "x12"],
    media: "#E2E6DE",
  },
  {
    id: "lapicero-gel",
    name: "Lapicero gel",
    brand: "Pilot",
    subtitle: "Tinta suave · 0.7 mm",
    price: 2500,
    category: "escritura",
    badge: "Oferta",
    sale: true,
    order: 3,
    art: "pink",
    artLines: ["Lapicero", "gel"],
    media: "#E9D8D3",
  },
  {
    id: "cartulina",
    name: "Cartulina",
    brand: "Selección Mundo Pórix",
    subtitle: "Varias tonalidades disponibles",
    price: 1500,
    category: "arte",
    badge: "Básico",
    order: 4,
    art: "default",
    artLines: ["Cartulina", "unidad"],
    media: "#DFE4E6",
  },
  {
    id: "agenda-2026",
    name: "Agenda 2026",
    brand: "Editorial",
    subtitle: "Planificación semanal",
    price: 18500,
    category: "oficina",
    badge: "Nuevo",
    order: 5,
    art: "alt",
    artLines: ["Agenda", "2026"],
    media: "#E8DCC8",
  },
  {
    id: "marcadores-x6",
    name: "Marcadores x6",
    brand: "Sharpie",
    subtitle: "Colores permanentes",
    price: 6500,
    category: "escritura",
    badge: "Popular",
    order: 6,
    art: "pink",
    artLines: ["Marcadores", "x6"],
    media: "#DDE4D9",
  },
];
