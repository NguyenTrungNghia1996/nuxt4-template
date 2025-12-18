<template>
  <div class="min-h-full rounded bg-white p-4 shadow">
    <div class="mb-4 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm Nhóm quyền..." enter-button @search="handleSearch" class="w-full flex-1 md:w-1/3" />
      <div class="flex w-full flex-col gap-2 md:w-auto md:flex-row">
        <a-button @click="resetSearch" class="w-full md:w-auto">Đặt lại</a-button>
        <a-button type="primary" @click="openCreateModal" class="w-full md:w-auto">Thêm mới</a-button>
      </div>
    </div>

    <ClientOnly class="overflow-x-auto">
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" :scroll="{ x: 900 }" :row-key="record => record.id || record._id || record.name" @change="handleTableChange" bordered size="small">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'description'">
            <span :class="[{ 'text-gray-400': !record.description }]">
              {{ record.description || "Trống" }}
            </span>
          </template>

          <template v-if="column.key === 'action'">
            <div class="flex flex-wrap items-center justify-center gap-1 md:flex-nowrap md:gap-2">
              <a-tooltip title="Sửa">
                <a-button type="link" size="small" @click="openEditModal(record)">
                  <Icon name="ant-design:edit-outlined" class="text-base" />
                </a-button>
              </a-tooltip>

              <a-popconfirm title="Bạn chắc chắn muốn xóa?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="deleteItem(record)">
                <a-tooltip title="Xóa">
                  <a-button type="link" danger size="small" :loading="deletingId === (record.id || record._id)">
                    <Icon name="ant-design:delete-outlined" class="text-base" />
                  </a-button>
                </a-tooltip>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </ClientOnly>

    <a-modal v-model:open="visible" :title="modalTitle" @cancel="handleCancel" :width="modalWidth" :bodyStyle="{ maxHeight: '70vh', overflowY: 'auto' }" destroy-on-close>
      <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
        <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules">
          <a-form-item label="Tên Nhóm quyền" name="name">
            <a-input v-model:value="formState.name" placeholder="Nhập tên Nhóm quyền" :maxlength="50" show-count />
          </a-form-item>

          <a-form-item label="Mô tả" name="description">
            <a-textarea v-model:value="formState.description" :rows="4" placeholder="Nhập mô tả (nếu có)" :maxlength="250" show-count />
          </a-form-item>
        </a-form>

        <PermissionEditor v-model="formState.permissions" />
      </div>

      <template #footer>
        <div class="flex justify-end space-x-2">
          <a-button @click="handleCancel">Hủy</a-button>
          <a-button type="primary" @click="handleOk" :loading="confirmLoading">
            {{ isEdit ? "Cập nhật" : "Thêm mới" }}
          </a-button>
        </div>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";

const { superAdminRoleGroup } = useApi();

const searchText = ref("");
const visible = ref(false);
const confirmLoading = ref(false);
const isEdit = ref(false);
const deletingId = ref("");
const formRef = ref();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("md");
const modalWidth = computed(() => (isMobile.value ? "95vw" : 1000));

const params = reactive({
  page: 1,
  limit: 10,
  q: "",
});

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["1", "10", "20", "50"],
  showTotal: total => `Tổng ${total} bản ghi`,
});

const {
  data: roleGroupData,
  refresh: refreshRoleGroups,
  pending: loading,
} = await superAdminRoleGroup.get({
  params,
});

const dataSource = computed(() => {
  if (roleGroupData.value?.status === "success") {
    return (roleGroupData.value.data?.items || []).map(item => ({
      ...item,
      id: item.id || item._id || "",
      name: item.name || "",
      description: item.description || "",
      permissions: item.permissions || [],
    }));
  }
  return [];
});

watch(
  roleGroupData,
  val => {
    if (val?.status === "success") {
      pagination.total = val.data?.totalrecord ?? val.data?.total ?? 0;
    } else {
      pagination.total = 0;
    }
  },
  { immediate: true },
);

