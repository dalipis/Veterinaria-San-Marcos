export type Role = 'administrador' | 'vendedor' | 'cliente';

export type ProfileDetails = Pick<User, 'nombre' | 'apellido' | 'fechaNacimiento' | 'correo' | 'direccion' | 'region' | 'genero'>;

export interface User {
  id: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  correo: string;
  password: string;
  direccion: string;
  region: string;
  genero: string;
  role: Role;
  compras: Order[];
  intentosFallidos: number;
  bloqueado: boolean;
}

export interface Product {
  id: string;
  categoria: string;
  nombre: string;
  principioActivo: string;
  presentacion: string;
  especie: string;
  stock: number;
  precio: number;
  icono: string;
}

export interface CartItem {
  id: string;
  cantidad: number;
}

export interface Order {
  idOrden: string;
  fecha: string;
  items: { id: string; nombre: string; cantidad: number; precioUnitario: number; subtotal: number }[];
  total: number;
}

export interface Notice {
  text: string;
  kind: 'success' | 'error' | 'info';
}