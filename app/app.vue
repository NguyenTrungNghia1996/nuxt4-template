<template>
  <a-extract-style>
    <a-config-provider :locale="locale" :theme="theme">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </a-config-provider>
  </a-extract-style>
</template>
<script setup>
import vi_VN from "ant-design-vue/es/locale/vi_VN";
const locale = computed(() => {
  return vi_VN;
});
const theme = ref({});
// const theme = ref({
//   token: {
//     colorPrimary: "#0057A0", // Màu xanh dương đậm trong logo – làm màu chủ đạo
//     colorSuccess: "#7AC943", // Màu xanh lá logo – dùng cho thành công (Success)
//     colorWarning: "#F59E0B", // Vàng cam nhẹ – cảnh báo nhưng vẫn hài hòa với logo
//     colorError: "#DC2626", // Đỏ đậm hiện đại – phù hợp cho trạng thái lỗi
//     colorInfo: "#0284C7",
//   },
// });
</script>
