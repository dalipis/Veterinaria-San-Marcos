import { useMemo, useState, type FormEvent } from 'react';
import { ProductCard } from '../components/ProductCard';
import type { CartItem, CheckoutDetails, CheckoutResult, Product, User } from '../types';

const money = (value: number) => `$${value.toLocaleString('es-CL')}`;

interface ShopProps {
  products: Product[];
  categories: string[];
  available: (id: string) => number;
  onAdd: (product: Product) => void;
}

export function HomePage({ products }: Pick<ShopProps, 'products'>) {
  const [message, setMessage] = useState('');
  const featured = products.slice(2, 5);
  return <main>
    <section className="hero" id="inicio"><div className="container hero-content">
      <p className="eyebrow">Desde Rancagua, cuidamos lo que más quieres</p><h1>Salud y bienestar para cada compañero de vida.</h1>
      <p>Desde 2009 acompañamos a familias de la Región de O'Higgins con atención veterinaria cercana y responsable.</p>
      <a className="button" href="catalogo.html">Ver catálogo de productos</a>
      <div className="home-featured"><p className="eyebrow">Productos destacados</p><div className="featured-grid row g-3">{featured.map((product) => <div className="col-12 col-md-6 col-lg-4" key={product.id}><article className="service-card h-100"><div className="service-icon">{product.icono}</div><p className="service-category">{product.categoria}</p><h3>{product.nombre}</h3><p>{product.principioActivo}</p><div className="service-details"><span>{product.especie}</span><strong>${product.precio.toLocaleString('es-CL')}</strong></div></article></div>)}</div></div>
    </div></section>
    <section className="section specialists-section" id="especialistas"><div className="container"><div className="section-heading"><p className="eyebrow">Nuestro equipo</p><h2>Profesionales que cuidan a tu mascota</h2><p>Atención cercana y responsable para cada familia.</p></div><div className="specialists-grid row g-4">
      <div className="col-12 col-md-6 col-lg-4"><article className="specialist-card h-100"><div className="specialist-avatar specialist-avatar--mint">🩺</div><p className="service-category">Equipo médico</p><h3>Médicos veterinarios</h3><p>Tres profesionales para evaluar, diagnosticar y acompañar la salud de tu mascota.</p></article></div>
      <div className="col-12 col-md-6 col-lg-4"><article className="specialist-card h-100"><div className="specialist-avatar specialist-avatar--coral">🛡️</div><p className="service-category">Apoyo clínico</p><h3>Técnico veterinario</h3><p>Apoyo en procedimientos y cuidados atentos para una visita segura.</p></article></div>
      <div className="col-12 col-md-6 col-lg-4"><article className="specialist-card h-100"><div className="specialist-avatar specialist-avatar--yellow">✚</div><p className="service-category">Primera atención</p><h3>Recepción administrativa</h3><p>Coordinación de horas y orientación para que cada visita sea simple.</p></article></div>
    </div></div></section>
    <section className="section about-section" id="nosotros"><div className="container about-copy"><p className="eyebrow">Nuestra historia</p><h2>Una clínica cercana, con experiencia y vocación</h2><p>Veterinaria San Marcos es una clínica de Rancagua fundada en 2009. El equipo cuenta con tres médicos veterinarios, un técnico veterinario y una recepcionista administrativa.</p><p>Atendemos perros, gatos, conejos y aves, con servicios de consulta general, vacunación, cirugía menor, desparasitación y control de peso.</p><div className="clinic-stats clinic-stats--two"><div className="clinic-stat"><strong>Desde 2009</strong><span>Acompañando a las familias</span></div><div className="clinic-stat"><strong>5 personas</strong><span>Experiencia y cariño en cada atención</span></div></div></div></section>
    <section className="section" id="contacto"><div className="container"><div className="section-heading"><p className="eyebrow">Estamos para ayudarte</p><h2>Contáctanos</h2><p>Déjanos tus datos y nuestro equipo en Rancagua te responderá pronto.</p></div><div className="contact-layout row g-4">
      <div className="col-12 col-lg-6">
        <iframe className="map-frame"
          title="Mapa de Rancagua"
          src="https://www.google.com/maps?q=Rancagua,Chile&output=embed"
          width="600"
          height="450"
          loading="lazy"
        />
      </div>
      <div className="col-12 col-lg-6">
        <form className="contact-form"
          onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setMessage('Gracias por escribirnos. Te contactaremos pronto.'); event.currentTarget.reset(); }}>
          <label className="form-group">Nombre
            <input className="form-control" name="nombre" required />
          </label>
          <label className="form-group">Correo electrónico
            <input className="form-control" name="email" type="email" required />
          </label>
          <label className="form-group">Mensaje
            <textarea className="form-control" name="mensaje" required />
          </label>
          <button className="button btn btn-primary" type="submit">
            Enviar consulta
          </button>
          {message && <p role="status">{message}</p>}
        </form>
      </div>
    </div></div></section>
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand-block">
            <a className="footer-brand" href="index.html">
              <img className="brand-logo" src="/images/Logo%20veterinaria.png" alt="" />
              <span>Veterinaria <strong>San Marcos</strong></span>
            </a>
            <p>Cuidado cercano para quienes hacen de tu casa un hogar.</p>
          </div>
          <nav className="footer-column" aria-label="Explora">
            <h3>Explora</h3>
            <a href="index.html">Inicio</a>
            <a href="catalogo.html">Catálogo</a>
            <a href="index.html#especialistas">Especialistas</a>
            <a href="index.html#nosotros">Quiénes somos</a>
          </nav>
          <div className="footer-column">
            <h3>Conversemos</h3>
            <p>Estamos en Rancagua, Región de O'Higgins.</p>
            <a className="footer-action" href="index.html#contacto">Agendar consulta <span aria-hidden="true">→</span></a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>Equipo: Dalí Morales&nbsp; | &nbsp;Joaquín Diez&nbsp; | &nbsp;Marco Palma</p>
          <p>DSY1104 · 2026</p>
        </div>
      </div>
    </footer>
  </main>;
}

