# VitePress Plugin Typesense 🔎⚡️

A VitePress plugin that integrates Typesense with the DocSearch interface to add lightning-fast, typo-tolerant search to your VitePress documentation site.

![Plugin demo](../../assets/screenshot.png 'Plugin demo')

## Getting Started

Check out the [Getting Started Guide](https://vitepress-plugin.typesense.org/) to add Typesense search to your VitePress site quickly.

## About Typesense & VitePress

[**Typesense**](https://typesense.org/) is an open-source, lightning-fast search engine that delivers instant, typo-tolerant results with minimal setup. It's an open source alternative to Algolia and an easier-to-use alternative to ElasticSearch.

[**VitePress**](https://vitepress.dev/) is a Static Site Generator (SSG) designed for building fast, content-centric websites.

Together, **Typesense**, **VitePress** and [**DocSearch**](https://github.com/typesense/typesense-docsearch.js) provide a seamless way to add powerful, blazingly-fast search to modern websites.

## Indexing Your Documentation

To enable search, your documentation content must be indexed into Typesense. You can choose between two methods:

- [**Built-in Indexing (Recommended):**](https://vitepress-plugin.typesense.org/configuration#built-in-indexing)
  The plugin automatically scans your generated HTML files and indexes them into Typesense whenever you run `vitepress build`. This is the easiest setup as it requires no external tools.

- [**External Scraper:**](https://vitepress-plugin.typesense.org/configuration#index-using-docsearch-scraper)
  You can use the official [`typesense-docsearch-scraper`](https://github.com/typesense/typesense-docsearch-scraper). This is a crawler that visits your live documentation, extracts content (titles, headings, paragraphs), and pushes it to Typesense. This approach requires an automation pipeline (e.g., GitHub Actions).

## License

Licensed under the MIT License, Copyright © Typesense.

See [LICENSE](../../LICENSE) for more information.
