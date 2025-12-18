<template>
  <div class="flex h-full flex-col">
    <ClientOnly>
      <a-layout class="flex-1 overflow-y-auto">
        <a-layout-sider
          v-model:collapsed="collapsed"
          theme="light"
          width="250px"
          :collapsible="true"
          collapsed-width="50">
          <div class="p-2">
            <template v-if="!collapsed">
              <a-input
                v-model:value="searchQuery"
                placeholder="Tìm kiếm menu..."
                allow-clear
                @focus="expandSidebar" />
            </template>
            <template v-else>
              <div class="flex w-full cursor-pointer justify-center" @click="expandSidebar">
                <Icon name="ant-design:search-outlined" class="text-lg" />
              </div>
            </template>
          </div>
          <a-menu
            theme="light"
            :open-keys="menuState.openKeys"
            v-model:selectedKeys="selectedMenuKeys"
            mode="inline"
            @openChange="onMenuOpenChange">
            <template v-for="menuItem in filteredMenuList" :key="menuItem.key">
              <a-sub-menu v-if="menuItem.children?.length" :key="menuItem.key">
                <template #icon>
                  <Icon :name="menuItem.icon || 'ant-design:folder-outlined'" class="text-xl" />
                </template>
                <template #title>
                  <p class="font-roboto">{{ menuItem.title }}</p>
                </template>
                <a-menu-item v-for="subItem in menuItem.children" :key="subItem.url">
                  <p @click="navigateToPage(subItem.url)" class="font-roboto">
                    {{ subItem.title }}
                  </p>
                </a-menu-item>
              </a-sub-menu>
              <a-menu-item v-else-if="menuItem.url" :key="menuItem.url" @click="navigateToPage(menuItem.url)">
                <template #icon>
                  <Icon :name="menuItem.icon || 'ant-design:file-outlined'" class="text-xl" />
                </template>
                <p class="font-roboto">{{ menuItem.title }}</p>
              </a-menu-item>
            </template>
          </a-menu>
          <div class="pb-10"></div>
        </a-layout-sider>
      </a-layout>
    </ClientOnly>
  </div>
</template>

<script setup>
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";
import { useRouter } from "vue-router";

const router = useRouter();
const { visibleMenu } = useMenu();

const collapsed = ref(false);
const selectedMenuKeys = ref([]);
const menuState = reactive({ openKeys: [] });
const searchQuery = ref("");

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMediumAndUp = breakpoints.greaterOrEqual("md");
const isLargeAndUp = breakpoints.greaterOrEqual("lg");

// Menu lấy từ store + đã được lọc theo quyền trong useMenu
const formattedMenu = computed(() => visibleMenu.value || []);

// Filter menu based on search query
const filteredMenuList = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase();
  if (!keyword) return formattedMenu.value;

  return formattedMenu.value
    .map(menu => {
      const matchingChildren = menu.children?.filter(child =>
        child.title.toLowerCase().includes(keyword),
      );

      if (menu.title.toLowerCase().includes(keyword)) {
        return menu;
      } else if (matchingChildren?.length) {
        return {
          ...menu,
          children: matchingChildren,
        };
      }
      return null;
    })
    .filter(Boolean);
});

// Navigation function
const navigateToPage = async url => {
  if (url) {
    await router.push(url);
  }
};

// Handle sub-menu open/close
const onMenuOpenChange = openKeys => {
  menuState.openKeys = openKeys.length ? [openKeys.at(-1)] : [];
};

// Update selected menu when route or menu data changes
watchEffect(() => {
  const currentPath = router.currentRoute.value.fullPath;
  selectedMenuKeys.value = [currentPath];
  const parentItem = formattedMenu.value.find(menu =>
    menu.children?.some(child => child.url === currentPath),
  );
  menuState.openKeys = parentItem ? [parentItem.key] : [];
});

// Auto collapse/expand based on screen size
watch(isMediumAndUp, () => {
  if (!isMediumAndUp.value && !collapsed.value) collapsed.value = true;
});
watch(isLargeAndUp, () => {
  if (isLargeAndUp.value && collapsed.value) collapsed.value = false;
});

// Expand sidebar when search is clicked
const expandSidebar = () => {
  collapsed.value = false;
};
</script>
