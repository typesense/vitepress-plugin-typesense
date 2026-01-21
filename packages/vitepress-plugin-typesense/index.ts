import type { Plugin } from 'vite';
import fs from 'fs';
import matter from 'gray-matter';
import type docsearch from 'typesense-docsearch.js';
import type { SiteConfig } from 'vitepress';
import { TypesenseHelper } from './typesenseHelper.ts';
import { IndexingStrategy } from './indexingStrategy.ts';
import type { CustomSettings } from './types';
import path from 'path';
import { fileURLToPath } from 'url';

const VIRTUAL_MODULE_ID = 'virtual:typesense-config';
const RESOLVED_VIRTUAL_ID = '\0' + VIRTUAL_MODULE_ID;

export type DocSearchClientConfig =
  | Omit<
      Parameters<typeof docsearch>[0],
      'container' | 'translations' | 'typesenseSearchParameters'
    > &
      DocSearchLocales & {
        typesenseSearchParameters?: Parameters<
          typeof docsearch
        >[0]['typesenseSearchParameters'];
      };

export type TypesensePluginConfig =
  | (DocSearchClientConfig & {
      configFilePath?: never;
      indexing?: IndexingConfig & {
        typesenseCollectionName?: never;
      };
    })
  | {
      configFilePath: string;
      indexing?: IndexingConfig & { typesenseCollectionName: string };
    };

type DocSearchLocales = {
  locales?: {
    [locale: string]: Parameters<typeof docsearch>[0]['translations'];
  };
};

type IndexingConfig = {
  enabled: boolean;
  hostname?: string;
  typesenseServerConfig: Parameters<
    typeof docsearch
  >[0]['typesenseServerConfig'];
  customCollectionSettings?: CustomSettings;
  failBuildOnDocumentIndexingError?: boolean;
};
let vitepressConfigDir: string;

export function TypesenseSearchPlugin(options: TypesensePluginConfig): Plugin {
  let hasIndexed = false;

  return {
    name: 'vitepress-plugin-typesense',

    configResolved(config: any) {
      vitepressConfigDir = config.root;

      if (!options.indexing?.enabled) return;

      if (options.configFilePath && !options.indexing.typesenseCollectionName)
        return console.error(
          '`indexing.typesenseCollectionName` must be set when using `configFilePath`',
        );

      const vitepressConfig: SiteConfig = config.vitepress;

      if (!vitepressConfig) {
        return;
      }

      const collectionName = options.configFilePath
        ? options.indexing.typesenseCollectionName
        : (options as DocSearchClientConfig).typesenseCollectionName;

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

        if (rest.configFilePath) {
          const normalizePath = (filePath: string) => {
            const absolutePath = path.isAbsolute(filePath)
              ? filePath
              : path.resolve(vitepressConfigDir, filePath);
            return JSON.stringify(absolutePath);
          };

          return `export { default } from ${normalizePath(
            rest.configFilePath,
          )};`;
        }
        return `export default () => (${JSON.stringify(rest)});`;
      }
    },

    config() {
      // Logic to find the current directory in both ESM and CJS
      let dir = '';
      if (typeof __dirname !== 'undefined') {
        dir = __dirname;
      } else {
        dir = path.dirname(fileURLToPath(import.meta.url));
      }

      return {
        resolve: {
          alias: {
            './VPNavBarSearch.vue': path.join(dir, 'Search.vue'),
            './VPNavBarSearchButton.vue': path.join(dir, 'SearchButton.vue'),
          },
        },
      };
    },
  };
}

async function buildEnd(
  siteConfig: SiteConfig,
  typesenseCollectionAlias: string,
  options?: IndexingConfig,
) {
  if (!options?.enabled) return;

  console.log('⚡ [Typesense] Starting indexing process...');

  const timestamp = Date.now();
  const collectionNameTmp = `${typesenseCollectionAlias}_${timestamp}`;

  const helper = new TypesenseHelper(
    options.typesenseServerConfig,
    typesenseCollectionAlias,
    collectionNameTmp,
    options.customCollectionSettings || null,
  );
  const strategy = new IndexingStrategy();

  try {
    await helper.init();
    await helper.createTmpCollection();

    const allRecords = [];
    const { pages, srcDir, outDir, cleanUrls, site } = siteConfig;

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
          `⚠️ [Typesense] Could not find generated file: ${htmlPath}`,
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

      const fullUrl = `${options.hostname || ''}/${publicUrlPath}`.replace(
        /([^:]\/)\/+/g,
        '$1',
      ); // clean double slashes

      // Determine language
      let docLang = 'en-US';
      if (site.locales?.root?.lang) {
        docLang = site.locales.root.lang;
      } else if (site.lang) {
        docLang = site.lang;
      }

      if (site.locales) {
        // pages are paths like "getting-started.md" or "vi/getting-started.md"
        const firstSegment = page.split('/')[0];

        // Check if the first directory segment matches a defined locale key (e.g. "vi")
        // If the file is at the root (e.g. "getting-started.md"), firstSegment is the filename itself,
        // which won't match a locale key in site.locales.
        if (
          firstSegment &&
          firstSegment !== 'root' &&
          site.locales[firstSegment]
        ) {
          docLang = site.locales[firstSegment]?.lang || firstSegment;
        }
      }
      // Scrape
      const pageRecords = strategy.getRecords(
        htmlContent,
        fullUrl,
        frontmatter,
        docLang,
      );
      allRecords.push(...pageRecords);
    }
    // Upload & Commit
    console.log(`⚡ [Typesense] Uploading ${allRecords.length} records...`);
    await helper.addRecords(allRecords, options.hostname || '', false);
    await helper.commitTmpCollection();

    console.log('✅ [Typesense] Indexing Complete.');
  } catch (error) {
    console.error('❌ [Typesense] Indexing Failed:');
    if (options.failBuildOnDocumentIndexingError != false) {
      process.exitCode = 1;
      console.log(
        'failBuildOnDocumentIndexingError is not set to false, exiting build...',
      );
      throw error;
    } else console.log(error);
  }
}
