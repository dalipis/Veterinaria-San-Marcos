import { money } from '../utils/format';
import type { CartItem, Product } from '../types';

interface CartDrawerProps {
  open: boolean;
  products: Product[];
  cart: CartItem[];
  onClose: () => void;
  onChange: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

export function CartDrawer({ open, products, cart, onClose, onChange, onRemove, onCheckout }: CartDrawerProps) {
  const lines = cart.flatMap((item) => {
    const product = products.find((entry) => entry.id === item.id);
    return product ? [{ item, product }] : [];
  });
  const priceOf = (product: Product) => product.precioOferta && product.precioOferta < product.precio ? product.precioOferta : product.precio;
  const total = lines.reduce((sum, line) => sum + priceOf(line.product) * line.item.cantidad, 0);

  return <>
    {open && <div className="cart-overlay" onClick={onClose} />}
    <aside className={`cart-panel ${open ? 'cart-panel--open' : ''}`} aria-label="Carrito de compras" aria-hidden={!open}>
      <div className="cart-panel-header">
        <h2>Tu carrito</h2>
        <button className="modal-close" type="button" aria-label="Cerrar carrito" onClick={onClose}>×</button>
      </div>
      {!lines.length ? <p className="cart-empty">Tu carrito está vacío.</p> : <>
        <ul className="cart-items">{lines.map(({ item, product }) => <li className="cart-item" key={item.id}>
          <div className="cart-item-top"><strong>{product.nombre}</strong><span>{money(priceOf(product) * item.cantidad)}</span></div>
          <p className="cart-item-price">Precio unitario: {money(priceOf(product))}{priceOf(product) < product.precio && <del className="product-old-price">{money(product.precio)}</del>}</p>
          <div className="cart-item-controls">
            <button className="qty-btn btn btn-sm btn-outline-secondary" type="button" aria-label="Restar" onClick={() => onChange(item.id, -1)}>−</button>
            <span>{item.cantidad}</span>
            <button className="qty-btn btn btn-sm btn-outline-secondary" type="button" aria-label="Sumar" onClick={() => onChange(item.id, 1)}>+</button>
            <button className="cart-item-remove btn btn-sm btn-outline-danger" type="button" onClick={() => onRemove(item.id)}>Quitar</button>
          </div>
        </li>)}</ul>
        <div className="cart-footer">
          <div className="cart-total"><span>Total</span><strong>{money(total)}</strong></div>
          <button className="button btn btn-primary" type="button" onClick={onCheckout}>Continuar al checkout</button>
        </div>
      </>}
    </aside>
  </>;
}
