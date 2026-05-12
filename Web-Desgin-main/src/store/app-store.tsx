import * as React from "react";
import { PRODUCTS, type Product } from "@/data/products";

export type Role = "guest" | "customer" | "seller" | "admin";
export type ItemType = "buy" | "rent";

export interface CartItem {
  id: string;
  productId: string;
  type: ItemType;
  days?: number;
  qty: number;
}

export type OrderStatus = "pending" | "approved" | "rejected" | "completed";

export interface Order {
  id: string;
  productId: string;
  type: ItemType;
  days?: number;
  total: number;
  payment: "cod" | "online";
  status: OrderStatus;
  createdAt: string;
}

export interface Message {
  id: string;
  productId: string;
  fromName: string;
  fromEmail: string;
  body: string;
  reply?: string;
  createdAt: string;
  unread: boolean;
}

interface State {
  role: Role;
  user: { name: string; email: string; dob?: string; id?: string | number } | null;
  token: string | null;
  theme: "light" | "dark";
  lang: "en" | "ar";
  wishlist: string[];
  cart: CartItem[];
  orders: Order[];
  messages: Message[];
  products: Product[];
  productsLoading: boolean;
  viewHistory: string[];
  currency: string;
  exchangeRates: Record<string, number> | null;
  ratesTimestamp: number | null;
}

type Action =
  | { type: "SET_ROLE"; role: Role; user?: { name: string; email: string } | null }
  | { type: "LOGIN"; user: { name: string; email: string; dob?: string; id: string | number }; role: Role; token: string }
  | { type: "LOGOUT" }
  | { type: "TOGGLE_THEME" }
  | { type: "SET_LANG"; lang: "en" | "ar" }
  | { type: "TOGGLE_WISHLIST"; productId: string }
  | { type: "ADD_TO_CART"; item: CartItem }
  | { type: "REMOVE_CART"; id: string }
  | { type: "CLEAR_CART" }
  | { type: "PLACE_ORDER"; order: Order }
  | { type: "SET_ORDER_STATUS"; id: string; status: OrderStatus }
  | { type: "ADD_MESSAGE"; message: Message }
  | { type: "REPLY_MESSAGE"; id: string; reply: string }
  | { type: "MARK_READ"; id: string }
  | { type: "ADD_PRODUCT"; product: Product }
  | { type: "TOGGLE_PRODUCT_AVAIL"; id: string }
  | { type: "REMOVE_PRODUCT"; id: string }
  | { type: "SET_PRODUCTS"; products: Product[] }
  | { type: "SET_PRODUCTS_LOADING"; loading: boolean }
  | { type: "ADD_TO_VIEW_HISTORY"; productId: string }
  | { type: "SET_CURRENCY"; currency: string }
  | { type: "SET_EXCHANGE_RATES"; rates: Record<string, number>; timestamp: number }
  | { type: "HYDRATE"; state: State };

const STORAGE_KEY = "rentbuy:v1";

const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  EGP: 48.5,
  SAR: 3.75,
};

const initialState: State = {
  role: "guest",
  user: null,
  token: null,
  theme: "light",
  lang: "en",
  wishlist: [],
  cart: [],
  orders: [],
  messages: [],
  products: PRODUCTS,
  productsLoading: true,
  viewHistory: [],
  currency: "USD",
  exchangeRates: FALLBACK_RATES,
  ratesTimestamp: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return action.state;
    case "SET_ROLE":
      return { ...state, role: action.role, user: action.user ?? state.user };
    case "LOGIN":
      return { ...state, role: action.role, user: action.user, token: action.token };
    case "LOGOUT":
      localStorage.removeItem(STORAGE_KEY);
      return {
        ...initialState,
        theme: state.theme,
        lang: state.lang,
        currency: state.currency,
        exchangeRates: state.exchangeRates,
        ratesTimestamp: state.ratesTimestamp,
        products: state.products, // Keep loaded products
        productsLoading: false,
      };
    case "TOGGLE_THEME":
      return { ...state, theme: state.theme === "light" ? "dark" : "light" };
    case "SET_LANG":
      return { ...state, lang: action.lang };
    case "TOGGLE_WISHLIST":
      return {
        ...state,
        wishlist: state.wishlist.includes(action.productId)
          ? state.wishlist.filter((id) => id !== action.productId)
          : [...state.wishlist, action.productId],
      };
    case "ADD_TO_CART":
      return { ...state, cart: [...state.cart, action.item] };
    case "REMOVE_CART":
      return { ...state, cart: state.cart.filter((i) => i.id !== action.id) };
    case "CLEAR_CART":
      return { ...state, cart: [] };
    case "PLACE_ORDER":
      return { ...state, orders: [action.order, ...state.orders] };
    case "SET_ORDER_STATUS":
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.id ? { ...o, status: action.status } : o,
        ),
      };
    case "ADD_MESSAGE":
      return { ...state, messages: [action.message, ...state.messages] };
    case "REPLY_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.id ? { ...m, reply: action.reply } : m,
        ),
      };
    case "MARK_READ":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.id ? { ...m, unread: false } : m,
        ),
      };
    case "ADD_PRODUCT":
      return { ...state, products: [action.product, ...state.products] };
    case "TOGGLE_PRODUCT_AVAIL":
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.id ? { ...p, available: !p.available } : p,
        ),
      };
    case "REMOVE_PRODUCT":
      return { ...state, products: state.products.filter((p) => p.id !== action.id) };
    case "SET_PRODUCTS":
      return { ...state, products: action.products, productsLoading: false };
    case "SET_PRODUCTS_LOADING":
      return { ...state, productsLoading: action.loading };
    case "ADD_TO_VIEW_HISTORY":
      return {
        ...state,
        viewHistory: [action.productId, ...state.viewHistory.filter(id => id !== action.productId)].slice(0, 10),
      };
    case "SET_CURRENCY":
      return { ...state, currency: action.currency };
    case "SET_EXCHANGE_RATES":
      return { ...state, exchangeRates: action.rates, ratesTimestamp: action.timestamp };
    default:
      return state;
  }
}

