import type {
  AdminReport,
  AuthSession,
  CartItem,
  CheckoutDetails,
  CheckoutResult,
  Order,
  Product,
  User,
} from '../types';
import { initialProducts } from '../data/products';
import { defaultCategories } from '../constants';

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';
const SESSION_KEY = 'vsm_auth_session';

export function getStoredSession(): AuthSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) as AuthSession : null;
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession | null): void {
  if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else sessionStorage.removeItem(SESSION_KEY);
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const session = getStoredSession();
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) headers.set('Content-Type', 'application/json');
  if (session?.accessToken) headers.set('Authorization', `Bearer ${session.accessToken}`);

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    let message = 'No fue posible completar la solicitud.';
    try {
      const body = await response.json() as { message?: string };
      if (body.message) message = body.message;
    } catch {
      // Keep the default HTTP error message.
    }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

let mockProducts = initialProducts.map((product) => ({ ...product }));
let mockCategories = [...defaultCategories];
let mockUsers: User[] = [
  { id: 'demo-admin', nombre: 'Admin', apellido: 'San Marcos', correo: 'admin@duoc.cl', password: '', role: 'administrador', fechaNacimiento: '', direccion: '', region: '', genero: '', compras: [], intentosFallidos: 0, bloqueado: false },
  { id: 'demo-vendedor', nombre: 'Vendedor', apellido: 'San Marcos', correo: 'vendedor@duoc.cl', password: '', role: 'vendedor', fechaNacimiento: '', direccion: '', region: '', genero: '', compras: [], intentosFallidos: 0, bloqueado: false },
];
let mockOrders: Order[] = [];

function createId(prefix: string): string {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36)}`;
}

function makeSession(user: User): AuthSession {
  return {
    accessToken: `demo-access-${createId('token')}`,
    refreshToken: `demo-refresh-${createId('token')}`,
    expiresAt: Date.now() + 30 * 60 * 1000,
    user,
  };
}

export const api = {
  isConfigured: Boolean(API_URL),

  async bootstrap() {
    if (API_URL) {
      const [products, categories] = await Promise.all([
        apiRequest<Product[]>('/api/products'),
        apiRequest<string[]>('/api/categories'),
      ]);
      return { products, categories };
    }
    return { products: mockProducts, categories: mockCategories };
  },

  async login(email: string, password: string): Promise<AuthSession> {
    if (API_URL) {
      const session = await apiRequest<AuthSession>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      saveSession(session);
      return session;
    }
    const demoPasswords: Record<string, string> = { 'admin@duoc.cl': 'Admin123', 'vendedor@duoc.cl': 'Vendedor123' };
    const user = mockUsers.find((account) => account.correo.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error('No existe una cuenta registrada con este correo.');
    if (demoPasswords[email] !== password) throw new Error('Credenciales incorrectas.');
    const session = makeSession(user);
    saveSession(session);
    return session;
  },

  async register(details: Omit<User, 'id' | 'role' | 'compras' | 'intentosFallidos' | 'bloqueado'>): Promise<User> {
    if (API_URL) return apiRequest<User>('/api/auth/register', { method: 'POST', body: JSON.stringify(details) });
    if (mockUsers.some((account) => account.correo.toLowerCase() === details.correo.toLowerCase())) throw new Error('Ya existe una cuenta registrada con ese correo.');
    const user: User = { ...details, id: createId('usr'), role: 'cliente', compras: [], intentosFallidos: 0, bloqueado: false };
    mockUsers = [...mockUsers, user];
    return user;
  },

  async refreshSession(): Promise<AuthSession | null> {
    const session = getStoredSession();
    if (!session) return null;
    if (session.expiresAt > Date.now()) return session;
    if (API_URL) {
      const refreshed = await apiRequest<AuthSession>('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      });
      saveSession(refreshed);
      return refreshed;
    }
    const refreshed = { ...session, accessToken: `demo-access-${createId('token')}`, expiresAt: Date.now() + 30 * 60 * 1000 };
    saveSession(refreshed);
    return refreshed;
  },

  async logout(): Promise<void> {
    if (API_URL) {
      try { await apiRequest<void>('/api/auth/logout', { method: 'POST' }); } catch { /* Local logout must always complete. */ }
    }
    clearSession();
  },

  async getUsers(): Promise<User[]> {
    return API_URL ? apiRequest<User[]>('/api/users') : mockUsers;
  },

  async saveUser(account: User): Promise<User[]> {
    if (API_URL) {
      const saved = account.id
        ? await apiRequest<User>(`/api/users/${account.id}`, { method: 'PUT', body: JSON.stringify(account) })
        : await apiRequest<User>('/api/users', { method: 'POST', body: JSON.stringify(account) });
      return apiRequest<User[]>('/api/users').then((users) => users.map((user) => user.id === saved.id ? saved : user));
    }
    mockUsers = account.id
      ? mockUsers.map((item) => item.id === account.id ? account : item)
      : [...mockUsers, { ...account, id: createId('usr') }];
    return mockUsers;
  },

  async deleteUser(id: string): Promise<User[]> {
    if (API_URL) {
      await apiRequest<void>(`/api/users/${id}`, { method: 'DELETE' });
      return apiRequest<User[]>('/api/users');
    }
    mockUsers = mockUsers.filter((account) => account.id !== id);
    return mockUsers;
  },

  async saveProfile(account: User): Promise<User> {
    if (API_URL) return apiRequest<User>(`/api/users/${account.id}`, { method: 'PUT', body: JSON.stringify(account) });
    mockUsers = mockUsers.map((item) => item.id === account.id ? account : item);
    return account;
  },

  async saveProduct(product: Product): Promise<Product[]> {
    if (API_URL) {
      await apiRequest<Product>(product.id ? `/api/products/${product.id}` : '/api/products', {
        method: product.id ? 'PUT' : 'POST',
        body: JSON.stringify(product),
      });
      return apiRequest<Product[]>('/api/products');
    }
    mockProducts = product.id
      ? mockProducts.map((item) => item.id === product.id ? product : item)
      : [...mockProducts, { ...product, id: product.id || createId('prod') }];
    return mockProducts;
  },

  async deleteProduct(id: string): Promise<Product[]> {
    if (API_URL) {
      await apiRequest<void>(`/api/products/${id}`, { method: 'DELETE' });
      return apiRequest<Product[]>('/api/products');
    }
    mockProducts = mockProducts.filter((product) => product.id !== id);
    return mockProducts;
  },

  async saveCategories(categories: string[]): Promise<string[]> {
    if (API_URL) {
      await apiRequest<void>('/api/categories', { method: 'PUT', body: JSON.stringify({ categories }) });
      return apiRequest<string[]>('/api/categories');
    }
    mockCategories = [...categories];
    mockProducts = mockProducts.map((product) => mockCategories.includes(product.categoria) ? product : { ...product, categoria: mockCategories[0] ?? 'General' });
    return mockCategories;
  },

  async checkout(user: User, cart: CartItem[], details: CheckoutDetails): Promise<CheckoutResult> {
    if (API_URL) return apiRequest<CheckoutResult>('/api/orders', { method: 'POST', body: JSON.stringify({ userId: user.id, items: cart, ...details }) });
    const result = completeMockCheckout(user, cart, details);
    if (result.order) {
      mockOrders = [result.order, ...mockOrders];
      mockUsers = mockUsers.map((account) => account.id === user.id ? { ...account, compras: [result.order!, ...account.compras] } : account);
    }
    return result;
  },

  async getOrders(user: User): Promise<Order[]> {
    if (API_URL) return apiRequest<Order[]>(`/api/orders/user/${user.id}`);
    return mockOrders.filter((order) => mockUsers.find((account) => account.compras.some((item) => item.idOrden === order.idOrden))?.id === user.id);
  },

  async getAllOrders(): Promise<Order[]> {
    if (API_URL) return apiRequest<Order[]>('/api/orders');
    return mockOrders;
  },

  async updateOrderStatus(id: string, estado: Order['estado']): Promise<Order[]> {
    if (API_URL) {
      await apiRequest<Order>(`/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ estado }) });
      return apiRequest<Order[]>('/api/orders');
    }
    mockOrders = mockOrders.map((order) => order.idOrden === id ? { ...order, estado } : order);
    return mockOrders;
  },

  async getReport(period: 'week' | 'month' | 'year' = 'month'): Promise<AdminReport> {
    if (API_URL) return apiRequest<AdminReport>(`/api/reports/dashboard?period=${period}`);
    return buildMockReport(period);
  },
};