export function CatalogPage({ products, categories, available, onAdd }: ShopProps) {
  const requestedCategory = new URLSearchParams(window.location.search).get('categoria');
  const [category, setCategory] = useState(requestedCategory && categories.includes(requestedCategory) ? requestedCategory : 'TODAS');
  const [maxPrice, setMaxPrice] = useState(30000);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);
  const filtered = useMemo(() => products.filter((product) => (category === 'TODAS' || product.categoria === category)
    && (product.precioOferta && product.precioOferta < product.precio ? product.precioOferta : product.precio) <= maxPrice
    && `${product.nombre} ${product.principioActivo}`.toLowerCase().includes(query.toLowerCase())), [products, category, maxPrice, query]);
  return <main className="section catalog-page"><div className="container">
    <div className="catalog-hero"><div className="catalog-hero-copy"><p className="eyebrow">Cuidado animal, elegido con cariño</p><h1>Encuentra lo que tu mascota necesita.</h1><p>Productos seleccionados para acompañar la salud y el bienestar de perros y gatos.</p></div><div className="catalog-hero-mark" aria-hidden="true">🐾</div></div>
    <div className="catalog-toolbar"><label className="catalog-filter">Buscar producto
      <input className="form-control" type="search" placeholder="Nombre o principio activo" value={query} onChange={(event) => setQuery(event.target.value)} />
    </label><label className="catalog-filter">Categoría
      <select className="form-select"
        value={category}
        onChange={(event) => setCategory(event.target.value)}>
        <option value="TODAS">Todas las categorías</option>
        {categories.map((item) => <option key={item}>{item}</option>)}
      </select>
    </label><label className="catalog-filter catalog-filter--price">Precio máximo
      <span>${maxPrice.toLocaleString('es-CL')}</span>
      <input className="form-range" type="range" min="3000" max="30000" step="1000" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} />
    </label></div>
    {filtered.length ? <div className="products-grid row g-4">{filtered.map((product) => <ProductCard key={product.id} product={product} available={available(product.id)} onDetails={setSelected} onAdd={onAdd} />)}</div> : <p className="empty-state">No se encontraron productos con esos filtros.</p>}
    {selected && <ProductDetailsDialog product={selected} available={available(selected.id)} onAdd={onAdd} onClose={() => setSelected(null)} />}
  </div></main>;
}

