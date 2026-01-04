<template>
  <div class="typesense-search-wrapper">
    <div id="typesense-search" role="search"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import 'typesense-docsearch-css';
import type { DocSearchClientParams } from '.';
import { useData } from 'vitepress';
// @ts-ignore
import config from 'virtual:typesense-config';

const { lang } = useData();

const loadDocSearch = (newLang: string) =>
  // @ts-ignore there is no type declaration for umd import
  import('typesense-docsearch.js/dist/umd').then((docsearch) => {
    const { locales, ...rest }: DocSearchClientParams = config;
    console.log(rest);
    docsearch.default(
      Object.assign({}, rest, {
        container: '#typesense-search',
        translations: locales?.[newLang],
      })
    );
  });

onMounted(() => loadDocSearch(lang.value));
watch(
  () => lang.value,
  (newLang: string) => loadDocSearch(newLang)
);
</script>
<style>
.typesense-search-wrapper {
  flex-grow: 1;
}

@media (min-width: 768px) {
  .typesense-search-wrapper {
    flex-grow: 1;
  }

  :where([dir='ltr']) .typesense-search-wrapper {
    padding-left: 24px;
  }

  :where([dir='rtl']) .typesense-search-wrapper {
    padding-right: 24px;
  }
}

@media (min-width: 960px) {
  :where([dir='ltr']) .typesense-search-wrapper {
    padding-left: 32px;
  }

  :where([dir='rtl']) .typesense-search-wrapper {
    padding-right: 32px;
  }
}
</style>
