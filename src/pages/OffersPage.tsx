import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../ui/ProductCard';
import { ProductDetailsDialog } from '../ui/ProductDetailsDialog';
import type { Product } from '../types';
import type { ShopPageProps } from './shopTypes';

export default function OffersPage({ products, categories, available, onAdd }: ShopPageProps) {
  const [selected, setSelected] = useState<Product | null>(null);
  const offers = products.filter((product) => product.precioOferta !== undefined && product.precioOferta > 0 && product.precioOferta < product.precio);
  return <main className="section catalog-page"><div className="container">
    <div className="catalog-hero offers-hero"><div className="catalog-hero-copy"><p className="eyebrow">Precios especiales</p><h1>Ofertas para cuidar más.</h1><p>Productos seleccionados con precio promocional por tiempo limitado.</p></div><div className="catalog-hero-mark" aria-hidden="true">%</div></div>
    {offers.length ? <div className="products-grid row g-4">{offers.map((product) => <ProductCard key={product.id} product={product} available={available(product.id)} onDetails={setSelected} onAdd={onAdd} />)}</div> : <p className="empty-state">No hay ofertas disponibles en este momento.</p>}
    <p className="offers-categories">Explora también: {categories.map((category, index) => <span key={category}><Link to={`/catalogo.html?categoria=${encodeURIComponent(category)}`}>{category}</Link>{index < categories.length - 1 ? ' · ' : ''}</span>)}</p>
    {selected && <ProductDetailsDialog product={selected} available={available(selected.id)} onAdd={onAdd} onClose={() => setSelected(null)} />}
  </div></main>;
}
