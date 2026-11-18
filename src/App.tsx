import { useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import StaffRoute from './components/StaffRoute';
import { StoreProvider } from './contexts/StoreProvider';
import { useStore } from './contexts/useStore';
import PageLayout from './layout/PageLayout';
import ScrollToTop from './layout/ScrollToTop';
import AccessDeniedPage from './pages/AccessDeniedPage';
import AdminPage from './pages/AdminPage';
import CatalogPage from './pages/CatalogPage';
import CategoryPage from './pages/CategoryPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutResultPage from './pages/CheckoutResultPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import OffersPage from './pages/OffersPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';

export default function App() {
  return <StoreProvider><AppRoutes /></StoreProvider>;
}

function AppRoutes() {
  const store = useStore();
  const { pathname } = useLocation();

  useEffect(() => {
    const titles: Record<string, string> = {
      '/admin.html': 'Panel de gestión',
      '/catalogo.html': 'Catálogo',
      '/categorias.html': 'Categorías',
      '/ofertas.html': 'Ofertas',
      '/checkout.html': 'Checkout',
      '/compra-resultado.html': 'Resultado de compra',
      '/login.html': 'Iniciar sesión',
      '/registro.html': 'Registro',
      '/profile.html': 'Mi perfil',
    };
    document.title = `${titles[pathname] ?? 'Veterinaria San Marcos'} — Veterinaria San Marcos`;
  }, [pathname]);

  return <>
    <ScrollToTop />
    <Routes>
      <Route element={<PageLayout />}>
        <Route path="/" element={<HomePage products={store.products} />} />
        <Route path="/index.html" element={<HomePage products={store.products} />} />
        <Route path="/catalogo.html" element={<CatalogPage products={store.products} categories={store.categories} available={store.available} onAdd={store.addToCart} />} />
        <Route path="/categorias.html" element={<CategoryPage products={store.products} categories={store.categories} />} />
        <Route path="/ofertas.html" element={<OffersPage products={store.products} categories={store.categories} available={store.available} onAdd={store.addToCart} />} />
        <Route path="/checkout.html" element={store.user
          ? <CheckoutPage user={store.user} products={store.products} cart={store.cart} onSubmit={store.completeCheckout} />
          : <main className="section"><div className="container access-denied"><h1>Inicia sesión para finalizar tu compra</h1><p>Tu carrito se conservará mientras accedes.</p><Link className="button btn btn-primary" to="/login.html?next=checkout.html">Iniciar sesión</Link></div></main>} />
        <Route path="/compra-resultado.html" element={<CheckoutResultPage result={store.checkoutResult} />} />
        <Route path="/login.html" element={<LoginPage onLogin={store.login} />} />
        <Route path="/registro.html" element={<RegisterPage onRegister={store.register} />} />
        <Route path="/profile.html" element={<ProtectedRoute><ProfilePage user={store.user!} onSave={store.saveProfile} /></ProtectedRoute>} />
        <Route path="/admin.html" element={<StaffRoute><AdminPage
          user={store.user!}
          users={store.users}
          products={store.products}
          categories={store.categories}
          onSaveProduct={store.saveManagedProduct}
          onSaveProducts={store.setProducts}
          onDeleteProduct={store.deleteManagedProduct}
          onSaveUser={store.saveManagedUser}
          onDeleteUser={store.deleteManagedUser}
          onSaveCategories={store.saveManagedCategories}
          notify={store.notify}
        /></StaffRoute>} />
        <Route path="/acceso-denegado" element={<AccessDeniedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  </>;
}
