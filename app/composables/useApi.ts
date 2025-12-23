// composables/useApi.ts
export const useApi = () => ({
  authAdmin: useAuthApi("/auth/admin"),
  superAdmin: useCrudApi("/superadmins"),
  superAdminRoleGroup: useCrudApi("/superadmin_role_groups"),
  superAdminMenu: useCrudApi("/superadmin_menus"),
  units: useCrudApi("/units"),
  servicePackages: useCrudApi("/service_packages"),
  servicePackageMenus: useCrudApi("/service_package_menus"),
  s3Admin: useS3Upload("/uploads/presigned_url"),
  // unitAPI
  authUnit: useAuthApi("/auth/unit"),
  s3Unit: useS3Upload("/unit_uploads/presigned_url"),
  unitMenu: useCrudApi("/unit_menus"),
  unitRoleGroup: useCrudApi("/unit_role_groups"),
});
