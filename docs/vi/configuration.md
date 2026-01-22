---
next:
  text: 'Tùy chỉnh giao diện'
  link: '/vi/styling'
---

# Cấu hình

Trang này hướng dẫn cách cấu hình plugin một cách chi tiết hơn.

## Sử dụng tệp cấu hình

Nếu bạn muốn truyền các tùy chọn dạng hàm như `transformItems()` hoặc `getMissingResultsUrl()` vào component DocSearch, bạn sẽ phải sử dụng một tệp cấu hình riêng biệt:

```ts
// typesense.config.ts
// QUAN TRỌNG: phải import dưới dạng type
import type { DocSearchClientConfig } from 'vitepress-plugin-typesense';

export default () =>
  ({
    typesenseCollectionName: 'COLLECTION_NAME',
    typesenseServerConfig: {
      /* CẤU HÌNH CỦA BẠN */
      /* Có thể dùng import.meta.env để truy cập các public env variables */
    },
    typesenseSearchParameters: {},
    getMissingResultsUrl({ query }) {
      return `https://example.com/?query=${query}`;
    },
  } satisfies DocSearchClientConfig);
```

Sau đó chỉ định đường dẫn tệp (tương đối so với thư mục gốc) trong cấu hình plugin:

```ts{8,10-13}
// docs/.vitepress/config.ts
import { defineConfig } from 'vitepress';
import { TypesenseSearchPlugin } from 'vitepress-plugin-typesense';

