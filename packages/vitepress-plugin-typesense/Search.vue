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

const initializeDocSearch = async (currentLang: string) => {
  // @ts-ignore
  const docsearch = await import('typesense-docsearch.js/dist/umd');
  const { locales, ...rest }: DocSearchClientConfig = config();

  docsearch.default(
    Object.assign({}, rest, {
      container: '#typesense-search',
      translations: locales?.[currentLang],
    })
  );

  setTimeout(() => {
    const btn = document.querySelector(
      '#typesense-search .DocSearch-Button'
    ) as HTMLElement;
    if (btn) btn.click();
  }, 50);
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
      await initializeDocSearch(newLang);
    }
  }
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

.DocSearch-LoadingIndicator {
  display: none !important;
}

/* Show the loading indicator only when the search is stalled/loading */
.DocSearch-Container--Stalled .DocSearch-LoadingIndicator {
  display: flex !important;
}

/* Hide the Magnifier icon when loading to prevent overlapping */
.DocSearch-Container--Stalled .DocSearch-MagnifierLabel {
  display: none !important;
}

.DocSearch-Button {
  padding: 2px 12px !important;
  border: none !important;
  border-radius: 8px !important;
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
.DocSearch-Logo a {
  display: flex;
  align-items: center;
}

.DocSearch-Help a {
  color: var(--docsearch-highlight-color);
}
</style>
