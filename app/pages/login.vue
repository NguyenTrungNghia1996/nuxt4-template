<template>
  <div class="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8">
      <div class="flex justify-center">
        <img :src="unitStore.logo" alt="Logo công ty" class="h-20 w-auto" />
      </div>
      <a-card class="shadow-xl">
        <h2 class="mb-6 text-center text-2xl font-bold text-gray-800">Đăng nhập hệ thống</h2>
        <a-form :model="form" layout="vertical" @finish="handleLogin" autocomplete="off">
          <a-form-item label="Tài khoản" name="username" :rules="[{ required: true, message: 'Vui lòng nhập nhập tài khoản!' }]">
            <a-input v-model:value="form.username" placeholder="Nhập tài khoản của bạn" size="large">
              <template #prefix>
                <UserOutlined class="text-gray-400" />
              </template>
            </a-input>
          </a-form-item>
          <a-form-item label="Mật khẩu" name="password" :rules="[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]">
            <a-input-password v-model:value="form.password" placeholder="Nhập mật khẩu" size="large">
              <template #prefix>
                <LockOutlined class="text-gray-400" />
              </template>
            </a-input-password>
          </a-form-item>
          <div class="mb-4 flex justify-between">
            <a-checkbox v-model:checked="rememberMe">Ghi nhớ đăng nhập</a-checkbox>
            <!-- <a-typography-link> Quên mật khẩu? </a-typography-link> -->
          </div>
          <a-form-item>
            <a-button type="primary" html-type="submit" size="large" block>Đăng nhập</a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </div>
  </div>
</template>
<script setup>
definePageMeta({
  layout: "auth",
});
const { rememberMe, saveCredentials, getCredentials, clearCredentials } = useAuth();
const { authAdmin, authUnit } = useApi();
// const { loadMenu } = useMenu();
// const { loadPermissions } = usePermissions();
const userStore = useUserStore();
const unitStore = useUnitStore();
const settingStore = useSettingStore();
const savedCredentials = getCredentials();
const form = reactive({
  username: savedCredentials?.username || "",
  password: savedCredentials?.password || "",
});
watch(rememberMe, async () => {
  if (!rememberMe.value) {
    form.username = "";
    form.password = "";
    clearCredentials();
  }
});
const handleLogin = async () => {
  settingStore.setLoading(true);
  try {
    let res;
    let navi;
    if (unitStore.subdomain == "sa") {
      res = await authAdmin.login({ body: JSON.stringify(form) });
      navi = "/admin";
    } else {
      form.subdomain = unitStore.subdomain;
      res = await authUnit.login({ body: JSON.stringify(form) });
      navi = "/";
    }
    const { data, status, error } = res;
    if (data.value?.status === "success") {
      // if (rememberMe.value) {
      //   saveCredentials(form.username, form.password);
      // }
      userStore.setUser(data.value.data);
      // await loadMenu();
      // await loadPermissions();
      message.success("Đăng nhập thành công!");
      await navigateTo(navi, { replace: true });
    } else {
      throw new Error(error.value?.data?.message);
    }
  } catch (error) {
    message.error(error?.message || error?.value?.data?.message || "Đăng Nhập Thất Bại");
  } finally {
    settingStore.setLoading(false);
  }
};
</script>
