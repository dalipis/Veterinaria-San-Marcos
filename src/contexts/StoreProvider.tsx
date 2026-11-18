import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from './store-context';
import { createCategory, createId, createProduct, createUser, deleteCategory, deleteProduct, deleteUser, getCart, getCategories, getCheckoutResult, getProducts, getSession, getUsers, saveCart, saveCategories, saveCheckoutResult, saveProducts, saveSession, saveUsers, updateCategory, updateProduct, updateUser } from '../services/storage';
import type { CartItem, CheckoutDetails, CheckoutResult, Notice, Order, Product, User } from '../types';

function reconcileCart(items: CartItem[], products: Product[]): CartItem[] {
  return items.flatMap((item) => {
    const product = products.find((entry) => entry.id === item.id);
    if (!product || product.stock <= 0) return [];
    return [{ ...item, cantidad: Math.min(item.cantidad, product.stock) }];
  });
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProductsState] = useState(getProducts);
  const [users, setUsersState] = useState(getUsers);
  const [categories, setCategoriesState] = useState(getCategories);
  const [cart, setCartState] = useState(getCart);
  const [user, setUserState] = useState<User | null>(getSession);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResult | null>(getCheckoutResult);
  const [notice, setNotice] = useState<Notice | null>(null);
  const noticeTimeout = useRef<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const refreshFromStorage = (event: StorageEvent) => {
      let activeProducts = products;
      if (event.key === null || event.key === 'vsm_productos') {
        activeProducts = getProducts();
        setProductsState(activeProducts);
      }
      if (event.key === null || event.key === 'vsm_usuarios') setUsersState(getUsers());
      if (event.key === null || event.key === 'vsm_categorias') setCategoriesState(getCategories());
      if (event.key === null || event.key === 'vsm_carrito' || event.key === 'vsm_productos') {
        const nextCart = reconcileCart(getCart(), activeProducts);
        setCartState(nextCart);
        if (JSON.stringify(nextCart) !== JSON.stringify(getCart())) saveCart(nextCart);
      }
      if (event.key === null || event.key === 'vsm_usuario_logueado' || event.key === 'vsm_usuarios') setUserState(getSession());
    };
    window.addEventListener('storage', refreshFromStorage);
    return () => window.removeEventListener('storage', refreshFromStorage);
  }, [products]);

  function setProducts(next: Product[]) {
    setProductsState(next);
    saveProducts(next);
    const nextCart = reconcileCart(cart, next);
    if (JSON.stringify(nextCart) !== JSON.stringify(cart)) setCart(nextCart);
  }

  function setUsers(next: User[]) {
    setUsersState(next);
    saveUsers(next);
  }

  function setCategories(next: string[]) {
    setCategoriesState(next);
  }

  function setCart(next: CartItem[]) {
    setCartState(next);
    saveCart(next);
  }

  function setUser(next: User | null) {
    setUserState(next);
    saveSession(next);
  }

  const cartCount = useMemo(() => cart.reduce((total, item) => total + item.cantidad, 0), [cart]);

  function available(id: string) {
    const product = products.find((item) => item.id === id);
    return Math.max(0, (product?.stock ?? 0) - (cart.find((item) => item.id === id)?.cantidad ?? 0));
  }

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

  function addToCart(product: Product) {
    if (available(product.id) <= 0) return notify('No hay unidades disponibles.', 'error');
    const item = cart.find((entry) => entry.id === product.id);
    setCart(item ? cart.map((entry) => entry.id === product.id ? { ...entry, cantidad: entry.cantidad + 1 } : entry) : [...cart, { id: product.id, cantidad: 1 }]);
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

  function completeCheckout(details: CheckoutDetails) {
    const finish = (result: CheckoutResult) => {
      saveCheckoutResult(result);
      setCheckoutResult(result);
      navigate('/compra-resultado.html');
    };
    if (!user || !cart.length) {
      finish({ estado: 'fallido', mensaje: 'No hay una sesión activa o el carrito está vacío.', order: null, fecha: new Date().toLocaleString('es-CL') });
      return;
    }
    const stockOk = cart.every((item) => products.some((product) => product.id === item.id && product.stock >= item.cantidad));
    if (!stockOk) {
      finish({ estado: 'fallido', mensaje: 'El stock cambió y no alcanza para completar la compra. Tu carrito se conservó.', order: null, fecha: new Date().toLocaleString('es-CL') });
      return;
    }
    if (details.metodoPago === 'tarjeta' && details.numeroTarjeta.endsWith('0002')) {
      finish({ estado: 'fallido', mensaje: 'El emisor rechazó el pago simulado. Tu carrito se conservó para que puedas intentarlo de nuevo.', order: null, fecha: new Date().toLocaleString('es-CL') });
      return;
    }
    const orderItems: Order['items'] = [];
    const nextProducts = products.map((product) => {
      const item = cart.find((entry) => entry.id === product.id);
      if (!item) return product;
      const price = product.precioOferta && product.precioOferta < product.precio ? product.precioOferta : product.precio;
      orderItems.push({ id: product.id, nombre: product.nombre, cantidad: item.cantidad, precioUnitario: price, subtotal: price * item.cantidad });
      return { ...product, stock: product.stock - item.cantidad };
    });
    const order: Order = {
      idOrden: `ORD-${Date.now()}`,
      fecha: new Date().toLocaleString('es-CL'),
      direccionEntrega: details.tipoEntrega === 'retiro' ? 'Retiro en clínica' : details.direccionEntrega,
      regionEntrega: details.tipoEntrega === 'retiro' ? "Libertador General Bernardo O'Higgins" : details.regionEntrega,
      tipoEntrega: details.tipoEntrega,
      metodoPago: details.metodoPago,
      estado: 'confirmado',
      items: orderItems,
      total: orderItems.reduce((sum, item) => sum + item.subtotal, 0),
    };
    const nextUsers = users.map((account) => account.id === user.id ? { ...account, compras: [...account.compras, order] } : account);
    setProducts(nextProducts);
    setUsers(nextUsers);
    setUser(nextUsers.find((account) => account.id === user.id) ?? user);
    setCart([]);
    finish({ estado: 'exitoso', mensaje: `Tu pedido ${order.idOrden} fue confirmado.`, order, fecha: order.fecha });
  }

  function login(email: string, password: string): { user?: User; message: string } {
    if (!email.endsWith('@duoc.cl')) return { message: 'Usa un correo institucional válido con dominio @duoc.cl.' };
    const account = users.find((item) => item.correo.toLowerCase() === email);
    if (!account) return { message: 'No existe una cuenta registrada con este correo.' };
    if (account.bloqueado) return { message: 'La cuenta está bloqueada por superar 3 intentos fallidos.' };
    if (account.password !== password) {
      const attempts = account.intentosFallidos + 1;
      setUsers(users.map((item) => item.id === account.id ? { ...item, intentosFallidos: attempts, bloqueado: attempts >= 3 } : item));
      return { message: attempts >= 3 ? 'Cuenta bloqueada: se alcanzaron 3 intentos fallidos.' : `Credenciales incorrectas. Te quedan ${3 - attempts} intentos.` };
    }
    const signedIn = { ...account, intentosFallidos: 0, bloqueado: false };
    setUsers(users.map((item) => item.id === account.id ? signedIn : item));
    setUser(signedIn);
    return { user: signedIn, message: 'Sesión iniciada.' };
  }

  function register(details: Omit<User, 'id' | 'role' | 'compras' | 'intentosFallidos' | 'bloqueado'>): string | null {
    if (users.some((item) => item.correo.toLowerCase() === details.correo.toLowerCase())) return 'Ya existe una cuenta registrada con ese correo.';
    const account: User = { ...details, id: createId('usr'), role: 'cliente', compras: [], intentosFallidos: 0, bloqueado: false };
    setUsers(createUser(users, account));
    return null;
  }

  function saveManagedUser(account: User) {
    if (account.id) {
      const next = updateUser(users, account);
      setUsers(next);
      if (user?.id === account.id) setUser(account);
    } else setUsers(createUser(users, account));
  }

  function saveProfile(account: User): string | null {
    if (users.some((item) => item.id !== account.id && item.correo.toLowerCase() === account.correo.toLowerCase())) return 'Ya existe una cuenta registrada con ese correo.';
    if (!account.correo.endsWith('@duoc.cl')) return 'Usa un correo institucional válido con dominio @duoc.cl.';
    saveManagedUser(account);
    return null;
  }

  function saveManagedProduct(product: Product) {
    const exists = products.some((item) => item.id === product.id);
    setProducts(exists ? updateProduct(products, product) : createProduct(products, product));
  }

  function deleteManagedProduct(id: string) {
    setProducts(deleteProduct(products, id));
    setCart(cart.filter((item) => item.id !== id));
  }

  function deleteManagedUser(id: string) {
    setUsers(deleteUser(users, id));
  }

  function saveManagedCategories(next: string[]) {
    const added = next.find((item) => !categories.includes(item));
    const removed = categories.find((item) => !next.includes(item));
    let saved = next;
    if (added && next.length === categories.length + 1) saved = createCategory(categories, added);
    else if (removed && next.length === categories.length - 1) saved = deleteCategory(categories, removed);
    else if (removed && added && next.length === categories.length) saved = updateCategory(categories, removed, added);
    else saveCategories(next);
    setCategories(saved);
  }

  return <StoreContext.Provider value={{ products, users, categories, cart, user, checkoutResult, notice, cartCount, available, setProducts, setUsers, setCategories, setCart, setUser, notify, addToCart, changeQuantity, completeCheckout, login, register, saveManagedUser, deleteManagedUser, saveProfile, saveManagedProduct, deleteManagedProduct, saveManagedCategories }}>{children}</StoreContext.Provider>;
}
