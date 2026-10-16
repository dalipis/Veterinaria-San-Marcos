# Veterinaria San Marcos

Tienda académica migrada a React, TypeScript y Vite. Las páginas públicas y el panel comparten componentes y una fuente de datos persistida en `localStorage`.

## Desarrollo

Requiere Node.js 20.19+ o 22.12+ y npm.

```sh
npm install
npm run dev
npm run lint
npm run build
```

`npm run lint` ejecuta ESLint sobre el código TypeScript y React. `npm run build` verifica TypeScript y genera el sitio de producción en `dist/`.

## Organización

- `src/components/`: componentes compartidos de la interfaz.
- `src/pages/`: páginas del catálogo, inicio, autenticación, perfil y gestión.
- `src/data/`: datos iniciales y persistencia local.
- `src/styles/` y `assets/css/`: estilos de la aplicación.
- Bootstrap se carga desde `src/main.tsx`; los estilos propios se importan después.

## Rutas

- `/`: inicio, presentación de la clínica y contacto (`index.html` también funciona como alias).
- `/catalogo`: catálogo con búsqueda, filtros, detalle y carrito (`catalogo.html` también funciona como alias).
- `/login` y `/registro`: acceso y creación pública de cuentas cliente; se conservan los alias `.html`.
- `/perfil`: consulta y edición de datos personales para cualquier rol autenticado (`perfil.html` también funciona como alias).
- `/admin`: gestión según el rol activo (`admin.html` también funciona como alias).

## Permisos

- Administrador: altas, consultas, modificaciones y bajas de productos, categorías y usuarios; asigna roles al crear o editar cuentas.
- Vendedor: consulta productos, modifica stock y crea cuentas de cliente. No administra categorías ni elimina productos o usuarios.
- Cliente: navega el catálogo y realiza compras.
- Cualquier usuario registrado en el flujo público recibe el rol cliente.

## Interfaz y persistencia

- El CSS propio adapta el catálogo a una columna en móviles, dos en tablets y tres en pantallas grandes.
- Usuarios, productos, categorías, carrito y sesión se conservan en `localStorage`. Las compras actualizan stock e historial; si una edición reduce el stock por debajo de lo reservado en el carrito, la cantidad se ajusta o el producto se retira si queda sin stock.

Para probar el panel localmente: `admin@duoc.cl` / `Admin123` o `vendedor@duoc.cl` / `Vendedor123`. Las cuentas se crean automáticamente si no existen. Los datos de prueba y credenciales se guardan solo en el navegador; este prototipo no implementa seguridad de producción.