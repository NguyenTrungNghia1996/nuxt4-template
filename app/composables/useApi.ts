// composables/useApi.ts
export const useApi = () => ({
  //public
  unitInfo: useCrudApi("/units/public_info"),
  //SuperAdmin
  authAdmin: useAuthApi("/auth/admin"),
  superAdmin: useCrudApi("/admin/superadmins"),
  superAdminMe: useCrudApi("/admin/superadmin_me"),
  superAdminRoleGroup: useCrudApi("/admin/superadmin_role_groups"),
  superAdminMenu: useCrudApi("/admin/superadmin_menus"),
  units: useCrudApi("/admin/units"),
  servicePackages: useCrudApi("/admin/service_packages"),
  servicePackageMenus: useCrudApi("/admin/service_package_menus"),
  s3Admin: useS3Upload("/admin/uploads/presigned_url"),
  // unitAPI
  authUnit: useAuthApi("/auth/unit"),
  s3Unit: useS3Upload("/unit/unit_uploads/presigned_url"),
  unitMenu: useCrudApi("/unit/unit_menus"),
  unitRoleGroup: useCrudApi("/unit/unit_role_groups"),
  unitUsers: useCrudApi("/unit/unit_users"),
  unitMe: useCrudApi("/unit/unit_me"),
});
