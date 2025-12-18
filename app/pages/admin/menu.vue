<template>
  <div class="min-h-full rounded bg-white p-4 shadow">
    <div class="mb-4 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm menu..." enter-button @search="handleSearch" class="w-full flex-1 md:w-96" />
      <div class="flex w-full flex-col gap-2 md:w-auto md:flex-row">
        <a-button @click="resetSearch" class="w-full md:w-auto">Đặt lại</a-button>
        <a-button type="primary" @click="showModal(0)" class="w-full md:w-auto">Thêm mới</a-button>
      </div>
    </div>

    <ClientOnly>
      <a-table :columns="columns" :data-source="nestedMenuData" :pagination="false" :loading="loading" :scroll="{ x: 1000 }" :row-class-name="rowClassName" :expand-icon-column-index="0" :row-key="record => record.id" bordered size="small">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'icon'">
            <div class="flex items-center gap-2">
              <Icon v-if="record.icon" :name="record.icon" class="text-base" />
              <!-- <span class="text-xs text-gray-500">{{ record.icon || "N/A" }}</span> -->
            </div>
          </template>

          <template v-if="column.key === 'active'">
            <a-tag :color="record.active ? 'green' : 'red'">
              {{ record.active ? "Hoạt động" : "Ẩn" }}
            </a-tag>
          </template>

          <template v-if="column.key === 'action'">
            <div class="flex justify-center gap-2">
              <a-tooltip title="Thêm menu con" v-if="getDepth(record) < 2">
                <a-button type="link" size="small" @click="showModal(record.id)">
                  <Icon name="ant-design:folder-add-outlined" class="text-base" />
                </a-button>
              </a-tooltip>

              <a-tooltip title="Sửa">
                <a-button type="link" size="small" @click="editItem(record)">
                  <Icon name="ant-design:edit-outlined" class="text-base" />
                </a-button>
              </a-tooltip>

              <a-popconfirm title="Bạn chắc chắn muốn xóa?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="deleteItem(record.id)">
                <a-tooltip title="Xóa">
                  <a-button type="link" danger size="small">
                    <Icon name="ant-design:delete-outlined" class="text-base" />
                  </a-button>
                </a-tooltip>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </ClientOnly>

    <a-modal v-model:open="visible" :title="isEdit ? 'Chỉnh sửa menu' : currentParentId ? 'Thêm menu con' : 'Thêm menu mới'" @cancel="handleCancel" :width="700" :footer="null" destroy-on-close>
      <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules">
        <a-form-item label="Tiêu đề menu" name="title">
          <a-input v-model:value="formState.title" placeholder="Nhập tiêu đề menu" @input="onTitleInput" />
        </a-form-item>

        <a-form-item label="Key menu" name="key">
          <a-input v-model:value="formState.key" :disabled="true" placeholder="Tự động sinh từ tiêu đề" />
        </a-form-item>

        <a-form-item label="Đường dẫn" name="url">
          <a-input v-model:value="formState.url" placeholder="/admin/dashboard" />
        </a-form-item>

        <IconPicker v-model="formState.icon" label="Icon" name="icon" />

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="rounded border border-dashed border-gray-200 bg-gray-50 px-3 py-2">
            <p class="mb-1 text-xs text-gray-500">Menu cha</p>
            <p class="text-sm font-medium text-gray-700">
              {{ parentLabel || "Menu gốc" }}
            </p>
          </div>

          <a-form-item label="Kích hoạt" name="active">
            <a-switch v-model:checked="formState.active" />
          </a-form-item>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <a-button @click="handleCancel">Hủy</a-button>
          <a-button type="primary" @click="handleOk" :loading="confirmLoading">
            {{ isEdit ? "Cập nhật" : "Thêm mới" }}
          </a-button>
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
const { superAdminMenu } = useApi();

const searchText = ref("");
const visible = ref(false);
const confirmLoading = ref(false);
const isEdit = ref(false);
const ROOT_PARENT_ID = "000000000000000000000000";
const currentParentId = ref(ROOT_PARENT_ID);

const formRef = ref();
const dataSource = ref([]);
const nestedMenuData = ref([]);

const formState = reactive({
  id: "",
  title: "",
  key: "",
  url: "",
  icon: "",
  parent_id: ROOT_PARENT_ID,
  permission: 0,
  active: true,
});

const rules = {
  title: [{ required: true, message: "Vui lòng nhập tiêu đề", trigger: "blur" }],
  key: [{ required: true, message: "Vui lòng nhập key", trigger: "blur" }],
  url: [{ required: true, message: "Vui lòng nhập đường dẫn", trigger: "blur" }],
};

const columns = [
  { title: "Tiêu đề", dataIndex: "title", key: "title", width: 220 },
  { title: "Key", dataIndex: "key", key: "key", width: 180 },
  { title: "Đường dẫn", dataIndex: "url", key: "url", width: 220, ellipsis: true },
  { title: "Icon", dataIndex: "icon", key: "icon", width: 160 },
  { title: "Trạng thái", dataIndex: "active", key: "active", width: 120 },
  { title: "Thao tác", key: "action", align: "center", fixed: "right", width: 180 },
];

const params = reactive({
  page: 1,
  limit: 0,
  q: "",
  sort_order: "asc",
});

const {
  data: menuResponse,
  refresh: refreshMenus,
  pending: loading,
} = await superAdminMenu.get(
  {
    params,
  },
  "superadmin-menu",
);

