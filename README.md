# Veterinaria San Marcos

Tienda académica construida con React 19, TypeScript, Vite y React Router. Los datos del catálogo, usuarios y compras provienen de la API Spring Boot; la sesión se mantiene en memoria y se autentica con cookies `HttpOnly`.

## Desarrollo

Requiere Node.js 20.19+ o 22.12+ y npm.

```sh
npm install
npm run dev
npm run lint
npm run build
```

## Estructura

- `index.html`: única entrada HTML de la aplicación React.
- `src/App.tsx`: proveedores globales y árbol de rutas.
- `src/pages/`: una página por archivo, incluyendo catálogo, login, perfil y panel.
- `src/components/`: guards para rutas con sesión y permisos de personal.
- `src/layout/`: navbar, layout de página, footer, carrito, historial y scroll.
- `src/contexts/`: estado en memoria compartido de productos, sesión, carrito y notificaciones.
- `src/ui/`: piezas visuales reutilizables, como las tarjetas y el detalle del producto.
- `src/services/`: cliente REST, adaptación de respuestas y renovación segura de sesión.
- `src/constants/`, `src/data/`, `src/utils/` y `src/types/`: opciones, catálogo inicial, formato y tipos de dominio.
- `src/styles/`: estilos activos de la interfaz, incluidos los estilos heredados que se mantienen en uso.
- `config/`: configuraciones de Vite y TypeScript.
- `public/images/`: imágenes estáticas servidas directamente por Vite.
- `docs/requisitos/`: pauta, anexo, instrumento y planilla entregados para el proyecto.
- `package.json` y `package-lock.json` permanecen en la raíz como archivos de gestión del proyecto.

## Rutas

- `/` e `/index.html`: inicio, presentación de la clínica y contacto.
- `catalogo.html`: catálogo con búsqueda, filtros por categoría, detalle y carrito.
- `categorias.html`: navegación del catálogo agrupada por categoría.
- `ofertas.html`: productos con precio promocional.
- `checkout.html` y `compra-resultado.html`: dirección y entrega, pago simulado y resumen de resultado.
- `login.html` y `registro.html`: acceso y creación de cuenta cliente.
- `profile.html`: consulta y edición de datos personales; el rol se muestra y no se puede editar.
- `admin.html`: gestión según el rol activo.

En el checkout, el pago es una simulación local: una tarjeta de prueba que termina en `0002` se rechaza; otras tarjetas válidas y la transferencia simulada se aprueban. No se envían ni almacenan datos de tarjetas y no se procesan pagos reales.

Las rutas antiguas con extensión `.html` se conservan dentro de React Router para no romper enlaces, accesos guardados ni el flujo de checkout.

## Permisos

- Administrador: altas, consultas, modificaciones y bajas de productos, categorías y usuarios; asigna roles al crear o editar cuentas.
- Vendedor: consulta productos, modifica stock y crea cuentas de cliente. No administra categorías ni elimina productos o usuarios.
- Cliente: navega el catálogo y realiza compras.
- Cualquier usuario registrado en el flujo público recibe el rol cliente.

Para probar el panel localmente: `admin@duoc.cl` / `Admin123` o `vendedor@duoc.cl` / `Vendedor123`. El backend crea cuentas de demostración al iniciar cuando el seed está habilitado.

## Integración con backend

El frontend está preparado para consumir una API REST mediante `src/services/api.ts`.

1. Inicia el backend Spring Boot con MariaDB y configura `JWT_SECRET`.
2. Copia `.env.example` como `.env` y configura `VITE_API_URL` con la URL base del backend (por defecto `http://localhost:8080`).
3. Reinicia Vite después de cambiar la variable.
4. El frontend consume `/api/v1` para autenticación, usuarios, productos, categorías, compras, reportes y renovación de sesión. El backend debe permitir credenciales para el origen del frontend.

No hay modo simulado: si el backend no está disponible, la interfaz muestra el error de conexión en vez de usar datos ficticios. El access token y el refresh token se guardan en cookies `HttpOnly`; el frontend recupera la sesión desde `/auth/me` y no almacena tokens en Web Storage. Las solicitudes mutables incluyen protección CSRF. Para despliegues HTTPS, configura `COOKIE_SECURE=true` en el backend. El carrito permanece en memoria.
