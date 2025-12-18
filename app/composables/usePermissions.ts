export type PermissionItem = {
  key: string;
  permissionValue: number;
};

type PermissionResponse = {
  items: PermissionItem[];
  page: number;
  limit: number;
  total: number;
};

export const usePermissions = () => {
  const { superAdmin } = useApi();
  const settingStore = useSettingStore();

  const normalizePermissions = (list: unknown): PermissionItem[] => {
    if (!Array.isArray(list)) return [];
    return list
      .map(item => {
        const key = (item as PermissionItem | undefined)?.key;
        const permissionValue = (item as PermissionItem | undefined)?.permissionValue;
        if (typeof key !== "string") return null;
        return {
          key,
          permissionValue:
            typeof permissionValue === "number" ? permissionValue : Number(permissionValue) || 0,
        };
      })
      .filter(Boolean) as PermissionItem[];
  };

  const loadPermissions = async (): Promise<PermissionItem[]> => {
    try {
      const { data, error } = await superAdmin.getByRest("permissions");

      if (error.value) throw error.value;

      const permissions = normalizePermissions(
        (data.value?.data as PermissionResponse | undefined)?.items,
      );
      settingStore.setPermissions(permissions);
      if (!permissions.length) {
        console.warn("Không có dữ liệu permission trả về");
      }
      return permissions;
    } catch (err: unknown) {
      console.error("Lỗi loadPermissions:", err);
      settingStore.setPermissions([]);
      return [];
    }
  };

  const setPermissions = (perms?: PermissionItem[] | null): void => {
    settingStore.setPermissions(normalizePermissions(perms ?? []));
  };

  return { loadPermissions, setPermissions };
};
