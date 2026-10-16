# Veterinaria San Marcos

Tienda académica migrada a React, TypeScript y Vite. Las páginas públicas y el panel comparten componentes y una fuente de datos persistida en `localStorage`.

## Desarrollo

Requiere Node.js 20.19+ o 22.12+ y npm.

```sh
npm install
npm run dev
npm run build
```

## Estructura

- `pages/`: entradas HTML multipágina; Vite la usa como raíz web para conservar las rutas actuales.
- `config/`: configuraciones de Vite y TypeScript.
- `src/`: aplicación React, componentes, páginas, tipos, datos y estilos activos.
- `src/styles/legacy/`: hojas CSS del diseño original, importadas por la aplicación mientras se conserva ese estilo.
- `public/images/`: imágenes estáticas servidas directamente por Vite.
- `legacy/js/`: scripts del template anterior, conservados como referencia; la aplicación activa usa React.
- `docs/requisitos/`: pauta, anexo, instrumento y planilla entregados para el proyecto.
- `package.json` y `package-lock.json` permanecen en la raíz como archivos de gestión del proyecto.

## Rutas

- `index.html`: inicio, presentación de la clínica y contacto.
- `catalogo.html`: catálogo con búsqueda, filtros por categoría, detalle y carrito.
- `categorias.html`: navegación del catálogo agrupada por categoría.
- `ofertas.html`: productos con precio promocional.
- `checkout.html` y `compra-resultado.html`: dirección y entrega, pago simulado y resumen de resultado.
- `login.html` y `registro.html`: acceso y creación de cuenta cliente.
- `profile.html`: consulta y edición de datos personales; el rol se muestra y no se puede editar.
- `admin.html`: gestión según el rol activo.

En el checkout, el pago es una simulación local: una tarjeta de prueba que termina en `0002` se rechaza; otras tarjetas válidas y la transferencia simulada se aprueban. No se envían ni almacenan datos de tarjetas y no se procesan pagos reales.

## Permisos

- Administrador: altas, consultas, modificaciones y bajas de productos, categorías y usuarios; asigna roles al crear o editar cuentas.
- Vendedor: consulta productos, modifica stock y crea cuentas de cliente. No administra categorías ni elimina productos o usuarios.
- Cliente: navega el catálogo y realiza compras.
- Cualquier usuario registrado en el flujo público recibe el rol cliente.

Para probar el panel localmente: `admin@duoc.cl` / `Admin123` o `vendedor@duoc.cl` / `Vendedor123`. Las cuentas se crean automáticamente si no existen. Los datos de prueba y credenciales se guardan solo en el navegador; este prototipo no implementa seguridad de producción.
