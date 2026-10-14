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
  return (
    <header className="site-header">
      <div className="container nav-wrapper">
        <a className="brand" href="index.html">
          <img className="brand-logo" src="Imagenes/Logo%20veterinaria.png" alt="" />
          <span>Veterinaria <strong>San Marcos</strong></span>
        </a>
        <button className="nav-toggle" type="button" aria-label={menuOpen ? 'Cerrar navegación' : 'Abrir navegación'} aria-controls="primary-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          <span className="nav-toggle-line" /><span className="nav-toggle-line" /><span className="nav-toggle-line" />
        </button>
        <nav id="primary-navigation" className={`main-nav ${menuOpen ? 'main-nav--open' : ''}`} aria-label="Navegación principal">
          <a href="index.html">Inicio</a><a href="catalogo.html">Catálogo</a><a href="index.html#nosotros">Quiénes somos</a>
          {user && user.role !== 'cliente' && <a href="admin.html">Panel de gestión</a>}
          {!user ? <><a href="login.html">Iniciar sesión</a><a href="registro.html">Registrarse</a></> : (
            <div className="account-menu"><span className="account-toggle">{user.nombre} · {roleLabel(user.role)}</span><a href="perfil.html">Mi perfil</a><button className="text-button" type="button" onClick={onOrdersOpen}>Mis compras</button><button className="text-button" type="button" onClick={onLogout}>Cerrar sesión</button></div>
          )}
          <a className="nav-contact" href="index.html#contacto">Agendar consulta</a>
          <button className="cart-toggle" type="button" onClick={onCartOpen} aria-label={`Abrir carrito, ${cartCount} productos`}>
            <span aria-hidden="true">🛒</span><span className="cart-count">{cartCount}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}

function roleLabel(role: User['role']): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}