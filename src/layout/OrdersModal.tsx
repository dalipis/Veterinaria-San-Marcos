import { money } from '../utils/format';
import type { User } from '../types';

export function OrdersModal({ user, onClose }: { user: User; onClose: () => void }) {
  return <div className="modal-overlay" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="vsm-dialog orders-modal" role="dialog" aria-modal="true" aria-labelledby="orders-title">
      <button className="modal-close" type="button" aria-label="Cerrar historial" onClick={onClose}>×</button>
      <p className="service-category">Historial de pedidos</p>
      <h2 id="orders-title">Mis compras</h2>
      {user.compras.length === 0 ? <p>Aún no has realizado ninguna compra con tu cuenta.</p> : <div className="orders-list">
        {[...user.compras].reverse().map((order) => <article className="order-card" key={order.idOrden}>
          <div className="order-header"><strong>{order.idOrden}</strong><span>{order.fecha}</span></div>
          <ul className="order-items-list">{order.items.map((item) => <li className="order-item-row" key={item.id}>
            <span>{item.cantidad} × {item.nombre}</span><span>{money(item.subtotal)}</span>
          </li>)}</ul>
          <div className="order-total-row"><span>Total pagado</span><strong>{money(order.total)}</strong></div>
        </article>)}
      </div>}
    </section>
  </div>;
}
