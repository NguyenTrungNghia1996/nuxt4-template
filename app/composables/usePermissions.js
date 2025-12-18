export const usePermissions = () => {
  const { superAdmin } = useApi();
  const settingStore = useSettingStore();
  // const DEFAULT_PERMISSIONS = [
  //   {
  //     key: "menu",
  //     permissionValue: 42,
  //   },
  //   {
  //     key: "menu-plvuxq63o0",
  //     permissionValue: 0,
  //   },
  //   {
  //     key: "menu-c8u2jgnoto",
  //     permissionValue: 2796202,
  //   },
  //   {
  //     key: "menu-f5fh5fri05",
  //     permissionValue: 170,
  //   },
  // ];
  const loadPermissions = async () => {
    try {
      const { data: res } = await superAdmin.getByRest("permissions");
      console.log("permission", res);
      // const permission = res?.value?.data?.permission;
      // if (permission) {
      //   settingStore.setPermissions(permission);
      // } else {
      //   console.warn("Không có dữ liệu permission trả về");
      // }
    } catch (error) {
      console.error("Lỗi loadPermissions:", error);
    }
  };

  const setPermissions = perms => {
    // settingStore.setPermissions(perms || DEFAULT_PERMISSIONS);
    // settingStore.setPermissions(DEFAULT_PERMISSIONS);
  };

  return { loadPermissions, setPermissions };
};
