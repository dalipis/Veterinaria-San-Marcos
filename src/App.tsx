import { useEffect, useMemo, useRef, useState } from 'react';
import { Header } from './components/Header';
import { AdminPage } from './pages/AdminPage';
import { CatalogPage, CategoryPage, CheckoutPage, CheckoutResultPage, HomePage, LoginPage, OffersPage, RegisterPage } from './pages/PublicPages';
import { ProfilePage } from './pages/ProfilePage';
import { createCategory, createId, createProduct, createUser, deleteCategory, deleteProduct, deleteUser, getCart, getCategories, getCheckoutResult, getProducts, getSession, getUsers, saveCart, saveCategories, saveCheckoutResult, saveProducts, saveSession, saveUsers, updateCategory, updateProduct, updateUser } from './data/store';
import type { CartItem, CheckoutDetails, CheckoutResult, Notice, Order, Product, User } from './types';

const money = (value: number) => `$${value.toLocaleString('es-CL')}`;

function reconcileCart(items: CartItem[], products: Product[]): CartItem[] {
  return items.flatMap((item) => {
    const product = products.find((entry) => entry.id === item.id);
    if (!product || product.stock <= 0) return [];
    return [{ ...item, cantidad: Math.min(item.cantidad, product.stock) }];
  });
}

