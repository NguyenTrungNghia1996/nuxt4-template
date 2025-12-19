<template>
  <div class="min-h-full rounded bg-white p-4 shadow">
    <div class="mb-4 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm gói dịch vụ..." enter-button @search="handleSearch" class="w-full flex-1 md:w-96" />
      <div class="flex w-full flex-col gap-2 md:w-auto md:flex-row">
        <a-button @click="resetSearch" class="w-full md:w-auto">Đặt lại</a-button>
        <a-button type="primary" @click="openCreateModal" class="w-full md:w-auto">Thêm gói</a-button>
      </div>
    </div>

    <ClientOnly class="overflow-x-auto">
      <a-table :columns="columns" :data-source="dataSource" :pagination="pagination" :loading="loading" :scroll="{ x: 1000 }" :row-key="record => record.id" @change="handleTableChange" bordered size="small">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'description'">
            <span :class="{ 'text-gray-400': !record.description }">
              {{ record.description || "Trống" }}
            </span>
          </template>

          <template v-if="column.key === 'price'">
            <span class="font-semibold">{{ formatPrice(record.price) }}</span>
          </template>

          <template v-if="column.key === 'duration'">
            <a-tag color="blue">{{ durationLabel(record.duration) }}</a-tag>
          </template>

          <template v-if="column.key === 'is_active'">
            <a-tag :color="record.is_active ? 'green' : 'red'">
              {{ record.is_active ? "Hoạt động" : "Tạm dừng" }}
            </a-tag>
          </template>

          <template v-if="column.key === 'action'">
            <div class="flex flex-wrap items-center justify-center gap-1 md:flex-nowrap md:gap-2">
              <a-tooltip title="Quản lý menu">
                <a-button type="link" size="small" @click="openMenuModal(record)">
                  <Icon name="ant-design:unordered-list-outlined" class="text-base" />
                </a-button>
              </a-tooltip>

              <a-tooltip title="Sửa">
                <a-button type="link" size="small" @click="openEditModal(record)">
                  <Icon name="ant-design:edit-outlined" class="text-base" />
                </a-button>
              </a-tooltip>

              <a-popconfirm title="Bạn chắc chắn muốn xóa?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="deleteItem(record)">
                <a-tooltip title="Xóa">
                  <a-button type="link" danger size="small" :loading="deletingId === record.id">
                    <Icon name="ant-design:delete-outlined" class="text-base" />
                  </a-button>
                </a-tooltip>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </ClientOnly>

    <a-modal v-model:open="visible" :title="modalTitle" @cancel="handleCancel" :width="1000" destroy-on-close>
      <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <a-form-item label="Tên gói" name="name">
            <a-input v-model:value="formState.name" placeholder="Nhập tên gói dịch vụ" />
          </a-form-item>

          <a-form-item label="Giá" name="price">
            <a-input-number v-model:value="formState.price" class="w-full" :min="0" :step="0.01" placeholder="0.00" />
          </a-form-item>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <a-form-item label="Thời hạn" name="duration">
            <a-select v-model:value="formState.duration" placeholder="Chọn thời hạn">
              <a-select-option v-for="opt in durationOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="Kích hoạt" name="is_active">
            <div class="flex items-center gap-2">
              <a-switch v-model:checked="formState.is_active" />
              <span class="text-sm text-gray-600">{{ formState.is_active ? "Hoạt động" : "Tạm dừng" }}</span>
            </div>
          </a-form-item>
        </div>

        <a-form-item label="Mô tả" name="description">
          <a-textarea v-model:value="formState.description" :rows="3" placeholder="Nhập mô tả gói (nếu có)" />
        </a-form-item>
      </a-form>

      <template #footer>
        <div class="flex justify-end gap-2">
          <a-button @click="handleCancel">Hủy</a-button>
          <a-button type="primary" @click="handleOk" :loading="confirmLoading">
            {{ isEdit ? "Cập nhật" : "Thêm mới" }}
          </a-button>
        </div>
      </template>
    </a-modal>
  </div>
  <a-modal v-model:open="menuModalVisible" :title="menuModalTitle" @cancel="closeMenuModal" :width="1000" destroy-on-close>
    <div class="mb-3 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
      <a-input-search v-model:value="menuSearchText" placeholder="Tìm kiếm menu..." enter-button @search="handleMenuSearch" class="w-full flex-1 md:w-96" />
      <div class="flex w-full flex-col gap-2 md:w-auto md:flex-row">
        <a-button @click="resetMenuSearch" class="w-full md:w-auto">Đặt lại</a-button>
        <a-button type="primary" @click="openMenuForm()" class="w-full md:w-auto">Thêm menu</a-button>
      </div>
    </div>

    <ClientOnly>
      <a-table
        :columns="menuColumns"
        :data-source="menuTreeData"
        :pagination="false"
        :loading="menuLoading"
        :scroll="{ x: 720, y: 420 }"
        :row-key="record => record.id"
        :row-class-name="menuRowClassName"
        :expand-icon-column-index="0"
        bordered
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'icon'">
            <div class="flex items-center gap-2">
              <Icon v-if="record.icon" :name="record.icon" class="text-base" />
            </div>
          </template>

          <template v-if="column.key === 'active'">
            <a-tag :color="record.active ? 'green' : 'red'">
              {{ record.active ? "Hoạt động" : "Ẩn" }}
            </a-tag>
          </template>

          <template v-if="column.key === 'action'">
            <div class="flex flex-wrap items-center justify-center gap-1 md:flex-nowrap md:gap-2">
              <a-tooltip title="Thêm menu con" v-if="canAddChild(record)">
                <a-button type="link" size="small" @click="openMenuForm(undefined, record.id)">
                  <Icon name="ant-design:folder-add-outlined" class="text-base" />
                </a-button>
              </a-tooltip>

              <a-tooltip title="Sửa">
                <a-button type="link" size="small" @click="openMenuForm(record)">
                  <Icon name="ant-design:edit-outlined" class="text-base" />
                </a-button>
              </a-tooltip>

              <a-popconfirm title="Bạn chắc chắn muốn xóa?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="deleteMenu(record)">
                <a-tooltip title="Xóa">
                  <a-button type="link" danger size="small" :loading="menuDeletingId === record.id">
                    <Icon name="ant-design:delete-outlined" class="text-base" />
                  </a-button>
                </a-tooltip>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </ClientOnly>

    <template #footer>
      <div class="flex justify-end">
        <a-button type="primary" @click="closeMenuModal">Đóng</a-button>
      </div>
    </template>
  </a-modal>

  <a-modal v-model:open="menuFormVisible" :title="menuFormTitle" @cancel="closeMenuForm" :width="700" destroy-on-close>
    <a-form ref="menuFormRef" :model="menuFormState" layout="vertical" :rules="menuRules">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <a-form-item label="Tiêu đề" name="title">
          <a-input v-model:value="menuFormState.title" placeholder="Nhập tiêu đề menu" @input="onMenuTitleInput" />
        </a-form-item>

        <a-form-item label="Đường dẫn" name="url">
          <a-input v-model:value="menuFormState.url" placeholder="/path" />
        </a-form-item>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <IconPicker v-model="menuFormState.icon" label="Icon" name="icon" />

        <div class="rounded border border-dashed border-gray-200 bg-gray-50 px-3 py-2">
          <p class="mb-1 text-xs text-gray-500">Menu cha</p>
          <p class="text-sm font-medium text-gray-700">
            {{ currentParentLabel }}
          </p>
        </div>
      </div>

      <a-form-item label="Kích hoạt" name="active" class="mt-4">
        <a-switch v-model:checked="menuFormState.active" />
      </a-form-item>
    </a-form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <a-button @click="closeMenuForm">Hủy</a-button>
        <a-button type="primary" @click="handleMenuSave" :loading="menuConfirmLoading">
          {{ isMenuEdit ? "Cập nhật" : "Thêm mới" }}
        </a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
