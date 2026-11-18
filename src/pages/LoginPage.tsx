import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { User } from '../types';

interface LoginPageProps { onLogin: (email: string, password: string) => { user?: User; message: string } }

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const result = onLogin(String(data.get('correo')).trim().toLowerCase(), String(data.get('password')));
    if (result.user) {
      const nextPage = new URLSearchParams(window.location.search).get('next');
      navigate(nextPage === 'checkout.html' ? '/checkout.html' : result.user.role === 'cliente' ? '/index.html' : '/admin.html');
    }
    else setMessage(result.message);
  }
  return <main className="section auth-section"><div className="container auth-container"><section className="auth-card"><p className="eyebrow">Acceso a la plataforma</p><h1>Iniciar sesión</h1><form className="auth-form" onSubmit={submit}><label className="form-group">Correo electrónico<input className="form-control" name="correo" type="email" autoComplete="username" required /></label><label className="form-group">Contraseña<input className="form-control" name="password" type="password" autoComplete="current-password" required /></label><button className="button btn btn-primary" type="submit">Ingresar</button>{message && <p className="form-message" role="alert">{message}</p>}</form><p className="demo-access">Cuentas de prueba: admin@duoc.cl / Admin123 · vendedor@duoc.cl / Vendedor123</p><p className="auth-switch">¿Aún no tienes cuenta? <Link to="/registro.html">Regístrate aquí</Link></p></section></div></main>;
}
