import { DocSearchClientConfig } from 'vitepress-plugin-typesense';

export default {
  typesenseCollectionName: 'vitepress-docs',
  typesenseServerConfig: {
    apiKey: 'xyz',
    nodes: [{ url: 'http://localhost:8108' }],
  },
  typesenseSearchParameters: {},
  getMissingResultsUrl({ query }) {
    return `https://example.com/?query=${query}`;
  },
  locales: {
    vi: {
      button: {
        buttonText: 'Tìm kiếm',
        buttonAriaLabel: 'Tìm kiếm',
      },
      modal: {
        searchBox: {
          resetButtonTitle: 'Xóa từ khóa',
          resetButtonAriaLabel: 'Xóa từ khóa',
          cancelButtonText: 'Hủy',
          cancelButtonAriaLabel: 'Hủy',
        },
        startScreen: {
          recentSearchesTitle: 'Gần đây',
          noRecentSearchesText: 'Không có tìm kiếm gần đây',
          saveRecentSearchButtonTitle: 'Lưu tìm kiếm này',
          removeRecentSearchButtonTitle: 'Xóa tìm kiếm này khỏi lịch sử',
          favoriteSearchesTitle: 'Yêu thích',
          removeFavoriteSearchButtonTitle:
            'Xóa tìm kiếm này khỏi mục yêu thích',
        },
        errorScreen: {
          titleText: 'Không thể tải kết quả',
          helpText: 'Vui lòng kiểm tra kết nối mạng của bạn.',
        },
        footer: {
          selectText: 'Chọn',
          selectKeyAriaLabel: 'Phím Enter',
          navigateText: 'Di chuyển',
          navigateUpKeyAriaLabel: 'Mũi tên lên',
          navigateDownKeyAriaLabel: 'Mũi tên xuống',
          closeText: 'Đóng',
          closeKeyAriaLabel: 'Phím Esc',
          searchByText: 'Cung cấp bởi',
        },
        noResultsScreen: {
          noResultsText: 'Không có kết quả cho',
          suggestedQueryText: 'Thử tìm kiếm với',
          reportMissingResultsText:
            'Bạn tin rằng truy vấn này nên trả về kết quả?',
          reportMissingResultsLinkText: 'Hãy cho chúng tôi biết.',
        },
      },
    },
  },
} satisfies DocSearchClientConfig;
