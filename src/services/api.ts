import type {
  AdminReport,
  AuthSession,
  CartItem,
  CheckoutDetails,
  CheckoutResult,
  Order,
  Product,
  Role,
  User,
} from '../types';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');
const API_PREFIX = '/api/v1';
const AUTH_PATHS_WITHOUT_REFRESH = ['/auth/login', '/auth/registro', '/auth/refresh'];
let csrfRequest: Promise<string> | null = null;
let refreshRequest: Promise<void> | null = null;
let sessionExpiredHandler: (() => void) | null = null;

interface ApiUser {
  id: string;
  nombre: string;
  apellido: string;
  fechaNacimiento?: string;
  correo: string;
  direccion?: string;
  region?: string;
  genero?: string;
  role: string;
  compras?: ApiOrder[];
  intentosFallidos?: number;
  bloqueado?: boolean;
  activo?: boolean;
}

interface ApiOrder {
  idOrden: string;
  fecha: string;
  direccionEntrega: string;
  regionEntrega: string;
  tipoEntrega: Order['tipoEntrega'];
  metodoPago: Order['metodoPago'];
  estado: string;
  items: Order['items'];
  total: number;
}

interface ApiCategory {
  id: string;
  nombre: string;
}

type ApiProduct = Omit<Product, 'precioOferta'> & { precioOferta: number | null };

interface ApiReport {
  periodo: string;
  totalOperaciones: number;
  montoTotal: number;
  unidadesVendidas: number;
  productosMasSolicitados: { productoId: string; nombre: string; cantidad: number; monto: number }[];
}

const ORDER_STATES: Record<string, Order['estado']> = {
  confirmado: 'confirmado',
  preparando: 'procesando',
  despachado: 'procesando',
  entregado: 'entregado',
  cancelado: 'cancelado',
};

function mapOrder(order: ApiOrder): Order {
  const estado = ORDER_STATES[order.estado];
  if (!estado) throw new Error(`El backend devolvió un estado de compra no reconocido: ${order.estado}`);
  return { ...order, estado };
}

function mapRole(role: string): Role {
  const normalized = role.toLowerCase();
  if (normalized === 'administrador' || normalized === 'vendedor' || normalized === 'cliente') return normalized;
  throw new Error(`El backend devolvió un rol no reconocido: ${role}`);
}

function mapUser(user: ApiUser): User {
  return {
    id: user.id,
    nombre: user.nombre,
    apellido: user.apellido,
    fechaNacimiento: user.fechaNacimiento ?? '',
    correo: user.correo,
    password: '',
    direccion: user.direccion ?? '',
    region: user.region ?? '',
    genero: user.genero ?? '',
    role: mapRole(user.role),
    compras: (user.compras ?? []).map(mapOrder),
    intentosFallidos: user.intentosFallidos ?? 0,
    bloqueado: user.bloqueado ?? false,
    activo: user.activo ?? true,
  };
}

function mapProduct(product: ApiProduct): Product {
  return { ...product, precioOferta: product.precioOferta ?? undefined };
}

class ApiRequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export function setSessionExpiredHandler(handler: () => void): void {
  sessionExpiredHandler = handler;
}

async function getCsrfToken(): Promise<string> {
  if (!csrfRequest) {
    csrfRequest = fetch(`${API_URL}${API_PREFIX}/auth/csrf`, { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) throw new ApiRequestError('No fue posible preparar la sesión segura.', response.status);
        const body = await response.json() as { token: string };
        return body.token;
      })
      .finally(() => { csrfRequest = null; });
  }
  return csrfRequest;
}

