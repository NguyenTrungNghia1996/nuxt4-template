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
      console.log(this.user);
    },
    logout() {
      this.user = {};
    },
  },

  getters: {
    token: state => state.user?.token ?? null,
    name: state => state.user?.user?.name ?? null,
    is_admin: state => state.user?.user?.is_admin ?? null,
  },

  persist: {
    storage: piniaPluginPersistedstate.cookies(),
  },
});
