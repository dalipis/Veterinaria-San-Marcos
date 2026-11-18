import { Link } from 'react-router-dom';
import { money } from '../utils/format';
import type { CheckoutResult } from '../types';

export default function CheckoutResultPage({ result }: { result: CheckoutResult | null }) {
  const success = result?.estado === 'exitoso';
  return <main className="section checkout-page"><div className="container">
    <section className={`checkout-result ${success ? 'checkout-result--success' : 'checkout-result--failure'}`}>
      <p className="eyebrow">{success ? 'Pedido confirmado' : 'No se pudo completar'}</p>
      <h1>{success ? '¡Gracias por tu compra!' : 'El pago no fue aprobado'}</h1>
      <p>{result?.mensaje ?? 'No encontramos un resultado reciente de compra.'}</p>
      {success && result?.order && <div className="result-summary">
        <div className="order-header"><strong>{result.order.idOrden}</strong><span>{result.order.fecha}</span></div>
        <p>{result.order.tipoEntrega === 'retiro' ? 'Retiro en clínica, Rancagua' : `${result.order.direccionEntrega}, ${result.order.regionEntrega}`}</p>
        <ul className="order-items-list">{result.order.items.map((item) => <li className="order-item-row" key={item.id}><span>{item.cantidad} × {item.nombre}</span><span>{money(item.subtotal)}</span></li>)}</ul>
        <div className="order-total-row"><span>Total pagado</span><strong>{money(result.order.total)}</strong></div>
      </div>}
      <div className="checkout-result-actions"><Link className="button btn btn-primary" to={success ? '/catalogo.html' : '/checkout.html'}>{success ? 'Seguir comprando' : 'Volver al checkout'}</Link>{success && <Link className="button button--outline" to="/profile.html">Ver mi perfil y compras</Link>}</div>
    </section>
  </div></main>;
}