export default function App() {
  const [products, setProducts] = useState(getProducts);
  const [users, setUsers] = useState(getUsers);
  const [categories, setCategories] = useState(getCategories);
  const [cart, setCart] = useState(getCart);
  const [user, setUser] = useState<User | null>(getSession);
  const [checkoutResult] = useState<CheckoutResult | null>(getCheckoutResult);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const pathname = window.location.pathname;
  const noticeTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (!window.location.hash) return;
    const targetId = decodeURIComponent(window.location.hash.slice(1));
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => () => {
    if (noticeTimeout.current !== null) window.clearTimeout(noticeTimeout.current);
  }, []);

  const cartCount = useMemo(() => cart.reduce((total, item) => total + item.cantidad, 0), [cart]);
  const available = (id: string) => {
    const product = products.find((item) => item.id === id);
    return Math.max(0, (product?.stock ?? 0) - (cart.find((item) => item.id === id)?.cantidad ?? 0));
  };

  useEffect(() => {
    const refreshFromStorage = (event: StorageEvent) => {
      let activeProducts = products;
      if (event.key === null || event.key === 'vsm_productos') {
        activeProducts = getProducts();
        setProducts(activeProducts);
        const nextCart = reconcileCart(cart, activeProducts);
        if (JSON.stringify(nextCart) !== JSON.stringify(cart)) {
          setCart(nextCart);
          saveCart(nextCart);
        }
      }
      if (event.key === null || event.key === 'vsm_usuarios') setUsers(getUsers());
      if (event.key === null || event.key === 'vsm_categorias') setCategories(getCategories());
      if (event.key === null || event.key === 'vsm_carrito') {
        const storedCart = getCart();
        const nextCart = reconcileCart(storedCart, activeProducts);
        setCart(nextCart);
        if (JSON.stringify(nextCart) !== JSON.stringify(storedCart)) saveCart(nextCart);
      }
      if (event.key === null || event.key === 'vsm_usuario_logueado' || event.key === 'vsm_usuarios') setUser(getSession());
    };
    window.addEventListener('storage', refreshFromStorage);
    return () => window.removeEventListener('storage', refreshFromStorage);
  }, [cart, products]);

  function updateProducts(next: Product[]) {
    setProducts(next);
    saveProducts(next);
    const nextCart = reconcileCart(cart, next);
    if (JSON.stringify(nextCart) !== JSON.stringify(cart)) updateCart(nextCart);
  }
  function updateUsers(next: User[]) { setUsers(next); saveUsers(next); }
  function updateCart(next: CartItem[]) { setCart(next); saveCart(next); }
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

  function finishCheckout(result: CheckoutResult) {
    saveCheckoutResult(result);
    window.location.href = 'compra-resultado.html';
  }

  function completeCheckout(details: CheckoutDetails) {
    if (!user || !cart.length) {
      finishCheckout({ estado: 'fallido', mensaje: 'No hay una sesión activa o el carrito está vacío.', order: null, fecha: new Date().toLocaleString('es-CL') });
      return;
    }
    const stockOk = cart.every((item) => products.some((product) => product.id === item.id && product.stock >= item.cantidad));
    if (!stockOk) {
      finishCheckout({ estado: 'fallido', mensaje: 'El stock cambió y no alcanza para completar la compra. Tu carrito se conservó.', order: null, fecha: new Date().toLocaleString('es-CL') });
      return;
    }
    if (details.metodoPago === 'tarjeta' && details.numeroTarjeta.endsWith('0002')) {
      finishCheckout({ estado: 'fallido', mensaje: 'El emisor rechazó el pago simulado. Tu carrito se conservó para que puedas intentarlo de nuevo.', order: null, fecha: new Date().toLocaleString('es-CL') });
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
    const updatedUsers = users.map((account) => account.id === user.id ? { ...account, compras: [...account.compras, order] } : account);
    updateProducts(nextProducts);
    updateUsers(updatedUsers);
    setUser(updatedUsers.find((account) => account.id === user.id) ?? user);
    updateCart([]);
    saveCheckoutResult({ estado: 'exitoso', mensaje: `Tu pedido ${order.idOrden} fue confirmado.`, order, fecha: order.fecha });
    window.location.href = 'compra-resultado.html';
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
    updateUsers(createUser(users, account));
    return null;
  }

  function saveManagedUser(account: User) {
    if (account.id) {
      const next = updateUser(users, account);
      updateUsers(next);
      if (user?.id === account.id) { setUser(account); saveSession(account); }
    }
    else updateUsers(createUser(users, account));
  }

  function saveProfile(account: User): string | null {
    if (users.some((item) => item.id !== account.id && item.correo.toLowerCase() === account.correo.toLowerCase())) {
      return 'Ya existe una cuenta registrada con ese correo.';
    }
    if (!account.correo.endsWith('@duoc.cl')) return 'Usa un correo institucional válido con dominio @duoc.cl.';
    saveManagedUser(account);
    return null;
  }

  function saveManagedProduct(product: Product) {
    const exists = products.some((item) => item.id === product.id);
    updateProducts(exists ? updateProduct(products, product) : createProduct(products, product));
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

  const isAdmin = pathname.endsWith('/admin.html') || pathname === '/admin.html';
  const isCatalog = pathname.endsWith('/catalogo.html');
  const isCategories = pathname.endsWith('/categorias.html');
  const isOffers = pathname.endsWith('/ofertas.html');
  const isCheckout = pathname.endsWith('/checkout.html');
  const isPurchaseResult = pathname.endsWith('/compra-resultado.html');
  const isLogin = pathname.endsWith('/login.html');
  const isRegister = pathname.endsWith('/registro.html');
  const isProfile = pathname.endsWith('/profile.html');
  document.title = isAdmin ? 'Panel de gestión — Veterinaria San Marcos' : isCatalog ? 'Catálogo — Veterinaria San Marcos' : isCategories ? 'Categorías — Veterinaria San Marcos' : isOffers ? 'Ofertas — Veterinaria San Marcos' : isCheckout ? 'Checkout — Veterinaria San Marcos' : isPurchaseResult ? 'Resultado de compra — Veterinaria San Marcos' : isLogin ? 'Iniciar sesión — Veterinaria San Marcos' : isRegister ? 'Registro — Veterinaria San Marcos' : isProfile ? 'Mi perfil — Veterinaria San Marcos' : 'Veterinaria San Marcos';

  return <>
    <Header user={user} cartCount={cartCount} onCartOpen={() => setCartOpen(true)} onOrdersOpen={() => setOrdersOpen(true)} onLogout={() => { saveSession(null); setUser(null); window.location.href = 'index.html'; }} />
    {isAdmin ? user && user.role !== 'cliente' ? <AdminPage user={user} users={users} products={products} categories={categories}
      onSaveProduct={saveManagedProduct} onSaveProducts={updateProducts} onDeleteProduct={(id) => { updateProducts(deleteProduct(products, id)); updateCart(cart.filter((item) => item.id !== id)); }}
      onSaveUser={saveManagedUser} onDeleteUser={(id) => updateUsers(deleteUser(users, id))}
      onSaveCategories={saveManagedCategories} notify={notify} />
      : <main className="section"><div className="container access-denied"><h1>Acceso restringido</h1><p>El panel está disponible solo para cuentas de administración y ventas.</p><a className="button" href="login.html">Iniciar sesión con una cuenta autorizada</a></div></main>
      : isCatalog ? <CatalogPage products={products} categories={categories} available={available} onAdd={addToCart} />
        : isCategories ? <CategoryPage products={products} categories={categories} />
          : isOffers ? <OffersPage products={products} categories={categories} available={available} onAdd={addToCart} />
            : isCheckout ? user ? <CheckoutPage user={user} products={products} cart={cart} onSubmit={completeCheckout} /> : <main className="section"><div className="container access-denied"><h1>Inicia sesión para finalizar tu compra</h1><p>Tu carrito se conservará mientras accedes.</p><a className="button btn btn-primary" href="login.html?next=checkout.html">Iniciar sesión</a></div></main>
              : isPurchaseResult ? <CheckoutResultPage result={checkoutResult} />
        : isLogin ? <LoginPage onLogin={login} />
          : isRegister ? <RegisterPage onRegister={register} />
            : isProfile ? user ? <ProfilePage user={user} onSave={saveProfile} /> : <main className="section"><div className="container access-denied"><h1>Inicia sesión para ver tu perfil</h1><a className="button" href="login.html">Iniciar sesión</a></div></main>
              : <HomePage products={products} />}
    <CartDrawer open={cartOpen} products={products} cart={cart} onClose={() => setCartOpen(false)} onChange={changeQuantity} onRemove={(id) => updateCart(cart.filter((item) => item.id !== id))} onCheckout={() => { window.location.href = user ? 'checkout.html' : 'login.html?next=checkout.html'; }} />
    {ordersOpen && user && <div className="modal-overlay" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setOrdersOpen(false); }}><section className="vsm-dialog orders-modal" role="dialog" aria-modal="true" aria-labelledby="orders-title"><button className="modal-close" type="button" aria-label="Cerrar historial" onClick={() => setOrdersOpen(false)}>×</button><p className="service-category">Historial de pedidos</p><h2 id="orders-title">Mis compras</h2>{user.compras.length === 0 ? <p>Aún no has realizado ninguna compra con tu cuenta.</p> : <div className="orders-list">{[...user.compras].reverse().map((order) => <article className="order-card" key={order.idOrden}><div className="order-header"><strong>{order.idOrden}</strong><span>{order.fecha}</span></div><ul className="order-items-list">{order.items.map((item) => <li className="order-item-row" key={item.id}><span>{item.cantidad} × {item.nombre}</span><span>{money(item.subtotal)}</span></li>)}</ul><div className="order-total-row"><span>Total pagado</span><strong>{money(order.total)}</strong></div></article>)}</div>}</section></div>}
    {notice && <div className={`toast toast--${notice.kind}`} role="status">{notice.text}</div>}
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
  const priceOf = (product: Product) => product.precioOferta && product.precioOferta < product.precio ? product.precioOferta : product.precio;
  const total = lines.reduce((sum, line) => sum + priceOf(line.product) * line.item.cantidad, 0);
  return <>
    {open && <div className="cart-overlay" onClick={onClose} />}
    <aside className={`cart-panel ${open ? 'cart-panel--open' : ''}`} aria-label="Carrito de compras" aria-hidden={!open}>
      <div className="cart-panel-header"><h2>Tu carrito</h2><button className="modal-close" type="button" aria-label="Cerrar carrito" onClick={onClose}>×</button></div>
      {!lines.length ? <p className="cart-empty">Tu carrito está vacío.</p> : <><ul className="cart-items">{lines.map(({ item, product }) => <li className="cart-item" key={item.id}><div className="cart-item-top"><strong>{product.nombre}</strong><span>{money(priceOf(product) * item.cantidad)}</span></div><p className="cart-item-price">Precio unitario: {money(priceOf(product))}{priceOf(product) < product.precio && <del className="product-old-price">{money(product.precio)}</del>}</p><div className="cart-item-controls"><button className="qty-btn btn btn-sm btn-outline-secondary" type="button" aria-label="Restar" onClick={() => onChange(item.id, -1)}>−</button><span>{item.cantidad}</span><button className="qty-btn btn btn-sm btn-outline-secondary" type="button" aria-label="Sumar" onClick={() => onChange(item.id, 1)}>+</button><button className="cart-item-remove btn btn-sm btn-outline-danger" type="button" onClick={() => onRemove(item.id)}>Quitar</button></div></li>)}</ul><div className="cart-footer"><div className="cart-total"><span>Total</span><strong>{money(total)}</strong></div><button className="button btn btn-primary" type="button" onClick={onCheckout}>Continuar al checkout</button></div></>}
    </aside>
  </>;
}

