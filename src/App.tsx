import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { AdminPage } from './pages/AdminPage';
import { CatalogPage, HomePage, LoginPage, ProfilePage, RegisterPage } from './pages/PublicPages';
import { createId, getCart, getCategories, getProducts, getSession, getUsers, saveCart, saveCategories, saveProducts, saveSession, saveUsers } from './data/store';
import type { CartItem, Notice, Order, Product, ProfileDetails, User } from './types';

const money = (value: number) => `$${value.toLocaleString('es-CL')}`;

export default function App() {
  const [products, setProducts] = useState(getProducts);
  const [users, setUsers] = useState(getUsers);
  const [categories, setCategories] = useState(getCategories);
  const [cart, setCart] = useState(getCart);
  const [user, setUser] = useState<User | null>(getSession);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const location = useLocation();
  const { pathname } = location;
  const navigate = useNavigate();
  const noticeTimeout = useRef<number | null>(null);
  const normalizedPath = pathname.toLowerCase().replace(/\.html$/, '') || '/';

  useEffect(() => {
    if (!location.hash) return;
    const targetId = decodeURIComponent(location.hash.slice(1));
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);

  useEffect(() => () => {
    if (noticeTimeout.current !== null) window.clearTimeout(noticeTimeout.current);
  }, []);

  const cartCount = useMemo(() => cart.reduce((total, item) => total + item.cantidad, 0), [cart]);
  const available = (id: string) => {
    const product = products.find((item) => item.id === id);
    return Math.max(0, (product?.stock ?? 0) - (cart.find((item) => item.id === id)?.cantidad ?? 0));
  };

  function updateProducts(next: Product[]) { saveProducts(next); setProducts(next); }
  function updateUsers(next: User[]) { saveUsers(next); setUsers(next); }
  function updateCart(next: CartItem[]) { saveCart(next); setCart(next); }
  function notify(text: string, kind: Notice['kind'] = 'info') {
    if (noticeTimeout.current !== null) window.clearTimeout(noticeTimeout.current);
    setNotice({ text, kind });
    noticeTimeout.current = window.setTimeout(() => {
      setNotice(null);
      noticeTimeout.current = null;
    }, 3500);
  }

  function addToCart(product: Product) {
    if (available(product.id) <= 0) return notify('No hay unidades disponibles.', 'error');
    const item = cart.find((entry) => entry.id === product.id);
    updateCart(item ? cart.map((entry) => entry.id === product.id ? { ...entry, cantidad: entry.cantidad + 1 } : entry) : [...cart, { id: product.id, cantidad: 1 }]);
    notify(`${product.nombre} agregado al carrito.`, 'success');
  }

  function changeQuantity(id: string, delta: number) {
    const product = products.find((item) => item.id === id);
    const item = cart.find((entry) => entry.id === id);
    if (!product || !item) return;
    const nextQuantity = item.cantidad + delta;
    if (nextQuantity > product.stock) return notify('La cantidad supera el stock disponible.', 'error');
    updateCart(nextQuantity < 1 ? cart.filter((entry) => entry.id !== id) : cart.map((entry) => entry.id === id ? { ...entry, cantidad: nextQuantity } : entry));
  }

  function checkout() {
    if (!user) {
      notify('Inicia sesión para finalizar la compra.', 'error');
      window.setTimeout(() => navigate('/login'), 900);
      return;
    }
    if (!cart.length) return;
    const stockOk = cart.every((item) => products.some((product) => product.id === item.id && product.stock >= item.cantidad));
    if (!stockOk) return notify('El stock cambió y no alcanza para completar la compra.', 'error');
    const orderItems: Order['items'] = [];
    const nextProducts = products.map((product) => {
      const item = cart.find((entry) => entry.id === product.id);
      if (!item) return product;
      orderItems.push({ id: product.id, nombre: product.nombre, cantidad: item.cantidad, precioUnitario: product.precio, subtotal: product.precio * item.cantidad });
      return { ...product, stock: product.stock - item.cantidad };
    });
    const order: Order = { idOrden: `ORD-${Date.now()}`, fecha: new Date().toLocaleString('es-CL'), items: orderItems, total: orderItems.reduce((sum, item) => sum + item.subtotal, 0) };
    const updatedUsers = users.map((account) => account.id === user.id ? { ...account, compras: [...account.compras, order] } : account);
    updateProducts(nextProducts);
    updateUsers(updatedUsers);
    setUser(updatedUsers.find((account) => account.id === user.id) ?? user);
    updateCart([]);
    setCartOpen(false);
    notify(`Compra realizada. Pedido ${order.idOrden}.`, 'success');
  }

  function login(email: string, password: string): { user?: User; message: string } {
    if (!email.endsWith('@duoc.cl')) return { message: 'Usa un correo institucional válido con dominio @duoc.cl.' };
    const account = users.find((item) => item.correo.toLowerCase() === email);
    if (!account) return { message: 'No existe una cuenta registrada con este correo.' };
    if (account.bloqueado) return { message: 'La cuenta está bloqueada por superar 3 intentos fallidos.' };
    if (account.password !== password) {
      const attempts = account.intentosFallidos + 1;
      updateUsers(users.map((item) => item.id === account.id ? { ...item, intentosFallidos: attempts, bloqueado: attempts >= 3 } : item));
      return { message: attempts >= 3 ? 'Cuenta bloqueada: se alcanzaron 3 intentos fallidos.' : `Credenciales incorrectas. Te quedan ${3 - attempts} intentos.` };
    }
    const signedIn = { ...account, intentosFallidos: 0, bloqueado: false };
    updateUsers(users.map((item) => item.id === account.id ? signedIn : item));
    saveSession(signedIn);
    setUser(signedIn);
    return { user: signedIn, message: 'Sesión iniciada.' };
  }

  function register(details: Omit<User, 'id' | 'role' | 'compras' | 'intentosFallidos' | 'bloqueado'>): string | null {
    if (users.some((item) => item.correo.toLowerCase() === details.correo.toLowerCase())) return 'Ya existe una cuenta registrada con ese correo.';
    const account: User = { ...details, id: createId('usr'), role: 'cliente', compras: [], intentosFallidos: 0, bloqueado: false };
    updateUsers([...users, account]);
    return null;
  }

  function saveManagedUser(account: User) {
    if (account.id) {
      const next = users.map((item) => item.id === account.id ? account : item);
      updateUsers(next);
      if (user?.id === account.id) { setUser(account); saveSession(account); }
    }
    else updateUsers([...users, { ...account, id: createId('usr') }]);
  }

  function updateProfile(details: ProfileDetails): string | null {
    if (!user) return 'Inicia sesión para actualizar tu perfil.';
    const correo = details.correo.trim().toLowerCase();
    if (!correo.endsWith('@duoc.cl')) return 'Usa un correo institucional con dominio @duoc.cl.';
    if (users.some((account) => account.id !== user.id && account.correo.toLowerCase() === correo)) return 'Ya existe una cuenta registrada con ese correo.';
    const updatedUser = { ...user, ...details, correo };
    updateUsers(users.map((account) => account.id === user.id ? updatedUser : account));
    setUser(updatedUser);
    saveSession(updatedUser);
    return null;
  }

  function saveManagedProduct(product: Product) {
    const exists = products.some((item) => item.id === product.id);
    updateProducts(exists ? products.map((item) => item.id === product.id ? product : item) : [...products, { ...product, id: createId('prod') }]);
    const cartItem = cart.find((item) => item.id === product.id);
    if (cartItem && cartItem.cantidad > product.stock) {
      const nextCart = cart.flatMap((item) => item.id !== product.id ? [item] : product.stock > 0 ? [{ ...item, cantidad: product.stock }] : []);
      updateCart(nextCart);
      notify(product.stock > 0 ? `El carrito se ajustó al nuevo stock de ${product.nombre}.` : `${product.nombre} se quitó del carrito porque quedó sin stock.`, 'info');
    }
  }

  const pageTitle = normalizedPath === '/admin' ? 'Panel de gestión — Veterinaria San Marcos' : normalizedPath === '/catalogo' ? 'Catálogo — Veterinaria San Marcos' : normalizedPath === '/login' ? 'Iniciar sesión — Veterinaria San Marcos' : normalizedPath === '/registro' ? 'Registro — Veterinaria San Marcos' : normalizedPath === '/perfil' ? 'Mi perfil — Veterinaria San Marcos' : 'Veterinaria San Marcos';
  useEffect(() => { document.title = pageTitle; }, [pageTitle]);

  const homePage = <HomePage products={products} />;
  const adminPage = user && user.role !== 'cliente' ? <AdminPage user={user} users={users} products={products} categories={categories}
    onSaveProduct={saveManagedProduct} onSaveProducts={updateProducts} onDeleteProduct={(id) => { updateProducts(products.filter((item) => item.id !== id)); updateCart(cart.filter((item) => item.id !== id)); }}
    onSaveUser={saveManagedUser} onDeleteUser={(id) => updateUsers(users.filter((item) => item.id !== id))}
    onSaveCategories={(next) => { saveCategories(next); setCategories(next); }} notify={notify} />
    : <main className="section"><div className="container access-denied"><h1>Acceso restringido</h1><p>El panel está disponible solo para cuentas de administración y ventas.</p><Link className="button" to="/login">Iniciar sesión con una cuenta autorizada</Link></div></main>;
  const profilePage = user ? <ProfilePage user={user} onUpdate={updateProfile} /> : <main className="section"><div className="container access-denied"><h1>Inicia sesión para ver tu perfil</h1><p>El perfil personal está disponible para usuarios con sesión activa.</p><Link className="button" to="/login">Iniciar sesión</Link></div></main>;

  return <>
    <Header user={user} cartCount={cartCount} onCartOpen={() => setCartOpen(true)} onOrdersOpen={() => setOrdersOpen(true)} onLogout={() => { saveSession(null); setUser(null); navigate('/'); }} />
    <Routes>
      <Route path="/" element={homePage} />
      <Route path="/index.html" element={homePage} />
      <Route path="/catalogo" element={<CatalogPage products={products} categories={categories} available={available} onAdd={addToCart} />} />
      <Route path="/catalogo.html" element={<CatalogPage products={products} categories={categories} available={available} onAdd={addToCart} />} />
      <Route path="/admin" element={adminPage} />
      <Route path="/admin.html" element={adminPage} />
      <Route path="/login" element={<LoginPage onLogin={login} />} />
      <Route path="/login.html" element={<LoginPage onLogin={login} />} />
      <Route path="/registro" element={<RegisterPage onRegister={register} />} />
      <Route path="/registro.html" element={<RegisterPage onRegister={register} />} />
      <Route path="/perfil" element={profilePage} />
      <Route path="/perfil.html" element={profilePage} />
      <Route path="*" element={homePage} />
    </Routes>
    <CartDrawer open={cartOpen} products={products} cart={cart} onClose={() => setCartOpen(false)} onChange={changeQuantity} onRemove={(id) => updateCart(cart.filter((item) => item.id !== id))} onCheckout={checkout} />
    {ordersOpen && user && <div className="modal-overlay" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setOrdersOpen(false); }}><section className="site-modal orders-modal" role="dialog" aria-modal="true" aria-labelledby="orders-title"><button className="modal-close" type="button" aria-label="Cerrar historial" onClick={() => setOrdersOpen(false)}>×</button><p className="service-category">Historial de pedidos</p><h2 id="orders-title">Mis compras</h2>{user.compras.length === 0 ? <p>Aún no has realizado ninguna compra con tu cuenta.</p> : <div className="orders-list">{[...user.compras].reverse().map((order) => <article className="order-card" key={order.idOrden}><div className="order-header"><strong>{order.idOrden}</strong><span>{order.fecha}</span></div><ul className="order-items-list">{order.items.map((item) => <li className="order-item-row" key={item.id}><span>{item.cantidad} × {item.nombre}</span><span>{money(item.subtotal)}</span></li>)}</ul><div className="order-total-row"><span>Total pagado</span><strong>{money(order.total)}</strong></div></article>)}</div>}</section></div>}
    {notice && <div className={`app-toast app-toast--${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>{notice.text}</div>}
  </>;
}

interface CartDrawerProps {
  open: boolean;
  products: Product[];
  cart: CartItem[];
  onClose: () => void;
  onChange: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

function CartDrawer({ open, products, cart, onClose, onChange, onRemove, onCheckout }: CartDrawerProps) {
  const lines = cart.map((item) => ({ item, product: products.find((product) => product.id === item.id) })).filter((line): line is { item: CartItem; product: Product } => Boolean(line.product));
  const total = lines.reduce((sum, line) => sum + line.product.precio * line.item.cantidad, 0);
  return <>
    {open && <div className="cart-overlay" onClick={onClose} />}
    <aside className={`cart-panel ${open ? 'cart-panel--open' : ''}`} aria-label="Carrito de compras" aria-hidden={!open}>
      <div className="cart-panel-header"><h2>Tu carrito</h2><button className="modal-close" type="button" aria-label="Cerrar carrito" onClick={onClose}>×</button></div>
      {!lines.length ? <p className="cart-empty">Tu carrito está vacío.</p> : <><ul className="cart-items">{lines.map(({ item, product }) => <li className="cart-item" key={item.id}><div className="cart-item-top"><strong>{product.nombre}</strong><span>{money(product.precio * item.cantidad)}</span></div><p className="cart-item-price">Precio unitario: {money(product.precio)}</p><div className="cart-item-controls"><button className="qty-btn" type="button" aria-label="Restar" onClick={() => onChange(item.id, -1)}>−</button><span>{item.cantidad}</span><button className="qty-btn" type="button" aria-label="Sumar" onClick={() => onChange(item.id, 1)}>+</button><button className="cart-item-remove" type="button" onClick={() => onRemove(item.id)}>Quitar</button></div></li>)}</ul><div className="cart-footer"><div className="cart-total"><span>Total</span><strong>{money(total)}</strong></div><button className="button" type="button" onClick={onCheckout}>Finalizar compra</button></div></>}
    </aside>
  </>;
}

