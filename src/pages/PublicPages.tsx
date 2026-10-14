import { useMemo, useState, type FormEvent } from 'react';
import { ProductCard } from '../components/ProductCard';
import type { Product, ProfileDetails, User } from '../types';

interface ShopProps {
  products: Product[];
  categories: string[];
  available: (id: string) => number;
  onAdd: (product: Product) => void;
}

export function HomePage({ products, available, onAdd }: Omit<ShopProps, 'categories'>) {
  const [message, setMessage] = useState('');
  const featured = products.slice(2, 5);
  return <main>
    <section className="hero" id="inicio"><div className="container hero-content">
      <p className="eyebrow">Desde Rancagua, cuidamos lo que más quieres</p><h1>Salud y bienestar para cada compañero de vida.</h1>
      <p>Desde 2009 acompañamos a familias de la Región de O'Higgins con atención veterinaria cercana y responsable.</p>
      <a className="button" href="catalogo.html">Ver catálogo de productos</a>
      <div className="home-featured"><p className="eyebrow">Productos destacados</p><div className="featured-grid">{featured.map((product) => <article className="service-card" key={product.id}><div className="service-icon">{product.icono}</div><p className="service-category">{product.categoria}</p><h3>{product.nombre}</h3><p>{product.principioActivo}</p><div className="service-details"><span>{product.especie}</span><strong>${product.precio.toLocaleString('es-CL')}</strong></div></article>)}</div></div>
    </div></section>
    <section className="section specialists-section"><div className="container"><div className="section-heading"><p className="eyebrow">Nuestro equipo</p><h2>Profesionales que cuidan a tu mascota</h2><p>Atención cercana y responsable para cada familia.</p></div><div className="specialists-grid">
      <article className="specialist-card"><div className="specialist-avatar specialist-avatar--mint">🩺</div><p className="service-category">Equipo médico</p><h3>Médicos veterinarios</h3><p>Tres profesionales para evaluar, diagnosticar y acompañar la salud de tu mascota.</p></article>
      <article className="specialist-card"><div className="specialist-avatar specialist-avatar--coral">🛡️</div><p className="service-category">Apoyo clínico</p><h3>Técnico veterinario</h3><p>Apoyo en procedimientos y cuidados atentos para una visita segura.</p></article>
      <article className="specialist-card"><div className="specialist-avatar specialist-avatar--yellow">✚</div><p className="service-category">Primera atención</p><h3>Recepción administrativa</h3><p>Coordinación de horas y orientación para que cada visita sea simple.</p></article>
    </div></div></section>
    <section className="section about-section" id="nosotros"><div className="container about-copy"><p className="eyebrow">Nuestra historia</p><h2>Una clínica cercana, con experiencia y vocación</h2><p>Veterinaria San Marcos es una clínica de Rancagua fundada en 2009. El equipo cuenta con tres médicos veterinarios, un técnico veterinario y una recepcionista administrativa.</p><p>Atendemos perros, gatos, conejos y aves, con servicios de consulta general, vacunación, cirugía menor, desparasitación y control de peso.</p><div className="clinic-stats clinic-stats--two"><div className="clinic-stat"><strong>Desde 2009</strong><span>Acompañando a las familias</span></div><div className="clinic-stat"><strong>5 personas</strong><span>Experiencia y cariño en cada atención</span></div></div></div></section>
    <section className="section" id="contacto"><div className="container"><div className="section-heading"><p className="eyebrow">Estamos para ayudarte</p><h2>Contáctanos</h2><p>Déjanos tus datos y nuestro equipo en Rancagua te responderá pronto.</p></div><div className="contact-layout">
      <iframe title="Mapa de Rancagua" src="https://www.google.com/maps?q=Rancagua,Chile&output=embed" width="600" height="450" loading="lazy" />
      <form className="contact-form" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setMessage('Gracias por escribirnos. Te contactaremos pronto.'); event.currentTarget.reset(); }}><label className="form-group">Nombre<input name="nombre" required /></label><label className="form-group">Correo electrónico<input name="email" type="email" required /></label><label className="form-group">Mensaje<textarea name="mensaje" required /></label><button className="button" type="submit">Enviar consulta</button>{message && <p role="status">{message}</p>}</form>
    </div></div></section>
    <footer className="site-footer"><div className="container"><p>Veterinaria San Marcos · Rancagua</p><p>DSY1104 · 2026</p><a href="catalogo.html">Catálogo</a></div></footer>
  </main>;
}

