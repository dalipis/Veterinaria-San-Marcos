import type { CartItem, Product, Role, User } from '../types';

const keys = {
  users: 'vsm_usuarios',
  session: 'vsm_usuario_logueado',
  products: 'vsm_productos',
  cart: 'vsm_carrito',
  categories: 'vsm_categorias',
};

export const defaultCategories = [
  'Antibióticos', 'Antiparasitarios', 'Antiinflamatorios', 'Dermatología', 'Digestivo',
  'Cardíaco', 'Analgésicos', 'Vacunas', 'Suplementos',
];

export const initialProducts: Product[] = [
  { id: 'ME001', categoria: 'Antibióticos', nombre: 'Amoxibay 250mg', principioActivo: 'Amoxicilina', presentacion: 'Blíster 10 comp.', especie: 'Perro / Gato', stock: 45, precio: 4200, icono: '💊' },
  { id: 'ME002', categoria: 'Antibióticos', nombre: 'Enrox 50mg', principioActivo: 'Enrofloxacino', presentacion: 'Blíster 10 comp.', especie: 'Perro / Gato', stock: 30, precio: 6800, icono: '💊' },
  { id: 'ME004', categoria: 'Antiparasitarios', nombre: 'Nexgard', principioActivo: 'Afoxolaner', presentacion: 'Masticable 1 unid.', especie: 'Perro', stock: 60, precio: 9500, icono: '🐛' },
  { id: 'ME005', categoria: 'Antiparasitarios', nombre: 'Bravecto', principioActivo: 'Fluralaner', presentacion: 'Masticable 1 unid.', especie: 'Perro', stock: 40, precio: 18900, icono: '🐛' },
  { id: 'ME006', categoria: 'Antiparasitarios', nombre: 'Revolution Plus', principioActivo: 'Selamectina + Sarolaner', presentacion: 'Pipeta 1 unid.', especie: 'Gato', stock: 35, precio: 14500, icono: '🐛' },
  { id: 'ME009', categoria: 'Antiinflamatorios', nombre: 'Meloxicam 1mg', principioActivo: 'Meloxicam', presentacion: 'Blíster 10 comp.', especie: 'Perro / Gato', stock: 55, precio: 4500, icono: '🩹' },
  { id: 'ME011', categoria: 'Dermatología', nombre: 'Clorhexidina shampoo', principioActivo: 'Clorhexidina 2%', presentacion: 'Frasco 250ml', especie: 'Perro / Gato', stock: 25, precio: 8900, icono: '🧴' },
  { id: 'ME013', categoria: 'Dermatología', nombre: 'Apoquel 16mg', principioActivo: 'Oclacitinib', presentacion: 'Blíster 10 comp.', especie: 'Perro', stock: 18, precio: 22000, icono: '🧴' },
  { id: 'ME014', categoria: 'Digestivo', nombre: 'Probifor', principioActivo: 'Bacillus clausii', presentacion: 'Sobre 5ml x10', especie: 'Perro / Gato', stock: 40, precio: 5600, icono: '🍽️' },
  { id: 'ME016', categoria: 'Cardíaco', nombre: 'Vetmedin 2.5mg', principioActivo: 'Pimobendan', presentacion: 'Blíster 10 comp.', especie: 'Perro', stock: 15, precio: 28000, icono: '❤️' },
  { id: 'ME018', categoria: 'Vacunas', nombre: 'Nobivac DHPPi', principioActivo: 'Vacuna polivalente', presentacion: 'Vial 1 dosis', especie: 'Perro', stock: 48, precio: 8500, icono: '💉' },
  { id: 'ME021', categoria: 'Suplementos', nombre: 'Omega vet 3-6-9', principioActivo: 'Ácidos grasos omega', presentacion: 'Frasco 100ml', especie: 'Perro / Gato', stock: 30, precio: 9900, icono: '🌿' },
];

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
  write(keys.users, users);
  return users;
}

export function saveUsers(users: User[]): void { write(keys.users, users); }
export function getProducts(): Product[] { return read(keys.products, initialProducts); }
export function saveProducts(products: Product[]): void { write(keys.products, products); }
export function getCategories(): string[] { return read(keys.categories, defaultCategories); }
export function saveCategories(categories: string[]): void { write(keys.categories, categories); }
export function getCart(): CartItem[] { return read(keys.cart, []); }
export function saveCart(cart: CartItem[]): void { write(keys.cart, cart); }
export function getSession(): User | null {
  const session = read<Pick<User, 'id' | 'correo'> | null>(keys.session, null);
  return session ? getUsers().find((user) => user.id === session.id || user.correo === session.correo) ?? null : null;
}
export function saveSession(user: User | null): void {
  if (user) write(keys.session, { id: user.id, correo: user.correo });
  else localStorage.removeItem(keys.session);
}
export function roleLabel(role: Role): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}