export function CategoryPage({ products, categories }: Pick<ShopProps, 'products' | 'categories'>) {
  return <main className="section catalog-page"><div className="container">
    <div className="catalog-hero"><div className="catalog-hero-copy"><p className="eyebrow">Explora por necesidad</p><h1>Categorías para cada cuidado.</h1><p>Encuentra rápidamente productos para el bienestar de tu mascota.</p></div><div className="catalog-hero-mark" aria-hidden="true">🐾</div></div>
    <div className="category-grid row g-3">{categories.map((category) => {
      const count = products.filter((product) => product.categoria === category).length;
      return <a className="category-tile col-12 col-sm-6 col-lg-4" href={`catalogo.html?categoria=${encodeURIComponent(category)}`} key={category}>
        <span className="category-tile-icon" aria-hidden="true">{products.find((product) => product.categoria === category)?.icono ?? '🐾'}</span>
        <span><strong>{category}</strong><small>{count} {count === 1 ? 'producto' : 'productos'}</small></span>
        <span className="category-tile-arrow" aria-hidden="true">→</span>
      </a>;
    })}</div>
  </div></main>;
}

export function OffersPage({ products, categories, available, onAdd }: ShopProps) {
  const [selected, setSelected] = useState<Product | null>(null);
  const offers = products.filter((product) => product.precioOferta !== undefined && product.precioOferta > 0 && product.precioOferta < product.precio);
  return <main className="section catalog-page"><div className="container">
    <div className="catalog-hero offers-hero"><div className="catalog-hero-copy"><p className="eyebrow">Precios especiales</p><h1>Ofertas para cuidar más.</h1><p>Productos seleccionados con precio promocional por tiempo limitado.</p></div><div className="catalog-hero-mark" aria-hidden="true">%</div></div>
    {offers.length ? <div className="products-grid row g-4">{offers.map((product) => <ProductCard key={product.id} product={product} available={available(product.id)} onDetails={setSelected} onAdd={onAdd} />)}</div> : <p className="empty-state">No hay ofertas disponibles en este momento.</p>}
    <p className="offers-categories">Explora también: {categories.map((category, index) => <span key={category}><a href={`catalogo.html?categoria=${encodeURIComponent(category)}`}>{category}</a>{index < categories.length - 1 ? ' · ' : ''}</span>)}</p>
    {selected && <ProductDetailsDialog product={selected} available={available(selected.id)} onAdd={onAdd} onClose={() => setSelected(null)} />}
  </div></main>;
}

function ProductDetailsDialog({ product, available, onAdd, onClose }: { product: Product; available: number; onAdd: (product: Product) => void; onClose: () => void }) {
  const price = product.precioOferta && product.precioOferta < product.precio ? product.precioOferta : product.precio;
  return <div className="modal-overlay" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="vsm-dialog" role="dialog" aria-modal="true" aria-labelledby="detail-title"><button className="modal-close" type="button" aria-label="Cerrar detalle" onClick={onClose}>×</button><div className="modal-icon">{product.icono}</div><p className="service-category">{product.categoria}</p><h2 id="detail-title">{product.nombre}</h2><p>{product.principioActivo} · Presentación: {product.presentacion}</p><p>{product.especie} · Stock: {available}</p><strong>{money(price)}</strong>{price < product.precio && <del className="product-old-price">{money(product.precio)}</del>}<p><button className="button btn btn-primary" type="button" disabled={available <= 0} onClick={() => onAdd(product)}>Agregar al carrito</button></p></section></div>;
}

