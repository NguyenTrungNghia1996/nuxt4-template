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
            <a-menu-item key="profile" class="!mx-0 !px-4 !py-2.5 text-gray-200 hover:bg-gray-700/50 hover:text-white" @click="openProfileModal">
              <div class="flex items-center gap-2">
                <UserOutlined class="text-blue-400" />
                <span>Cập nhật thông tin</span>
              </div>
            </a-menu-item>
            <a-menu-divider class="!my-1 !bg-gray-700" />
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

    <a-modal v-model:open="profileModalVisible" :title="profileModalTitle" ok-text="Lưu" cancel-text="Hủy" :confirm-loading="profileSubmitting" destroy-on-close @ok="handleProfileSubmit" @cancel="handleProfileCancel">
      <a-spin :spinning="profileLoading">
        <a-form ref="profileFormRef" :model="profileForm" layout="vertical">
          <a-form-item label="Họ tên" name="name" :rules="[{ required: true, message: 'Vui lòng nhập họ tên' }]">
            <a-input v-model:value="profileForm.name" placeholder="Nhập họ tên" />
          </a-form-item>

          <a-form-item label="Email" name="email" :rules="emailRules">
            <a-input v-model:value="profileForm.email" type="email" placeholder="name@example.com" />
          </a-form-item>

          <a-form-item label="Ảnh đại diện" name="image_url">
            <div class="flex flex-col gap-3">
              <div class="flex items-center gap-3">
                <div class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                  <img v-if="profileForm.image_url" :src="profileForm.image_url" alt="Avatar preview" class="h-full w-full object-cover" />
                  <UserOutlined v-else class="text-lg text-gray-400" />
                </div>
                <div class="flex-1 space-y-2">
                  <a-input v-model:value="profileForm.image_url" placeholder="https://example.com/avatar.png" />
                  <div class="flex flex-wrap items-center gap-2">
                    <ClientOnly>
                      <a-upload :show-upload-list="false" :before-upload="handleProfileImageUpload" accept="image/*">
                        <a-button size="small" :loading="profileImageUploading">
                          <template #icon>
                            <Icon name="ri:upload-2-line" />
                          </template>
                          Upload S3
                        </a-button>
                      </a-upload>
                    </ClientOnly>
                    <a-button v-if="profileForm.image_url" size="small" :disabled="profileImageUploading" @click="clearProfileImage">
                      <template #icon>
                        <Icon name="ri:close-line" />
                      </template>
                      Xóa ảnh
                    </a-button>
                  </div>
                  <p class="text-xs text-gray-500">Upload lên S3 hoặc dán URL trực tiếp.</p>
                </div>
              </div>
            </div>
          </a-form-item>

          <a-form-item label="Mật khẩu mới" name="password" :rules="passwordRules">
            <a-input-password v-model:value="profileForm.password" autocomplete="new-password" placeholder="Để trống nếu không đổi" />
          </a-form-item>
        </a-form>
      </a-spin>
    </a-modal>
  </div>
</template>

<script setup>
const userStore = useUserStore();
const unitStore = useUnitStore();
const { superAdminMe, unitMe, s3Admin, s3Unit } = useApi();

const profileForm = reactive({
  name: "",
  email: "",
  image_url: "",
  password: "",
});

const profileModalVisible = ref(false);
const profileLoading = ref(false);
const profileSubmitting = ref(false);
const profileFormRef = ref();
const profileImageUploading = ref(false);

const emailRules = [
  { required: true, message: "Vui lòng nhập email" },
  { type: "email", message: "Email không hợp lệ" },
];

const passwordRules = [
  {
    validator: (_, value) => {
      if (!value) return Promise.resolve();
      if (value.length < 6) return Promise.reject("Mật khẩu tối thiểu 6 ký tự");
      return Promise.resolve();
    },
  },
];

const currentProfileApi = computed(() => (unitStore.isSuperAdmin ? superAdminMe : unitMe));
const currentS3Upload = computed(() => (unitStore.isSuperAdmin ? s3Admin : s3Unit));
const profileModalTitle = computed(() => (unitStore.isSuperAdmin ? "Cập nhật thông tin Super Admin" : "Cập nhật thông tin tài khoản"));

const applyProfileToStore = updatedInfo => {
  const current = userStore.user || {};
  const currentUser = current.user && typeof current.user === "object" ? current.user : {};
  userStore.setUser({ ...current, user: { ...currentUser, ...(updatedInfo || {}) } });
};

const handleProfileImageUpload = async file => {
  const rawFile = file?.originFileObj || file;
  if (!rawFile) return false;
  if (!(rawFile instanceof File)) {
    message.error("File không hợp lệ");
    return false;
  }

  profileImageUploading.value = true;
  try {
    const url = await currentS3Upload.value.upload(rawFile);
    profileForm.image_url = url;
    message.success("Upload ảnh thành công");
  } catch (err) {
    message.error(err?.message || err?.data?.message || "Upload ảnh thất bại");
  } finally {
    profileImageUploading.value = false;
  }

  return false;
};

const fetchProfile = async () => {
  profileLoading.value = true;
  try {
    const { data, error } = await currentProfileApi.value.get();
    if (error.value) throw error.value;
    if (data.value?.status !== "success") {
      throw new Error(data.value?.message || "Không thể tải thông tin");
    }

    const profile = data.value.data || {};
    profileForm.name = profile.name || "";
    profileForm.email = profile.email || "";
    profileForm.image_url = profile.image_url || "";
    profileForm.password = "";
  } catch (err) {
    message.error(err?.message || err?.data?.message || "Không thể tải thông tin cá nhân");
    profileModalVisible.value = false;
  } finally {
    profileLoading.value = false;
  }
};

const openProfileModal = async () => {
  profileModalVisible.value = true;
};

const handleProfileCancel = () => {
  profileModalVisible.value = false;
  profileForm.password = "";
};

const clearProfileImage = () => {
  profileForm.image_url = "";
};

watch(
  () => profileModalVisible.value,
  async visible => {
    if (visible) {
      await fetchProfile();
    } else {
      profileForm.password = "";
    }
  },
);

const handleProfileSubmit = async () => {
  try {
    await profileFormRef.value?.validate();
    profileSubmitting.value = true;
    const payload = {
      name: profileForm.name,
      email: profileForm.email,
      image_url: profileForm.image_url,
      ...(profileForm.password ? { password: profileForm.password } : {}),
    };

    const { data, error } = await currentProfileApi.value.put({ body: payload });
    if (error.value) throw error.value;
    if (data.value?.status !== "success") {
      throw new Error(data.value?.message || "Cập nhật thông tin thất bại");
    }

    message.success("Cập nhật thông tin thành công");
    applyProfileToStore(data.value?.data || payload);
    handleProfileCancel();
  } catch (err) {
    message.error(err?.message || err?.data?.message || "Cập nhật thông tin thất bại");
  } finally {
    profileSubmitting.value = false;
  }
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
