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
const { RestApi } = useApi();

const searchText = ref("");
const loading = ref(false);
const dataSource = ref([]);

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["1", "10", "20", "50"],
  showTotal: total => `Tổng ${total} bản ghi`,
});
const param = ref({ PageIndex: 1, PageSize: 10, search: "" });

const fetchData = async (param = {}) => {
  try {
    loading.value = true;

    const { data, error } = await RestApi.superAdmin.list({ params: param });
    if (data.value?.status === "success") {
      dataSource.value = data.value.data.items || [];
      pagination.total = data.value.data.totalrecord ?? data.value.data.total ?? 0;
    } else {
      throw new Error(error.value?.data?.message || "Không thể tải danh sách super admin");
    }
  } catch (error) {
    dataSource.value = [];
    pagination.total = 0;
    message.error(error.message || "Không thể tải danh sách super admin");
  } finally {
    loading.value = false;
  }
};

const handleSearch = async () => {
  pagination.page = 1;
  await fetchData({ keyword: searchText.value });
};

const resetSearch = async () => {
  searchText.value = "";
  pagination.page = 1;
  await fetchData();
};

const showModal = () => {};

onMounted(() => {
  fetchData();
});
</script>