const { servicePackages, servicePackageMenus } = useApi();
const ROOT_PARENT_ID = "000000000000000000000000";

const searchText = ref("");
const visible = ref(false);
const isEdit = ref(false);
const confirmLoading = ref(false);
const deletingId = ref("");
const formRef = ref();

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
  showTotal: total => `Tổng ${total} gói`,
});

const {
  data: packageResponse,
  refresh: refreshPackages,
  pending: loading,
} = await servicePackages.get({
  params,
});

const dataSource = computed(() => {
  if (packageResponse.value?.status === "success") {
    return (packageResponse.value.data?.items || []).map(item => ({
      ...item,
      id: item.id || item._id || "",
      name: item.name || "",
      description: item.description || "",
      price: Number(item.price ?? 0),
      duration: item.duration || "",
      is_active: item.is_active ?? true,
    }));
  }
  return [];
});

watch(
  packageResponse,
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
  { title: "Tên gói", dataIndex: "name", key: "name", ellipsis: true },
  { title: "Mô tả", dataIndex: "description", key: "description", ellipsis: true },
  { title: "Giá", dataIndex: "price", key: "price", width: 120 },
  { title: "Thời hạn", dataIndex: "duration", key: "duration", width: 120 },
  { title: "Trạng thái", dataIndex: "is_active", key: "is_active", width: 120 },
  { title: "Thao tác", key: "action", width: 180, align: "center", fixed: "right" },
];

