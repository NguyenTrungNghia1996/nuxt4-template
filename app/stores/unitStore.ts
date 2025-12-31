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

const DEFAULT_SUPER_ADMIN: UnitInfo = {
  name: "Super Admin",
  subdomain: "sa",
  logo_url: "https://cdn.nghia196.io.vn/admin/0bb442c5-ef40-494f-ab72-a694a7cf642b-logo.png",
};

const PLACEHOLDER_LOGO = "https://image.nguyenanh-est.com/website/1745742349824_placeholder.png";

const resolveSuperAdminUnit = (() => {
  let cached: UnitInfo | null = null;
  return (): UnitInfo => {
    if (cached) return cached;
    const {
      public: { superAdminName, superAdminSubdomain, superAdminLogoUrl },
    } = useRuntimeConfig();

    cached = {
      name: superAdminName || DEFAULT_SUPER_ADMIN.name,
      subdomain: superAdminSubdomain || DEFAULT_SUPER_ADMIN.subdomain,
      logo_url: superAdminLogoUrl || DEFAULT_SUPER_ADMIN.logo_url,
    };
    return cached;
  };
})();

export const getSuperAdminUnit = (): UnitInfo => ({ ...resolveSuperAdminUnit() });

const isSuperAdminSubdomain = (value?: string | null): boolean => {
  const subdomain = (value ?? "").trim();
  if (!subdomain) return false;
  const superAdmin = resolveSuperAdminUnit();
  return subdomain === (superAdmin.subdomain ?? DEFAULT_SUPER_ADMIN.subdomain);
};

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

      if (isSuperAdminSubdomain(normalized)) {
        this.unit = getSuperAdminUnit();
      } else if (isSuperAdminSubdomain(this.unit?.subdomain)) {
        this.unit = null;
      }
    },
    clearSubdomain() {
      this.subdomain = "";
      this.unit = null;
    },
  },

  getters: {
    isSuperAdmin: state => isSuperAdminSubdomain(state.subdomain),
    // unitId: (state) => state.unit?._id || null,
    // subdomain: (state) => state.unit?.subdomain || null,
    // isActive: (state) => state.unit?.active === true,
    logo: (state): string => {
      const superAdmin = resolveSuperAdminUnit();
      return state.unit?.logo_url || (isSuperAdminSubdomain(state.subdomain) ? superAdmin.logo_url || "" : PLACEHOLDER_LOGO);
    },
    name: (state): string => {
      const superAdmin = resolveSuperAdminUnit();
      return state.unit?.name || (isSuperAdminSubdomain(state.subdomain) ? superAdmin.name || "" : "");
    },
  },
  // persist: {
  //   // storage: piniaPluginPersistedstate.localStorage(),
  //   storage: piniaPluginPersistedstate.cookies(),
  // },
});
