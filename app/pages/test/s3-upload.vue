<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 px-4 py-10">
    <div class="mx-auto max-w-5xl">
      <div class="space-y-8 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-6 lg:p-8">
        <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="space-y-1">
            <div class="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Icon name="ri:upload-cloud-2-line" class="h-4 w-4" />
              S3 upload playground
            </div>
            <h1 class="text-2xl font-semibold text-gray-900">Trang test upload S3</h1>
            <p class="max-w-2xl text-sm text-gray-600">
              Kiểm tra flow lấy presigned URL và upload file lên S3 bằng composable sẵn có
              <code>useS3Upload</code>
              (endpoint
              <code>{{ endpoint }}</code>
              ).
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2 text-xs text-gray-600">
            <span class="rounded-lg bg-white px-3 py-1 shadow-sm ring-1 ring-gray-200">useApi.s3Admin / s3Unit</span>
            <span class="rounded-lg bg-white px-3 py-1 shadow-sm ring-1 ring-gray-200">POST presigned → PUT file</span>
          </div>
        </header>

        <section class="grid gap-5 lg:grid-cols-[1.7fr,1fr]">
          <article class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-600">Upload runner</p>
              <h2 class="text-lg font-semibold text-gray-900">Chọn endpoint và đẩy file</h2>
              <p class="text-sm text-gray-600">Giữ nguyên tên file, dùng token hiện tại để xin presigned URL rồi PUT lên S3.</p>
            </div>
            <span class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" :class="canUpload ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-100'">
              <span class="inline-flex h-2 w-2 rounded-full" :class="canUpload ? 'bg-emerald-500' : 'bg-amber-500'" />
              {{ canUpload ? "Token sẵn sàng" : "Cần đăng nhập" }}
            </span>
          </div>

          <div class="mt-4 rounded-xl bg-gray-50 p-4 ring-1 ring-gray-100">
            <div class="flex flex-wrap items-center gap-3">
              <a-radio-group v-model:value="target" button-style="solid">
                <a-radio-button value="admin">Admin upload</a-radio-button>
                <a-radio-button value="unit">Unit upload</a-radio-button>
              </a-radio-group>
              <code class="rounded bg-white px-2 py-1 text-xs text-gray-700 ring-1 ring-gray-200">POST {{ endpoint }}</code>
            </div>
            <p class="mt-2 text-xs text-gray-500">Dùng composable useS3Upload: POST lấy presigned_url → PUT file (đính headers trả về) → nhận public_url.</p>
          </div>

          <ClientOnly>
            <a-upload-dragger class="mt-4 max-h-64 overflow-hidden" name="file" :file-list="fileList" :multiple="false" :before-upload="beforeUpload" :on-remove="handleRemove" :max-count="1" :accept="accepts" :disabled="uploading" list-type="text">
              <p class="ant-upload-drag-icon">
                <Icon name="ri:cloud-line" class="h-10 w-10 text-emerald-500" />
              </p>
              <p class="ant-upload-text font-semibold text-gray-800">Thả file vào đây hoặc bấm chọn</p>
              <p class="ant-upload-hint text-xs text-gray-500">Giữ nguyên tên file; presigned URL sẽ được backend trả về theo API hiện có.</p>
            </a-upload-dragger>
          </ClientOnly>

          <div class="mt-4 flex flex-wrap gap-2">
            <a-button type="primary" :loading="uploading" :disabled="!fileList.length || !canUpload" @click="handleUpload">
              {{ uploading ? "Đang upload..." : "Upload lên S3" }}
            </a-button>
            <a-button :disabled="uploading && !fileList.length" @click="reset">Reset</a-button>
            <a-tag v-if="!canUpload" color="orange">Cần token hợp lệ để gọi presigned</a-tag>
          </div>

          <div class="mt-6 grid gap-4 md:grid-cols-2">
            <div class="rounded-xl border border-dashed border-emerald-100 bg-emerald-50/50 p-4">
              <div class="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                <Icon name="ri:file-line" class="h-4 w-4" />
                File đã chọn
              </div>
              <template v-if="fileInfo">
                <dl class="mt-2 space-y-1 text-sm text-emerald-900">
                  <div class="flex justify-between gap-2">
                    <dt class="text-emerald-700">Tên</dt>
                    <dd class="font-semibold">{{ fileInfo.name }}</dd>
                  </div>
                  <div class="flex justify-between gap-2">
                    <dt class="text-emerald-700">Kích thước</dt>
                    <dd class="font-semibold">{{ fileInfo.size }}</dd>
                  </div>
                  <div class="flex justify-between gap-2">
                    <dt class="text-emerald-700">Loại</dt>
                    <dd class="font-semibold">{{ fileInfo.type || "unknown" }}</dd>
                  </div>
                </dl>
              </template>
              <p v-else class="mt-2 text-sm text-emerald-700">Chưa chọn file.</p>
            </div>

            <div class="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <Icon name="ri:checkbox-circle-line" class="h-4 w-4 text-emerald-600" />
                  Kết quả
                </div>
                <span class="rounded-full px-2 py-1 text-xs font-semibold" :class="statusBadgeClass">{{ statusText }}</span>
              </div>
              <template v-if="uploadedUrl">
                <p class="mt-2 break-all text-xs text-gray-600">{{ uploadedUrl }}</p>
                <div v-if="isImage" class="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-white">
                  <img :src="uploadedUrl" alt="preview" class="h-40 w-full object-contain" />
                </div>
                <div class="mt-3 flex flex-wrap gap-2">
                  <a-button type="link" size="small" target="_blank" :href="uploadedUrl">Mở URL</a-button>
                  <a-button size="small" @click="copyUrl">
                    <template #icon>
                      <Icon :name="copied ? 'ri:check-line' : 'ri:clipboard-line'" />
                    </template>
                    {{ copied ? "Đã copy" : "Copy URL" }}
                  </a-button>
                </div>
              </template>
              <template v-else-if="errorMessage">
                <p class="mt-2 text-sm text-rose-600">{{ errorMessage }}</p>
              </template>
              <p v-else class="mt-2 text-sm text-gray-600">Chưa upload.</p>
            </div>
          </div>

          <div class="mt-6 grid gap-4 md:grid-cols-2">
            <div class="rounded-xl border border-dashed border-blue-100 bg-blue-50/40 p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 text-sm font-semibold text-blue-900">
                  <Icon name="ri:user-smile-line" class="h-4 w-4" />
                  Upload bằng Avatar (AntDV)
                </div>
                <a-tag color="blue" class="text-[11px]">Không dùng list</a-tag>
              </div>
              <p class="mt-2 text-xs text-blue-800">
                Dùng
                <code>a-upload</code>
                +
                <code>a-avatar</code>
                , chọn ảnh và upload ngay.
              </p>

              <div class="mt-3 flex items-center gap-4">
                <a-upload :show-upload-list="false" :before-upload="beforeAvatarUpload" :accept="'image/*'" :disabled="avatarLoading">
                  <a-avatar
                    :size="96"
                    :src="!avatarLoading && avatarUrl ? avatarUrl : undefined"
                    class="avatar-cover border border-white shadow-sm ring-2 ring-blue-100 overflow-hidden">
                    <template v-if="avatarLoading">
                      <Icon name="ri:loader-4-line" class="h-6 w-6 animate-spin text-blue-600" />
                    </template>
                    <template v-else>
                      <Icon name="ri:add-line" class="h-6 w-6 text-blue-500" />
                    </template>
                  </a-avatar>
                </a-upload>

                <div class="space-y-2 text-xs text-blue-900">
                  <p>Chọn ảnh để upload ngay lên S3.</p>
                  <div class="flex flex-wrap gap-2">
                    <a-button size="small" :loading="avatarLoading" @click="clearAvatar">Reset</a-button>
                    <a-tag v-if="avatarError" color="red" class="text-[11px]">{{ avatarError }}</a-tag>
                    <a-tag v-else-if="avatarUrl" color="green" class="text-[11px]">Đã upload</a-tag>
                  </div>
                  <p v-if="avatarUrl" class="break-all text-[11px] text-blue-700">{{ avatarUrl }}</p>
                </div>
              </div>
            </div>

            <div class="rounded-xl border border-dashed border-gray-200 bg-white p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Icon name="ri:focus-3-line" class="h-4 w-4" />
                  Upload form thuần (không AntDV)
                </div>
                <a-tag color="default" class="text-[11px]">input file</a-tag>
              </div>
              <p class="mt-2 text-xs text-gray-600">Form HTML cơ bản: input type="file" + button submit.</p>

              <form class="mt-3 space-y-3" @submit.prevent="handleFormUpload">
                <input class="w-full cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800" type="file" :accept="accepts" @change="handleFormFileChange" />
                <div class="flex flex-wrap items-center gap-2">
                  <a-button type="primary" html-type="submit" :loading="formLoading" :disabled="!canUpload">Upload</a-button>
                  <span v-if="!canUpload" class="text-xs text-amber-600">Cần token</span>
                </div>
                <div class="rounded-lg bg-slate-900 p-3 text-xs text-emerald-50">
                  <p v-if="formUrl">✅ {{ formUrl }}</p>
                  <p v-else-if="formError" class="text-rose-300">⚠ {{ formError }}</p>
                  <p v-else class="text-slate-200">Chưa upload.</p>
                </div>
              </form>
            </div>
          </div>
        </article>

        <article class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <p class="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-600">Ghi chú</p>
          <h3 class="text-lg font-semibold text-gray-900">Luồng API sẵn có</h3>
          <ul class="mt-3 space-y-2 text-sm text-gray-700">
            <li class="flex gap-2">
              <Icon name="ri:number-1" class="mt-0.5 h-4 w-4 text-emerald-600" />
              <span>
                POST {{ endpoint }} với
                <code>{ filename, filetype }</code>
                để lấy presigned URL + headers.
              </span>
            </li>
            <li class="flex gap-2">
              <Icon name="ri:number-2" class="mt-0.5 h-4 w-4 text-emerald-600" />
              <span>PUT file trực tiếp lên S3 bằng URL + headers trả về.</span>
            </li>
            <li class="flex gap-2">
              <Icon name="ri:number-3" class="mt-0.5 h-4 w-4 text-emerald-600" />
              <span>
                API trả
                <code>public_url</code>
                → dùng cho preview/link.
              </span>
            </li>
          </ul>

          <div class="mt-5 rounded-xl bg-slate-900 p-4 text-xs leading-relaxed text-emerald-50 shadow-inner ring-1 ring-slate-800">
            <div class="mb-3 flex items-center justify-between">
              <span class="text-[11px] uppercase tracking-[0.12em] text-emerald-200">Snippet</span>
              <button class="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-1 text-[11px] font-semibold text-emerald-100 ring-1 ring-slate-700 transition hover:bg-slate-700" @click="copySnippet">
                <Icon :name="copiedSnippet ? 'ri:check-line' : 'ri:clipboard-line'" class="h-3.5 w-3.5" />
                {{ copiedSnippet ? "Đã copy" : "Copy" }}
              </button>
            </div>
            <pre class="whitespace-pre-wrap break-words">{{ snippet }}</pre>
          </div>

      <a-alert class="mt-4" type="info" show-icon message="Cần token hợp lệ trước khi test (middleware chỉ bỏ qua /test/ cho SSR)" description="Nếu chưa login, upload sẽ lỗi 401 khi xin presigned URL." />
    </article>
  </section>
