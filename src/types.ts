export type Role = 'administrador' | 'vendedor' | 'cliente';

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
  precioOferta?: number;
  icono: string;
}

export interface CartItem {
  id: string;
  cantidad: number;
}

export interface Order {
  idOrden: string;
  fecha: string;
  direccionEntrega: string;
  regionEntrega: string;
  tipoEntrega: 'despacho' | 'retiro';
  metodoPago: 'tarjeta' | 'transferencia';
  estado: 'confirmado';
  items: { id: string; nombre: string; cantidad: number; precioUnitario: number; subtotal: number }[];
  total: number;
}

export interface CheckoutDetails {
  direccionEntrega: string;
  regionEntrega: string;
  tipoEntrega: 'despacho' | 'retiro';
  metodoPago: 'tarjeta' | 'transferencia';
  numeroTarjeta: string;
}

export interface CheckoutResult {
  estado: 'exitoso' | 'fallido';
  mensaje: string;
  order: Order | null;
  fecha: string;
}

export interface Notice {
  text: string;
  kind: 'success' | 'error' | 'info';
}