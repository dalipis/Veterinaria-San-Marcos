import type { Product } from '../types';

export interface ShopPageProps { products: Product[]; categories: string[]; available: (id: string) => number; onAdd: (product: Product) => void }
