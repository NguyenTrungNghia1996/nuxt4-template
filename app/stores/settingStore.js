import { defineStore } from "pinia";
export const useSettingStore = defineStore(
  "setting",
  {
    state: () => ({
      loading: {
        title: "Đang xử lý",
        description: "Vui lòng chờ trong giây lát...",
        isActive: false,
        showLogo: true,
        transparent: false,
      },
    }),
    actions: {
      setLoading(value) {
        this.loading.isActive = value;
      },
      setDetailLoading(value) {
        this.loading = value;
      },
    },
    getters: {
      isLoading: state => state.loading.isActive,
    },
  },
  {
    persist: true,
  },
);
