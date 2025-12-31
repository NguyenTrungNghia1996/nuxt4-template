<template>
  <div class="min-h-full rounded bg-white p-4 shadow">
    <div class="mb-4 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm người dùng..." enter-button @search="handleSearch" class="w-full flex-1 md:w-1/3" />
      <div class="flex w-full flex-col gap-2 md:w-auto md:flex-row">
        <a-button @click="resetSearch" class="w-full md:w-auto">Đặt lại</a-button>
        <a-button type="primary" @click="openCreateModal" class="w-full md:w-auto">Thêm mới</a-button>
      </div>
    </div>

    <ClientOnly class="overflow-x-auto">
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" :scroll="{ x: 1000 }" :row-key="record => record.id || record._id || record.username" @change="handleTableChange" bordered size="small">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'is_admin'">
            <a-tag :color="record.is_admin ? 'blue' : 'default'">{{ record.is_admin ? "Admin" : "User" }}</a-tag>
          </template>

          <template v-else-if="column.key === 'role_groups'">
            <div class="flex flex-wrap gap-1">
              <a-tag v-for="role in getRoleNames(record.role_group_ids)" :key="`${record.id}-${role}`" color="purple">{{ role }}</a-tag>
              <span v-if="!record.role_group_ids || record.role_group_ids.length === 0" class="text-gray-400">Không có</span>
            </div>
          </template>

          <template v-else-if="column.key === 'action'">
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

    <a-modal v-model:open="visible" :title="modalTitle" @cancel="handleCancel" @ok="handleOk" ok-text="Lưu" cancel-text="Hủy" :confirm-loading="confirmLoading" :width="modalWidth" destroy-on-close>
      <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules">
        <a-form-item label="Tài khoản" name="username">
          <a-input v-model:value="formState.username" :disabled="isEdit" placeholder="Nhập tài khoản" />
        </a-form-item>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <a-form-item label="Họ tên" name="name">
            <a-input v-model:value="formState.name" placeholder="Nhập họ tên" />
          </a-form-item>

          <a-form-item label="Email" name="email">
            <a-input v-model:value="formState.email" type="email" placeholder="Nhập email" />
          </a-form-item>
        </div>

        <a-form-item label="Ảnh đại diện" name="image_url">
          <div class="flex items-center gap-3">
            <div class="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              <img v-if="formState.image_url" :src="formState.image_url" alt="Avatar preview" class="h-full w-full object-cover" />
              <Icon v-else name="ri:image-add-line" class="text-xl text-gray-400" />
            </div>
            <div class="flex-1 space-y-2">
              <a-input v-model:value="formState.image_url" placeholder="https://example.com/avatar.png" />
              <div class="flex flex-wrap items-center gap-2">
                <ClientOnly>
                  <a-upload :show-upload-list="false" :before-upload="handleImageUpload" accept="image/*">
                    <a-button size="small" :loading="imageUploading">
                      <template #icon>
                        <Icon name="ri:upload-2-line" />
                      </template>
                      Upload S3
                    </a-button>
                  </a-upload>
                </ClientOnly>
                <a-button v-if="formState.image_url" size="small" :disabled="imageUploading" @click="clearImage">
                  <template #icon>
                    <Icon name="ri:close-line" />
                  </template>
                  Xóa ảnh
                </a-button>
              </div>
              <p class="text-xs text-gray-500">Upload lên S3 hoặc dán URL trực tiếp.</p>
            </div>
          </div>
        </a-form-item>

        <a-form-item v-if="!isEdit" label="Mật khẩu" name="password">
          <a-input-password v-model:value="formState.password" placeholder="Nhập mật khẩu" />
        </a-form-item>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectRoleUnit v-model="formState.role_group_ids" multiple placeholder="Chọn Nhóm quyền" label="Nhóm quyền" name="role_group_ids" />

          <a-form-item label="Là Admin" name="is_admin">
            <a-switch v-model:checked="formState.is_admin" checked-children="Admin" un-checked-children="User" />
          </a-form-item>
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";

const { unitUsers, unitRoleGroup, s3Unit } = useApi();

const searchText = ref("");
const visible = ref(false);
const isEdit = ref(false);
const confirmLoading = ref(false);
const deletingId = ref("");
const formRef = ref();
const imageUploading = ref(false);

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("md");
const modalWidth = computed(() => (isMobile.value ? "95vw" : 720));

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
  showTotal: total => `Tổng ${total} người dùng`,
});

const {
  data: userData,
  refresh: refreshUsers,
  pending: loading,
} = await unitUsers.get({
  params,
});

const { data: roleGroupData, refresh: refreshRoleGroups } = await unitRoleGroup.get({
  params: { page: 1, limit: 0 },
});

const roleGroupMap = computed(() => {
  const map = {};
  if (roleGroupData.value?.status === "success") {
    (roleGroupData.value.data?.items || []).forEach(item => {
      const id = item.id || item._id || item.key;
      if (id !== undefined && id !== null) {
        const key = String(id);
        map[key] = item.name || item.title || key;
      }
    });
  }
  return map;
});

const getRoleNames = ids => {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  return ids.map(id => {
    const key = String(id);
    return roleGroupMap.value[key] || key;
  });
};

const dataSource = computed(() => {
  if (userData.value?.status === "success") {
    return (userData.value.data?.items || []).map(item => {
      const rawId = item.id ?? item._id ?? item.user_id ?? item.userId ?? item.username ?? "";
      return {
        ...item,
        id: rawId ? String(rawId) : "",
        username: item.username || "",
        name: item.name || "",
        email: item.email || "",
        is_admin: item.is_admin ?? item.isAdmin ?? false,
        image_url: item.image_url ?? item.avatar ?? item.photo ?? "",
        role_group_ids: (item.role_group_ids ?? item.roleGroupIds ?? []).map(id => String(id)),
      };
    });
  }
  return [];
});

