export const usePermissions = () => {
  const { superAdmin } = useApi();
  const settingStore = useSettingStore();

  const normalizePermissions = list => {
    if (!Array.isArray(list)) return [];
    return list.map(({ key, permissionValue }) => ({ key, permissionValue }));
  };

  const loadPermissions = async () => {
    try {
      const { data, error } = await superAdmin.getByRest("permissions");

      if (error.value) throw error.value;

      const permissions = normalizePermissions(data.value?.data?.items);
      settingStore.setPermissions(permissions);
      if (!permissions.length) {
        console.warn("Không có dữ liệu permission trả về");
      }
      return permissions;
    } catch (error) {
      console.error("Lỗi loadPermissions:", error);
      settingStore.setPermissions([]);
      return [];
    }
  };

  const setPermissions = perms => {
    settingStore.setPermissions(normalizePermissions(perms));
  };

  return { loadPermissions, setPermissions };
};
