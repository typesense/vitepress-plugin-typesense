import { defineConfig, loadEnv } from 'vitepress';
import { TypesenseSearchPlugin } from 'vitepress-plugin-typesense';

const env = loadEnv('production', process.cwd(), '');

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'VitePress plugin Typesense',
  description: 'VitePress plugin Typesense',
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