export function CatalogPage({ products, categories, available, onAdd }: ShopProps) {
  const [category, setCategory] = useState('TODAS');
  const [maxPrice, setMaxPrice] = useState(30000);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);
  const filtered = useMemo(() => products.filter((product) => (category === 'TODAS' || product.categoria === category)
    && product.precio <= maxPrice && `${product.nombre} ${product.principioActivo}`.toLowerCase().includes(query.toLowerCase())), [products, category, maxPrice, query]);
  return <main className="section catalog-page"><div className="container">
    <div className="catalog-hero"><div className="catalog-hero-copy"><p className="eyebrow">Cuidado animal, elegido con cariño</p><h1>Encuentra lo que tu mascota necesita.</h1><p>Productos seleccionados para acompañar la salud y el bienestar de perros y gatos.</p></div><div className="catalog-hero-mark" aria-hidden="true">🐾</div></div>
    <div className="catalog-toolbar"><label className="catalog-filter">Buscar producto<input type="search" placeholder="Nombre o principio activo" value={query} onChange={(event) => setQuery(event.target.value)} /></label><label className="catalog-filter">Categoría<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="TODAS">Todas las categorías</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label className="catalog-filter catalog-filter--price">Precio máximo <span>${maxPrice.toLocaleString('es-CL')}</span><input type="range" min="3000" max="30000" step="1000" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} /></label></div>
    {filtered.length ? <div className="products-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} available={available(product.id)} onDetails={setSelected} onAdd={onAdd} />)}</div> : <p className="empty-state">No se encontraron productos con esos filtros.</p>}
    {selected && <div className="modal-overlay" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="detail-title"><button className="modal-close" type="button" aria-label="Cerrar detalle" onClick={() => setSelected(null)}>×</button><div className="modal-icon">{selected.icono}</div><p className="service-category">{selected.categoria}</p><h2 id="detail-title">{selected.nombre}</h2><p>{selected.principioActivo} · Presentación: {selected.presentacion}</p><p>{selected.especie} · Stock: {available(selected.id)}</p><strong>${selected.precio.toLocaleString('es-CL')}</strong><p><button className="button" type="button" disabled={available(selected.id) <= 0} onClick={() => onAdd(selected)}>Agregar al carrito</button></p></section></div>}
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
    if (result.user) window.location.href = result.user.role === 'cliente' ? 'index.html' : 'admin.html';
    else setMessage(result.message);
  }
  return <main className="section auth-section"><div className="container auth-container"><section className="auth-card"><p className="eyebrow">Acceso a la plataforma</p><h1>Iniciar sesión</h1><form className="auth-form" onSubmit={submit}><label className="form-group">Correo electrónico<input name="correo" type="email" autoComplete="username" required /></label><label className="form-group">Contraseña<input name="password" type="password" autoComplete="current-password" required /></label><button className="button" type="submit">Ingresar</button>{message && <p className="form-message" role="alert">{message}</p>}</form><p className="demo-access">Cuentas de prueba: admin@duoc.cl / Admin123 · vendedor@duoc.cl / Vendedor123</p><p className="auth-switch">¿Aún no tienes cuenta? <a href="registro.html">Regístrate aquí</a></p></section></div></main>;
}

const regions = ['Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo', 'Valparaíso', 'Metropolitana de Santiago', "Libertador General Bernardo O'Higgins", 'Maule', 'Ñuble', 'Biobío', 'La Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén del General Carlos Ibáñez del Campo', 'Magallanes y de la Antártica Chilena'];

interface ProfilePageProps {
  user: User;
  onUpdate: (details: ProfileDetails) => string | null;
}

