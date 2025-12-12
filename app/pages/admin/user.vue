<template>
  <div class="min-h-full rounded bg-white p-4 shadow">
    <div class="mb-4 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm loại phòng học..." enter-button @search="handleSearch" class="flex-grow" />
      <a-button @click="resetSearch" class="w-full md:w-auto">Đặt lại</a-button>
      <a-button type="primary" @click="showModal" class="w-full md:w-auto">Thêm mới</a-button>
    </div>
  </div>
</template>
<script setup>
const searchText = ref("");
const handleSearch = async () => {};
</script>
