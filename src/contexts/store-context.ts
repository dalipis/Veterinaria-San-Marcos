import { createContext } from 'react';
import type { AdminReport, CartItem, CheckoutDetails, CheckoutResult, Notice, Order, Product, User } from '../types';

export interface StoreContextValue {
  products: Product[];
  users: User[];
  categories: string[];
  cart: CartItem[];
  user: User | null;
  checkoutResult: CheckoutResult | null;
  notice: Notice | null;
  orders: Order[];
  report: AdminReport | null;
  loading: boolean;
  cartCount: number;
  available: (id: string) => number;
  setCategories: (categories: string[]) => void;
  setCart: (cart: CartItem[]) => void;
  setUser: (user: User | null) => Promise<void>;
  notify: (text: string, kind?: Notice['kind']) => void;
  addToCart: (product: Product) => void;
  changeQuantity: (id: string, delta: number) => void;
  completeCheckout: (details: CheckoutDetails) => Promise<void>;
  login: (email: string, password: string) => Promise<{ user?: User; message: string }>;
  register: (details: Omit<User, 'id' | 'role' | 'compras' | 'intentosFallidos' | 'bloqueado'>) => Promise<string | null>;
  saveManagedUser: (account: User) => Promise<void>;
  deleteManagedUser: (id: string) => Promise<void>;
  activateManagedUser: (id: string) => Promise<void>;
  saveProfile: (account: User) => Promise<string | null>;
  saveManagedProduct: (product: Product) => Promise<void>;
  deleteManagedProduct: (id: string) => Promise<void>;
  saveManagedCategories: (categories: string[]) => Promise<void>;
  updateOrderStatus: (id: string, estado: Order['estado']) => Promise<void>;
  loadReport: (period?: 'week' | 'month' | 'year') => Promise<void>;
}

export const StoreContext = createContext<StoreContextValue | null>(null);