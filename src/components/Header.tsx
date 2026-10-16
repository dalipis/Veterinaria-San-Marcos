import { useState } from 'react';
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
    <header className="site-header navbar navbar-expand-lg">
      <div className="container nav-wrapper">
  <a className="brand" href="index.html" onClick={closeMenu}>
          <img className="brand-logo" src="/images/Logo%20veterinaria.png" alt="" />
          <span>Veterinaria <strong>San Marcos</strong></span>
        </a>
        <button className="nav-toggle navbar-toggler" type="button" aria-label={menuOpen ? 'Cerrar navegación' : 'Abrir navegación'} aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen(!menuOpen)}>
          <span className="nav-toggle-line" /><span className="nav-toggle-line" /><span className="nav-toggle-line" />
        </button>
        <nav id="mobile-nav" className={`main-nav ${menuOpen ? 'main-nav--open' : ''}`} data-mobile-open={menuOpen} aria-label="Navegación principal">
          <a href="index.html" onClick={closeMenu}>Inicio</a><a href="catalogo.html" onClick={closeMenu}>Catálogo</a><a href="categorias.html" onClick={closeMenu}>Categorías</a><a href="ofertas.html" onClick={closeMenu}>Ofertas</a><a href="index.html#nosotros" onClick={closeMenu}>Quiénes somos</a>
          {user && user.role !== 'cliente' && <a href="admin.html" onClick={closeMenu}>Panel de gestión</a>}
          {!user ? <><a href="login.html">Iniciar sesión</a><a href="registro.html">Registrarse</a></> : (
            <div className="account-menu"><span className="account-toggle">{user.nombre} · {roleLabel(user.role)}</span><a href="profile.html" onClick={closeMenu}>Mi perfil</a><button className="text-button" type="button" onClick={() => { onOrdersOpen(); closeMenu(); }}>Mis compras</button><button className="text-button" type="button" onClick={onLogout}>Cerrar sesión</button></div>
          )}
          <a className="nav-contact" href="index.html#contacto" onClick={closeMenu}>Agendar consulta</a>
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