const durationOptions = [
  { value: "monthly", label: "Theo tháng" },
  { value: "quarterly", label: "Theo quý" },
  { value: "yearly", label: "Theo năm" },
  { value: "lifetime", label: "Trọn đời" },
];

const formState = reactive({
  id: "",
  name: "",
  description: "",
  price: 0,
  duration: "",
  is_active: true,
});

const validatePrice = (_rule, value) => {
  if (value === undefined || value === null || value === "") return Promise.reject("Vui lòng nhập giá");
  if (Number(value) < 0) return Promise.reject("Giá không hợp lệ");
  return Promise.resolve();
};

const rules = {
  name: [{ required: true, message: "Vui lòng nhập tên gói", trigger: "blur" }],
  duration: [{ required: true, message: "Vui lòng chọn thời hạn", trigger: "change" }],
  price: [{ validator: validatePrice, trigger: "blur" }],
};

const modalTitle = computed(() => (isEdit.value ? "Chỉnh sửa gói dịch vụ" : "Thêm gói dịch vụ"));

const handleSearch = async () => {
  params.q = searchText.value.trim();
  params.page = 1;
  pagination.current = 1;
  await refreshPackages();
};

const resetSearch = async () => {
  searchText.value = "";
  params.q = "";
  params.page = 1;
  params.limit = 10;
  pagination.current = 1;
  pagination.pageSize = 10;
  await refreshPackages();
};

const handleTableChange = async pag => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  params.page = pag.current;
  params.limit = pag.pageSize;
  await refreshPackages();
};

const formatPrice = price => {
  const num = Number(price);
  if (Number.isNaN(num)) return "0";
  return num.toLocaleString("vi-VN", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

const durationLabel = val => {
  const map = {
    monthly: "Theo tháng",
    quarterly: "Theo quý",
    yearly: "Theo năm",
    lifetime: "Trọn đời",
  };
  return map[val] || val || "Không rõ";
};

const resetFormState = () => {
  Object.assign(formState, {
    id: "",
    name: "",
    description: "",
    price: 0,
    duration: "",
    is_active: true,
  });
  formRef.value?.clearValidate();
};

const openCreateModal = async () => {
  isEdit.value = false;
  resetFormState();
  visible.value = true;
};

const openEditModal = async record => {
  isEdit.value = true;
  resetFormState();

  Object.assign(formState, {
    id: record.id || record._id || "",
    name: record.name || "",
    description: record.description || "",
    price: Number(record.price ?? 0),
    duration: record.duration || "",
    is_active: record.is_active ?? true,
  });
  nextTick(() => formRef.value?.clearValidate());
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
      price: Number(formState.price ?? 0),
      duration: formState.duration,
      is_active: !!formState.is_active,
    };

    if (isEdit.value) {
      const { data, error } = await servicePackages.put({ body: payload });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Cập nhật gói dịch vụ thành công");
      } else {
        throw new Error(error.value?.data?.message || data.value?.message || "Không thể cập nhật gói dịch vụ");
      }
    } else {
      const { id, ...createPayload } = payload;
      const { data, error } = await servicePackages.post({ body: createPayload });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Thêm gói dịch vụ thành công");
      } else {
        throw new Error(error.value?.data?.message || data.value?.message || "Không thể thêm gói dịch vụ");
      }
    }

    visible.value = false;
    resetFormState();
    await refreshPackages();
  } catch (err) {
    message.error(err?.message || "Lỗi khi lưu gói dịch vụ");
  } finally {
    confirmLoading.value = false;
  }
};

const handleCancel = () => {
  resetFormState();
  visible.value = false;
};

const deleteItem = async record => {
  const id = record.id || record._id || "";
  if (!id) return;
  deletingId.value = id;
  try {
    const { data, error } = await servicePackages.delete({ params: { id } });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Xóa gói dịch vụ thành công");
      await refreshPackages();
    } else {
      message.error(error.value?.data?.message || data.value?.message || "Không thể xóa gói dịch vụ");
    }
  } catch (error) {
    message.error(error?.message || "Lỗi khi xóa gói dịch vụ");
  } finally {
    deletingId.value = "";
  }
};

// =========================
// MENU MANAGEMENT FOR PACKAGE
// =========================
const menuModalVisible = ref(false);
const menuFormVisible = ref(false);
const isMenuEdit = ref(false);
const menuConfirmLoading = ref(false);
const menuDeletingId = ref("");
const menuFormRef = ref();
const managingPackage = ref({ id: "", name: "" });
const menuSearchText = ref("");

