<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
    <div class="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="space-y-1">
          <div class="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
            <Icon name="ri:shield-keyhole-line" class="h-4 w-4" />
            Permission playground
          </div>
          <h1 class="text-2xl font-semibold text-gray-900">Trang test PermissionEditor</h1>
          <p class="max-w-2xl text-sm text-gray-600">
            Dùng để thử component phân quyền menu (bitmask). Menu sẽ được lấy từ API
            <code>/superadmin_menus</code>
            và modelValue trả về danh sách key + permissionValue.
          </p>
        </div>
        <div class="flex items-center gap-2 text-xs text-gray-600">
          <span class="rounded-lg bg-white px-3 py-1 shadow-sm ring-1 ring-gray-200">Auto import component</span>
          <span class="rounded-lg bg-white px-3 py-1 shadow-sm ring-1 ring-gray-200">Client only (fetch)</span>
        </div>
      </header>

      <section class="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <article class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-rose-600">Component</p>
              <h2 class="text-lg font-semibold text-gray-900">PermissionEditor + v-model</h2>
            </div>
            <span class="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">Live</span>
          </div>

          <div class="mt-4 overflow-hidden rounded-xl border border-gray-100">
            <ClientOnly>
              <PermissionEditor v-model="permissions" />
              <template #fallback>
                <div class="grid gap-3 bg-gray-50 p-4 text-sm text-gray-500">
                  <div class="h-3 w-24 rounded-full bg-gray-200" />
                  <div class="h-40 rounded-xl border border-dashed border-gray-200 bg-white" />
                  <p>Đang khởi tạo component (client only)...</p>
                </div>
              </template>
            </ClientOnly>
          </div>

          <div class="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-800 ring-1 ring-rose-100">
            Yêu cầu: backend cung cấp endpoint
            <code>/superadmin_menus</code>
            , có token hợp lệ trước khi mở trang này.
          </div>
        </article>

        <aside class="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <div class="flex items-center gap-2 text-gray-900">
            <Icon name="ri:information-line" class="h-5 w-5 text-rose-600" />
            <h3 class="text-base font-semibold">Model hiện tại (v-model)</h3>
          </div>

          <div class="rounded-xl border border-gray-100 bg-slate-900 p-4 font-mono text-xs text-emerald-50">
            <div class="mb-2 flex items-center justify-between text-slate-200">
              <span>permissions</span>
              <button class="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-1 text-[11px] font-semibold text-emerald-100 ring-1 ring-slate-700 transition hover:bg-slate-700" @click="copyState">
                <Icon :name="copiedState ? 'ri:check-line' : 'ri:clipboard-line'" class="h-3.5 w-3.5" />
                <span>{{ copiedState ? "Đã copy" : "Copy" }}</span>
              </button>
            </div>
            <pre class="whitespace-pre-wrap break-words text-emerald-100">{{ stateJson }}</pre>
          </div>

          <div class="space-y-2 text-sm text-gray-700">
            <div class="flex items-start gap-2">
              <span class="mt-1 h-2 w-2 rounded-full bg-rose-500" />
              Mỗi menu cha (level 1) trả về key + permissionValue; bit chuyển dịch theo permissionBit của từng menu con.
            </div>
            <div class="flex items-start gap-2">
              <span class="mt-1 h-2 w-2 rounded-full bg-rose-500" />
              Đổi radio sẽ cập nhật ngay modelValue (hai chiều).
            </div>
            <div class="flex items-start gap-2">
              <span class="mt-1 h-2 w-2 rounded-full bg-rose-500" />
              Nếu API không phản hồi, bảng sẽ trống và có toast lỗi.
            </div>
          </div>
        </aside>
      </section>

      <section class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-rose-600">Usage</p>
            <h2 class="text-lg font-semibold text-gray-900">Cách nhúng nhanh</h2>
            <p class="text-sm text-gray-600">Sao chép block dưới để dùng PermissionEditor ở trang khác (ClientOnly để tránh fetch SSR).</p>
          </div>
          <button class="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-600" @click="copyUsage">
            <Icon :name="copiedUsage ? 'ri:check-line' : 'ri:clipboard-line'" class="h-4 w-4" />
            <span>{{ copiedUsage ? "Đã copy" : "Copy" }}</span>
          </button>
        </div>
        <pre class="mt-4 whitespace-pre-wrap break-words rounded-xl bg-slate-900 p-4 font-mono text-xs leading-relaxed text-emerald-50 shadow-inner ring-1 ring-slate-800"
          >{{ usageSnippet }}
        </pre>
      </section>
    </div>
  </div>
</template>

<script setup>
const permissions = ref([{ key: "menu", permissionValue: 0 }]);

const stateJson = computed(() => JSON.stringify(permissions.value, null, 2));

const usageSnippet = `<ClientOnly>
  <PermissionEditor v-model="permissions" />
</ClientOnly>

const permissions = ref([
  { key: 'menu', permissionValue: 0 }
]);`;

const copiedUsage = ref(false);
const copiedState = ref(false);

const copyUsage = async () => {
  if (!import.meta.client || !navigator?.clipboard) return;
  await navigator.clipboard.writeText(usageSnippet.trim());
  copiedUsage.value = true;
  setTimeout(() => (copiedUsage.value = false), 1500);
};

const copyState = async () => {
  if (!import.meta.client || !navigator?.clipboard) return;
  await navigator.clipboard.writeText(stateJson.value);
  copiedState.value = true;
  setTimeout(() => (copiedState.value = false), 1500);
};
</script>
