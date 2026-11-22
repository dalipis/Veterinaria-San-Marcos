import { useState, type FormEvent } from 'react';
import { regions } from '../constants/regions';
import type { User } from '../types';

interface RegisterPageProps { onRegister: (details: Omit<User, 'id' | 'role' | 'compras' | 'intentosFallidos' | 'bloqueado'>) => Promise<string | null> }

export default function RegisterPage({ onRegister }: RegisterPageProps) {
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get('correo')).trim().toLowerCase();
    const password = String(data.get('password'));
    const confirm = String(data.get('confirmarPassword'));
    const birth = String(data.get('fechaNacimiento'));
    const today = new Date();
    const birthday = new Date(`${birth}T00:00:00`);
    let age = today.getFullYear() - birthday.getFullYear();
    if (today.getMonth() < birthday.getMonth() || (today.getMonth() === birthday.getMonth() && today.getDate() < birthday.getDate())) age -= 1;
    if (!email.endsWith('@duoc.cl')) return setMessage('Usa un correo institucional con dominio @duoc.cl.');
    if (age < 14) return setMessage('Debes tener al menos 14 años para registrarte.');
    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) return setMessage('La contraseña debe tener 8 caracteres, una mayúscula y un número.');
    if (password !== confirm) return setMessage('Las contraseñas no coinciden.');
    const error = await onRegister({ nombre: String(data.get('nombre')).trim(), apellido: String(data.get('apellido')).trim(), fechaNacimiento: birth, correo: email, password, direccion: String(data.get('direccion')).trim(), region: String(data.get('region')), genero: String(data.get('genero')) });
    if (error) return setMessage(error);
    setSuccess(true);
    setMessage('Cuenta de cliente creada. Ya puedes iniciar sesión.');
    form.reset();
  }
  return <main className="section auth-section"><div className="container auth-container"><section className="auth-card auth-card--wide"><p className="eyebrow">Crear cuenta de cliente</p><h1>Regístrate</h1><p className="auth-subtitle">El registro público crea exclusivamente cuentas de cliente.</p><form className="auth-form" onSubmit={submit}><div className="form-row row g-3"><label className="form-group col-12 col-md-6">Nombre
        <input className="form-control" name="nombre" required />
      </label><label className="form-group col-12 col-md-6">Apellido
        <input className="form-control" name="apellido" required />
      </label></div><label className="form-group">Fecha de nacimiento
        <input className="form-control" name="fechaNacimiento" type="date" required />
      </label><label className="form-group">Correo institucional
        <input className="form-control" name="correo" type="email" required />
      </label><div className="form-row row g-3"><label className="form-group col-12 col-md-6">Contraseña
        <input className="form-control" name="password" type="password" minLength={8} required />
        <span className="field-hint">Mínimo 8 caracteres, una mayúscula y un número.</span>
      </label><label className="form-group col-12 col-md-6">Confirmar contraseña
        <input className="form-control" name="confirmarPassword" type="password" required />
      </label></div><label className="form-group">Dirección
        <input className="form-control" name="direccion" required />
      </label><div className="form-row row g-3"><label className="form-group col-12 col-md-6">Región
        <select className="form-select"
          name="region"
          defaultValue="" required>
          <option value="" disabled>Selecciona tu región</option>
          {regions.map((region) => <option key={region}>{region}</option>)}
        </select>
      </label><label className="form-group col-12 col-md-6">Género
        <select className="form-select" name="genero" defaultValue="" required>
          <option value="" disabled>Selecciona una opción</option>
          <option>Femenino</option>
          <option>Masculino</option>
          <option>No binario</option>
          <option>Prefiero no decirlo</option>
        </select>
      </label></div><label className="checkbox-label"><input name="acepta" type="checkbox" required />Acepto las condiciones de registro y el tratamiento de mis datos.</label><button className="button btn btn-primary" type="submit">Crear cuenta</button>{message && <p className={`form-message ${success ? 'form-message--success' : ''}`} role={success ? 'status' : 'alert'}>{message}</p>}</form></section></div></main>;
}
