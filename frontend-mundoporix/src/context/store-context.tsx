"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface QuoteItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

const CART_KEY = "mp_cart";

interface StoreContextValue {
  items: QuoteItem[];
  count: number;
  total: number;
  addItem: (id: string, name: string, price: number, qty?: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  drawerOpen: boolean;
  toggleDrawer: () => void;
  closeDrawer: () => void;
  toast: string | null;
  notify: (message: string) => void;
  contactOpen: boolean;
  openContact: () => void;
  closeContact: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function loadCart(): QuoteItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QuoteItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i) => i && typeof i.id === "string" && typeof i.qty === "number",
    );
  } catch {
    return [];
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<QuoteItem[]>(loadCart);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) {
      try {
        window.localStorage.setItem(CART_KEY, JSON.stringify(items));
      } catch {
        /* almacenamiento no disponible */
      }
    } else {
      hydrated.current = true;
    }
  }, [items]);

  const notify = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1200);
  }, []);

  const addItem = useCallback(
    (id: string, name: string, price: number, qty = 1) => {
      setItems((prev) => {
        const found = prev.find((i) => i.id === id);
        if (found) {
          return prev.map((i) =>
            i.id === id ? { ...i, qty: i.qty + qty } : i,
          );
        }
        return [...prev, { id, name, price, qty }];
      });
      notify(`${name} agregado`);
    },
    [notify],
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const toggleDrawer = useCallback(() => setDrawerOpen((o) => !o), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const openContact = useCallback(() => setContactOpen(true), []);
  const closeContact = useCallback(() => setContactOpen(false), []);

  const count = useMemo(
    () => items.reduce((s, i) => s + i.qty, 0),
    [items],
  );
  const total = useMemo(
    () => items.reduce((s, i) => s + i.price * i.qty, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      count,
      total,
      addItem,
      removeItem,
      clearCart,
      drawerOpen,
      toggleDrawer,
      closeDrawer,
      toast,
      notify,
      contactOpen,
      openContact,
      closeContact,
    }),
    [
      items,
      count,
      total,
      addItem,
      removeItem,
      clearCart,
      drawerOpen,
      toggleDrawer,
      closeDrawer,
      toast,
      notify,
      contactOpen,
      openContact,
      closeContact,
    ],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore debe usarse dentro de <StoreProvider>");
  return ctx;
}