export default defineConfig({
  vite: {
    plugins: [
      TypesenseSearchPlugin({
        configFilePath: '.vitepress/typesense.config.ts',
        indexing: {
          // Đảm bảo cũng chỉ định tên bộ sưu tập (collection name) nếu configFilePath được sử dụng và tính năng indexing được bật.
          // Tên này phải khớp với tên bộ sưu tập trong typesense.config.ts
          typesenseCollectionName: 'vitepress-docs',
          enabled: true,
          // ...
        },
      }),
    ],
  },
});
```

::: info
Bạn có thể xem tài liệu tham khảo API cho component DocSearch [tại đây](https://docsearch.algolia.com/docs/v3/api).
:::

## Lập chỉ mục (Indexing) tài liệu

Bạn có thể bật tính năng lập chỉ mục khi build VitePress và plugin sẽ lo phần còn lại, hoặc sử dụng [Typesense DocSearch Scraper](https://typesense.org/docs/guide/docsearch.html#step-1-set-up-docsearch-scraper).

### Tính năng lập chỉ mục tích hợp sẵn

Plugin sẽ tự động quét các tệp HTML đã được tạo và lập chỉ mục chúng vào Typesense mỗi khi bạn chạy lệnh vitepress build. Dưới đây là các kiểu dữ liệu (types) để cấu hình việc lập chỉ mục tài liệu khi build:

```ts
type IndexingConfig = {
  enabled: boolean;
  hostname?: string; // hostname trang VitePress của bạn, được dùng để tạo liên kết đến các trang tài liệu
  typesenseServerConfig: {
    /* cấu hình server */
    /* Api key được sử dụng ở đây phải có quyền ghi (write permission) */
  };
  customCollectionSettings?: {
    token_separators?: string[];
    symbols_to_index?: string[];
    field_definitions?: any[];
    enable_nested_fields?: boolean;
  };
  failBuildOnDocumentIndexingError?: boolean; // Mặc định: true
};
```

### Lập chỉ mục bằng DocSearch Scraper

[`typesense-docsearch-scraper`](https://github.com/typesense/typesense-docsearch-scraper) là một trình crawler truy cập vào trang tài liệu đang hoạt động của bạn, trích xuất nội dung và tải dữ liệu đó lên Typesense.
Cách tiếp cận này yêu cầu một pipeline tự động hóa (ví dụ: GitHub Actions). Dưới đây là một mẫu cấu hình cho DocSearch Scraper:

```json
// docsearch.config.json
{
  "index_name": "YOUR_TYPESENSE_COLLECTION_NAME", // đảm bảo tên này khớp với `typesenseCollectionName` trong cấu hình VitePress, plugin sử dụng nó để truy vấn cùng một bộ sưu tập Typesense mà scraper đã lập chỉ mục.
  "start_urls": [
    {
      "url": "YOUR_DOCUMENTATION_SITE_URL"
    }
  ],
  "selectors": {
    "default": {
      "lvl0": ".VPNavBarTitle",
      "lvl1": ".vp-doc h1",
      "lvl2": ".vp-doc h2",
      "lvl3": ".vp-doc h3",
      "lvl4": ".vp-doc h4",
      "lvl5": ".vp-doc h5",
      "lvl6": ".vp-doc h6",
      "text": ".vp-doc p, .vp-doc ul li, .vp-doc ol li, .vp-doc table tbody tr"
    }
  },
  "strip_chars": " .,;:#",
  "scrape_start_urls": false
}
```

::: tip
Nếu bạn đang chạy trang VitePress cục bộ (local) và sử dụng Docker để chạy scraper, hãy cập nhật `start_urls` để sử dụng **Địa chỉ IP Mạng** của máy bạn thay vì `localhost`, và thêm địa chỉ IP đó vào `allowed_domains`.

Bạn có thể tìm địa chỉ IP bằng cách khởi động server dev VitePress với cờ `--host`, ví dụ:
`npm run docs:dev -- --host`.

```json
// docsearch.config.json
{
  "allowed_domains": ["123.456.7.89"], // thay thế bằng địa chỉ IP mạng máy của bạn
  "start_urls": [
    {
      "url": "http://123.456.7.89:4321/"
    }
  ]
  // ... phần còn lại của cấu hình
}
```

:::

## Đa ngôn ngữ (i18n)

Bạn có thể cấu hình hỗ trợ đa ngôn ngữ cho component tìm kiếm như sau:

```ts
export default defineConfig({
  vite: {
    plugins: [
      TypesenseSearchPlugin({
        locales: {
          vi: {
            button: {
              buttonText: 'Tìm kiếm',
              buttonAriaLabel: 'Tìm kiếm',
            },
            modal: {
              searchBox: {
                resetButtonTitle: 'Xóa từ khóa',
                resetButtonAriaLabel: 'Xóa từ khóa',
                cancelButtonText: 'Hủy',
                cancelButtonAriaLabel: 'Hủy',
              },
              startScreen: {
                recentSearchesTitle: 'Gần đây',
                noRecentSearchesText: 'Không có tìm kiếm gần đây',
                saveRecentSearchButtonTitle: 'Lưu tìm kiếm này',
                removeRecentSearchButtonTitle: 'Xóa tìm kiếm này khỏi lịch sử',
                favoriteSearchesTitle: 'Yêu thích',
                removeFavoriteSearchButtonTitle:
                  'Xóa tìm kiếm này khỏi mục yêu thích',
              },
              errorScreen: {
                titleText: 'Không thể tải kết quả',
                helpText: 'Vui lòng kiểm tra kết nối mạng của bạn.',
              },
              footer: {
                selectText: 'Chọn',
                selectKeyAriaLabel: 'Phím Enter',
                navigateText: 'Di chuyển',
                navigateUpKeyAriaLabel: 'Mũi tên lên',
                navigateDownKeyAriaLabel: 'Mũi tên xuống',
                closeText: 'Đóng',
                closeKeyAriaLabel: 'Phím Esc',
                searchByText: 'Cung cấp bởi',
              },
              noResultsScreen: {
                noResultsText: 'Không có kết quả cho',
                suggestedQueryText: 'Thử tìm kiếm với',
                reportMissingResultsText:
                  'Bạn tin rằng truy vấn này nên trả về kết quả?',
                reportMissingResultsLinkText: 'Hãy cho chúng tôi biết.',
              },
            },
          },
        },
      }),
    ],
  },
});
```
