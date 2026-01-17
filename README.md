# VitePress Plugin Typesense 🔎⚡️

A VitePress plugin that integrates Typesense with the DocSearch interface to add lightning-fast, typo-tolerant search to your VitePress documentation site.

![Plugin demo](assets/screenshot.png 'Plugin demo')

## About Typesense & VitePress

[**Typesense**](https://typesense.org/) is an open-source, lightning-fast search engine that delivers instant, typo-tolerant results with minimal setup. It's an open source alternative to Algolia and an easier-to-use alternative to ElasticSearch.

[**VitePress**](https://vitepress.dev/) is a Static Site Generator (SSG) designed for building fast, content-centric websites.

Together, **Typesense**, **VitePress** and [**DocSearch**](https://github.com/typesense/typesense-docsearch.js) provide a seamless way to add powerful, blazingly-fast search to modern websites.

## Indexing Your Documentation

To power the search experience, you'll need to index your site's content into Typesense.

The [`typesense-docsearch-scraper`](https://github.com/typesense/typesense-docsearch-scraper) is a crawler that scans your documentation pages, extracts structured content (like titles, headings, and paragraphs), and uploads it into your Typesense collection.

You can run the scraper manually or automate it (e.g. via GitHub Actions) so that your search index stays up-to-date as your docs evolve.

## Getting Started

Check out the [Getting Started Guide](https://vitepress-plugin.typesense.org/) to add Typesense search to your VitePress site quickly.

## License

Licensed under the MIT License, Copyright © Typesense.

See [LICENSE](/LICENSE) for more information.
