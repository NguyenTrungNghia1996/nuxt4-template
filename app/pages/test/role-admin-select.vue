<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
    <div class="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="space-y-1">
          <div class="inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700">
            <Icon name="ri:user-settings-line" class="h-4 w-4" />
            Role group select playground
          </div>
          <h1 class="text-2xl font-semibold text-gray-900">Trang test SelectRoleAdmin</h1>
          <p class="max-w-2xl text-sm text-gray-600">
            Thử component SelectRoleAdmin (lấy dữ liệu từ
            <code>/superadmin_role_groups</code>
            , hỗ trợ tìm kiếm, nhiều lựa chọn, auto-select và nút chuyển trước/sau).
          </p>
        </div>
        <div class="flex items-center gap-2 text-xs text-gray-600">
          <span class="rounded-lg bg-white px-3 py-1 shadow-sm ring-1 ring-gray-200">API fetch (client)</span>
          <span class="rounded-lg bg-white px-3 py-1 shadow-sm ring-1 ring-gray-200">Ant Design Vue</span>
        </div>
      </header>

      <section class="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <article class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-teal-600">Component</p>
              <h2 class="text-lg font-semibold text-gray-900">SelectRoleAdmin + v-model</h2>
              <p class="text-sm text-gray-600">Bật/tắt các option để xem layout và hành vi; cần token hợp lệ để gọi API nhóm quyền.</p>
            </div>
            <span class="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">Live</span>
          </div>

          <div class="mt-4 flex flex-wrap gap-3 text-sm text-gray-700">
            <label class="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 ring-1 ring-gray-200">
              <a-switch v-model:checked="controls.showNavigation" size="small" />
              <span>Nút chuyển trước/sau</span>
            </label>
            <label class="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 ring-1 ring-gray-200">
              <a-switch v-model:checked="controls.autoSelectFirst" size="small" />
              <span>Tự chọn mục đầu tiên</span>
            </label>
            <label class="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 ring-1 ring-gray-200">
              <a-switch v-model:checked="controls.disabled" size="small" />
              <span>Disable</span>
            </label>
          </div>

          <div class="mt-4 grid gap-4 md:grid-cols-2">
            <div class="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div class="flex items-center justify-between text-gray-900">
                <h3 class="text-base font-semibold">Form-item (đơn)</h3>
                <span class="text-xs font-semibold text-teal-600">showNavigation</span>
              </div>

              <ClientOnly>
                <a-form layout="vertical" :model="{ singleRole }">
                  <SelectRoleAdmin v-model="singleRole" :show-navigation-buttons="controls.showNavigation" :auto-select-first="controls.autoSelectFirst" :disabled="controls.disabled" placeholder="Tìm hoặc chọn nhóm quyền" />
                </a-form>

                <template #fallback>
                  <div class="grid gap-2 text-sm text-gray-500">
                    <div class="h-4 w-24 rounded bg-gray-200" />
                    <div class="h-10 w-full rounded border border-dashed border-gray-200 bg-white" />
                    <p>Đang khởi tạo component...</p>
                  </div>
                </template>
              </ClientOnly>

              <div class="rounded-lg bg-white px-3 py-2 text-xs text-gray-600 ring-1 ring-gray-200">Tip: clear giá trị để reset search; bật auto-select-first sẽ chọn option đầu sau khi tải.</div>
            </div>

            <div class="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div class="flex items-center justify-between text-gray-900">
                <h3 class="text-base font-semibold">Inline label + multiple</h3>
                <span class="text-xs font-semibold text-amber-600">noFormItem</span>
              </div>

              <ClientOnly>
                <SelectRoleAdmin v-model="multipleRoles" multiple inline-label no-form-item :auto-select-first="controls.autoSelectFirst" :disabled="controls.disabled" placeholder="Chọn nhiều nhóm quyền" />

                <template #fallback>
                  <div class="grid gap-2 text-sm text-gray-500">
                    <div class="h-4 w-28 rounded bg-gray-200" />
                    <div class="h-10 w-full rounded border border-dashed border-gray-200 bg-white" />
                    <p>Đang khởi tạo component...</p>
                  </div>
                </template>
              </ClientOnly>

              <div class="rounded-lg bg-white px-3 py-2 text-xs text-gray-600 ring-1 ring-gray-200">Dùng khi không cần a-form-item nhưng vẫn muốn label cùng hàng với select.</div>
            </div>
          </div>

          <div class="mt-4 flex flex-wrap gap-2 text-xs text-gray-700">
            <button class="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-3 py-2 font-semibold text-white shadow-sm transition hover:bg-teal-700" @click="resetValues">
              <Icon name="ri:refresh-line" class="h-4 w-4" />
              Reset giá trị
            </button>
            <span class="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-orange-700">
              <Icon name="ri:alert-line" class="h-3.5 w-3.5" />
              Cần đăng nhập để gọi API
            </span>
          </div>
        </article>

        <aside class="space-y-4">
          <div class="space-y-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <div class="flex items-center justify-between text-gray-900">
              <div class="flex items-center gap-2">
                <Icon name="ri:information-line" class="h-5 w-5 text-teal-600" />
                <h3 class="text-base font-semibold">Model hiện tại</h3>
              </div>
              <button class="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-1 text-[11px] font-semibold text-teal-700 ring-1 ring-teal-100 transition hover:bg-teal-100" @click="copyState">
                <Icon :name="copiedState ? 'ri:check-line' : 'ri:clipboard-line'" class="h-3.5 w-3.5" />
                <span>{{ copiedState ? "Đã copy" : "Copy" }}</span>
              </button>
            </div>
            <pre class="whitespace-pre-wrap break-words rounded-xl bg-slate-900 p-4 font-mono text-xs leading-relaxed text-emerald-50 shadow-inner ring-1 ring-slate-800"
              >{{ stateJson }}
            </pre>
          </div>

          <div class="space-y-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <div class="flex items-center justify-between text-gray-900">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.08em] text-teal-600">Usage</p>
                <h3 class="text-base font-semibold">Nhúng nhanh</h3>
              </div>
              <button class="inline-flex items-center gap-1 rounded-md bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white transition hover:bg-slate-800" @click="copyUsage">
                <Icon :name="copiedUsage ? 'ri:check-line' : 'ri:clipboard-line'" class="h-3.5 w-3.5" />
                <span>{{ copiedUsage ? "Đã copy" : "Copy" }}</span>
              </button>
            </div>
            <pre class="whitespace-pre-wrap break-words rounded-xl bg-slate-900 p-4 font-mono text-xs leading-relaxed text-emerald-50 shadow-inner ring-1 ring-slate-800"
              >{{ usageSnippet }}
            </pre>
          </div>
        </aside>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import SelectRoleAdmin from "@/components/Select/RoleAdmin.vue";

