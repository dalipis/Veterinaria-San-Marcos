import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from './store-context';
import { api, getStoredSession, saveSession } from '../services/api';
import { initialProducts } from '../data/products';
import { defaultCategories } from '../constants';
import type { AdminReport, CartItem, CheckoutDetails, CheckoutResult, Notice, Order, Product, User } from '../types';

function reconcileCart(items: CartItem[], products: Product[]): CartItem[] {
  return items.flatMap((item) => {
    const product = products.find((entry) => entry.id === item.id);
    return !product || product.stock <= 0 ? [] : [{ ...item, cantidad: Math.min(item.cantidad, product.stock) }];
  });
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProductsState] = useState<Product[]>(initialProducts);
  const [users, setUsersState] = useState<User[]>([]);
  const [categories, setCategoriesState] = useState<string[]>(defaultCategories);
  const [cart, setCartState] = useState<CartItem[]>([]);
  const [user, setUserState] = useState<User | null>(getStoredSession()?.user ?? null);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResult | null>(null);
  const [orders, setOrdersState] = useState<Order[]>([]);
  const [report, setReport] = useState<AdminReport | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const noticeTimeout = useRef<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    void (async () => {
      try {
        const initial = await api.bootstrap();
        setProductsState(initial.products);
        setCategoriesState(initial.categories);
        const session = await api.refreshSession();
        if (session) setUserState(session.user);
        if (session?.user) {
          const [savedUsers, savedOrders] = await Promise.all([
            api.getUsers().catch(() => []),
            session.user.role === 'cliente' ? api.getOrders(session.user) : api.getAllOrders(),
          ]);
          setUsersState(savedUsers);
          setOrdersState(savedOrders);
        }
      } catch (error) {
        notify(error instanceof Error ? error.message : 'No fue posible cargar los datos.', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cartCount = useMemo(() => cart.reduce((total, item) => total + item.cantidad, 0), [cart]);

  function notify(text: string, kind: Notice['kind'] = 'info') {
    if (noticeTimeout.current !== null) window.clearTimeout(noticeTimeout.current);
    setNotice({ text, kind });
    noticeTimeout.current = window.setTimeout(() => {
      setNotice(null);
      noticeTimeout.current = null;
    }, 3500);
  }

  useEffect(() => () => {
    if (noticeTimeout.current !== null) window.clearTimeout(noticeTimeout.current);
  }, []);

  function setCart(next: CartItem[]) {
    setCartState(reconcileCart(next, products));
  }

  async function setUser(next: User | null) {
    if (next) saveSession({ ...(getStoredSession() ?? { accessToken: '', refreshToken: '', expiresAt: Date.now() + 30 * 60 * 1000 }), user: next });
    else await api.logout();
    setUserState(next);
  }

  function available(id: string) {
    const product = products.find((item) => item.id === id);
    return Math.max(0, (product?.stock ?? 0) - (cart.find((item) => item.id === id)?.cantidad ?? 0));
  }

  function addToCart(product: Product) {
    if (available(product.id) <= 0) return notify('No hay unidades disponibles.', 'error');
    const item = cart.find((entry) => entry.id === product.id);
    setCart(item
      ? cart.map((entry) => entry.id === product.id ? { ...entry, cantidad: entry.cantidad + 1 } : entry)
      : [...cart, { id: product.id, cantidad: 1 }]);
    notify(`${product.nombre} agregado al carrito.`, 'success');
  }

  function changeQuantity(id: string, delta: number) {
    const product = products.find((item) => item.id === id);
    const item = cart.find((entry) => entry.id === id);
    if (!product || !item) return;
    const nextQuantity = item.cantidad + delta;
    if (nextQuantity > product.stock) return notify('La cantidad supera el stock disponible.', 'error');
    setCart(nextQuantity < 1 ? cart.filter((entry) => entry.id !== id) : cart.map((entry) => entry.id === id ? { ...entry, cantidad: nextQuantity } : entry));
  }

  async function completeCheckout(details: CheckoutDetails) {
    if (!user) {
      const result: CheckoutResult = { estado: 'fallido', mensaje: 'No hay una sesión activa.', order: null, fecha: new Date().toLocaleString('es-CL') };
      setCheckoutResult(result);
      navigate('/compra-resultado.html');
      return;
    }
    try {
      const result = await api.checkout(user, cart, details);
      setCheckoutResult(result);
      if (result.estado === 'exitoso') {
        const initial = await api.bootstrap();
        setProductsState(initial.products);
        setCategoriesState(initial.categories);
        setCart([]);
        setOrdersState(await api.getOrders(user));
      }
      navigate('/compra-resultado.html');
    } catch (error) {
      const result: CheckoutResult = {
        estado: 'fallido',
        mensaje: error instanceof Error ? error.message : 'No fue posible registrar la compra.',
        order: null,
        fecha: new Date().toLocaleString('es-CL'),
      };
      setCheckoutResult(result);
      navigate('/compra-resultado.html');
    }
  }

  async function login(email: string, password: string): Promise<{ user?: User; message: string }> {
    try {
      const session = await api.login(email.trim().toLowerCase(), password);
      setUserState(session.user);
      setUsersState(await api.getUsers().catch(() => []));
      setOrdersState(session.user.role === 'cliente' ? await api.getOrders(session.user).catch(() => []) : await api.getAllOrders().catch(() => []));
      return { user: session.user, message: 'Sesión iniciada.' };
    } catch (error) {
      return { message: error instanceof Error ? error.message : 'No fue posible iniciar sesión.' };
    }
  }

  async function register(details: Omit<User, 'id' | 'role' | 'compras' | 'intentosFallidos' | 'bloqueado'>): Promise<string | null> {
    try {
      await api.register(details);
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'No fue posible crear la cuenta.';
    }
  }

  async function saveManagedUser(account: User) {
    try {
      setUsersState(await api.saveUser(account));
      notify('Usuario guardado correctamente.', 'success');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No fue posible guardar el usuario.', 'error');
    }
  }

  async function deleteManagedUser(id: string) {
    try {
      setUsersState(await api.deleteUser(id));
      notify('Usuario eliminado.', 'success');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No fue posible eliminar el usuario.', 'error');
    }
  }

  async function saveProfile(account: User): Promise<string | null> {
    try {
      const saved = await api.saveProfile(account);
      setUserState(saved);
      setUsersState((current) => current.map((item) => item.id === saved.id ? saved : item));
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'No fue posible actualizar el perfil.';
    }
  }

  async function saveManagedProduct(product: Product) {
    try {
      setProductsState(await api.saveProduct(product));
      notify('Producto guardado correctamente.', 'success');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No fue posible guardar el producto.', 'error');
    }
  }

  async function deleteManagedProduct(id: string) {
    try {
      setProductsState(await api.deleteProduct(id));
      setCart(cart.filter((item) => item.id !== id));
      notify('Producto eliminado.', 'success');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No fue posible eliminar el producto.', 'error');
    }
  }

  async function saveManagedCategories(next: string[]) {
    try {
      setCategoriesState(await api.saveCategories(next));
      const initial = await api.bootstrap();
      setProductsState(initial.products);
      notify('Categorías actualizadas.', 'success');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No fue posible actualizar las categorías.', 'error');
    }
  }

  async function updateOrderStatus(id: string, estado: Order['estado']) {
    try {
      setOrdersState(await api.updateOrderStatus(id, estado));
      notify('Estado del pedido actualizado.', 'success');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No fue posible actualizar el pedido.', 'error');
    }
  }

  async function loadReport(period: 'week' | 'month' | 'year' = 'month') {
    try {
      setReport(await api.getReport(period));
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No fue posible cargar el reporte.', 'error');
    }
  }

  return <StoreContext.Provider value={{
    products, users, categories, cart, user, checkoutResult, notice, orders, report, loading,
    cartCount, available, setProducts: (next) => { void saveManagedProducts(next); }, setUsers: (next) => setUsersState(next),
    setCategories: setCategoriesState, setCart, setUser, notify, addToCart, changeQuantity, completeCheckout,
    login, register, saveManagedUser, deleteManagedUser, saveProfile, saveManagedProduct,
    deleteManagedProduct, saveManagedCategories, updateOrderStatus, loadReport,
  }}>{children}</StoreContext.Provider>;

  async function saveManagedProducts(next: Product[]) {
    for (const product of next) await api.saveProduct(product);
    setProductsState(await api.bootstrap().then((initial) => initial.products));
  }
}
