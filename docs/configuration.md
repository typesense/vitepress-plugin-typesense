---
next:
  text: 'Styling'
  link: '/styling'
---

# Configuration

This page shows how to configure the plugin in more details.

## Using a config file

If you want to pass function options like `transformItems()` or `getMissingResultsUrl()` to the DocSearch component, you would have to use a separate configuration file:

```ts
// typesense.config.ts
// IMPORTANT: import the type only
import type { DocSearchClientConfig } from 'vitepress-plugin-typesense';

export default () =>
  ({
    typesenseCollectionName: 'COLLECTION_NAME',
    typesenseServerConfig: {
      /* YOUR CONFIG */
      /* You can use import.meta.env to access public env variables */
    },
    typesenseSearchParameters: {},
    getMissingResultsUrl({ query }) {
      return `https://example.com/?query=${query}`;
    },
  } satisfies DocSearchClientConfig);
```

Then specify the file path, which is relative to the root directory, in the plugin configuration:

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
          // Make sure to also specify the collection name if configFilePath is used and indexing is enabled.
          // This must match with the collection name in typesense.config.ts
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
You can view the API reference for the DocSearch component [here](https://docsearch.algolia.com/docs/v3/api).
:::

## Indexing documents

You can either enable indexing on VitePress build and the plugin will do the rest for you or use [Typesense DocSearch Scraper](https://typesense.org/docs/guide/docsearch.html#step-1-set-up-docsearch-scraper).

### Built-in indexing

The plugin automatically scans your generated HTML files and indexes them into Typesense whenever you run `vitepress build`. Here are the types for configuring documents indexing on build:

```ts
type IndexingConfig = {
  enabled: boolean;
  hostname?: string; // your VitePress site hostname used to construct links to your docs pages
  typesenseServerConfig: {
    /* server config*/
    /* The api key used here must have write permission*/
  };
  customCollectionSettings?: {
    token_separators?: string[];
    symbols_to_index?: string[];
    field_definitions?: any[];
    enable_nested_fields?: boolean;
  };
  failBuildOnDocumentIndexingError?: boolean; // Default: true
};
```

### Index using DocSearch Scraper

[`typesense-docsearch-scraper`](https://github.com/typesense/typesense-docsearch-scraper) is a crawler that visits your live documentation, extracts the content and pushes it to Typesense.
This approach requires an automation pipeline (e.g., GitHub Actions). Here is a template for the DocSearch Scraper config:

```json
// docsearch.config.json
{
  "index_name": "YOUR_TYPESENSE_COLLECTION_NAME", // make sure this matches your `typesenseCollectionName` in VitePress config, the plugin uses it to query the same Typesense collection that the scraper indexes.
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
If you are running the VitePress site locally and you're using Docker to run the scraper, update the `start_urls` to use your machine's **Network IP address** instead of `localhost`, and include that IP address in `allowed_domains`.

You can find the IP by starting your VitePress dev server with `--host`, e.g.
`npm run docs:dev -- --host`.

```json
// docsearch.config.json
{
  "allowed_domains": ["123.456.7.89"], // replace with your machine's network IP address
  "start_urls": [
    {
      "url": "http://123.456.7.89:4321/"
    }
  ]
  // ... rest of the config
}
```

:::

## i18n

You can configure multi-language support for the search component like this:

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
