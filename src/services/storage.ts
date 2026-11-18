import type { CartItem, CheckoutResult, Product, Role, User } from '../types';
import { defaultCategories, keys } from '../constants';
import { initialProducts } from '../data/products';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function createId(prefix: string): string {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36)}`;
}

export function getUsers(): User[] {
  const raw = localStorage.getItem(keys.users);
  const stored = read<Partial<User>[]>(keys.users, []);
  const users = stored.map((user) => ({
    ...user,
    id: user.id ?? createId('usr'),
    role: user.role ?? 'cliente',
    compras: user.compras ?? [],
    intentosFallidos: user.intentosFallidos ?? 0,
    bloqueado: user.bloqueado ?? false,
  })) as User[];
  const demos: User[] = [
    { id: 'demo-admin', nombre: 'Admin', apellido: 'San Marcos', correo: 'admin@duoc.cl', password: 'Admin123', role: 'administrador', fechaNacimiento: '', direccion: '', region: '', genero: '', compras: [], intentosFallidos: 0, bloqueado: false },
    { id: 'demo-vendedor', nombre: 'Vendedor', apellido: 'San Marcos', correo: 'vendedor@duoc.cl', password: 'Vendedor123', role: 'vendedor', fechaNacimiento: '', direccion: '', region: '', genero: '', compras: [], intentosFallidos: 0, bloqueado: false },
  ];
  for (const demo of demos) if (!users.some((user) => user.correo.toLowerCase() === demo.correo)) users.push(demo);
  if (raw === null || JSON.stringify(users) !== raw) write(keys.users, users);
  return users;
}

export function saveUsers(users: User[]): void { write(keys.users, users); }
export function getProducts(): Product[] {
  const products = read<Product[] | null>(keys.products, null);
  if (!products) {
    write(keys.products, initialProducts);
    localStorage.setItem(keys.offerMigration, '1');
    return initialProducts;
  }
  if (localStorage.getItem(keys.offerMigration) !== '1') {
    const migrated = products.map((product) => {
      const seedOffer = initialProducts.find((item) => item.id === product.id)?.precioOferta;
      return product.precioOferta === undefined && seedOffer ? { ...product, precioOferta: seedOffer } : product;
    });
    write(keys.products, migrated);
    localStorage.setItem(keys.offerMigration, '1');
    return migrated;
  }
  return products;
}
export function saveProducts(products: Product[]): void { write(keys.products, products); }
export function createProduct(products: Product[], product: Product): Product[] {
  const created = { ...product, id: product.id || createId('prod') };
  const next = [...products, created];
  saveProducts(next);
  return next;
}
export function updateProduct(products: Product[], product: Product): Product[] {
  const next = products.map((item) => item.id === product.id ? product : item);
  saveProducts(next);
  return next;
}
export function deleteProduct(products: Product[], id: string): Product[] {
  const next = products.filter((item) => item.id !== id);
  saveProducts(next);
  return next;
}
export function getCategories(): string[] {
  const categories = read<string[] | null>(keys.categories, null);
  if (categories) return categories;
  write(keys.categories, defaultCategories);
  return defaultCategories;
}
export function saveCategories(categories: string[]): void { write(keys.categories, categories); }
export function createCategory(categories: string[], category: string): string[] {
  const next = [...categories, category];
  saveCategories(next);
  return next;
}
export function updateCategory(categories: string[], previous: string, category: string): string[] {
  const next = categories.map((item) => item === previous ? category : item);
  saveCategories(next);
  return next;
}
export function deleteCategory(categories: string[], category: string): string[] {
  const next = categories.filter((item) => item !== category);
  saveCategories(next);
  return next;
}
export function createUser(users: User[], user: User): User[] {
  const next = [...users, { ...user, id: user.id || createId('usr') }];
  saveUsers(next);
  return next;
}
export function updateUser(users: User[], user: User): User[] {
  const next = users.map((item) => item.id === user.id ? user : item);
  saveUsers(next);
  return next;
}
export function deleteUser(users: User[], id: string): User[] {
  const next = users.filter((item) => item.id !== id);
  saveUsers(next);
  return next;
}
export function getCart(): CartItem[] { return read(keys.cart, []); }
export function saveCart(cart: CartItem[]): void { write(keys.cart, cart); }
export function getCheckoutResult(): CheckoutResult | null { return read(keys.checkoutResult, null); }
export function saveCheckoutResult(result: CheckoutResult): void { write(keys.checkoutResult, result); }
export function getSession(): User | null {
  const session = read<Pick<User, 'id' | 'correo'> | null>(keys.session, null);
  if (!session) return null;
  const user = getUsers().find((account) => account.id === session.id || account.correo === session.correo);
  if (!user) localStorage.removeItem(keys.session);
  return user ?? null;
}
export function saveSession(user: User | null): void {
  if (user) write(keys.session, { id: user.id, correo: user.correo });
  else localStorage.removeItem(keys.session);
}
export function roleLabel(role: Role): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}