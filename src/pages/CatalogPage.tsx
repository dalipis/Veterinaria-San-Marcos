import { useMemo, useState } from 'react';
import { ProductCard } from '../ui/ProductCard';
import { ProductDetailsDialog } from '../ui/ProductDetailsDialog';
import type { Product } from '../types';
import type { ShopPageProps } from './shopTypes';

export default function CatalogPage({ products, categories, available, onAdd }: ShopPageProps) {
  const requestedCategory = new URLSearchParams(window.location.search).get('categoria');
  const [category, setCategory] = useState(requestedCategory && categories.includes(requestedCategory) ? requestedCategory : 'TODAS');
  const [maxPrice, setMaxPrice] = useState(30000);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);
  const filtered = useMemo(() => products.filter((product) => (category === 'TODAS' || product.categoria === category)
    && (product.precioOferta && product.precioOferta < product.precio ? product.precioOferta : product.precio) <= maxPrice
    && `${product.nombre} ${product.principioActivo}`.toLowerCase().includes(query.toLowerCase())), [products, category, maxPrice, query]);
  return <main className="section catalog-page"><div className="container">
    <div className="catalog-hero"><div className="catalog-hero-copy"><p className="eyebrow">Cuidado animal, elegido con cariño</p><h1>Encuentra lo que tu mascota necesita.</h1><p>Productos seleccionados para acompañar la salud y el bienestar de perros y gatos.</p></div><div className="catalog-hero-mark" aria-hidden="true">🐾</div></div>
    <div className="catalog-toolbar"><label className="catalog-filter">Buscar producto
      <input className="form-control" type="search" placeholder="Nombre o principio activo" value={query} onChange={(event) => setQuery(event.target.value)} />
    </label><label className="catalog-filter">Categoría
      <select className="form-select"
        value={category}
        onChange={(event) => setCategory(event.target.value)}>
        <option value="TODAS">Todas las categorías</option>
        {categories.map((item) => <option key={item}>{item}</option>)}
      </select>
    </label><label className="catalog-filter catalog-filter--price">Precio máximo
      <span>${maxPrice.toLocaleString('es-CL')}</span>
      <input className="form-range" type="range" min="3000" max="30000" step="1000" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} />
    </label></div>
    {filtered.length ? <div className="products-grid row g-4">{filtered.map((product) => <ProductCard key={product.id} product={product} available={available(product.id)} onDetails={setSelected} onAdd={onAdd} />)}</div> : <p className="empty-state">No se encontraron productos con esos filtros.</p>}
    {selected && <ProductDetailsDialog product={selected} available={available(selected.id)} onAdd={onAdd} onClose={() => setSelected(null)} />}
  </div></main>;
}