interface CheckoutPageProps {
  user: User;
  products: Product[];
  cart: CartItem[];
  onSubmit: (details: CheckoutDetails) => void;
}

export function CheckoutPage({ user, products, cart, onSubmit }: CheckoutPageProps) {
  const [deliveryType, setDeliveryType] = useState<CheckoutDetails['tipoEntrega']>('despacho');
  const [paymentMethod, setPaymentMethod] = useState<CheckoutDetails['metodoPago']>('tarjeta');
  const lines = cart.map((item) => ({ item, product: products.find((product) => product.id === item.id) }))
    .filter((line): line is { item: CartItem; product: Product } => Boolean(line.product));
  const total = lines.reduce((sum, line) => sum + (line.product.precioOferta && line.product.precioOferta < line.product.precio ? line.product.precioOferta : line.product.precio) * line.item.cantidad, 0);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSubmit({
      direccionEntrega: String(data.get('direccion')).trim(),
      regionEntrega: String(data.get('region')).trim(),
      tipoEntrega: deliveryType,
      metodoPago: paymentMethod,
      numeroTarjeta: String(data.get('numeroTarjeta') ?? '').replace(/\s/g, ''),
    });
  }

  return <main className="section checkout-page"><div className="container">
    <div className="checkout-heading"><p className="eyebrow">Paso final</p><h1>Completa tu compra</h1><p>Hola, {user.nombre}. Revisa los datos y el método de entrega.</p></div>
    {!lines.length ? <div className="empty-state"><h2>Tu carrito está vacío</h2><a className="button btn btn-primary" href="catalogo.html">Ir al catálogo</a></div> : <div className="checkout-layout row g-4">
      <form className="checkout-form col-12 col-lg-7" onSubmit={submit}>
        <section className="checkout-section">
          <h2>Entrega</h2>
          <div className="checkout-options" role="radiogroup" aria-label="Tipo de entrega">
            <label className={`checkout-option ${deliveryType === 'despacho' ? 'checkout-option--active' : ''}`}><input className="form-check-input" type="radio" name="tipoEntrega" value="despacho" checked={deliveryType === 'despacho'} onChange={() => setDeliveryType('despacho')} /><span><strong>Despacho a domicilio</strong><small>Entrega en la dirección indicada</small></span></label>
            <label className={`checkout-option ${deliveryType === 'retiro' ? 'checkout-option--active' : ''}`}><input className="form-check-input" type="radio" name="tipoEntrega" value="retiro" checked={deliveryType === 'retiro'} onChange={() => setDeliveryType('retiro')} /><span><strong>Retiro en clínica</strong><small>Rancagua, Región de O'Higgins</small></span></label>
          </div>
          {deliveryType === 'despacho' && <div className="checkout-address row g-3">
            <label className="form-group col-12">Dirección<input className="form-control" name="direccion" autoComplete="street-address" defaultValue={user.direccion} required /></label>
            <label className="form-group col-12">Región<input className="form-control" name="region" autoComplete="address-level1" defaultValue={user.region} required /></label>
          </div>}
        </section>
        <section className="checkout-section">
          <h2>Pago</h2>
          <label className="form-group">Método de pago<select className="form-select" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as CheckoutDetails['metodoPago'])}><option value="tarjeta">Tarjeta de crédito o débito</option><option value="transferencia">Transferencia bancaria simulada</option></select></label>
          {paymentMethod === 'tarjeta' ? <label className="form-group">Número de tarjeta de prueba<input className="form-control" name="numeroTarjeta" inputMode="numeric" autoComplete="cc-number" minLength={13} maxLength={19} pattern="[0-9 ]{13,19}" placeholder="0000 0000 0000 0000" required /><span className="field-hint">Pago simulado: la tarjeta terminada en 0002 será rechazada. No ingreses datos de una tarjeta real.</span></label> : <p className="payment-note">La transferencia se marcará como aprobada al confirmar; esta tienda académica no procesa pagos reales.</p>}
        </section>
        <button className="button btn btn-primary checkout-submit" type="submit">Confirmar compra · {money(total)}</button>
      </form>
      <aside className="checkout-summary col-12 col-lg-5" aria-label="Resumen de compra">
        <h2>Resumen del pedido</h2>
        <ul className="checkout-lines">{lines.map(({ item, product }) => {
          const price = product.precioOferta && product.precioOferta < product.precio ? product.precioOferta : product.precio;
          return <li key={item.id}><span>{item.cantidad} × {product.nombre}</span><strong>{money(price * item.cantidad)}</strong></li>;
        })}</ul>
        <div className="checkout-total"><span>Total</span><strong>{money(total)}</strong></div>
      </aside>
    </div>}
  </div></main>;
}

