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

  </div>
</template>

<script setup>
const userStore = useUserStore();
const unitStore = useUnitStore();

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
