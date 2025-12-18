<template>
  <div class="min-h-full rounded bg-white p-4 shadow">
    <div class="mb-4 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm super admin..." enter-button @search="handleSearch" class="flex-grow" />
      <a-button @click="resetSearch" class="w-full md:w-auto">Đặt lại</a-button>
      <a-button type="primary" @click="showModal" class="w-full md:w-auto">Thêm mới</a-button>
    </div>

    <ClientOnly class="overflow-x-auto">
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" :scroll="{ x: '900' }" :row-key="record => record.id || record._id || record.username" @change="handleTableChange" bordered size="small">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <div class="flex flex-wrap items-center justify-center gap-1 md:flex-nowrap md:space-x-2">
              <a-tooltip title="Sửa">
                <a-button type="link" size="small" @click="openEditModal(record)">
                  <template #icon>
                    <Icon name="ant-design:edit-outlined" class="text-base" />
                  </template>
                </a-button>
              </a-tooltip>

              <a-popconfirm title="Bạn chắc chắn muốn xóa?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="handleDelete(record)">
                <a-tooltip title="Xóa">
                  <a-button type="link" danger size="small" :loading="deletingId === (record.id || record._id)">
                    <template #icon>
                      <Icon name="ant-design:delete-outlined" class="text-base" />
                    </template>
                  </a-button>
                </a-tooltip>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </ClientOnly>

    <a-modal v-model:open="modalVisible" :title="modalTitle" :confirm-loading="submitting" ok-text="Lưu" cancel-text="Hủy" destroy-on-close @ok="handleSubmit" @cancel="handleCancel">
      <a-form ref="formRef" :model="formState" layout="vertical">
        <a-form-item label="Tài khoản" name="username" :rules="usernameRules">
          <a-input v-model:value="formState.username" :disabled="isEdit" placeholder="Nhập tài khoản" />
        </a-form-item>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <a-form-item label="Họ tên" name="name" :rules="[{ required: true, message: 'Vui lòng nhập họ tên' }]">
            <a-input v-model:value="formState.name" />
          </a-form-item>

          <a-form-item label="Email" name="email" :rules="emailRules">
            <a-input v-model:value="formState.email" type="email" />
          </a-form-item>
        </div>

        <a-form-item :label="isEdit ? 'Mật khẩu mới (tuỳ chọn)' : 'Mật khẩu'" name="password" :rules="passwordRules">
          <a-input-password v-model:value="formState.password" />
        </a-form-item>

        <a-form-item label="Nhóm quyền" name="role_group_ids">
          <a-select v-model:value="formState.role_group_ids" mode="tags" :options="roleGroupOptions" :loading="loadingRoleGroups" allow-clear show-search />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
const { superAdmin, superAdminRoleGroup } = useApi();

/* =======================
   STATE & PARAMS
======================= */
const searchText = ref("");

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

/* =======================
   FETCH LIST (NUXT 4)
======================= */
const {
  data: superAdminData,
  refresh: refreshSuperAdmin,
  pending: loading,
} = await superAdmin.get(
  {
    params,
  },
  "superadmin-get",
);

/* =======================
   COMPUTED TABLE DATA
======================= */
const dataSource = computed(() => {
  if (superAdminData.value?.status === "success") {
    return superAdminData.value.data.items || [];
  }
  return [];
});

watch(superAdminData, val => {
  if (val?.status === "success") {
    pagination.total = val.data.totalrecord ?? val.data.total ?? 0;
  } else {
    pagination.total = 0;
  }
});

/* =======================
   TABLE CONFIG
======================= */
const columns = [
  {
    title: "STT",
    key: "stt",
    width: 60,
    align: "center",
    customRender: ({ index }) => index + 1 + (pagination.current - 1) * pagination.pageSize,
  },
  // { title: "Username", dataIndex: "username", key: "username", width: 100 },
  { title: "Họ tên", dataIndex: "name", key: "name" },
  { title: "Email", dataIndex: "email", key: "email" },
  {
    title: "Quyền",
    dataIndex: "is_admin",
    key: "is_admin",
    align: "center",
    customRender: ({ text }) => (text ? "Admin" : "User"),
  },
  { title: "Thao tác", key: "action", fixed: "right", width: 120 },
];

