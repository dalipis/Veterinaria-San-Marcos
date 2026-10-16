import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const configDir = dirname(fileURLToPath(import.meta.url));
const projectDir = resolve(configDir, '..');
const pagesDir = resolve(projectDir, 'pages');
const pageNames = new Set(['index', 'catalogo', 'categorias', 'ofertas', 'checkout', 'compra-resultado', 'login', 'registro', 'admin', 'profile']);

const pageRoutes = {
  name: 'page-routes-from-pages-folder',
  configureServer(server: { middlewares: { use: (handler: (request: { url?: string }, response: unknown, next: () => void) => void) => void } }) {
    server.middlewares.use((request, _response, next) => {
      if (!request.url) return next();
      const separator = request.url.indexOf('?');
      const pathname = separator === -1 ? request.url : request.url.slice(0, separator);
      const suffix = separator === -1 ? '' : request.url.slice(separator);
      const pageName = pathname === '/' ? 'index' : pathname.match(/^\/([^/]+)\.html$/)?.[1];
      if (pageName && pageNames.has(pageName)) request.url = `/pages/${pageName}.html${suffix}`;
      next();
    });
  },
};

const flattenBuiltPages: Plugin = {
  name: 'flatten-built-pages',
  enforce: 'post',
  generateBundle(_options, bundle) {
    for (const [fileName, output] of Object.entries(bundle)) {
      if (!fileName.startsWith('pages/') || !fileName.endsWith('.html') || output.type !== 'asset') continue;
      delete bundle[fileName];
      this.emitFile({ type: 'asset', fileName: fileName.slice('pages/'.length), source: output.source });
    }
  },
};

export default defineConfig({
  plugins: [pageRoutes, react(), flattenBuiltPages],
  build: {
    rollupOptions: {
      input: {
        index: resolve(pagesDir, 'index.html'),
        catalogo: resolve(pagesDir, 'catalogo.html'),
        categorias: resolve(pagesDir, 'categorias.html'),
        ofertas: resolve(pagesDir, 'ofertas.html'),
        checkout: resolve(pagesDir, 'checkout.html'),
        compraResultado: resolve(pagesDir, 'compra-resultado.html'),
        login: resolve(pagesDir, 'login.html'),
        registro: resolve(pagesDir, 'registro.html'),
        admin: resolve(pagesDir, 'admin.html'),
        profile: resolve(pagesDir, 'profile.html'),
      },
    },
  },
});