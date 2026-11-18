import { createContext } from 'react';
import type { CartItem, CheckoutDetails, CheckoutResult, Notice, Product, User } from '../types';

export interface StoreContextValue {
  products: Product[];
  users: User[];
  categories: string[];
  cart: CartItem[];
  user: User | null;
  checkoutResult: CheckoutResult | null;
  notice: Notice | null;
  cartCount: number;
  available: (id: string) => number;
  setProducts: (products: Product[]) => void;
  setUsers: (users: User[]) => void;
  setCategories: (categories: string[]) => void;
  setCart: (cart: CartItem[]) => void;
  setUser: (user: User | null) => void;
  notify: (text: string, kind?: Notice['kind']) => void;
  addToCart: (product: Product) => void;
  changeQuantity: (id: string, delta: number) => void;
  completeCheckout: (details: CheckoutDetails) => void;
  login: (email: string, password: string) => { user?: User; message: string };
  register: (details: Omit<User, 'id' | 'role' | 'compras' | 'intentosFallidos' | 'bloqueado'>) => string | null;
  saveManagedUser: (account: User) => void;
  deleteManagedUser: (id: string) => void;
  saveProfile: (account: User) => string | null;
  saveManagedProduct: (product: Product) => void;
  deleteManagedProduct: (id: string) => void;
  saveManagedCategories: (categories: string[]) => void;
}

export const StoreContext = createContext<StoreContextValue | null>(null);