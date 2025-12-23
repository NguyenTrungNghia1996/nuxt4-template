<template>
  <div class="min-h-full rounded bg-white p-4 shadow">
    <div class="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <a-input-search v-model:value="searchText" placeholder="Tìm kiếm đơn vị..." enter-button @search="handleSearch" class="w-full md:w-96" />
      <div class="flex w-full flex-col gap-2 md:w-auto md:flex-row">
        <a-button @click="resetSearch" class="w-full md:w-auto">Đặt lại</a-button>
        <a-button type="primary" @click="openCreateModal" class="w-full md:w-auto">Thêm đơn vị</a-button>
      </div>
    </div>

    <ClientOnly class="overflow-x-auto">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :pagination="pagination"
        :loading="loading"
        :scroll="{ x: 1100 }"
        :row-key="record => record.id || record._id || record.subdomain"
        @change="handleTableChange"
        bordered
        size="small"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'stt'">
            {{ index + 1 + (pagination.current - 1) * pagination.pageSize }}
          </template>

          <template v-else-if="column.key === 'unit'">
            <div class="flex items-center gap-3">
              <div class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                <img v-if="record.logo_url" :src="record.logo_url" alt="logo" class="h-full w-full object-cover" />
                <Icon v-else name="ri:building-2-line" class="text-xl text-gray-400" />
              </div>
              <div class="min-w-0">
                <p class="truncate font-semibold text-gray-900">{{ record.name || "Chưa đặt tên" }}</p>
                <p v-if="record.description" class="truncate text-sm text-gray-500">
                  {{ record.description }}
                </p>
              </div>
            </div>
          </template>

          <template v-else-if="column.key === 'subdomain'">
            <div class="space-y-1">
              <a-tag color="blue">{{ record.subdomain || "-" }}</a-tag>
              <p v-if="record.subdomain" class="text-xs text-gray-500">{{ renderSubdomainUrl(record.subdomain) }}</p>
            </div>
          </template>

          <template v-else-if="column.key === 'packages'">
            <div class="space-y-1">
              <template v-if="(record.service_packages || []).length">
                <div
                  v-for="(pkg, pkgIndex) in record.service_packages"
                  :key="pkg.service_package_id || pkg.id || pkg._id || pkgIndex"
                  class="rounded border border-gray-100 bg-gray-50 px-2 py-1"
                >
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-sm font-medium text-gray-900">{{ resolvePackageName(pkg) }}</span>
                    <a-tag v-if="pkg.start_at && pkg.end_at" size="small" color="green">
                      {{ formatRange(pkg.start_at, pkg.end_at) }}
                    </a-tag>
                  </div>
                  <p v-if="!pkg.start_at || !pkg.end_at" class="text-xs text-gray-500">Chưa cấu hình thời gian</p>
                </div>
              </template>
              <span v-else class="text-sm text-gray-400">Chưa gán gói</span>
            </div>
          </template>

          <template v-else-if="column.key === 'action'">
            <div class="flex flex-wrap items-center justify-center gap-1 md:flex-nowrap md:gap-2">
              <a-tooltip title="Sửa">
                <a-button type="link" size="small" @click="openEditModal(record)">
                  <Icon name="ant-design:edit-outlined" class="text-base" />
                </a-button>
              </a-tooltip>

              <a-popconfirm title="Bạn chắc chắn muốn xóa?" ok-text="Đồng ý" cancel-text="Hủy" @confirm="deleteUnit(record)">
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

    <a-modal v-model:open="modalVisible" :title="modalTitle" :width="900" destroy-on-close @cancel="handleCancel">
      <a-form ref="formRef" :model="formState" layout="vertical">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <a-form-item label="Subdomain" name="subdomain" :rules="[{ required: true, message: 'Vui lòng nhập subdomain' }]">
            <a-input v-model:value="formState.subdomain" placeholder="sales" />
          </a-form-item>

          <a-form-item label="Tên đơn vị" name="name" :rules="[{ required: true, message: 'Vui lòng nhập tên đơn vị' }]">
            <a-input v-model:value="formState.name" placeholder="Sales Department" />
          </a-form-item>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <a-form-item label="Logo URL" name="logo_url">
            <a-input v-model:value="formState.logo_url" placeholder="https://example.com/logo.png" />
          </a-form-item>

          <a-form-item label="Mô tả" name="description">
            <a-input v-model:value="formState.description" placeholder="Mô tả ngắn" />
          </a-form-item>
        </div>

        <div class="flex items-center justify-between gap-2 border-b border-dashed border-gray-200 pb-2">
          <div>
            <p class="text-sm font-semibold text-gray-900">Gói dịch vụ</p>
            <p class="text-xs text-gray-500">Chọn gói + thời gian hiệu lực (tùy chọn nhiều gói)</p>
          </div>
          <a-button type="dashed" size="small" @click="addServicePackageRow">
            <template #icon>
              <Icon name="ant-design:plus-outlined" />
            </template>
            Thêm gói
          </a-button>
        </div>

        <div class="mt-3 space-y-3">
          <template v-if="formState.service_packages.length">
            <div v-for="(pkg, idx) in formState.service_packages" :key="`pkg-${idx}`" class="rounded-lg border border-gray-100 bg-gray-50 p-3 shadow-sm">
              <div class="mb-2 flex items-center justify-between">
                <div class="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <Icon name="ri:package-line" class="text-base text-emerald-500" />
                  Gói #{{ idx + 1 }}
                </div>
                <a-button v-if="formState.service_packages.length > 1" type="text" danger size="small" @click="removeServicePackageRow(idx)">
                  <Icon name="ant-design:delete-outlined" />
                </a-button>
              </div>

              <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                <a-form-item class="mb-0" label="Gói dịch vụ">
                  <SelectServicePackage v-model="pkg.service_package_id" placeholder="Chọn gói" />
                </a-form-item>

                <a-form-item class="mb-0" label="Thời gian hiệu lực">
                  <a-range-picker v-model:value="pkg.range" show-time class="w-full" format="YYYY-MM-DD HH:mm" />
                </a-form-item>
              </div>
            </div>
          </template>
          <div v-else class="rounded-lg border border-dashed border-gray-200 p-3 text-sm text-gray-500">
            Chưa có gói dịch vụ nào. Nhấn "Thêm gói" để bắt đầu.
          </div>
        </div>

        <div v-if="!isEdit" class="mt-5 rounded-lg border border-dashed border-gray-200 p-3">
          <div class="flex items-center justify-between gap-2 pb-2">
            <div>
              <p class="text-sm font-semibold text-gray-900">Tài khoản Admin cho đơn vị</p>
              <p class="text-xs text-gray-500">Thông tin bắt buộc khi tạo mới</p>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <a-form-item label="Tài khoản" :name="['admin_user', 'username']" :rules="adminRules.username">
              <a-input v-model:value="formState.admin_user.username" placeholder="admin" />
            </a-form-item>

            <a-form-item label="Mật khẩu" :name="['admin_user', 'password']" :rules="adminRules.password">
              <a-input-password v-model:value="formState.admin_user.password" placeholder="••••••" />
            </a-form-item>

            <a-form-item label="Họ tên" :name="['admin_user', 'name']" :rules="adminRules.name">
              <a-input v-model:value="formState.admin_user.name" placeholder="Sales Admin" />
            </a-form-item>

            <a-form-item label="Email" :name="['admin_user', 'email']" :rules="adminRules.email">
              <a-input type="email" v-model:value="formState.admin_user.email" placeholder="sales.admin@example.com" />
            </a-form-item>
          </div>
        </div>
      </a-form>

      <template #footer>
        <div class="flex justify-end gap-2">
          <a-button @click="handleCancel">Hủy</a-button>
          <a-button type="primary" :loading="confirmLoading" @click="handleSubmit">
            {{ isEdit ? "Cập nhật" : "Tạo mới" }}
          </a-button>
        </div>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