/* =======================
   SEARCH / PAGINATION
======================= */
const handleSearch = () => {
  params.q = searchText.value.trim();
  params.page = 1;
  pagination.current = 1;
};

const resetSearch = () => {
  searchText.value = "";
  params.q = "";
  params.page = 1;
  params.limit = 10;
  pagination.current = 1;
  pagination.pageSize = 10;
};

const handleTableChange = pag => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  params.page = pag.current;
  params.limit = pag.pageSize;
};

/* =======================
   FORM / MODAL
======================= */
const modalVisible = ref(false);
const isEdit = ref(false);
const submitting = ref(false);
const deletingId = ref("");
const formRef = ref();

const formState = reactive({
  id: "",
  username: "",
  password: "",
  name: "",
  email: "",
  role_group_ids: [],
});

const modalTitle = computed(() => (isEdit.value ? "Cập nhật super admin" : "Thêm super admin"));

const usernameRules = computed(() => (isEdit.value ? [] : [{ required: true, message: "Vui lòng nhập tài khoản" }]));

const emailRules = [
  { required: true, message: "Vui lòng nhập email" },
  { type: "email", message: "Email không hợp lệ" },
];

const passwordRules = computed(() =>
  isEdit.value
    ? [
        {
          validator: (_, v) => (!v || v.length >= 6 ? Promise.resolve() : Promise.reject("Mật khẩu tối thiểu 6 ký tự")),
        },
      ]
    : [
        { required: true, message: "Vui lòng nhập mật khẩu" },
        { min: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
      ],
);

/* =======================
   ROLE GROUPS
======================= */
const loadingRoleGroups = ref(false);
const roleGroupOptions = ref([]);

const fetchRoleGroups = async () => {
  loadingRoleGroups.value = true;
  const { data } = await superAdminRoleGroup.get({
    params: { page: 0, limit: 0 },
  });
  roleGroupOptions.value =
    data.value?.data?.items?.map(i => ({
      label: i.name,
      value: i.id || i._id,
    })) || [];
  loadingRoleGroups.value = false;
};

/* =======================
   CRUD
======================= */
const resetForm = () => {
  Object.assign(formState, {
    id: "",
    username: "",
    password: "",
    name: "",
    email: "",
    role_group_ids: [],
  });
  formRef.value?.clearValidate();
};

const showModal = async () => {
  isEdit.value = false;
  resetForm();
  modalVisible.value = true;
  if (!roleGroupOptions.value.length) await fetchRoleGroups();
};

const openEditModal = async record => {
  isEdit.value = true;
  resetForm();
  Object.assign(formState, {
    id: record.id || record._id,
    username: record.username,
    name: record.name,
    email: record.email,
    role_group_ids: record.role_group_ids || [],
  });
  modalVisible.value = true;
  if (!roleGroupOptions.value.length) await fetchRoleGroups();
};

const handleDelete = async record => {
  const id = record.id || record._id;
  if (!id) return;

  deletingId.value = id;
  try {
    const { data, error: deleteError } = await superAdmin.delete({ params: { id } });
    if (data.value?.status === "success") {
      message.success("Xóa tài khoản thành công");
      await refreshSuperAdmin();
    } else {
      message.error(deleteError.value?.data?.message || "Xóa tài khoản thất bại");
    }
  } catch (error) {
    message.error(error?.message || "Xóa tài khoản thất bại");
  } finally {
    deletingId.value = "";
  }
};

const handleSubmit = async () => {
  await formRef.value.validate();
  submitting.value = true;

  if (isEdit.value) {
    await superAdmin.put({ body: formState });
  } else {
    await superAdmin.post({ body: formState });
  }

  modalVisible.value = false;
  submitting.value = false;
  await refreshSuperAdmin();
};

const handleCancel = () => {
  resetForm();
  modalVisible.value = false;
};
</script>
