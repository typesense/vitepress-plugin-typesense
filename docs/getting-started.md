---
next:
  text: 'Configuration'
  link: '/configuration'
---

# Getting Started

## Demo

This documentation site is built using VitePress and the search experience is powered by Typesense. Click on the search icon to try the plugin out!

## Installation

You can install the plugin by running the following command:

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

Configure the plugin in your `.vitepress/config.ts` file.

```ts
import { defineConfig, loadEnv } from 'vitepress';

const env = loadEnv('', process.cwd() + '/docs', '');

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
        // when `indexing` is enabled, the pages will be automatically indexed into Typesense on vitepress buildEnd
        indexing: {
          enabled: true,
          hostname: 'YOUR_DOCUMENTATION_SITE_URL',
          typesenseServerConfig: {
            apiKey: env.TYPESENSE_ADMIN_API_KEY, // your api key with write permission, create a .env file in your /docs directory
            nodes: [{ url: 'YOUR_TYPESENSE_URL' }],
            // timeout config, etc...
          },
        },
      }),
    ],
  },
});
```

Run the VitePress build command to populate the pages into Typesense:
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

And that's it! You can [start the development server](https://vitepress.dev/guide/getting-started#up-and-running) to preview the plugin in action.