</div>
</div>
</div>
</template>

<script setup>
const { s3Admin, s3Unit } = useApi();
const userStore = useUserStore();

const target = ref("admin");
const uploading = ref(false);
const uploadedUrl = ref("");
const errorMessage = ref("");
const copied = ref(false);
const copiedSnippet = ref(false);
const fileList = ref([]);
const avatarUrl = ref("");
const avatarLoading = ref(false);
const avatarError = ref("");
const formFile = ref(null);
const formLoading = ref(false);
const formUrl = ref("");
const formError = ref("");

const accepts = ".png,.jpg,.jpeg,.gif,.webp,.pdf,.doc,.docx,.xlsx,.csv";

const endpoint = computed(() => (target.value === "admin" ? "/uploads/presigned_url" : "/unit_uploads/presigned_url"));
const canUpload = computed(() => Boolean(userStore.token));

const fileInfo = computed(() => {
  const file = fileList.value[0];
  if (!file) return null;
  const raw = file.originFileObj || file;
  return {
    name: file.name || raw.name,
    size: formatSize(raw.size),
    type: raw.type || file.type,
  };
});

const isImage = computed(() => {
  if (!uploadedUrl.value) return false;
  const type = fileList.value[0]?.type || fileList.value[0]?.originFileObj?.type;
  if (type) return type.startsWith("image/");
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(uploadedUrl.value);
});

