import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return <main className="section">
    <div className="container access-denied">
      <h1>Página no encontrada</h1>
      <p>La dirección que buscas no existe.</p>
      <Link className="button" to="/">Volver al inicio</Link>
    </div>
  </main>;
}
