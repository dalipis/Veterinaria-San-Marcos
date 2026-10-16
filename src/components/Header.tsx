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

export function Header({ user, cartCount, onCartOpen, onOrdersOpen, onLogout }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  return (
    <header className="site-header">
      <div className="container nav-wrapper">
        <Link className="brand" to="/">
          <img className="brand-logo" src="Imagenes/Logo%20veterinaria.png" alt="" />
          <span>Veterinaria <strong>San Marcos</strong></span>
        </Link>
        <button className="nav-toggle" type="button" aria-label={menuOpen ? 'Cerrar navegación' : 'Abrir navegación'} aria-controls="primary-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          <span className="nav-toggle-line" /><span className="nav-toggle-line" /><span className="nav-toggle-line" />
        </button>
        <nav id="primary-navigation" className={`main-nav ${menuOpen ? 'main-nav--open' : ''}`} data-mobile-open={menuOpen} aria-label="Navegación principal">
          <Link to="/" onClick={closeMenu}>Inicio</Link><Link to="/catalogo" onClick={closeMenu}>Catálogo</Link><Link to="/#nosotros" onClick={closeMenu}>Quiénes somos</Link>
          {user && user.role !== 'cliente' && <Link to="/admin" onClick={closeMenu}>Panel de gestión</Link>}
          {!user ? <><Link to="/login" onClick={closeMenu}>Iniciar sesión</Link><Link to="/registro" onClick={closeMenu}>Registrarse</Link></> : (
            <div className="account-menu"><span className="account-toggle">{user.nombre} · {roleLabel(user.role)}</span><Link to="/perfil" onClick={closeMenu}>Mi perfil</Link><button className="text-button" type="button" onClick={() => { onOrdersOpen(); closeMenu(); }}>Mis compras</button><button className="text-button" type="button" onClick={onLogout}>Cerrar sesión</button></div>
          )}
          <Link className="nav-contact" to="/#contacto" onClick={closeMenu}>Agendar consulta</Link>
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