export function CheckoutResultPage({ result }: { result: CheckoutResult | null }) {
  const success = result?.estado === 'exitoso';
  return <main className="section checkout-page"><div className="container">
    <section className={`checkout-result ${success ? 'checkout-result--success' : 'checkout-result--failure'}`}>
      <p className="eyebrow">{success ? 'Pedido confirmado' : 'No se pudo completar'}</p>
      <h1>{success ? '¡Gracias por tu compra!' : 'El pago no fue aprobado'}</h1>
      <p>{result?.mensaje ?? 'No encontramos un resultado reciente de compra.'}</p>
      {success && result?.order && <div className="result-summary">
        <div className="order-header"><strong>{result.order.idOrden}</strong><span>{result.order.fecha}</span></div>
        <p>{result.order.tipoEntrega === 'retiro' ? 'Retiro en clínica, Rancagua' : `${result.order.direccionEntrega}, ${result.order.regionEntrega}`}</p>
        <ul className="order-items-list">{result.order.items.map((item) => <li className="order-item-row" key={item.id}><span>{item.cantidad} × {item.nombre}</span><span>{money(item.subtotal)}</span></li>)}</ul>
        <div className="order-total-row"><span>Total pagado</span><strong>{money(result.order.total)}</strong></div>
      </div>}
      <div className="checkout-result-actions"><a className="button btn btn-primary" href={success ? 'catalogo.html' : 'checkout.html'}>{success ? 'Seguir comprando' : 'Volver al checkout'}</a>{success && <a className="button button--outline" href="profile.html">Ver mi perfil y compras</a>}</div>
    </section>
  </div></main>;
}

interface AuthProps {
  onLogin: (email: string, password: string) => { user?: User; message: string };
  onRegister: (details: Omit<User, 'id' | 'role' | 'compras' | 'intentosFallidos' | 'bloqueado'>) => string | null;
}

export function LoginPage({ onLogin }: Pick<AuthProps, 'onLogin'>) {
  const [message, setMessage] = useState('');
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const result = onLogin(String(data.get('correo')).trim().toLowerCase(), String(data.get('password')));
    if (result.user) {
      const nextPage = new URLSearchParams(window.location.search).get('next');
      window.location.href = nextPage === 'checkout.html' ? nextPage : result.user.role === 'cliente' ? 'index.html' : 'admin.html';
    }
    else setMessage(result.message);
  }
  return <main className="section auth-section"><div className="container auth-container"><section className="auth-card"><p className="eyebrow">Acceso a la plataforma</p><h1>Iniciar sesión</h1><form className="auth-form" onSubmit={submit}><label className="form-group">Correo electrónico<input className="form-control" name="correo" type="email" autoComplete="username" required /></label><label className="form-group">Contraseña<input className="form-control" name="password" type="password" autoComplete="current-password" required /></label><button className="button btn btn-primary" type="submit">Ingresar</button>{message && <p className="form-message" role="alert">{message}</p>}</form><p className="demo-access">Cuentas de prueba: admin@duoc.cl / Admin123 · vendedor@duoc.cl / Vendedor123</p><p className="auth-switch">¿Aún no tienes cuenta? <a href="registro.html">Regístrate aquí</a></p></section></div></main>;
}

