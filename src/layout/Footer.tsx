import { Link } from 'react-router-dom';

export function Footer() {
  return <footer className="site-footer">
    <div className="container">
      <div className="footer-main">
        <div className="footer-brand-block">
          <Link className="footer-brand" to="/index.html">
            <img className="brand-logo" src="/images/Logo%20veterinaria.png" alt="" />
            <span>Veterinaria <strong>San Marcos</strong></span>
          </Link>
          <p>Cuidado cercano para quienes hacen de tu casa un hogar.</p>
        </div>
        <nav className="footer-column" aria-label="Explora">
          <h3>Explora</h3>
          <Link to="/index.html">Inicio</Link>
          <Link to="/catalogo.html">Catálogo</Link>
          <Link to="/index.html#especialistas">Especialistas</Link>
          <Link to="/index.html#nosotros">Quiénes somos</Link>
        </nav>
        <div className="footer-column">
          <h3>Conversemos</h3>
          <p>Estamos en Rancagua, Región de O'Higgins.</p>
          <Link className="footer-action" to="/index.html#contacto">Agendar consulta <span aria-hidden="true">→</span></Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>Equipo: Dalí Morales&nbsp; | &nbsp;Joaquín Diez&nbsp; | &nbsp;Marco Palma</p>
        <p>DSY1104 · 2026</p>
      </div>
    </div>
  </footer>;
}
