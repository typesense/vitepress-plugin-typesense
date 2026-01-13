---
next:
  text: 'Cấu hình'
  link: '/vi/configuration'
---

# Bắt đầu

## Demo

Trang tài liệu này được xây dựng bằng VitePress và trải nghiệm tìm kiếm được cung cấp bởi Typesense. Nhấp vào biểu tượng tìm kiếm để trải nghiệm thử plugin này!

## Cài đặt

Bạn có thể cài đặt plugin bằng cách chạy lệnh sau:

::: code-group

```sh [npm]
$ npm add vitepress-plugin-typesense
```

```sh [pnpm]
$ pnpm add vitepress-plugin-typesense
```

```sh [yarn]
$ yarn add vitepress-plugin-typesense
```

```sh [bun]
$ bun add vitepress-plugin-typesense
```

:::

Cấu hình plugin trong tệp `.vitepress/config.ts` của bạn.

```ts
import { defineConfig, loadEnv } from 'vitepress';

const env = loadEnv('production', process.cwd(), '');

export default defineConfig({
  vite: {
    plugins: [
      TypesenseSearchPlugin({
        typesenseCollectionName: 'YOUR_COLLECTION_NAME',
        typesenseServerConfig: {
          apiKey: 'YOUR_SEARCH_ONLY_API_KEY',
          nodes: [{ url: 'YOUR_TYPESENSE_URL' }],
        },
        typesenseSearchParameters: {},
        // khi `indexing` được kích hoạt, các trang sẽ tự động được lập chỉ mục vào Typesense khi vitepress buildEnd
        indexing: {
          enabled: true,
          hostname: 'YOUR_DOCUMENTATION_SITE_URL',
          typesenseServerConfig: {
            apiKey: env.TYPESENSE_ADMIN_API_KEY, // api key của bạn với quyền ghi, hãy tạo một tệp .env trong thư mục gốc của bạn
            nodes: [{ url: 'YOUR_TYPESENSE_URL' }],
            // cấu hình timeout, v.v...
          },
        },
      }),
    ],
  },
});
```

Chạy lệnh build VitePress để đưa dữ liệu các trang vào Typesense:
::: code-group

```sh [npm]
$ npm run docs:build
```

```sh [pnpm]
$ pnpm docs:build
```

```sh [yarn]
$ yarn docs:build
```

```sh [bun]
$ bun docs:build
```

:::

Và thế là xong! Bạn có thể [khởi động máy chủ phát triển](https://vitepress.dev/guide/getting-started#up-and-running) để xem trước plugin hoạt động.
