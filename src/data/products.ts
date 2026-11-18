import type { Product } from '../types';

export const initialProducts: Product[] = [
  { id: 'ME001', categoria: 'Antibióticos', nombre: 'Amoxibay 250mg', principioActivo: 'Amoxicilina', presentacion: 'Blíster 10 comp.', especie: 'Perro / Gato', stock: 45, precio: 4200, icono: '💊' },
  { id: 'ME002', categoria: 'Antibióticos', nombre: 'Enrox 50mg', principioActivo: 'Enrofloxacino', presentacion: 'Blíster 10 comp.', especie: 'Perro / Gato', stock: 30, precio: 6800, icono: '💊' },
  { id: 'ME004', categoria: 'Antiparasitarios', nombre: 'Nexgard', principioActivo: 'Afoxolaner', presentacion: 'Masticable 1 unid.', especie: 'Perro', stock: 60, precio: 9500, precioOferta: 8500, icono: '🐛' },
  { id: 'ME005', categoria: 'Antiparasitarios', nombre: 'Bravecto', principioActivo: 'Fluralaner', presentacion: 'Masticable 1 unid.', especie: 'Perro', stock: 40, precio: 18900, precioOferta: 16900, icono: '🐛' },
  { id: 'ME006', categoria: 'Antiparasitarios', nombre: 'Revolution Plus', principioActivo: 'Selamectina + Sarolaner', presentacion: 'Pipeta 1 unid.', especie: 'Gato', stock: 35, precio: 14500, icono: '🐛' },
  { id: 'ME009', categoria: 'Antiinflamatorios', nombre: 'Meloxicam 1mg', principioActivo: 'Meloxicam', presentacion: 'Blíster 10 comp.', especie: 'Perro / Gato', stock: 55, precio: 4500, icono: '🩹' },
  { id: 'ME011', categoria: 'Dermatología', nombre: 'Clorhexidina shampoo', principioActivo: 'Clorhexidina 2%', presentacion: 'Frasco 250ml', especie: 'Perro / Gato', stock: 25, precio: 8900, icono: '🧴' },
  { id: 'ME013', categoria: 'Dermatología', nombre: 'Apoquel 16mg', principioActivo: 'Oclacitinib', presentacion: 'Blíster 10 comp.', especie: 'Perro', stock: 18, precio: 22000, icono: '🧴' },
  { id: 'ME014', categoria: 'Digestivo', nombre: 'Probifor', principioActivo: 'Bacillus clausii', presentacion: 'Sobre 5ml x10', especie: 'Perro / Gato', stock: 40, precio: 5600, icono: '🍽️' },
  { id: 'ME016', categoria: 'Cardíaco', nombre: 'Vetmedin 2.5mg', principioActivo: 'Pimobendan', presentacion: 'Blíster 10 comp.', especie: 'Perro', stock: 15, precio: 28000, icono: '❤️' },
  { id: 'ME018', categoria: 'Vacunas', nombre: 'Nobivac DHPPi', principioActivo: 'Vacuna polivalente', presentacion: 'Vial 1 dosis', especie: 'Perro', stock: 48, precio: 8500, precioOferta: 7900, icono: '💉' },
  { id: 'ME021', categoria: 'Suplementos', nombre: 'Omega vet 3-6-9', principioActivo: 'Ácidos grasos omega', presentacion: 'Frasco 100ml', especie: 'Perro / Gato', stock: 30, precio: 9900, icono: '🌿' },
];