function calculateAge(dateOfBirth: string): number | null {
  if (!dateOfBirth) return null;
  const birthDate = new Date(`${dateOfBirth}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) age -= 1;
  return age < 0 ? null : age;
}

export function ProfilePage({ user, onUpdate }: ProfilePageProps) {
  const [details, setDetails] = useState<ProfileDetails>(() => ({
    nombre: user.nombre,
    apellido: user.apellido,
    fechaNacimiento: user.fechaNacimiento,
    correo: user.correo,
    direccion: user.direccion,
    region: user.region,
    genero: user.genero,
  }));
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const age = calculateAge(details.fechaNacimiento);

  function updateField<K extends keyof ProfileDetails>(field: K, value: ProfileDetails[K]) {
    setDetails((current) => ({ ...current, [field]: value }));
    setMessage('');
    setSuccess(false);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (age === null || age < 14) {
      setSuccess(false);
      setMessage('La fecha debe ser válida y debes tener al menos 14 años.');
      return;
    }
    const normalizedDetails = { ...details, correo: details.correo.trim().toLowerCase() };
    const error = onUpdate(normalizedDetails);
    if (error) {
      setSuccess(false);
      setMessage(error);
      return;
    }
    setDetails(normalizedDetails);
    setSuccess(true);
    setMessage('Tu perfil se actualizó correctamente.');
  }

  return <main className="section auth-section profile-section"><div className="container auth-container">
    <section className="auth-card auth-card--wide profile-card">
      <p className="eyebrow">Cuenta personal</p><h1>Mi perfil</h1>
      <p className="profile-intro">Consulta y actualiza tus datos personales. Tu rol no se puede cambiar desde esta pantalla.</p>
      <form className="auth-form profile-form" onSubmit={submit}>
        <div className="form-row">
          <label className="form-group">Nombre<input autoComplete="given-name" value={details.nombre} onChange={(event) => updateField('nombre', event.target.value)} required /></label>
          <label className="form-group">Apellido<input autoComplete="family-name" value={details.apellido} onChange={(event) => updateField('apellido', event.target.value)} required /></label>
        </div>
        <div className="form-row">
          <label className="form-group">Fecha de nacimiento<input type="date" value={details.fechaNacimiento} onChange={(event) => updateField('fechaNacimiento', event.target.value)} required /></label>
          <div className="profile-age" aria-live="polite"><span>Edad</span><strong>{age === null ? 'Ingresa una fecha válida' : `${age} ${age === 1 ? 'año' : 'años'}`}</strong></div>
        </div>
        <label className="form-group">Correo electrónico<input autoComplete="email" type="email" value={details.correo} onChange={(event) => updateField('correo', event.target.value)} required /></label>
        <label className="form-group">Dirección<input autoComplete="street-address" value={details.direccion} onChange={(event) => updateField('direccion', event.target.value)} required /></label>
        <div className="form-row">
          <label className="form-group">Región<select value={details.region} onChange={(event) => updateField('region', event.target.value)} required><option value="" disabled>Selecciona tu región</option>{regions.map((region) => <option key={region}>{region}</option>)}</select></label>
          <label className="form-group">Género<select value={details.genero} onChange={(event) => updateField('genero', event.target.value)}><option value="">Prefiero no indicarlo</option><option>Femenino</option><option>Masculino</option><option>No binario</option><option>Prefiero no decirlo</option></select></label>
        </div>
        <label className="form-group">Rol<input value={user.role} readOnly aria-describedby="profile-role-note" /></label>
        <span id="profile-role-note" className="field-hint">El rol se administra según los permisos de la cuenta.</span>
        <button className="button" type="submit">Guardar cambios</button>
        {message && <p className={`form-message ${success ? 'form-message--success' : ''}`} role={success ? 'status' : 'alert'}>{message}</p>}
      </form>
    </section>
  </div></main>;
}

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
  return <main className="section auth-section"><div className="container auth-container"><section className="auth-card auth-card--wide"><p className="eyebrow">Crear cuenta de cliente</p><h1>Regístrate</h1><p className="auth-subtitle">El registro público crea exclusivamente cuentas de cliente.</p><form className="auth-form" onSubmit={submit}><div className="form-row"><label className="form-group">Nombre<input name="nombre" required /></label><label className="form-group">Apellido<input name="apellido" required /></label></div><label className="form-group">Fecha de nacimiento<input name="fechaNacimiento" type="date" required /></label><label className="form-group">Correo institucional<input name="correo" type="email" required /></label><div className="form-row"><label className="form-group">Contraseña<input name="password" type="password" minLength={8} required /><span className="field-hint">Mínimo 8 caracteres, una mayúscula y un número.</span></label><label className="form-group">Confirmar contraseña<input name="confirmarPassword" type="password" required /></label></div><label className="form-group">Dirección<input name="direccion" required /></label><div className="form-row"><label className="form-group">Región<select name="region" defaultValue="" required><option value="" disabled>Selecciona tu región</option>{regions.map((region) => <option key={region}>{region}</option>)}</select></label><label className="form-group">Género<select name="genero" defaultValue="" required><option value="" disabled>Selecciona una opción</option><option>Femenino</option><option>Masculino</option><option>No binario</option><option>Prefiero no decirlo</option></select></label></div><label className="checkbox-label"><input name="acepta" type="checkbox" required />Acepto las condiciones de registro y el tratamiento de mis datos.</label><button className="button" type="submit">Crear cuenta</button>{message && <p className={`form-message ${success ? 'form-message--success' : ''}`} role={success ? 'status' : 'alert'}>{message}</p>}</form></section></div></main>;
}