const regions = ['Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo', 'Valparaíso', 'Metropolitana de Santiago', "Libertador General Bernardo O'Higgins", 'Maule', 'Ñuble', 'Biobío', 'La Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén del General Carlos Ibáñez del Campo', 'Magallanes y de la Antártica Chilena'];

export function RegisterPage({ onRegister }: Pick<AuthProps, 'onRegister'>) {
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get('correo')).trim().toLowerCase();
    const password = String(data.get('password'));
    const confirm = String(data.get('confirmarPassword'));
    const birth = String(data.get('fechaNacimiento'));
    const today = new Date();
    const birthday = new Date(`${birth}T00:00:00`);
    let age = today.getFullYear() - birthday.getFullYear();
    if (today.getMonth() < birthday.getMonth() || (today.getMonth() === birthday.getMonth() && today.getDate() < birthday.getDate())) age -= 1;
    if (!email.endsWith('@duoc.cl')) return setMessage('Usa un correo institucional con dominio @duoc.cl.');
    if (age < 14) return setMessage('Debes tener al menos 14 años para registrarte.');
    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) return setMessage('La contraseña debe tener 8 caracteres, una mayúscula y un número.');
    if (password !== confirm) return setMessage('Las contraseñas no coinciden.');
    const error = onRegister({ nombre: String(data.get('nombre')).trim(), apellido: String(data.get('apellido')).trim(), fechaNacimiento: birth, correo: email, password, direccion: String(data.get('direccion')).trim(), region: String(data.get('region')), genero: String(data.get('genero')) });
    if (error) return setMessage(error);
    setSuccess(true);
    setMessage('Cuenta de cliente creada. Ya puedes iniciar sesión.');
    form.reset();
  }
  return <main className="section auth-section"><div className="container auth-container"><section className="auth-card auth-card--wide"><p className="eyebrow">Crear cuenta de cliente</p><h1>Regístrate</h1><p className="auth-subtitle">El registro público crea exclusivamente cuentas de cliente.</p><form className="auth-form" onSubmit={submit}><div className="form-row row g-3"><label className="form-group col-12 col-md-6">Nombre
        <input className="form-control" name="nombre" required />
      </label><label className="form-group col-12 col-md-6">Apellido
        <input className="form-control" name="apellido" required />
      </label></div><label className="form-group">Fecha de nacimiento
        <input className="form-control" name="fechaNacimiento" type="date" required />
      </label><label className="form-group">Correo institucional
        <input className="form-control" name="correo" type="email" required />
      </label><div className="form-row row g-3"><label className="form-group col-12 col-md-6">Contraseña
        <input className="form-control" name="password" type="password" minLength={8} required />
        <span className="field-hint">Mínimo 8 caracteres, una mayúscula y un número.</span>
      </label><label className="form-group col-12 col-md-6">Confirmar contraseña
        <input className="form-control" name="confirmarPassword" type="password" required />
      </label></div><label className="form-group">Dirección
        <input className="form-control" name="direccion" required />
      </label><div className="form-row row g-3"><label className="form-group col-12 col-md-6">Región
        <select className="form-select"
          name="region"
          defaultValue="" required>
          <option value="" disabled>Selecciona tu región</option>
          {regions.map((region) => <option key={region}>{region}</option>)}
        </select>
      </label><label className="form-group col-12 col-md-6">Género
        <select className="form-select" name="genero" defaultValue="" required>
          <option value="" disabled>Selecciona una opción</option>
          <option>Femenino</option>
          <option>Masculino</option>
          <option>No binario</option>
          <option>Prefiero no decirlo</option>
        </select>
      </label></div><label className="checkbox-label"><input name="acepta" type="checkbox" required />Acepto las condiciones de registro y el tratamiento de mis datos.</label><button className="button btn btn-primary" type="submit">Crear cuenta</button>{message && <p className={`form-message ${success ? 'form-message--success' : ''}`} role={success ? 'status' : 'alert'}>{message}</p>}</form></section></div></main>;
}