import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'index.ts'),
      name: 'VitePressPluginTypesense',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'vite',
        'vitepress',
        'typesense-docsearch.js',
        'typesense-docsearch-css',
        'gray-matter',
        'cheerio',
        'typesense',
        'fs',
        'path',
        'url',
        'crypto',
      ],
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  plugins: [dts({ rollupTypes: true })],
});
