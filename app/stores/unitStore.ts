import { defineStore } from "pinia";

export type UnitInfo = {
  _id?: string;
  subdomain?: string;
  active?: boolean;
  logo_url?: string;
  name?: string;
  [key: string]: unknown;
};

type UnitState = {
  unit: UnitInfo | null;
  subdomain: string;
};

export const SUPER_ADMIN_UNIT: UnitInfo = {
  name: "Super Admin",
  subdomain: "sa",
  logo_url: "https://cdn.nghia196.io.vn/admin/0bb442c5-ef40-494f-ab72-a694a7cf642b-logo.png",
};

const PLACEHOLDER_LOGO = "https://image.nguyenanh-est.com/website/1745742349824_placeholder.png";

export const useUnitStore = defineStore("unit", {
  state: (): UnitState => ({
    unit: null,
    subdomain: "",
  }),

  actions: {
    setUnit(data?: UnitInfo | null) {
      this.unit = data ?? null;
    },
    clearUnit() {
      this.unit = null;
    },
    setSubdomain(value?: string | null) {
      const normalized = (value ?? "").trim();
      this.subdomain = normalized;

      if (normalized === "sa") {
        this.unit = { ...SUPER_ADMIN_UNIT };
      } else if (this.unit?.subdomain === "sa") {
        this.unit = null;
      }
    },
    clearSubdomain() {
      this.subdomain = "";
      this.unit = null;
    },
  },

  getters: {
    // unitId: (state) => state.unit?._id || null,
    // subdomain: (state) => state.unit?.subdomain || null,
    // isActive: (state) => state.unit?.active === true,
    logo: (state): string => state.unit?.logo_url || (state.subdomain === "sa" ? SUPER_ADMIN_UNIT.logo_url || "" : PLACEHOLDER_LOGO),
    name: (state): string => state.unit?.name || (state.subdomain === "sa" ? SUPER_ADMIN_UNIT.name || "" : ""),
  },
  // persist: {
  //   // storage: piniaPluginPersistedstate.localStorage(),
  //   storage: piniaPluginPersistedstate.cookies(),
  // },
});
