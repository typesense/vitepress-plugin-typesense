import { defineConfig } from 'vitepress';
import { TypesenseSearchPlugin } from '../../src/index';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'VitePress plugin Typesense',
  description: 'VitePress plugin Typesense',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' },
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
    ],
  },
  cleanUrls: true,
  vite: {
    plugins: [
      TypesenseSearchPlugin({
        typesenseCollectionName: 'vitepress-docs',
        typesenseServerConfig: {
          apiKey: 'xyz',
          nodes: [{ url: 'http://localhost:8108' }],
        },
        typesenseSearchParameters: {},
        indexing: {
          enabled: true,
          hostname: 'http://localhost:5173',
          typesenseServerConfig: {
            apiKey: 'xyz',
            nodes: [{ url: 'http://localhost:8108' }],
          },
        },
      }),
    ],
  },
});