const { units } = useApi();
const { $dayjs } = useNuxtApp();
const config = useRuntimeConfig();

const baseDomain = computed(() => {
  const url = config.public.baseURL || "";
  try {
    const parsed = new URL(url);
    return parsed.hostname || "";
  } catch (err) {
    return (url || "").replace(/^https?:\/\//, "");
  }
});

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
  pageSizeOptions: ["10", "20", "50"],
  showTotal: total => `Tổng ${total} đơn vị`,
});

const {
  data: unitResponse,
  refresh: refreshUnits,
  pending: loading,
} = await units.get({
  params,
});

const dataSource = computed(() => {
  if (unitResponse.value?.status === "success") {
    return unitResponse.value.data?.items || [];
  }
  return [];
});

watch(unitResponse, val => {
  pagination.total = val?.status === "success" ? val.data?.total ?? val.data?.totalrecord ?? 0 : 0;
});

const columns = [
  { title: "STT", key: "stt", width: 70, align: "center" },
  { title: "Đơn vị", dataIndex: "name", key: "unit", width: 260 },
  { title: "Subdomain", dataIndex: "subdomain", key: "subdomain", width: 160 },
  { title: "Gói dịch vụ", key: "packages", width: 320 },
  { title: "Thao tác", key: "action", fixed: "right", width: 120 },
];

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