interface Ctx {
  state: State;
  dispatch: React.Dispatch<Action>;
}

const AppCtx = React.createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const hydrated = React.useRef(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as State;
        dispatch({
          type: "HYDRATE",
          state: {
            ...initialState,
            ...parsed,
            products: PRODUCTS,
            productsLoading: true,
            exchangeRates: null,
            cart: parsed.role === "guest" ? [] : (parsed.cart ?? []),
          },
        });
      }
    } catch {
      /* noop */
    }
    hydrated.current = true;

    // Listen for logout or session changes from other tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        if (!e.newValue) {
          window.location.href = "/auth";
          return;
        }
        try {
          const parsed = JSON.parse(e.newValue);
          // If other tab logged out (became guest) but this one hasn't reacted yet
          if (parsed.role === "guest" && hydrated.current) {
             const currentRaw = localStorage.getItem(STORAGE_KEY);
             if (currentRaw && JSON.parse(currentRaw).role !== "guest") {
                window.location.href = '/auth';
             }
          }
        } catch(e) { /* noop */ }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);



  React.useEffect(() => {
    if (!hydrated.current) return;
    try {
      // Exclude products (re-fetched on load), exchangeRates, and productsLoading from persistence
      const { products, exchangeRates, productsLoading, ...persistState } = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persistState));
    } catch {
      /* noop */
    }
  }, [state]);

  React.useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}/api/products`, {
      signal: controller.signal,
    })
      .then(res => res.json())
      .then(data => {
        clearTimeout(timeoutId);
        if (Array.isArray(data)) {
          dispatch({ type: "SET_PRODUCTS", products: data });
        } else {
          // Backend returned unexpected data — mark loading done but keep local products
          dispatch({ type: "SET_PRODUCTS_LOADING", loading: false });
        }
      })
      .catch(err => {
        clearTimeout(timeoutId);
        if (err.name !== 'AbortError') {
          console.error("Failed to fetch products:", err);
        }
        // Keep using local PRODUCTS data, just mark loading done
        dispatch({ type: "SET_PRODUCTS_LOADING", loading: false });
      });

    // Fetch exchange rates (5 s timeout — falls back to FALLBACK_RATES on failure)
    const now = Date.now();
    if (!state.ratesTimestamp || !state.exchangeRates || now - state.ratesTimestamp >= 3600000) {
      const ratesController = new AbortController();
      const ratesTimeout = setTimeout(() => ratesController.abort(), 5000);

      fetch('https://open.er-api.com/v6/latest/USD', { signal: ratesController.signal })
        .then(res => res.json())
        .then(data => {
          clearTimeout(ratesTimeout);
          if (data && data.rates) {
            dispatch({
              type: 'SET_EXCHANGE_RATES',
              rates: data.rates,
              timestamp: now,
            });
          }
        })
        .catch(() => {
          clearTimeout(ratesTimeout);
          // API unavailable or timed out — ensure fallback rates are set
          if (!state.exchangeRates) {
            dispatch({
              type: 'SET_EXCHANGE_RATES',
              rates: FALLBACK_RATES,
              timestamp: Date.now(),
            });
          }
        });
    }
  }, []);

  React.useEffect(() => {
    const root = document.documentElement;
    if (state.theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [state.theme]);

  React.useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("dir", state.lang === "ar" ? "rtl" : "ltr");
    root.setAttribute("lang", state.lang);
  }, [state.lang]);

  return <AppCtx.Provider value={{ state, dispatch }}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = React.useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
