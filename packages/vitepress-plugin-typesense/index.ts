import type { Plugin } from 'vite';
import fs from 'fs';
import matter from 'gray-matter';
import type docsearch from 'typesense-docsearch.js';
import type { SiteConfig } from 'vitepress';
import { TypesenseHelper } from './typesenseHelper.js';
import { IndexingStrategy } from './indexingStrategy.js';
import type { CustomSettings } from './types';
import path from 'path';

const VIRTUAL_MODULE_ID = 'virtual:typesense-config';
const RESOLVED_VIRTUAL_ID = '\0' + VIRTUAL_MODULE_ID;

export type DocSearchClientConfig =
  | Omit<Parameters<typeof docsearch>[0], 'container' | 'translations'> &
      DocSearchLocales;

export type TypesensePluginConfig = (
  | DocSearchClientConfig
  | { configFilePath: string }
) &
  IndexingConfig;

type DocSearchLocales = {
  locales?: {
    [locale: string]: Parameters<typeof docsearch>[0]['translations'];
  };
};

type IndexingConfig = {
  indexing?: {
    typesenseCollectionName?: string;
    enabled: boolean;
    hostname: string;
    typesenseServerConfig: Parameters<
      typeof docsearch
    >[0]['typesenseServerConfig'];
    customCollectionSettings?: CustomSettings;
    failBuildOnDocumentIndexingError?: boolean;
  };
};
let vitepressConfigDir: string;

export function TypesenseSearchPlugin(options: TypesensePluginConfig): Plugin {
  let hasIndexed = false;

  return {
    name: 'vitepress-plugin-typesense',

    configResolved(config: any) {
      vitepressConfigDir = config.root;

      if (!options.indexing?.enabled) return;

      if (
        'configFilePath' in options &&
        !options.indexing.typesenseCollectionName
      )
        return console.error(
          '`indexing.typesenseCollectionName` must be set when using `configFilePath`'
        );

      const vitepressConfig: SiteConfig = config.vitepress;

      if (!vitepressConfig) {
        return;
      }

      const collectionName =
        'configFilePath' in options
          ? options.indexing.typesenseCollectionName!
          : options.typesenseCollectionName;

      const previousBuildEnd = vitepressConfig.buildEnd;

      vitepressConfig.buildEnd = async (siteConfig: any) => {
        if (previousBuildEnd) {
          await previousBuildEnd(siteConfig);
        }

        if (!hasIndexed) {
          hasIndexed = true;
          await buildEnd(siteConfig, collectionName, options.indexing);
        }
      };
    },

    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) return RESOLVED_VIRTUAL_ID;
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_ID) {
        const { indexing, ...rest } = options;

        if ('configFilePath' in rest) {
          const normalizePath = (filePath: string) => {
            const absolutePath = path.isAbsolute(filePath)
              ? filePath
              : path.resolve(vitepressConfigDir, filePath);
            return JSON.stringify(absolutePath);
          };

          return `export { default } from ${normalizePath(
            rest.configFilePath
          )};`;
        }
        return `export default ${JSON.stringify(rest)};`;
      }
    },

    config() {
      return {
        resolve: {
          alias: {
            './VPNavBarSearch.vue': new URL('./Search.vue', import.meta.url)
              .pathname,
            './VPNavBarSearchButton.vue': new URL(
              './SearchButton.vue',
              import.meta.url
            ).pathname,
          },
        },
      };
    },
  };
}

async function buildEnd(
  siteConfig: SiteConfig,
  typesenseCollectionAlias: string,
  options?: IndexingConfig['indexing']
) {
  if (!options?.enabled) return;

  console.log('⚡ [Typesense] Starting indexing process...');

  const timestamp = Date.now();
  const collectionNameTmp = `${typesenseCollectionAlias}_${timestamp}`;

  const helper = new TypesenseHelper(
    options.typesenseServerConfig,
    typesenseCollectionAlias,
    collectionNameTmp,
    options.customCollectionSettings || null
  );
  const strategy = new IndexingStrategy();

  try {
    await helper.init();
    await helper.createTmpCollection();

    const allRecords = [];
    const { pages, srcDir, outDir, cleanUrls } = siteConfig;

    // Iterate over source files to get Metadata
    for (const page of pages) {
      if (page === '404.md') continue;

      // Read Frontmatter from Source (to check `search: false`)
      const srcPath = path.join(srcDir, page);
      const srcContent = fs.readFileSync(srcPath, 'utf-8');
      const { data: frontmatter } = matter(srcContent);

      if (frontmatter.search === false) continue;

      // Resolve Output HTML Path
      // logic: foo.md -> foo.html OR foo/index.html (if cleanUrls)
      let htmlFileName = page.replace(/\.md$/, '.html');

      const htmlPath = path.join(outDir, htmlFileName);

      // Read the compiled HTML
      if (!fs.existsSync(htmlPath)) {
        console.warn(
          `⚠️ [Typesense] Could not find generated file: ${htmlPath}`
        );
        continue;
      }

      const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

      // Construct the Public URL
      // If cleanUrls is true:  /guide/intro.html -> /guide/intro
      // If cleanUrls is false: /guide/intro.html -> /guide/intro.html
      let publicUrlPath = page.replace(/\.md$/, '');
      if (!cleanUrls && publicUrlPath !== 'index') {
        publicUrlPath += '.html';
      }

      // Handle index pages (e.g. /section/index -> /section/)
      if (publicUrlPath.endsWith('index')) {
        publicUrlPath = publicUrlPath.replace(/index$/, '');
      }

      const fullUrl = `${options.hostname}/${publicUrlPath}`.replace(
        /([^:]\/)\/+/g,
        '$1'
      ); // clean double slashes

      // Scrape
      const pageRecords = strategy.getRecords(
        htmlContent,
        fullUrl,
        frontmatter
      );
      allRecords.push(...pageRecords);
    }
    // Upload & Commit
    console.log(`⚡ [Typesense] Uploading ${allRecords.length} records...`);
    await helper.addRecords(allRecords, options.hostname, false);
    await helper.commitTmpCollection();

    console.log('✅ [Typesense] Indexing Complete.');
  } catch (error) {
    console.error('❌ [Typesense] Indexing Failed:', error);
    if (options.failBuildOnDocumentIndexingError != false) process.exit(1);
  }
}