const columns = [
  {
    title: "STT",
    key: "stt",
    width: 60,
    align: "center",
    customRender: ({ index }) => index + 1 + (pagination.current - 1) * pagination.pageSize,
  },
  { title: "Tên Nhóm quyền", dataIndex: "name", key: "name", ellipsis: true },
  { title: "Mô tả", dataIndex: "description", key: "description", ellipsis: true },
  { title: "Thao tác", key: "action", width: 120, align: "center", fixed: "right" },
];

const formState = reactive({
  id: "",
  name: "",
  description: "",
  permissions: [],
});

const rules = {
  name: [
    { required: true, message: "Vui lòng nhập tên Nhóm quyền", trigger: "blur" },
    { min: 2, message: "Tên phải có ít nhất 2 ký tự", trigger: "blur" },
    { max: 50, message: "Tên nhiều nhất 50 ký tự", trigger: "blur" },
  ],
  description: [{ max: 250, message: "Mô tả tối đa 250 ký tự", trigger: "blur" }],
};

const modalTitle = computed(() => (isEdit.value ? "Chỉnh sửa Nhóm quyền" : "Thêm mới Nhóm quyền"));

const handleTableChange = async pag => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  params.page = pag.current;
  params.limit = pag.pageSize;
  await refreshRoleGroups();
};

const handleSearch = async () => {
  params.q = searchText.value.trim();
  params.page = 1;
  pagination.current = 1;
  await refreshRoleGroups();
};

const resetSearch = async () => {
  searchText.value = "";
  params.q = "";
  params.page = 1;
  params.limit = 10;
  pagination.current = 1;
  pagination.pageSize = 10;
  await refreshRoleGroups();
};

const resetFormState = () => {
  Object.assign(formState, {
    id: "",
    name: "",
    description: "",
    permissions: [],
  });
  formRef.value?.clearValidate();
};

const openCreateModal = () => {
  isEdit.value = false;
  resetFormState();
  visible.value = true;
};

const openEditModal = record => {
  isEdit.value = true;
  resetFormState();
  Object.assign(formState, {
    id: record.id || record._id || "",
    name: record.name || "",
    description: record.description || "",
    permissions: (record.permissions || []).map(p => ({ ...p })),
  });
  visible.value = true;
};

const handleOk = async () => {
  try {
    await formRef.value.validate();
    confirmLoading.value = true;

    const payload = {
      ...formState,
      id: formState.id ? String(formState.id) : "",
      name: (formState.name || "").trim(),
      description: (formState.description || "").trim(),
      permissions: formState.permissions || [],
    };

    if (isEdit.value) {
      const { data, error } = await superAdminRoleGroup.put({ body: payload });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Cập nhật Nhóm quyền thành công");
      } else {
        throw new Error(error.value?.data?.message || data.value?.message || "Không thể cập nhật Nhóm quyền");
      }
    } else {
      const { id, ...createPayload } = payload;
      const { data, error } = await superAdminRoleGroup.post({ body: createPayload });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Thêm Nhóm quyền thành công");
      } else {
        throw new Error(error.value?.data?.message || data.value?.message || "Không thể thêm Nhóm quyền");
      }
    }

    visible.value = false;
    resetFormState();
    await refreshRoleGroups();
  } catch (err) {
    message.error(err?.message || "Lỗi khi lưu Nhóm quyền");
  } finally {
    confirmLoading.value = false;
  }
};

const handleCancel = () => {
  resetFormState();
  visible.value = false;
};

const deleteItem = async record => {
  const id = record.id || record._id;
  if (!id) return;

  deletingId.value = id;
  try {
    const { data, error } = await superAdminRoleGroup.delete({ params: { id: String(id) } });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Đã xóa Nhóm quyền");
      await refreshRoleGroups();
    } else {
      message.error(error.value?.data?.message || data.value?.message || "Không thể xóa Nhóm quyền");
    }
  } catch (err) {
    message.error(err?.message || "Lỗi khi xóa Nhóm quyền");
  } finally {
    deletingId.value = "";
  }
};
</script>
