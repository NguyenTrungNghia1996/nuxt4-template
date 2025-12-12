<template>
  <div class="min-h-full rounded bg-white p-4 shadow">
    <div class="mb-4 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm loại phòng học..." enter-button @search="handleSearch" class="flex-grow" />
      <a-button @click="resetSearch" class="w-full md:w-auto">Đặt lại</a-button>
      <a-button type="primary" @click="showModal" class="w-full md:w-auto">Thêm mới</a-button>
    </div>
    <ClientOnly class="overflow-x-auto">
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" :scroll="{ x: '800' }" @change="handleTableChange" bordered size="small"></a-table>
    </ClientOnly>
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
const param = ref({ page: 1, limit: 10, q: "" });
const columns = [
  {
    title: "STT",
    key: "stt",
    width: 60,
    align: "center",
    customRender: ({ index }) => index + 1,
  },
  {
    title: "Username",
    dataIndex: "username",
    key: "username",
    ellipsis: true,
  },
  {
    title: "Họ tên",
    dataIndex: "name",
    key: "name",
    ellipsis: true,
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
    ellipsis: true,
  },
  {
    title: "Quyền",
    dataIndex: "is_admin",
    key: "is_admin",
    width: 100,
    align: "center",
    customRender: ({ text }) => (text ? "Admin" : "User"),
  },
  {
    title: "Thao tác",
    key: "action",
    width: 100,
    align: "center",
    fixed: "right",
  },
];

const fetchData = async param => {
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
  const search = (searchText.value || "").trim();
  if (search) {
    param.value.q = search;
  } else {
    delete param.value.search;
  }
  pagination.current = 1;
  await fetchData({ ...param.value });
};

const resetSearch = async () => {
  searchText.value = "";
  param.value.page = 1;
  param.value.limit = 10;
  param.value.q = "";
  pagination.current = 1;
  pagination.pageSize = 10;
  await fetchData({ ...param.value });
};

const showModal = () => {};
const handleTableChange = async pag => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  param.value.page = pag.current;
  param.value.limit = pag.pageSize;
  await fetchData({ ...param.value });
};
await fetchData({ ...param.value });
</script>