const modalVisible = ref(false);
const isEdit = ref(false);
const confirmLoading = ref(false);
const formRef = ref();
const deletingId = ref("");

const formState = reactive({
  id: "",
  subdomain: "",
  name: "",
  description: "",
  logo_url: "",
  service_packages: [],
  admin_user: {
    username: "",
    password: "",
    name: "",
    email: "",
  },
});

const adminRules = computed(() => ({
  username: isEdit.value ? [] : [{ required: true, message: "Nhập tài khoản admin" }],
  password: isEdit.value ? [] : [{ required: true, message: "Nhập mật khẩu" }],
  name: isEdit.value ? [] : [{ required: true, message: "Nhập họ tên admin" }],
  email: isEdit.value
    ? []
    : [
        { required: true, message: "Nhập email admin" },
        { type: "email", message: "Email không hợp lệ" },
      ],
}));

const modalTitle = computed(() => (isEdit.value ? "Cập nhật đơn vị" : "Thêm đơn vị"));

const createEmptyPackageRow = () => ({
  service_package_id: "",
  range: [],
});

const addServicePackageRow = () => {
  formState.service_packages.push(createEmptyPackageRow());
};

const removeServicePackageRow = index => {
  if (formState.service_packages.length <= 1) {
    formState.service_packages = [createEmptyPackageRow()];
    return;
  }
  formState.service_packages.splice(index, 1);
};

const resetFormState = () => {
  formState.id = "";
  formState.subdomain = "";
  formState.name = "";
  formState.description = "";
  formState.logo_url = "";
  formState.service_packages = [createEmptyPackageRow()];
  formState.admin_user = {
    username: "",
    password: "",
    name: "",
    email: "",
  };
};

const mapServicePackages = packages => {
  if (!Array.isArray(packages)) return [];
  return packages.map(pkg => {
    const start = pkg?.start_at && $dayjs(pkg.start_at).isValid() ? $dayjs(pkg.start_at) : null;
    const end = pkg?.end_at && $dayjs(pkg.end_at).isValid() ? $dayjs(pkg.end_at) : null;
    const range = start && end ? [start, end] : [];

    return {
      service_package_id: pkg?.service_package_id || pkg?.id || pkg?._id || "",
      range,
    };
  });
};

const openCreateModal = () => {
  resetFormState();
  isEdit.value = false;
  nextTick(() => formRef.value?.clearValidate());
  modalVisible.value = true;
};

const openEditModal = record => {
  resetFormState();
  isEdit.value = true;
  formState.id = record.id || record._id || "";
  formState.subdomain = record.subdomain || "";
  formState.name = record.name || "";
  formState.description = record.description || "";
  formState.logo_url = record.logo_url || "";
  const mappedPackages = mapServicePackages(record.service_packages);
  formState.service_packages = mappedPackages.length ? mappedPackages : [createEmptyPackageRow()];
  nextTick(() => formRef.value?.clearValidate());
  modalVisible.value = true;
};

