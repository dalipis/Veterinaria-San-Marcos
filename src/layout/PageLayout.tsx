import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useStore } from '../contexts/useStore';
import Navbar from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { OrdersModal } from './OrdersModal';

export default function PageLayout() {
  const store = useStore();
  const navigate = useNavigate();
  const [cartOpen, setCartOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);

  return <div className="page-wrapper">
    <Navbar
      user={store.user}
      cartCount={store.cartCount}
      onCartOpen={() => setCartOpen(true)}
      onOrdersOpen={() => setOrdersOpen(true)}
      onLogout={() => { void store.setUser(null).then(() => navigate('/index.html')); }}
    />
    <div className="page-content"><Outlet /></div>
    <Footer />
    <CartDrawer
      open={cartOpen}
      products={store.products}
      cart={store.cart}
      onClose={() => setCartOpen(false)}
      onChange={store.changeQuantity}
      onRemove={(id) => store.setCart(store.cart.filter((item) => item.id !== id))}
      onCheckout={() => navigate(store.user ? '/checkout.html' : '/login.html?next=checkout.html')}
    />
    {ordersOpen && store.user && <OrdersModal orders={store.orders} onClose={() => setOrdersOpen(false)} />}
    {store.notice && <div className={`toast toast--${store.notice.kind}`} role="status">{store.notice.text}</div>}
  </div>;
}