watch(
  userData,
  val => {
    if (val?.status === "success") {
      pagination.total = val.data?.totalrecord ?? val.data?.total ?? val.data?.count ?? 0;
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
  { title: "Tài khoản", dataIndex: "username", key: "username" },
  { title: "Họ tên", dataIndex: "name", key: "name" },
  { title: "Email", dataIndex: "email", key: "email" },
  { title: "Quyền", dataIndex: "is_admin", key: "is_admin", align: "center" },
  { title: "Nhóm quyền", dataIndex: "role_group_ids", key: "role_groups" },
  { title: "Thao tác", key: "action", width: 140, align: "center", fixed: "right" },
];

const handleTableChange = async pag => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  params.page = pag.current;
  params.limit = pag.pageSize;
  await refreshUsers();
};

const handleSearch = async () => {
  params.q = searchText.value.trim();
  params.page = 1;
  pagination.current = 1;
  await refreshUsers();
};

const resetSearch = async () => {
  searchText.value = "";
  params.q = "";
  params.page = 1;
  params.limit = 10;
  pagination.current = 1;
  pagination.pageSize = 10;
  await refreshUsers();
};

const formState = reactive({
  id: "",
  username: "",
  password: "",
  name: "",
  email: "",
  is_admin: false,
  role_group_ids: [],
  image_url: "",
});

const rules = {
  username: [
    { required: true, message: "Vui lòng nhập tài khoản", trigger: "blur" },
    { min: 3, message: "Tài khoản tối thiểu 3 ký tự", trigger: "blur" },
  ],
  password: [
    {
      validator: (_rule, value) => {
        if (isEdit.value) return Promise.resolve();
        if (!value) return Promise.reject(new Error("Vui lòng nhập mật khẩu"));
        if (value.length < 6) return Promise.reject(new Error("Mật khẩu tối thiểu 6 ký tự"));
        return Promise.resolve();
      },
      trigger: "blur",
    },
  ],
  name: [{ required: true, message: "Vui lòng nhập họ tên", trigger: "blur" }],
  email: [
    { required: true, message: "Vui lòng nhập email", trigger: "blur" },
    { type: "email", message: "Email không hợp lệ", trigger: "blur" },
  ],
};

const modalTitle = computed(() => (isEdit.value ? "Chỉnh sửa người dùng" : "Thêm người dùng"));

const resetFormState = () => {
  Object.assign(formState, {
    id: "",
    username: "",
    password: "",
    name: "",
    email: "",
    is_admin: false,
    role_group_ids: [],
    image_url: "",
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
    username: record.username || "",
    name: record.name || "",
    email: record.email || "",
    is_admin: !!record.is_admin,
    role_group_ids: Array.isArray(record.role_group_ids) ? record.role_group_ids.map(id => String(id)) : [],
    image_url: record.image_url || record.avatar || record.photo || "",
  });
  visible.value = true;
};

const handleCancel = () => {
  resetFormState();
  visible.value = false;
};

const handleOk = async () => {
  try {
    await formRef.value?.validate();
    confirmLoading.value = true;

    const payload = {
      id: formState.id ? String(formState.id) : undefined,
      username: (formState.username || "").trim(),
      password: formState.password || "",
      name: (formState.name || "").trim(),
      email: (formState.email || "").trim(),
      is_admin: !!formState.is_admin,
      role_group_ids: Array.isArray(formState.role_group_ids) ? formState.role_group_ids.map(id => String(id)) : [],
      image_url: (formState.image_url || "").trim(),
    };

    if (isEdit.value) {
      delete payload.password;
      const { data, error } = await unitUsers.put({ body: payload });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Cập nhật người dùng thành công");
      } else {
        throw new Error(error.value?.data?.message || data.value?.message || "Không thể cập nhật người dùng");
      }
    } else {
      const { id, ...createPayload } = payload;
      const { data, error } = await unitUsers.post({ body: createPayload });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Thêm người dùng thành công");
      } else {
        throw new Error(error.value?.data?.message || data.value?.message || "Không thể thêm người dùng");
      }
    }

    visible.value = false;
    resetFormState();
    await Promise.all([refreshUsers(), refreshRoleGroups()]);
  } catch (err) {
    message.error(err?.message || "Lỗi khi lưu người dùng");
  } finally {
    confirmLoading.value = false;
  }
};

const deleteItem = async record => {
  const id = record.id || record._id;
  if (!id) return;

  deletingId.value = String(id);
  try {
    const { data, error } = await unitUsers.delete({ params: { id: String(id) } });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Đã xóa người dùng");
      await refreshUsers();
    } else {
      message.error(error.value?.data?.message || data.value?.message || "Không thể xóa người dùng");
    }
  } catch (err) {
    message.error(err?.message || "Lỗi khi xóa người dùng");
  } finally {
    deletingId.value = "";
  }
};

const handleImageUpload = async file => {
  const rawFile = file?.originFileObj || file;
  if (!rawFile) return false;

  if (!(rawFile instanceof File)) {
    message.error("File không hợp lệ");
    return false;
  }

  imageUploading.value = true;
  try {
    const url = await s3Unit.upload(rawFile);
    formState.image_url = url;
    message.success("Upload ảnh thành công");
  } catch (err) {
    message.error(err?.message || err?.data?.message || "Upload ảnh thất bại");
  } finally {
    imageUploading.value = false;
  }

  return false;
};

const clearImage = () => {
  formState.image_url = "";
};
</script>

<style scoped></style>
