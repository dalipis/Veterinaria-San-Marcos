# Veterinaria San Marcos

Tienda académica migrada a React, TypeScript y Vite. Las páginas públicas y el panel comparten componentes y una fuente de datos persistida en `localStorage`.

## Desarrollo

Requiere Node.js 20.19+ o 22.12+ y npm.

```sh
npm install
npm run dev
npm run build
```

## Rutas

- `index.html`: inicio, presentación de la clínica y contacto.
- `catalogo.html`: catálogo con búsqueda, filtros, detalle y carrito.
- `login.html` y `registro.html`: acceso y creación pública de cuentas cliente.
- `perfil.html`: consulta y edición de datos personales para cualquier rol autenticado.
- `admin.html`: gestión según el rol activo.

## Permisos

- Administrador: altas, consultas, modificaciones y bajas de productos, categorías y usuarios; asigna roles al crear o editar cuentas.
- Vendedor: consulta productos, modifica stock y crea cuentas de cliente. No administra categorías ni elimina productos o usuarios.
- Cliente: navega el catálogo y realiza compras.
- Cualquier usuario registrado en el flujo público recibe el rol cliente.

## Interfaz y persistencia

- El CSS propio adapta el catálogo a una columna en móviles, dos en tablets y tres en pantallas grandes.
- Usuarios, productos, categorías, carrito y sesión se conservan en `localStorage`. Las compras actualizan stock e historial; si una edición reduce el stock por debajo de lo reservado en el carrito, la cantidad se ajusta o el producto se retira si queda sin stock.

Para probar el panel localmente: `admin@duoc.cl` / `Admin123` o `vendedor@duoc.cl` / `Vendedor123`. Las cuentas se crean automáticamente si no existen. Los datos de prueba y credenciales se guardan solo en el navegador; este prototipo no implementa seguridad de producción.