const singleRole = ref<string | number | undefined>(undefined);
const multipleRoles = ref<Array<string | number>>([]);

const controls = reactive({
  showNavigation: true,
  autoSelectFirst: false,
  disabled: false,
});

const copiedState = ref(false);
const copiedUsage = ref(false);

const stateJson = computed(() =>
  JSON.stringify(
    {
      singleRole: singleRole.value,
      multipleRoles: multipleRoles.value,
      controls: { ...controls },
    },
    null,
    2,
  ),
);

const usageSnippet = `<ClientOnly>
  <SelectRoleAdmin
    v-model="roleGroupId"
    :show-navigation-buttons="true"
    :auto-select-first="true"
    placeholder="Chọn Nhóm quyền"
  />
</ClientOnly>

const roleGroupId = ref(null);`;

const copyState = async () => {
  if (!import.meta.client || !navigator?.clipboard) return;
  await navigator.clipboard.writeText(stateJson.value);
  copiedState.value = true;
  setTimeout(() => (copiedState.value = false), 1500);
};

const copyUsage = async () => {
  if (!import.meta.client || !navigator?.clipboard) return;
  await navigator.clipboard.writeText(usageSnippet.trim());
  copiedUsage.value = true;
  setTimeout(() => (copiedUsage.value = false), 1500);
};

const resetValues = () => {
  singleRole.value = undefined;
  multipleRoles.value = [];
};
</script>
