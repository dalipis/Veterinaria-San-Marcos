import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { money } from '../utils/format';
import type { CartItem, CheckoutDetails, Product, User } from '../types';

interface CheckoutPageProps {
  user: User;
  products: Product[];
  cart: CartItem[];
  onSubmit: (details: CheckoutDetails) => void;
}

export default function CheckoutPage({ user, products, cart, onSubmit }: CheckoutPageProps) {
  const [deliveryType, setDeliveryType] = useState<CheckoutDetails['tipoEntrega']>('despacho');
  const [paymentMethod, setPaymentMethod] = useState<CheckoutDetails['metodoPago']>('tarjeta');
  const lines = cart.map((item) => ({ item, product: products.find((product) => product.id === item.id) }))
    .filter((line): line is { item: CartItem; product: Product } => Boolean(line.product));
  const total = lines.reduce((sum, line) => sum + (line.product.precioOferta && line.product.precioOferta < line.product.precio ? line.product.precioOferta : line.product.precio) * line.item.cantidad, 0);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSubmit({
      direccionEntrega: String(data.get('direccion')).trim(),
      regionEntrega: String(data.get('region')).trim(),
      tipoEntrega: deliveryType,
      metodoPago: paymentMethod,
      numeroTarjeta: String(data.get('numeroTarjeta') ?? '').replace(/\s/g, ''),
    });
  }

  return <main className="section checkout-page"><div className="container">
    <div className="checkout-heading"><p className="eyebrow">Paso final</p><h1>Completa tu compra</h1><p>Hola, {user.nombre}. Revisa los datos y el método de entrega.</p></div>
    {!lines.length ? <div className="empty-state"><h2>Tu carrito está vacío</h2><Link className="button btn btn-primary" to="/catalogo.html">Ir al catálogo</Link></div> : <div className="checkout-layout row g-4">
      <form className="checkout-form col-12 col-lg-7" onSubmit={submit}>
        <section className="checkout-section">
          <h2>Entrega</h2>
          <div className="checkout-options" role="radiogroup" aria-label="Tipo de entrega">
            <label className={`checkout-option ${deliveryType === 'despacho' ? 'checkout-option--active' : ''}`}><input className="form-check-input" type="radio" name="tipoEntrega" value="despacho" checked={deliveryType === 'despacho'} onChange={() => setDeliveryType('despacho')} /><span><strong>Despacho a domicilio</strong><small>Entrega en la dirección indicada</small></span></label>
            <label className={`checkout-option ${deliveryType === 'retiro' ? 'checkout-option--active' : ''}`}><input className="form-check-input" type="radio" name="tipoEntrega" value="retiro" checked={deliveryType === 'retiro'} onChange={() => setDeliveryType('retiro')} /><span><strong>Retiro en clínica</strong><small>Rancagua, Región de O'Higgins</small></span></label>
          </div>
          {deliveryType === 'despacho' && <div className="checkout-address row g-3">
            <label className="form-group col-12">Dirección<input className="form-control" name="direccion" autoComplete="street-address" defaultValue={user.direccion} required /></label>
            <label className="form-group col-12">Región<input className="form-control" name="region" autoComplete="address-level1" defaultValue={user.region} required /></label>
          </div>}
        </section>
        <section className="checkout-section">
          <h2>Pago</h2>
          <label className="form-group">Método de pago<select className="form-select" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as CheckoutDetails['metodoPago'])}><option value="tarjeta">Tarjeta de crédito o débito</option><option value="transferencia">Transferencia bancaria simulada</option></select></label>
          {paymentMethod === 'tarjeta' ? <label className="form-group">Número de tarjeta de prueba<input className="form-control" name="numeroTarjeta" inputMode="numeric" autoComplete="cc-number" minLength={13} maxLength={19} pattern="[0-9 ]{13,19}" placeholder="0000 0000 0000 0000" required /><span className="field-hint">Pago simulado: la tarjeta terminada en 0002 será rechazada. No ingreses datos de una tarjeta real.</span></label> : <p className="payment-note">La transferencia se marcará como aprobada al confirmar; esta tienda académica no procesa pagos reales.</p>}
        </section>
        <button className="button btn btn-primary checkout-submit" type="submit">Confirmar compra · {money(total)}</button>
      </form>
      <aside className="checkout-summary col-12 col-lg-5" aria-label="Resumen de compra">
        <h2>Resumen del pedido</h2>
        <ul className="checkout-lines">{lines.map(({ item, product }) => {
          const price = product.precioOferta && product.precioOferta < product.precio ? product.precioOferta : product.precio;
          return <li key={item.id}><span>{item.cantidad} × {product.nombre}</span><strong>{money(price * item.cantidad)}</strong></li>;
        })}</ul>
        <div className="checkout-total"><span>Total</span><strong>{money(total)}</strong></div>
      </aside>
    </div>}
  </div></main>;
}
