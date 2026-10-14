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

Para probar el panel localmente: `admin@duoc.cl` / `Admin123` o `vendedor@duoc.cl` / `Vendedor123`. Las cuentas se crean automáticamente si no existen. Los datos de prueba y credenciales se guardan solo en el navegador; este prototipo no implementa seguridad de producción.