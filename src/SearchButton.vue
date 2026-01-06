<script setup lang="ts">
import { ref, onMounted } from 'vue';

defineProps<{
  placeholder: string;
  ariaLabel?: string;
}>();

const metaKey = ref('Ctrl');

onMounted(() => {
  if (
    typeof navigator !== 'undefined' &&
    /Mac|iPod|iPhone|iPad/.test(navigator.platform)
  ) {
    metaKey.value = '⌘';
  }
});
</script>

<template>
  <button
    type="button"
    aria-keyshortcuts="/ control+k meta+k"
    class="DocSearch DocSearch-Button"
    :aria-label="ariaLabel || placeholder || 'Search'"
  >
    <span class="DocSearch-Button-Container">
      <svg
        width="20"
        height="20"
        class="DocSearch-Search-Icon"
        viewBox="0 0 20 20"
      >
        <path
          d="M14.386 14.386l4.0877 4.0877-4.0877-4.0877c-2.9418 2.9419-7.7115 2.9419-10.6533 0-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419 7.7115-2.9419 10.6533 0 2.9419 2.9418 2.9419 7.7115 0 10.6533z"
          stroke="currentColor"
          fill="none"
          fill-rule="evenodd"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
      </svg>
      <span class="DocSearch-Button-Placeholder">{{ placeholder }}</span>
    </span>
    <span class="DocSearch-Button-Keys"> </span>
  </button>
</template>
