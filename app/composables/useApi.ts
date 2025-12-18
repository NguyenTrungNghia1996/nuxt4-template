// composables/useApi.ts
export const useApi = () => ({
  authAdmin: useAuthApi("/auth/admin"),
  superAdmin: useCrudApi("/superadmins"),
  superAdminRoleGroup: useCrudApi("/superadmin_role_groups"),
  s3Admin: useS3Upload("/uploads/presigned_url"),
  // unitAPI
  authUnit: useAuthApi("/auth/unit"),
  s3Unit: useS3Upload("/unit_uploads/presigned_url"),
});
