import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  available: number;
  onDetails: (product: Product) => void;
  onAdd: (product: Product) => void;
}

const money = (value: number) => `$${value.toLocaleString('es-CL')}`;

export function ProductCard({ product, available, onDetails, onAdd }: ProductCardProps) {
  const hasOffer = product.precioOferta !== undefined && product.precioOferta > 0 && product.precioOferta < product.precio;
  return (
    <div className="col-12 col-md-6 col-xl-4">
      <article className="product-card card h-100">
        <div className="product-icon" aria-hidden="true">{product.icono}</div>
        <p className="service-category">{product.categoria}</p>
        <h3>{product.nombre}</h3>
        <p className="product-especie">{product.especie}</p>
        <div className="product-footer"><span className="product-price">{hasOffer ? <><del className="product-old-price">{money(product.precio)}</del><strong>{money(product.precioOferta!)}</strong></> : money(product.precio)}</span>{hasOffer && <span className="offer-badge">Oferta</span>}</div>
        <p className={`product-stock ${available <= 0 ? 'product-stock--low' : ''}`}>
          {available <= 0 ? 'Sin stock disponible' : `Disponible: ${available} unidades`}
        </p>
        <div className="product-card-actions">
          <button className="product-detail-btn btn btn-outline-primary" type="button"
            onClick={() => onDetails(product)}>
            Ver detalle
          </button>
          <button className="product-add-btn btn btn-primary" disabled={available <= 0}
            onClick={() => onAdd(product)}>
            {available <= 0 ? 'Sin stock' : 'Agregar al carrito'}
          </button>
        </div>
      </article>
    </div>
  );
}