function completeMockCheckout(user: User, cart: CartItem[], details: CheckoutDetails): CheckoutResult {
  const fecha = new Date().toLocaleString('es-CL');
  if (!cart.length) return { estado: 'fallido', mensaje: 'El carrito está vacío.', order: null, fecha };
  if (cart.some((item) => {
    const product = mockProducts.find((entry) => entry.id === item.id);
    return !product || product.stock < item.cantidad;
  })) return { estado: 'fallido', mensaje: 'El stock no alcanza para completar la compra.', order: null, fecha };
  if (details.metodoPago === 'tarjeta' && details.numeroTarjeta.endsWith('0002')) {
    return { estado: 'fallido', mensaje: 'El emisor rechazó el pago simulado.', order: null, fecha };
  }
  const items = cart.flatMap((item) => {
    const product = mockProducts.find((entry) => entry.id === item.id);
    if (!product) return [];
    const precioUnitario = product.precioOferta && product.precioOferta < product.precio ? product.precioOferta : product.precio;
    return [{ id: product.id, nombre: product.nombre, cantidad: item.cantidad, precioUnitario, subtotal: precioUnitario * item.cantidad }];
  });
  mockProducts = mockProducts.map((product) => {
    const item = cart.find((entry) => entry.id === product.id);
    return item ? { ...product, stock: product.stock - item.cantidad } : product;
  });
  const order: Order = {
    idOrden: `ORD-${Date.now()}`,
    fecha,
    direccionEntrega: details.tipoEntrega === 'retiro' ? 'Retiro en clínica' : details.direccionEntrega,
    regionEntrega: details.tipoEntrega === 'retiro' ? "Libertador General Bernardo O'Higgins" : details.regionEntrega,
    tipoEntrega: details.tipoEntrega,
    metodoPago: details.metodoPago,
    estado: 'confirmado',
    items,
    total: items.reduce((sum, item) => sum + item.subtotal, 0),
  };
  void user;
  return { estado: 'exitoso', mensaje: `Tu pedido ${order.idOrden} fue confirmado.`, order, fecha };
}

function buildMockReport(period: 'week' | 'month' | 'year'): AdminReport {
  const operations = mockOrders;
  const totals = operations.reduce((summary, order) => ({
    monto: summary.monto + order.total,
    productos: summary.productos + order.items.reduce((sum, item) => sum + item.cantidad, 0),
  }), { monto: 0, productos: 0 });
  const sales = new Map<string, number>();
  operations.forEach((order) => order.items.forEach((item) => sales.set(item.nombre, (sales.get(item.nombre) ?? 0) + item.cantidad)));
  const masSolicitados = [...sales.entries()].map(([nombre, cantidad]) => ({ nombre, cantidad })).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);
  return {
    totalOperaciones: operations.length,
    montoTotal: totals.monto,
    productosVendidos: totals.productos,
    masSolicitados,
    porPeriodo: [{ periodo: period, operaciones: operations.length, monto: totals.monto }],
  };
}
