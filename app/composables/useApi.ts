// composables/useApi.ts
export const useApi = () => ({
  authAdmin: useAuthApi("/auth/admin"),
  authUnit: useAuthApi("/auth/unit"),
  superAdmin: useCrudApi("/superadmins"),
  superAdminRoleGroup: useCrudApi("/superadmin_role_groups"),
  s3: useS3Upload("/uploads/presigned_url"),
});
