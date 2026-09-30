import { defineConfig, type Plugin } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import fs from 'node:fs';
import path from 'node:path';

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
    watch: process.argv.includes('--watch')
      ? { exclude: ['dist/**', 'public/**', 'node_modules/**'] }
      : undefined,
  },
  plugins: [
    dts({ rollupTypes: true }),
    vue(),
    copyAndWatchFiles(['Search.vue', 'SearchButton.vue']),
  ],
});

function copyAndWatchFiles(files: string[]): Plugin {
  return {
    name: 'copy-and-watch-files',
    buildStart() {
      for (const file of files) {
        this.addWatchFile(path.resolve(file));
      }
    },
    generateBundle() {
      for (const file of files) {
        const filePath = path.resolve(file);
        if (fs.existsSync(filePath)) {
          this.emitFile({
            type: 'asset',
            fileName: path.basename(file),
            source: fs.readFileSync(filePath, 'utf-8'),
          });
        }
      }
    },
  };
}
