import { defineStore } from "pinia";

export const useUnitStore = defineStore("unit", {
  state: () => ({
    unit: null,
    subdomain: "",
  }),

  actions: {
    setUnit(data) {
      this.unit = data;
    },
    clearUnit() {
      this.unit = null;
    },
    setSubdomain(data) {
      this.subdomain = data;
    },
    clearSubdomain() {
      this.subdomain = "";
    },
  },

  getters: {
    // unitId: (state) => state.unit?._id || null,
    // subdomain: (state) => state.unit?.subdomain || null,
    // isActive: (state) => state.unit?.active === true,
    logo: state => {
      // return "/logo.png";
      return "https://image.nguyenanh-est.com/website/1745742349824_placeholder.png";
    },
  },
  // persist: {
  //   // storage: piniaPluginPersistedstate.localStorage(),
  //   storage: piniaPluginPersistedstate.cookies(),
  // },
});
