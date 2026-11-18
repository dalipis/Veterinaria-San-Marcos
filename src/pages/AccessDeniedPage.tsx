import { Link } from 'react-router-dom';

export default function AccessDeniedPage() {
  return <main className="section">
    <div className="container access-denied">
      <h1>Acceso restringido</h1>
      <p>Esta sección está disponible solo para cuentas de administración y ventas.</p>
      <Link className="button" to="/login.html">Iniciar sesión con una cuenta autorizada</Link>
    </div>
  </main>;
}