const normalizeParent = val => {
  if (val === undefined || val === null) return ROOT_PARENT_ID;
  const str = String(val);
  if (!str || str === "null" || str === "undefined") return ROOT_PARENT_ID;
  return str;
};

const generateRandomMenuKey = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "pkg-menu-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const getNextAvailablePermission = parentId => {
  const siblings = menuData.value.filter(item => normalizeParent(item.parent_id) === normalizeParent(parentId));
  const used = siblings.map(item => Number(item.permission)).filter(num => !Number.isNaN(num));
  if (!used.length) return 0;
  return Math.max(...used) + 2;
};

const onMenuTitleInput = e => {
  menuFormState.title = e.target.value;
  if (!isMenuEdit.value) {
    menuFormState.key = generateRandomMenuKey();
  }
};

const menuParams = reactive({
  service_package_id: "",
  page: 1,
  limit: 0,
  q: "",
});

const {
  data: menuResponse,
  refresh: refreshPackageMenus,
  pending: menuLoading,
} = await servicePackageMenus.get({
  params: menuParams,
  immediate: false,
});

const menuData = computed(() => {
  if (menuResponse.value?.status === "success") {
    return (menuResponse.value.data?.items || []).map(item => ({
      ...item,
      id: item.id || item._id || "",
      service_package_id: item.service_package_id || menuParams.service_package_id || "",
      title: item.title || "",
      key: item.key || "",
      url: item.url || "",
      icon: item.icon || "",
      parent_id: normalizeParent(item.parent_id),
      permission: Number(item.permission ?? 0),
      active: item.active ?? true,
    }));
  }
  return [];
});

const buildMenuTree = (items, parentId = ROOT_PARENT_ID) => {
  const normalizedParent = normalizeParent(parentId);
  return items
    .filter(item => normalizeParent(item.parent_id) === normalizedParent)
    .map(item => ({
      ...item,
      children: buildMenuTree(items, item.id),
    }));
};

const menuTreeData = computed(() => buildMenuTree(menuData.value));

const menuModalTitle = computed(() => (managingPackage.value.name ? `Menu - ${managingPackage.value.name}` : "Menu gói dịch vụ"));
const menuFormTitle = computed(() => (isMenuEdit.value ? "Chỉnh sửa menu gói" : "Thêm menu gói"));

const menuParentLabel = parentId => {
  if (!parentId || normalizeParent(parentId) === ROOT_PARENT_ID) return "Menu gốc";
  const parent = menuData.value.find(item => item.id === parentId);
  return parent?.title || "Menu gốc";
};

const menuColumns = [
  { title: "Tiêu đề", dataIndex: "title", key: "title", width: 220 },
  { title: "Key", dataIndex: "key", key: "key", width: 170 },
  { title: "Đường dẫn", dataIndex: "url", key: "url", width: 210, ellipsis: true },
  { title: "Icon", dataIndex: "icon", key: "icon", width: 120 },
  { title: "Trạng thái", dataIndex: "active", key: "active", width: 110 },
  { title: "Thao tác", key: "action", width: 170, align: "center", fixed: "right" },
];

const openMenuModal = async record => {
  const id = record.id || record._id;
  if (!id) {
    message.warning("Không tìm thấy gói dịch vụ");
    return;
  }

  managingPackage.value = { id: String(id), name: record.name || "" };
  menuParams.service_package_id = String(id);
  menuParams.page = 1;
  menuParams.limit = 0;
  menuParams.q = "";
  menuSearchText.value = "";

  await refreshPackageMenus();
  menuModalVisible.value = true;
};

const closeMenuModal = () => {
  menuModalVisible.value = false;
  closeMenuForm();
};

const handleMenuSearch = async () => {
  menuParams.q = menuSearchText.value.trim();
  menuParams.page = 1;
  await refreshPackageMenus();
};

const resetMenuSearch = async () => {
  menuSearchText.value = "";
  menuParams.q = "";
  menuParams.page = 1;
  await refreshPackageMenus();
};

const menuFormState = reactive({
  id: "",
  service_package_id: "",
  title: "",
  key: "",
  url: "",
  icon: "",
  parent_id: ROOT_PARENT_ID,
  permission: 0,
  active: true,
});

const menuRules = {
  title: [{ required: true, message: "Vui lòng nhập tiêu đề", trigger: "blur" }],
  url: [{ required: true, message: "Vui lòng nhập đường dẫn", trigger: "blur" }],
};

const currentParentLabel = computed(() => menuParentLabel(menuFormState.parent_id));