const statusText = computed(() => {
  if (uploading.value) return "Đang upload";
  if (uploadedUrl.value) return "Thành công";
  if (errorMessage.value) return "Lỗi upload";
  return "Chưa chạy";
});

const statusBadgeClass = computed(() => {
  if (uploading.value) return "bg-blue-50 text-blue-700 ring-1 ring-blue-100";
  if (uploadedUrl.value) return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
  if (errorMessage.value) return "bg-rose-50 text-rose-700 ring-1 ring-rose-100";
  return "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
});

const snippet = `const { s3Admin, s3Unit } = useApi();
const file = input.files?.[0];
if (!file) return;

// Chọn endpoint: admin hoặc unit
const uploader = s3Admin; // hoặc s3Unit
const publicUrl = await uploader.upload(file);
console.log("Uploaded:", publicUrl);`;

const beforeUpload = file => {
  fileList.value = [file];
  uploadedUrl.value = "";
  errorMessage.value = "";
  return false;
};

const handleRemove = () => {
  fileList.value = [];
  uploadedUrl.value = "";
  errorMessage.value = "";
};

const uploadViaEndpoint = async file => {
  const uploader = target.value === "admin" ? s3Admin : s3Unit;
  return uploader.upload(file);
};

const formatSize = bytes => {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const reset = () => {
  fileList.value = [];
  uploadedUrl.value = "";
  errorMessage.value = "";
  copied.value = false;
};

const copyUrl = async () => {
  if (!uploadedUrl.value || !import.meta.client || !navigator?.clipboard) return;
  await navigator.clipboard.writeText(uploadedUrl.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 1500);
};

const copySnippet = async () => {
  if (!import.meta.client || !navigator?.clipboard) return;
  await navigator.clipboard.writeText(snippet);
  copiedSnippet.value = true;
  setTimeout(() => {
    copiedSnippet.value = false;
  }, 1500);
};

const handleUpload = async () => {
  if (!fileList.value.length) {
    message.warning("Chọn file trước khi upload");
    return;
  }
  if (!canUpload.value) {
    message.warning("Cần token đăng nhập để xin presigned URL");
    return;
  }

  const rawFile = fileList.value[0].originFileObj || fileList.value[0];
  if (!(rawFile instanceof File)) {
    message.error("File không hợp lệ");
    return;
  }

  uploading.value = true;
  errorMessage.value = "";
  uploadedUrl.value = "";

  try {
    const url = await uploadViaEndpoint(rawFile);
    uploadedUrl.value = url;
    message.success("Upload thành công");
  } catch (err) {
    errorMessage.value = err?.message || err?.data?.message || "Upload thất bại";
    message.error(errorMessage.value);
  } finally {
    uploading.value = false;
  }
};

const beforeAvatarUpload = file => {
  if (!canUpload.value) {
    message.warning("Cần token đăng nhập để xin presigned URL");
    return false;
  }
  avatarLoading.value = true;
  avatarError.value = "";
  uploadViaEndpoint(file)
    .then(url => {
      avatarUrl.value = url;
      message.success("Upload avatar thành công");
    })
    .catch(err => {
      avatarError.value = err?.message || err?.data?.message || "Upload avatar thất bại";
      message.error(avatarError.value);
    })
    .finally(() => {
      avatarLoading.value = false;
    });
  return false;
};

const clearAvatar = () => {
  avatarUrl.value = "";
  avatarError.value = "";
};

const handleFormFileChange = event => {
  const files = event?.target?.files;
  formFile.value = files?.[0] || null;
  formUrl.value = "";
  formError.value = "";
};

const handleFormUpload = async () => {
  if (!formFile.value) {
    message.warning("Chọn file trước khi upload");
    return;
  }
  if (!canUpload.value) {
    message.warning("Cần token đăng nhập để xin presigned URL");
    return;
  }

  formLoading.value = true;
  formError.value = "";
  formUrl.value = "";

  try {
    const url = await uploadViaEndpoint(formFile.value);
    formUrl.value = url;
    message.success("Upload (form) thành công");
  } catch (err) {
    formError.value = err?.message || err?.data?.message || "Upload thất bại";
    message.error(formError.value);
  } finally {
    formLoading.value = false;
  }
};
</script>

<style scoped>
.avatar-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
