import { money } from '../utils/format';
import type { Product } from '../types';

interface ProductDetailsDialogProps { product: Product; available: number; onAdd: (product: Product) => void; onClose: () => void }

export function ProductDetailsDialog({ product, available, onAdd, onClose }: ProductDetailsDialogProps) {
  const price = product.precioOferta && product.precioOferta < product.precio ? product.precioOferta : product.precio;
  return <div className="modal-overlay" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="vsm-dialog" role="dialog" aria-modal="true" aria-labelledby="detail-title"><button className="modal-close" type="button" aria-label="Cerrar detalle" onClick={onClose}>×</button><div className="modal-icon">{product.icono}</div><p className="service-category">{product.categoria}</p><h2 id="detail-title">{product.nombre}</h2><p>{product.principioActivo} · Presentación: {product.presentacion}</p><p>{product.especie} · Stock: {available}</p><strong>{money(price)}</strong>{price < product.precio && <del className="product-old-price">{money(product.precio)}</del>}<p><button className="button btn btn-primary" type="button" disabled={available <= 0} onClick={() => onAdd(product)}>Agregar al carrito</button></p></section></div>;
}
