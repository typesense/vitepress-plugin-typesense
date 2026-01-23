import { defineConfig, loadEnv } from 'vitepress';
import { TypesenseSearchPlugin } from 'vitepress-plugin-typesense';
import { COLLECTION_NAME } from './typesense.config';

const env = loadEnv('', process.cwd() + '/docs', '');

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'VitePress plugin Typesense',
  description:
    'A VitePress plugin that integrates Typesense with the DocSearch interface to add lightning-fast, typo-tolerant search to your VitePress documentation site.',
  head: [['link', { rel: 'icon', href: '/favicon.png' }]],
  cleanUrls: true,

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/typesense/vitepress-plugin-typesense',
      },
    ],
  },

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
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
      },
    },
    vi: {
      label: 'Vietnamese',
      lang: 'vi',
      themeConfig: {
        nav: [
          { text: 'Trang chủ', link: '/vi' },
          { text: 'Bắt đầu', link: '/vi/getting-started' },
        ],
        sidebar: [
          {
            text: 'Tham khảo',
            items: [
              { text: 'Bắt đầu', link: '/vi/getting-started' },
              { text: 'Cấu hình', link: '/vi/configuration' },
              { text: 'Giao diện', link: '/vi/styling' },
            ],
          },
        ],
      },
    },
  },
  vite: {
    plugins: [
      TypesenseSearchPlugin({
        configFilePath: '.vitepress/typesense.config.ts',
        indexing: {
          typesenseCollectionName: COLLECTION_NAME,
          enabled: true,
          typesenseServerConfig: {
            apiKey: env.TYPESENSE_ADMIN_API_KEY || 'xyz',
            nodes: [
              {
                url:
                  env.VITE_PUBLIC_TYPESENSE_NEAREST_NODE_URL ||
                  'http://localhost:8108',
              },
            ],
          },
        },
      }),
    ],
  },
});
