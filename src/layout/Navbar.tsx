import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { User } from '../types';

interface HeaderProps {
  user: User | null;
  cartCount: number;
  onCartOpen: () => void;
  onOrdersOpen: () => void;
  onLogout: () => void;
}

export default function Navbar({ user, cartCount, onCartOpen, onOrdersOpen, onLogout }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  return (
    <header className="site-header navbar navbar-expand-lg">
      <div className="container nav-wrapper">
  <Link className="brand" to="/index.html" onClick={closeMenu}>
          <img className="brand-logo" src="/images/Logo%20veterinaria.png" alt="" />
          <span>Veterinaria <strong>San Marcos</strong></span>
        </Link>
        <button className="nav-toggle navbar-toggler" type="button" aria-label={menuOpen ? 'Cerrar navegación' : 'Abrir navegación'} aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen(!menuOpen)}>
          <span className="nav-toggle-line" /><span className="nav-toggle-line" /><span className="nav-toggle-line" />
        </button>
        <nav id="mobile-nav" className={`main-nav ${menuOpen ? 'main-nav--open' : ''}`} data-mobile-open={menuOpen} aria-label="Navegación principal">
          <Link to="/index.html" onClick={closeMenu}>Inicio</Link><Link to="/catalogo.html" onClick={closeMenu}>Catálogo</Link><Link to="/categorias.html" onClick={closeMenu}>Categorías</Link><Link to="/ofertas.html" onClick={closeMenu}>Ofertas</Link><Link to="/index.html#nosotros" onClick={closeMenu}>Quiénes somos</Link>
          {user && user.role !== 'cliente' && <Link to="/admin.html" onClick={closeMenu}>Panel de gestión</Link>}
          {!user ? <><Link to="/login.html" onClick={closeMenu}>Iniciar sesión</Link><Link to="/registro.html" onClick={closeMenu}>Registrarse</Link></> : (
            <div className="account-menu"><span className="account-toggle">{user.nombre} · {roleLabel(user.role)}</span><Link to="/profile.html" onClick={closeMenu}>Mi perfil</Link><button className="text-button" type="button" onClick={() => { onOrdersOpen(); closeMenu(); }}>Mis compras</button><button className="text-button" type="button" onClick={onLogout}>Cerrar sesión</button></div>
          )}
          <Link className="nav-contact" to="/index.html#contacto" onClick={closeMenu}>Agendar consulta</Link>
          <button className="cart-toggle btn btn-outline-primary" type="button" onClick={onCartOpen} aria-label={`Abrir carrito, ${cartCount} productos`}>
            <span aria-hidden="true">🛒</span><span className="cart-count badge rounded-pill text-bg-primary">{cartCount}</span>
          </button>
        </nav>
        <button className="cart-toggle mobile-cart-toggle" type="button" onClick={onCartOpen} aria-label={`Abrir carrito, ${cartCount} productos`}>
          <span aria-hidden="true">🛒</span><span className="cart-count">{cartCount}</span>
        </button>
      </div>
    </header>
  );
}

function roleLabel(role: User['role']): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}