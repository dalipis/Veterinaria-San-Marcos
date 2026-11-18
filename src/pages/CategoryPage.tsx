import { Link } from 'react-router-dom';
import type { ShopPageProps } from './shopTypes';

export default function CategoryPage({ products, categories }: Pick<ShopPageProps, 'products' | 'categories'>) {
  return <main className="section catalog-page"><div className="container">
    <div className="catalog-hero"><div className="catalog-hero-copy"><p className="eyebrow">Explora por necesidad</p><h1>Categorías para cada cuidado.</h1><p>Encuentra rápidamente productos para el bienestar de tu mascota.</p></div><div className="catalog-hero-mark" aria-hidden="true">🐾</div></div>
    <div className="category-grid row g-3">{categories.map((category) => {
      const count = products.filter((product) => product.categoria === category).length;
      return <Link className="category-tile col-12 col-sm-6 col-lg-4" to={`/catalogo.html?categoria=${encodeURIComponent(category)}`} key={category}>
        <span className="category-tile-icon" aria-hidden="true">{products.find((product) => product.categoria === category)?.icono ?? '🐾'}</span>
        <span><strong>{category}</strong><small>{count} {count === 1 ? 'producto' : 'productos'}</small></span>
        <span className="category-tile-arrow" aria-hidden="true">→</span>
      </Link>;
    })}</div>
  </div></main>;
}
