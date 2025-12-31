<template>
  <div class="flex h-full w-full items-center justify-between border-b border-gray-700 bg-gray-900 px-6">
    <!-- Logo with modern glow effect -->
    <div class="flex items-center">
      <img :src="unitStore.logo" alt="Logo" class="h-16 cursor-pointer rounded-xl p-2 transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 active:scale-95 active:shadow-none" @click="() => navigateTo(`/dashboard`)" />
    </div>

    <!-- User dropdown with modern styling -->
    <div class="flex items-center">
      <a-dropdown>
        <div class="group flex cursor-pointer items-center rounded-lg p-1.5 transition-all duration-200 ease-out hover:bg-gray-700/50" @click.prevent>
          <div class="flex items-center gap-3">
            <!-- User name display -->
            <div class="hidden text-right md:block">
              <div class="text-sm font-medium text-gray-200 group-hover:text-white">
                {{ userStore.name }}
              </div>
              <div class="text-xs text-gray-400">
                {{ userStore.role }}
              </div>
            </div>

            <!-- Avatar -->
            <div class="relative">
              <a-avatar v-if="userStore.image_url" :src="userStore.image_url" class="h-9 w-9 transition-all duration-300 ease-out group-hover:scale-110 group-hover:ring-2 group-hover:ring-blue-400" />
              <a-avatar v-else class="h-9 w-9 bg-gray-600 transition-all duration-300 ease-out group-hover:scale-110 group-hover:ring-2 group-hover:ring-blue-400" :style="{ verticalAlign: 'middle' }" style="background-color: #8e8e8e">
                <template #icon>
                  <UserOutlined class="text-gray-300" />
                </template>
              </a-avatar>
            </div>
          </div>
        </div>

        <template #overlay>
          <a-menu class="min-w-[180px] rounded-lg border border-gray-700 bg-gray-800 py-1 shadow-xl">
            <!-- <a-menu-item key="profile" class="hover:bg-gray-700/50 !px-4 !py-2.5 !mx-0 text-gray-200 hover:text-white" @click="navigateTo('/profile')">
              <div class="flex items-center gap-2">
                <UserOutlined class="text-blue-400" />
                <span>Hồ sơ cá nhân</span>
              </div>
            </a-menu-item> -->
            <a-menu-item key="change_password" class="!mx-0 !px-4 !py-2.5 text-gray-200 hover:bg-gray-700/50 hover:text-white" @click="showChangePasswordModal">
              <div class="flex items-center gap-2">
                <KeyOutlined class="text-blue-400" />
                <span>Đổi mật khẩu</span>
              </div>
            </a-menu-item>
            <a-menu-item key="logout" class="!mx-0 !px-4 !py-2.5 text-gray-200 hover:bg-gray-700/50 hover:text-white" @click="signOut">
              <div class="flex items-center gap-2">
                <LogoutOutlined class="text-red-400" />
                <span>Đăng xuất</span>
              </div>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>

    <!-- Modern Change Password Modal -->
    <a-modal v-model:open="changePasswordModalVisible" title="Thay đổi mật khẩu" :confirm-loading="confirmLoading" class="[&_.ant-modal-content]:bg-gray-800 [&_.ant-modal-header]:bg-gray-800 [&_.ant-modal-title]:text-white" :footer="null">
      <a-form layout="vertical" :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" autocomplete="off" class="[&_.ant-form-item-label]:font-medium [&_.ant-form-item-label]:text-gray-300 [&_input]:border-gray-600 [&_input]:bg-gray-700 [&_input]:text-white">
        <a-form-item label="Mật khẩu hiện tại" name="currentPassword">
          <a-input-password v-model:value="passwordForm.currentPassword" />
        </a-form-item>
        <a-form-item label="Mật khẩu mới" name="newPassword">
          <a-input-password v-model:value="passwordForm.newPassword" />
        </a-form-item>
        <a-form-item label="Xác nhận mật khẩu" name="confirmPassword">
          <a-input-password v-model:value="passwordForm.confirmPassword" />
        </a-form-item>

        <div class="flex justify-end gap-3 pt-2">
          <a-button @click="handleCancel" class="border-gray-600 text-gray-300 hover:border-blue-400 hover:bg-gray-700/50 hover:text-white">Hủy bỏ</a-button>
          <a-button type="primary" :loading="confirmLoading" @click="handleChangePassword" class="border-blue-600 bg-blue-600 hover:bg-blue-500">Xác nhận</a-button>
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
const userStore = useUserStore();
const unitStore = useUnitStore();
const { RestApi } = useApi();

// Modal state
const changePasswordModalVisible = ref(false);
const confirmLoading = ref(false);
const passwordFormRef = ref();

// Form data
const passwordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// Validation rules
const passwordRules = {
  currentPassword: [{ required: true, message: "Bạn phải nhập mật khẩu hiện tại" }],
  newPassword: [
    { required: true, message: "Bạn phải nhập mật khẩu mới" },
    { min: 6, message: "Mật khẩu có ít nhất 6 kí tự " },
  ],
  confirmPassword: [
    { required: true, message: "Bạn cần xác nhận lại mật khẩu mới" },
    ({ getFieldValue }) => ({
      validator(_, value) {
        if (!value || getFieldValue("newPassword") === value) {
          return Promise.resolve();
        }
        return Promise.reject("Hai mật khẩu không khớp nhau!");
      },
    }),
  ],
};

const showChangePasswordModal = () => {
  changePasswordModalVisible.value = true;
};

const handleChangePassword = async () => {
  // try {
  //   await passwordFormRef.value.validate();
  //   confirmLoading.value = true;
  //   const { data, status } = await RestApi.user.change_password({
  //     body: {
  //       mat_khau_cu: passwordForm.value.currentPassword,
  //       mat_khau_moi: passwordForm.value.newPassword,
  //       xac_nhan_mat_khau: passwordForm.value.confirmPassword,
  //     },
  //   });
  //   if (status.value === "success") {
  //     message.success("Thay đổi mật khẩu thành công");
  //     await userStore.logout();
  //     await navigateTo("/auth/login");
  //   } else {
  //     message.error("Thay đổi mật khẩu không thành công");
  //   }
  // } catch (error) {
  //   message.error(error.response?.data?.message || "Thay đổi mật khẩu thất bại");
  // } finally {
  //   resetForm();
  //   confirmLoading.value = false;
  // }
};

const handleCancel = () => {
  resetForm();
  changePasswordModalVisible.value = false;
};

const resetForm = () => {
  passwordForm.value = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };
};

const signOut = async () => {
  try {
    userStore.logout();
    await navigateTo("/login");
  } catch (error) {
    message.error("Logout failed");
  }
};
</script>

<style scoped>
/* Smooth transitions for all interactive elements */
.ant-dropdown-link,
.ant-avatar,
img {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Custom scrollbar for dropdown */
.ant-dropdown-menu {
  scrollbar-width: thin;
  scrollbar-color: #3b82f6 #1f2937;
}

.ant-dropdown-menu::-webkit-scrollbar {
  width: 6px;
}

.ant-dropdown-menu::-webkit-scrollbar-track {
  background: #1f2937;
}

.ant-dropdown-menu::-webkit-scrollbar-thumb {
  background-color: #3b82f6;
  border-radius: 3px;
}
</style>
