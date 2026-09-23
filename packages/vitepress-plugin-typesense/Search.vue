<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue';
import { useData } from 'vitepress';
import SearchButton from './SearchButton.vue';
import type { DocSearchClientConfig } from '.';
// @ts-ignore
import config from 'virtual:typesense-config';
// @ts-ignore
import 'typesense-docsearch-css';

const { lang } = useData();
const loaded = ref(false);

const buttonText = computed(() => {
  const localeConfig = config.locales?.[lang.value];
  return (
    localeConfig?.button?.buttonText || config.button?.buttonText || 'Search'
  );
});

const buttonAriaLabel = computed(() => {
  const localeConfig = config.locales?.[lang.value];
  return (
    localeConfig?.button?.buttonAriaLabel ||
    config.button?.buttonAriaLabel ||
    'Search'
  );
});

const load = async () => {
  if (loaded.value) return;
  loaded.value = true;
  await nextTick();
  await initializeDocSearch(lang.value);
};

const initializeDocSearch = async (
  currentLang: string,
  autoOpen: boolean = true,
) => {
  const docsearch = await import('typesense-docsearch.js');
  const { locales, ...rest }: DocSearchClientConfig = config();
  rest.typesenseSearchParameters ||= {};

  if (rest.typesenseSearchParameters.filter_by) {
    rest.typesenseSearchParameters.filter_by += `&& language:=${currentLang}`;
  } else rest.typesenseSearchParameters.filter_by = `language:=${currentLang}`;

  docsearch.default(
    Object.assign({}, rest, {
      container: '#typesense-search',
      translations: locales?.[currentLang],
      typesenseSearchParameters: rest.typesenseSearchParameters,
    }),
  );

  if (autoOpen) {
    setTimeout(() => {
      const btn = document.querySelector(
        '#typesense-search .DocSearch-Button',
      ) as HTMLElement;
      if (btn) btn.click();
    }, 50);
  }
};

const handleSearchHotKey = (event: KeyboardEvent) => {
  if (
    (event.key?.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) ||
    (!isEditingContent(event) && event.key === '/')
  ) {
    event.preventDefault();
    load();
  }
};

function isEditingContent(event: KeyboardEvent): boolean {
  const element = event.target as HTMLElement;
  const tagName = element.tagName;
  return (
    element.isContentEditable ||
    tagName === 'INPUT' ||
    tagName === 'SELECT' ||
    tagName === 'TEXTAREA'
  );
}

onMounted(() => {
  window.addEventListener('keydown', handleSearchHotKey);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleSearchHotKey);
});

watch(
  () => lang.value,
  async (newLang) => {
    if (loaded.value) {
      await initializeDocSearch(newLang, false);
    }
  },
);
</script>

<template>
  <div class="typesense-search-wrapper">
    <div v-if="loaded" id="typesense-search" role="search"></div>

    <div v-else id="typesense-search-button">
      <SearchButton
        :placeholder="buttonText"
        :aria-label="buttonAriaLabel"
        @click="load"
      />
    </div>
  </div>
</template>

<style>
.typesense-search-wrapper {
  display: flex;
  align-items: center;
}

@media (min-width: 768px) {
  .typesense-search-wrapper {
    flex-grow: 1;
    padding-left: 24px;
  }
}

@media (min-width: 960px) {
  .typesense-search-wrapper {
    padding-left: 32px;
  }
}

.DocSearch-Button {
  padding: 2px 12px !important;
  border: none !important;
  border-radius: 8px !important;
}

:not(.dark) .DocSearch-Button {
  background-color: var(--vp-c-bg-alt, #f6f6f7);
}

.DocSearch-Button .DocSearch-Search-Icon {
  color: inherit !important;
  width: 18px !important;
  height: 18px !important;
  stroke-width: 1.2px !important;
}

@media (min-width: 768px) {
  .DocSearch-Button .DocSearch-Search-Icon {
    width: 15px !important;
    height: 15px !important;
    color: var(--docsearch-muted-color) !important;
  }

  .DocSearch-Button-Placeholder {
    font-size: 13px !important;
    color: var(--docsearch-muted-color) !important;
  }
}

.DocSearch-Button-Keys {
  min-width: auto !important;
  padding: 4px 6px;
  border: 1px solid var(--docsearch-subtle-color);
  border-radius: 4px;
  font-size: 12px;
  line-height: 1;
  color: var(--docsearch-key-color);
}

:not(.dark) .DocSearch-Button-Keys {
  border-color: var(--vp-c-divider, #e2e2e3);
}
.DocSearch-Commands-Key {
  background: none !important;
  border: 1px solid var(--docsearch-subtle-color) !important;
  border-radius: 4px !important;
}

.DocSearch-Button-Keys > * {
  display: none !important;
}

.DocSearch-Button-Keys:after {
  direction: ltr;
  content: 'Ctrl K';
}

.mac .DocSearch-Button-Keys:after {
  content: '\2318  K';
}

.DocSearch-Help a {
  color: var(--docsearch-highlight-color);
}
</style>
