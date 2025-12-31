import { defineStore } from "pinia";

type UserState = {
  user: Record<string, any>;
};

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    user: {},
  }),

  actions: {
    setUser(value: Record<string, any>) {
      this.user = value || {};
    },
    logout() {
      this.user = {};
    },
  },

  getters: {
    token: state => state.user?.token ?? null,
    name: state => state.user?.user?.name ?? null,
    is_admin: state => state.user?.user?.is_admin ?? null,
    image_url: state => state.user?.user?.image_url ?? "",
  },

  persist: {
    storage: piniaPluginPersistedstate.cookies(),
  },
});