const normalizeParent = val => {
  if (val === undefined || val === null || val === "" || val === ROOT_PARENT_ID) return ROOT_PARENT_ID;
  return String(val);
};

const buildNestedMenu = (items, parentId = ROOT_PARENT_ID) => {
  const normalizedParent = normalizeParent(parentId);
  return items.filter(i => normalizeParent(i.parent_id) === normalizedParent).map(i => ({ ...i, children: buildNestedMenu(items, i.id) }));
};

const parentLabel = computed(() => {
  if (!formState.parent_id || normalizeParent(formState.parent_id) === ROOT_PARENT_ID) return "";
  const parent = dataSource.value.find(i => String(i.id) === normalizeParent(formState.parent_id));
  return parent?.title || "";
});

const syncTableData = val => {
  if (val?.status === "success") {
    const items = (val.data?.items || []).map(item => ({
      ...item,
      id: item.id ? String(item.id) : "",
      parent_id: normalizeParent(item.parent_id),
      active: item.active ?? true,
    }));

    dataSource.value = items;
    nestedMenuData.value = buildNestedMenu(items);
  } else {
    dataSource.value = [];
    nestedMenuData.value = [];
  }
};

watch(menuResponse, syncTableData, { immediate: true });

const generateRandomKey = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "menu-";
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const onTitleInput = e => {
  formState.title = e.target.value;
  if (!isEdit.value) {
    formState.key = generateRandomKey();
  }
};

const getNextAvailablePermission = parentId => {
  const siblings = dataSource.value.filter(item => normalizeParent(item.parent_id) === normalizeParent(parentId));
  const used = siblings.map(item => Number(item.permission)).filter(num => !Number.isNaN(num));
  let candidate = 0;
  while (used.includes(candidate)) {
    candidate += 1;
  }
  return candidate;
};

const getDepth = record => {
  let depth = 1;
  let parent = dataSource.value.find(i => String(i.id) === normalizeParent(record.parent_id));
  while (parent) {
    depth += 1;
    parent = dataSource.value.find(i => String(i.id) === normalizeParent(parent.parent_id));
  }
  return depth;
};

const rowClassName = record => {
  const level = getDepth(record);
  if (level === 1) return "level-1-row";
  if (level === 2) return "level-2-row";
  return "";
};

const showModal = parentId => {
  if (parentId) {
    const parent = dataSource.value.find(i => i.id === parentId);
    if (parent && getDepth(parent) >= 2) {
      return message.warning("Chỉ cho phép tối đa 2 cấp menu");
    }
  }

  isEdit.value = false;
  currentParentId.value = parentId ? String(parentId) : ROOT_PARENT_ID;
  Object.assign(formState, {
    id: "",
    title: "",
    key: generateRandomKey(),
    url: "",
    icon: "",
    parent_id: parentId ? String(parentId) : ROOT_PARENT_ID,
    permission: getNextAvailablePermission(parentId ? String(parentId) : ROOT_PARENT_ID),
    active: true,
  });
  nextTick(() => formRef.value?.clearValidate());
  visible.value = true;
};

const editItem = record => {
  isEdit.value = true;
  currentParentId.value = record.parent_id ? String(record.parent_id) : ROOT_PARENT_ID;
  Object.assign(formState, {
    id: record.id ? String(record.id) : "",
    title: record.title,
    key: record.key,
    url: record.url,
    icon: record.icon,
    parent_id: record.parent_id ? String(record.parent_id) : ROOT_PARENT_ID,
    permission: record.permission ?? 0,
    active: record.active ?? true,
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
      parent_id: formState.parent_id ? String(formState.parent_id) : ROOT_PARENT_ID,
      id: formState.id ? String(formState.id) : "",
    };

    if (isEdit.value) {
      const { data, error } = await superAdminMenu.put({ body: payload });
      if (data.value?.status === "success") {
        message.success("Cập nhật menu thành công");
      } else {
        throw new Error(error.value?.data?.message || data.value?.message || "Không thể cập nhật menu");
      }
    } else {
      const { id, ...createPayload } = payload;
      const { data, error } = await superAdminMenu.post({ body: createPayload });
      if (data.value?.status === "success") {
        message.success("Thêm menu thành công");
      } else {
        throw new Error(error.value?.data?.message || data.value?.message || "Không thể thêm menu");
      }
    }

    visible.value = false;
    await refreshMenus();
  } catch (err) {
    message.error(err?.message || "Lỗi khi lưu menu");
  } finally {
    confirmLoading.value = false;
  }
};

const handleCancel = () => {
  formRef.value?.resetFields();
  visible.value = false;
};

const deleteItem = async id => {
  try {
    const { data, error } = await superAdminMenu.delete({ params: { id: id ? String(id) : "" } });
    if (data.value?.status === "success") {
      message.success("Xóa menu thành công");
      await refreshMenus();
    } else {
      message.error(error.value?.data?.message || data.value?.message || "Không thể xóa menu");
    }
  } catch (error) {
    message.error(error?.message || "Lỗi khi xóa menu");
  }
};

const handleSearch = async () => {
  params.q = searchText.value.trim();
  params.page = 1;
  await refreshMenus();
};

const resetSearch = async () => {
  searchText.value = "";
  params.q = "";
  params.page = 1;
  await refreshMenus();
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
