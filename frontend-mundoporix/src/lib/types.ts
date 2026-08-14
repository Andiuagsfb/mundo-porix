export type RoleName = "ADMIN" | "SELLER";

export interface Role {
  id: number;
  name: RoleName;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  isActive: boolean;
  role: { name: RoleName };
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  roleName: RoleName;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count?: { products: number };
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
}

export interface Season {
  id: string;
  name: string;
  slug: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  isActive: boolean;
  brandId: string;
  categoryId: string;
  category: Category;
  brand: Brand;
  productSeasons: { season: Season }[];
  availableQuantity: number;
}

export type QuoteStatus =
  | "NEW"
  | "RESERVED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "PICKED_UP"
  | "CANCELLED"
  | "EXPIRED";

export interface QuoteItem {
  id: string;
  quoteId: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  product: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
  };
}

export interface Quote {
  id: string;
  quoteNumber: string;
  customerName: string;
  customerPhone: string;
  pickupDate: string;
  notes: string | null;
  status: QuoteStatus;
  total: string;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  items: QuoteItem[];
  reservation: {
    id: string;
    status: "ACTIVE" | "EXPIRED" | "RELEASED" | "COMPLETED";
    reservedAt: string;
    expiresAt: string;
    releasedAt: string | null;
  } | null;
  pickup: {
    id: string;
    status: "PENDING" | "COMPLETED" | "CANCELLED";
    preparedAt: string | null;
    pickedUpAt: string | null;
  } | null;
  createdBy: { id: string; fullName: string; email: string } | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface InventoryEntry {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: string;
    isActive: boolean;
    category: { id: string; name: string };
    brand: { id: string; name: string };
  };
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  updatedAt: string;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiErrorPayload {
  statusCode: number;
  message: string | string[];
  error?: string;
  timestamp?: string;
  path?: string;
}
