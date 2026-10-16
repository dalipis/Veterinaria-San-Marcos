import { useState, type FormEvent } from 'react';
import type { User } from '../types';

interface ProfilePageProps {
  user: User;
  onSave: (user: User) => string | null;
}

const regions = [
  'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo', 'Valparaíso',
  'Metropolitana de Santiago', "Libertador General Bernardo O'Higgins", 'Maule', 'Ñuble',
  'Biobío', 'La Araucanía', 'Los Ríos', 'Los Lagos',
  'Aysén del General Carlos Ibáñez del Campo', 'Magallanes y de la Antártica Chilena',
];

function calculateAge(date: string): number | null {
  if (!date) return null;
  const birthDate = new Date(`${date}T00:00:00`);
  if (Number.isNaN(birthDate.getTime()) || birthDate > new Date()) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) age -= 1;
  return age;
}

export function ProfilePage({ user, onSave }: ProfilePageProps) {
  const [profile, setProfile] = useState({
    nombre: user.nombre,
    apellido: user.apellido,
    fechaNacimiento: user.fechaNacimiento,
    correo: user.correo,
    direccion: user.direccion,
    region: user.region,
  });
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(false);
  const age = calculateAge(profile.fechaNacimiento);

  function update(field: keyof typeof profile, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
    setMessage('');
    setSaved(false);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fullNameIsValid = profile.nombre.trim().length > 0 && profile.apellido.trim().length > 0;
    if (!fullNameIsValid) return setMessage('Ingresa tu nombre y apellido.');
    if (age === null || age < 0) return setMessage('Ingresa una fecha de nacimiento válida.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.correo.trim())) return setMessage('Ingresa un correo electrónico válido.');
    const error = onSave({
      ...user,
      nombre: profile.nombre.trim(),
      apellido: profile.apellido.trim(),
      fechaNacimiento: profile.fechaNacimiento,
      correo: profile.correo.trim().toLowerCase(),
      direccion: profile.direccion.trim(),
      region: profile.region,
    });
    if (error) return setMessage(error);
    setSaved(true);
    setMessage('Perfil actualizado correctamente.');
  }

  return <main className="section profile-page">
    <div className="container profile-container">
      <div className="profile-heading"><p className="eyebrow">Mi cuenta</p><h1>Perfil personal</h1><p>Actualiza tus datos de contacto y mantén tu información al día.</p></div>
      <form className="profile-form" onSubmit={submit}>
        <div className="profile-avatar" aria-hidden="true">{profile.nombre.trim().charAt(0).toUpperCase() || '👤'}</div>
        <div className="profile-fields">
          <div className="form-row row g-3">
            <label className="form-group col-12 col-md-6">Nombre<input className="form-control" autoComplete="given-name"
              value={profile.nombre}
              onChange={(event) => update('nombre', event.target.value)}
              required /></label>
            <label className="form-group col-12 col-md-6">Apellido<input className="form-control" autoComplete="family-name"
              value={profile.apellido}
              onChange={(event) => update('apellido', event.target.value)}
              required /></label>
          </div>
          <div className="form-row profile-birth-row row g-3">
            <label className="form-group col-12 col-md-6">Fecha de nacimiento<input className="form-control" type="date"
              value={profile.fechaNacimiento}
              onChange={(event) => update('fechaNacimiento', event.target.value)}
              required /></label>
            <div className="form-group col-12 col-md-6"><span className="profile-field-label">Edad</span>
              <output className="profile-age">{age === null ? 'Se calcula al indicar la fecha' : `${age} años`}</output></div>
          </div>
          <label className="form-group">Correo electrónico<input className="form-control" autoComplete="email"
            value={profile.correo}
            onChange={(event) => update('correo', event.target.value)}
            required /></label>
          <label className="form-group">Dirección<input className="form-control" autoComplete="street-address"
            value={profile.direccion}
            onChange={(event) => update('direccion', event.target.value)}
            required /></label>
          <div className="form-row row g-3">
            <label className="form-group col-12 col-md-6">Región<select className="form-select"
              value={profile.region}
              onChange={(event) => update('region', event.target.value)}
              required>
              <option value="" disabled>Selecciona tu región</option>
              {regions.map((region) => <option key={region}>{region}</option>)}
            </select></label>
            <label className="form-group col-12 col-md-6">Rol<input className="form-control" value={user.role}
              readOnly aria-describedby="role-help" />
              <span className="field-hint" id="role-help">El rol de la cuenta no se puede cambiar desde el perfil.</span></label>
          </div>
          <div className="profile-actions"><button className="button btn btn-primary" type="submit">Guardar cambios</button>
            {message && <p className={`form-message ${saved ? 'form-message--success' : ''}`} role={saved ? 'status' : 'alert'}>{message}</p>}</div>
        </div>
      </form>
    </div>
  </main>;
}