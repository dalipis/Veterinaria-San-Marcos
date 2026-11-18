import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type { ShopPageProps } from './shopTypes';

export default function HomePage({ products }: Pick<ShopPageProps, 'products'>) {
  const [message, setMessage] = useState('');
  const featured = products.slice(2, 5);
  return <main>
    <section className="hero" id="inicio"><div className="container hero-content">
      <p className="eyebrow">Desde Rancagua, cuidamos lo que más quieres</p><h1>Salud y bienestar para cada compañero de vida.</h1>
      <p>Desde 2009 acompañamos a familias de la Región de O'Higgins con atención veterinaria cercana y responsable.</p>
      <Link className="button" to="/catalogo.html">Ver catálogo de productos</Link>
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
  </main>;
}
