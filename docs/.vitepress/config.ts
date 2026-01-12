import { defineConfig, loadEnv } from 'vitepress';
import { TypesenseSearchPlugin } from 'vitepress-plugin-typesense';

const env = loadEnv('production', process.cwd(), '');

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'VitePress plugin Typesense',
  description: 'VitePress plugin Typesense',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting started', link: '/getting-started' },
    ],

    sidebar: [
      {
        text: 'Reference',
        items: [
          { text: 'Getting started', link: '/getting-started' },
          { text: 'Configuration', link: '/configuration' },
          { text: 'Styling', link: '/styling' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
    ],
  },

  locales: {
    root: {
      label: 'English',
      lang: 'en',
    },
    vi: {
      label: 'Vietnamese',
      lang: 'vi', // optional, will be added  as `lang` attribute on `html` tag
    },
  },
  cleanUrls: true,
  vite: {
    plugins: [
      TypesenseSearchPlugin({
        configFilePath: '.vitepress/typesense.config.ts',
        indexing: {
          typesenseCollectionName: 'vitepress-docs',
          enabled: true,
          hostname: 'http://localhost:5173',
          typesenseServerConfig: {
            apiKey: env.TYPESENSE_ADMIN_API_KEY,
            nodes: [{ url: 'http://localhost:8108' }],
          },
        },
      }),
    ],
  },
});