function refreshSessionCookie(): Promise<void> {
  if (!refreshRequest) {
    refreshRequest = apiRequest<ApiUser>('/auth/refresh', { method: 'POST' }, false)
      .then(() => undefined)
      .finally(() => { refreshRequest = null; });
  }
  return refreshRequest;
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  allowRefresh = true,
  retryCsrf = true,
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) headers.set('Content-Type', 'application/json');
  const method = (options.method ?? 'GET').toUpperCase();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) headers.set('X-XSRF-TOKEN', await getCsrfToken());

  const response = await fetch(`${API_URL}${API_PREFIX}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 403 && path === '/auth/login' && retryCsrf) {
    return apiRequest<T>(path, options, allowRefresh, false);
  }

  if (response.status === 401 && allowRefresh
      && !AUTH_PATHS_WITHOUT_REFRESH.some((authPath) => path.startsWith(authPath))) {
    try {
      await refreshSessionCookie();
      return apiRequest<T>(path, options, false);
    } catch (refreshError) {
      if (!(refreshError instanceof ApiRequestError) || refreshError.status !== 401) throw refreshError;
      sessionExpiredHandler?.();
    }
  }
  if (!response.ok) {
    let message = `La solicitud falló (${response.status}).`;
    try {
      const body = await response.json() as { error?: string; message?: string };
      message = body.error ?? body.message ?? message;
    } catch {
      // Some HTTP errors, such as a proxy failure, do not include a JSON body.
    }
    throw new ApiRequestError(message, response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

async function loadCategories(): Promise<ApiCategory[]> {
  return apiRequest<ApiCategory[]>('/categorias');
}

async function loadUsers(): Promise<User[]> {
  return (await apiRequest<ApiUser[]>('/usuarios')).map(mapUser);
}

async function loadOrders(): Promise<Order[]> {
  return (await apiRequest<ApiOrder[]>('/compras')).map(mapOrder);
}

function userRequest(account: User) {
  return {
    nombre: account.nombre,
    apellido: account.apellido,
    fechaNacimiento: account.fechaNacimiento,
    correo: account.correo,
    password: account.password,
    direccion: account.direccion,
    region: account.region,
    genero: account.genero,
    role: account.role,
  };
}

export const api = {
  async bootstrap() {
    const [products, categories] = await Promise.all([
      apiRequest<ApiProduct[]>('/productos'),
      loadCategories(),
    ]);
    return { products: products.map(mapProduct), categories: categories.map((category) => category.nombre) };
  },

  async login(email: string, password: string): Promise<AuthSession> {
    const user = await apiRequest<ApiUser>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ correo: email, password }),
    });
    return { user: mapUser(user) };
  },

  async register(details: Omit<User, 'id' | 'role' | 'compras' | 'intentosFallidos' | 'bloqueado'>): Promise<User> {
    const response = await apiRequest<ApiUser>('/auth/registro', {
      method: 'POST',
      body: JSON.stringify({ ...details, role: 'cliente' }),
    });
    return mapUser(response);
  },

  async refreshSession(): Promise<AuthSession | null> {
    try {
      return { user: mapUser(await apiRequest<ApiUser>('/auth/me')) };
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) return null;
      throw error;
    }
  },

  async logout(): Promise<void> {
    await apiRequest<void>('/auth/logout', { method: 'POST' });
  },

  getUsers: loadUsers,

  async saveUser(account: User, actorRole: Role): Promise<User[]> {
    await (account.id
      ? apiRequest<ApiUser>(`/usuarios/${encodeURIComponent(account.id)}`, {
        method: 'PUT',
        body: JSON.stringify(userRequest(account)),
      })
      : apiRequest<ApiUser>('/usuarios', {
        method: 'POST',
        body: JSON.stringify(userRequest(account)),
      }));
    return actorRole === 'administrador' ? loadUsers() : [];
  },

  async deleteUser(id: string): Promise<User[]> {
    await apiRequest<void>(`/usuarios/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return loadUsers();
  },

  async activateUser(id: string): Promise<User[]> {
    await apiRequest<ApiUser>(`/usuarios/${encodeURIComponent(id)}/activar`, { method: 'POST' });
    return loadUsers();
  },

  async saveProfile(account: User): Promise<User> {
    return mapUser(await apiRequest<ApiUser>('/auth/perfil', {
      method: 'PUT',
      body: JSON.stringify(userRequest(account)),
    }));
  },

  async saveProduct(product: Product, actorRole: Role): Promise<Product[]> {
    if (actorRole === 'vendedor') {
      await apiRequest<ApiProduct>(`/productos/${encodeURIComponent(product.id)}/stock`, {
        method: 'PATCH',
        body: JSON.stringify({ stock: product.stock }),
      });
    } else {
      await apiRequest<ApiProduct>(product.id
        ? `/productos/${encodeURIComponent(product.id)}`
        : '/productos', {
        method: product.id ? 'PUT' : 'POST',
        body: JSON.stringify(product),
      });
    }
    return (await apiRequest<ApiProduct[]>('/productos')).map(mapProduct);
  },

  async deleteProduct(id: string): Promise<Product[]> {
    await apiRequest<void>(`/productos/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return (await apiRequest<ApiProduct[]>('/productos')).map(mapProduct);
  },

  async saveCategories(categories: string[]): Promise<string[]> {
    const current = await loadCategories();
    const desiredNames = new Set(categories.map((name) => name.toLowerCase()));
    const currentNames = new Set(current.map((category) => category.nombre.toLowerCase()));
    const renamedFrom = current.filter((category) => !desiredNames.has(category.nombre.toLowerCase()));
    const renamedTo = categories.filter((name) => !currentNames.has(name.toLowerCase()));

    if (renamedFrom.length && renamedFrom.length === renamedTo.length) {
      await Promise.all(renamedFrom.map((category, index) =>
        apiRequest<ApiCategory>(`/categorias/${encodeURIComponent(category.id)}`, {
          method: 'PUT',
          body: JSON.stringify({ nombre: renamedTo[index] }),
        })));
    } else {
      for (const name of renamedTo) {
        await apiRequest<ApiCategory>('/categorias', {
          method: 'POST',
          body: JSON.stringify({ nombre: name }),
        });
      }
      for (const category of renamedFrom) {
        await apiRequest<void>(`/categorias/${encodeURIComponent(category.id)}`, { method: 'DELETE' });
      }
    }
    return (await loadCategories()).map((category) => category.nombre);
  },

  async checkout(cart: CartItem[], details: CheckoutDetails): Promise<CheckoutResult> {
    const order = await apiRequest<ApiOrder>('/compras', {
      method: 'POST',
      body: JSON.stringify({
        items: cart.map((item) => ({ productoId: item.id, cantidad: item.cantidad })),
        ...details,
      }),
    });
    return {
      estado: 'exitoso',
      mensaje: `Tu pedido ${order.idOrden} fue confirmado.`,
      order: mapOrder(order),
      fecha: order.fecha,
    };
  },

  async getOrders(): Promise<Order[]> {
    return (await apiRequest<ApiOrder[]>('/compras/mias')).map(mapOrder);
  },

  getAllOrders: loadOrders,

  async updateOrderStatus(id: string, estado: Order['estado']): Promise<Order[]> {
    const estadoApi = estado === 'procesando' ? 'preparando' : estado;
    await apiRequest<ApiOrder>(
      `/compras/${encodeURIComponent(id)}/estado?estado=${encodeURIComponent(estadoApi)}`,
      { method: 'PATCH' },
    );
    return loadOrders();
  },

  async getReport(period: 'week' | 'month' | 'year' = 'month'): Promise<AdminReport> {
    const periodoApi = period === 'week' ? 'semana' : period === 'year' ? 'ano' : 'mes';
    const report = await apiRequest<ApiReport>(`/reportes?periodo=${periodoApi}`);
    return {
      totalOperaciones: report.totalOperaciones,
      montoTotal: report.montoTotal,
      productosVendidos: report.unidadesVendidas,
      masSolicitados: report.productosMasSolicitados.map(({ nombre, cantidad }) => ({ nombre, cantidad })),
      porPeriodo: [{ periodo: report.periodo, operaciones: report.totalOperaciones, monto: report.montoTotal }],
    };
  },
};