const handleCancel = () => {
  resetFormState();
  modalVisible.value = false;
};

const renderSubdomainUrl = subdomain => {
  if (!subdomain) return "";
  const suffix = baseDomain.value ? `.${baseDomain.value}` : "";
  return `https://${subdomain}${suffix}`;
};

const formatDate = val => {
  if (!val) return "-";
  const d = $dayjs(val);
  return d.isValid() ? d.format("DD/MM/YYYY HH:mm") : "-";
};

const formatRange = (start, end) => {
  const s = formatDate(start);
  const e = formatDate(end);
  if (s === "-" && e === "-") return "";
  return `${s} - ${e}`;
};

const resolvePackageName = pkg =>
  pkg?.service_package?.name || pkg?.name || pkg?.title || pkg?.service_package_name || pkg?.service_package_id || "Gói dịch vụ";

const validateServicePackages = () => {
  const normalized = [];
  for (const pkg of formState.service_packages) {
    if (!pkg?.service_package_id) continue;
    const range = Array.isArray(pkg.range) ? pkg.range : [];
    const [start, end] = range;
    const startDay = start ? $dayjs(start) : null;
    const endDay = end ? $dayjs(end) : null;

    if (!startDay || !endDay || !startDay.isValid() || !endDay.isValid()) {
      throw new Error("Vui lòng chọn thời gian hiệu lực cho gói dịch vụ");
    }

    normalized.push({
      service_package_id: pkg.service_package_id,
      start_at: startDay.toISOString(),
      end_at: endDay.toISOString(),
    });
  }
  return normalized;
};

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    confirmLoading.value = true;

    const servicePackagesPayload = validateServicePackages();

    const basePayload = {
      id: formState.id ? String(formState.id) : "",
      subdomain: (formState.subdomain || "").trim(),
      name: (formState.name || "").trim(),
      description: (formState.description || "").trim(),
      logo_url: (formState.logo_url || "").trim(),
      service_packages: servicePackagesPayload,
    };

    if (isEdit.value) {
      const { data, error } = await units.put({ body: basePayload });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Cập nhật đơn vị thành công");
      } else {
        throw new Error(error.value?.data?.message || data.value?.message || "Không thể cập nhật đơn vị");
      }
    } else {
      const adminUser = {
        username: (formState.admin_user.username || "").trim(),
        password: formState.admin_user.password || "",
        name: (formState.admin_user.name || "").trim(),
        email: (formState.admin_user.email || "").trim(),
      };

      if (!adminUser.username || !adminUser.password || !adminUser.name || !adminUser.email) {
        message.warning("Vui lòng nhập đầy đủ thông tin tài khoản admin");
        confirmLoading.value = false;
        return;
      }

      const { id, ...createPayload } = basePayload;
      const payload = {
        ...createPayload,
        admin_user: adminUser,
      };

      const { data, error } = await units.post({ body: payload });
      if (data.value?.status === "success") {
        message.success(data.value?.message || "Tạo đơn vị thành công");
      } else {
        throw new Error(error.value?.data?.message || data.value?.message || "Không thể tạo đơn vị");
      }
    }

    modalVisible.value = false;
    resetFormState();
    await refreshUnits();
  } catch (err) {
    message.error(err?.message || "Lỗi khi lưu đơn vị");
  } finally {
    confirmLoading.value = false;
  }
};

const deleteUnit = async record => {
  const id = record.id || record._id;
  if (!id) return;
  deletingId.value = id;
  try {
    const { data, error } = await units.delete({ params: { id } });
    if (data.value?.status === "success") {
      message.success(data.value?.message || "Xóa đơn vị thành công");
      await refreshUnits();
    } else {
      message.error(error.value?.data?.message || data.value?.message || "Không thể xóa đơn vị");
    }
  } catch (err) {
    message.error(err?.message || "Lỗi khi xóa đơn vị");
  } finally {
    deletingId.value = "";
  }
};
</script>
