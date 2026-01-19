# Tùy chỉnh giao diện

Tạo tệp `.vitepress/theme/custom.css` này với nội dung sau:

```css
/* Đây là các CSS variables của theme mặc định VitePress, chỉnh sửa chúng nếu bạn muốn */
[class*='DocSearch'] {
  /* Bố cục & Kích thước */
  --docsearch-actions-height: auto;
  --docsearch-actions-width: auto;

  /* Nền */
  --docsearch-container-background: var(
    --vp-backdrop-bg-color
  ); /* Lớp phủ nền mờ */
  --docsearch-modal-background: var(--vp-c-bg-soft);
  --docsearch-footer-background: var(--vp-c-bg);
  --docsearch-background-color: var(--vp-c-bg-soft);

  /* Nút tìm kiếm & Ô nhập liệu tìm kiếm */
  --docsearch-search-button-background: var(--vp-c-bg-alt);
  --docsearch-searchbox-focus-background: transparent;
  --docsearch-highlight-color: var(--vp-c-brand-1);
  --docsearch-searchbox-shadow: inset 0 0 0 2px var(--vp-c-brand-1);

  /* Văn bản & Thương hiệu */
  --docsearch-primary-color: var(--vp-c-brand-1);
  --docsearch-focus-color: var(--vp-c-brand-1);
  --docsearch-text-color: var(--vp-c-text-1);
  --docsearch-secondary-text-color: var(--vp-c-text-2);
  --docsearch-muted-color: var(--vp-c-text-2);
  --docsearch-icon-color: var(--vp-c-text-2);
  --docsearch-subtle-color: var(--vp-c-divider);

  /* Kết quả (Hits) */
  --docsearch-hit-background: var(--vp-c-default-soft);
  --docsearch-text-color: var(--vp-c-text-1);
  --docsearch-hit-highlight-color: var(--vp-c-brand-soft);
  --docsearch-hit-active-color: var(--vp-c-text-1);

  /* Màu thành công / Màu nhẹ */
  --docsearch-success-color: var(--vp-c-brand-soft);
  --docsearch-soft-primary-color: var(--vp-c-brand-soft);

  /* Phím tắt bàn phím */
  --docsearch-key-background: transparent;
  --docsearch-key-color: var(--vp-c-text-2);

  --docsearch-hit-shadow: none;
  --docsearch-key-shadow: none;
  --docsearch-footer-shadow: 0 -1px 0 0 var(--vp-c-divider);
}
```

Và import nó vào `.vitepress/theme/index.ts`:

```ts{2}
import DefaultTheme from 'vitepress/theme';
import './custom.css';

export default {
  extends: DefaultTheme,
};
```
