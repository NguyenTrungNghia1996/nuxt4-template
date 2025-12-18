import { defineStore } from "pinia";
import type { PermissionItem } from "../composables/usePermissions";

type LoadingState = {
  title: string;
  description: string;
  isActive: boolean;
  showLogo: boolean;
  transparent: boolean;
};

export type MenuItem = {
  title: string;
  key: string;
  url: string;
  icon: string;
  permissionBit?: number;
  children: MenuItem[];
};

type SettingState = {
  loading: LoadingState;
  menu: MenuItem[];
  permissions: PermissionItem[];
  current_permission: number;
};

export const useSettingStore = defineStore("setting", {
  state: (): SettingState => ({
    loading: {
      title: "Đang xử lý",
      description: "Vui lòng chờ trong giây lát...",
      isActive: false,
      showLogo: true,
      transparent: false,
    },
    menu: [],
    permissions: [],
    current_permission: 0,
  }),
  actions: {
    setLoading(value: boolean) {
      this.loading.isActive = value;
    },
    setDetailLoading(value: LoadingState) {
      this.loading = value;
    },
    setMenu(value?: MenuItem[] | null) {
      this.menu = Array.isArray(value) ? value : [];
    },
    setPermissions(value?: PermissionItem[] | null) {
      this.permissions = Array.isArray(value) ? value : [];
    },
    setCurrentPermission(value: number) {
      this.current_permission = value;
    },
  },
  getters: {
    isLoading: state => state.loading.isActive,
    menuItems: state => state.menu,
    menuPermissions: state => state.permissions,
    currentPermission: state => {
      const PERMISSION_STATE = { NO_ACCESS: 0, VIEW: 1, EDIT: 2 };
      return state.current_permission === PERMISSION_STATE.EDIT;
    },
  },
  // {
  //   persist: true,
  // },
});