watch(
  () => menuFormState.parent_id,
  newVal => {
    if (!isMenuEdit.value) {
      menuFormState.permission = getNextAvailablePermission(newVal);
    }
  },
);

const resetMenuForm = (parentId = ROOT_PARENT_ID) => {
  const normalizedParent = normalizeParent(parentId);
  Object.assign(menuFormState, {
    id: "",
    service_package_id: managingPackage.value.id || "",
    title: "",
    key: generateRandomMenuKey(),
    url: "",
    icon: "",
    parent_id: normalizedParent,
    permission: getNextAvailablePermission(normalizedParent),
    active: true,
  });
  menuFormRef.value?.clearValidate();
};

const getDepth = record => {
  let depth = 1;
  let currentParent = menuData.value.find(item => item.id === normalizeParent(record.parent_id));
  while (currentParent) {
    depth += 1;
    currentParent = menuData.value.find(item => item.id === normalizeParent(currentParent.parent_id));
  }
  return depth;
};

const canAddChild = record => getDepth(record) < 2;
const menuRowClassName = record => {
  const level = getDepth(record);
  if (level === 1) return "level-1-row";
  if (level === 2) return "level-2-row";
  return "";
};

const openMenuForm = (record, parentId) => {
  if (!managingPackage.value.id) {
    message.warning("Vui lòng chọn gói dịch vụ trước");
    return;
  }

  isMenuEdit.value = !!record;
  const targetParent = normalizeParent(record ? record.parent_id : parentId || ROOT_PARENT_ID);
  resetMenuForm(targetParent);

  if (record) {
    Object.assign(menuFormState, {
      id: record.id || "",
      service_package_id: record.service_package_id || managingPackage.value.id,
      title: record.title || "",
      key: record.key || "",
      url: record.url || "",
      icon: record.icon || "",
      parent_id: normalizeParent(record.parent_id),
      permission: Number(record.permission ?? 0),
      active: record.active ?? true,
    });
  }

  menuFormVisible.value = true;
};

const closeMenuForm = () => {
  resetMenuForm();
  menuFormVisible.value = false;
};

const handleMenuSave = async () => {
  try {
    await menuFormRef.value.validate();
    menuConfirmLoading.value = true;

    if (!menuFormState.key) {
      menuFormState.key = generateRandomMenuKey();
    }

    const normalizedParentId = normalizeParent(menuFormState.parent_id);
    const payload = {
      ...menuFormState,
      id: menuFormState.id ? String(menuFormState.id) : "",
      service_package_id: managingPackage.value.id || menuFormState.service_package_id,
      title: (menuFormState.title || "").trim(),
      key: (menuFormState.key || "").trim(),
      url: (menuFormState.url || "").trim(),
      icon: (menuFormState.icon || "").trim(),
      parent_id: normalizedParentId === ROOT_PARENT_ID ? "" : normalizedParentId,
      permission: Number(menuFormState.permission ?? 0),
      active: !!menuFormState.active,
    };

    if (!payload.service_package_id) {
      throw new Error("Thiếu ID gói dịch vụ");
    }

    if (isMenuEdit.value) {
      const { data, error } = await servicePackageMenus.put({ body: payload });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Cập nhật menu thành công");
      } else {
        throw new Error(error.value?.data?.message || data.value?.message || "Không thể cập nhật menu");
      }
    } else {
      const { id, ...createPayload } = payload;
      const { data, error } = await servicePackageMenus.post({ body: createPayload });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Thêm menu thành công");
      } else {
        throw new Error(error.value?.data?.message || data.value?.message || "Không thể thêm menu");
      }
    }

    menuFormVisible.value = false;
    resetMenuForm();
    await refreshPackageMenus();
  } catch (err) {
    message.error(err?.message || "Lỗi khi lưu menu");
  } finally {
    menuConfirmLoading.value = false;
  }
};

const deleteMenu = async record => {
  const id = record.id || record._id || "";
  const servicePackageId = managingPackage.value.id;
  if (!id || !servicePackageId) return;

  menuDeletingId.value = id;
  try {
    const { data, error } = await servicePackageMenus.delete({ params: { id, service_package_id: servicePackageId } });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Xóa menu thành công");
      await refreshPackageMenus();
    } else {
      message.error(error.value?.data?.message || data.value?.message || "Không thể xóa menu");
    }
  } catch (error) {
    message.error(error?.message || "Lỗi khi xóa menu");
  } finally {
    menuDeletingId.value = "";
  }
};
</script>

<style scoped>
:deep(.level-1-row) {
  background-color: #fafafa;
}
:deep(.level-2-row) {
  background-color: #f5f5f5;
}
</style>
