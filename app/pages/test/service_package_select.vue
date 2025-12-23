<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
    <div class="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <header class="space-y-2">
        <div class="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          <Icon name="ri:package-line" class="h-4 w-4" />
          ServicePackage Select
        </div>
        <h1 class="text-2xl font-semibold text-gray-900">Trang test ServicePackage Select</h1>
        <p class="max-w-2xl text-sm text-gray-600">
          Thử component chọn gói dịch vụ (single & multiple) với API
          <code>/service_packages</code>
          .
        </p>
      </header>

      <section class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <div class="grid gap-4 md:grid-cols-2">
          <SelectServicePackage v-model="selected" label="Gói dịch vụ" name="service_package" />
          <SelectServicePackage v-model="selectedMany" multiple label="Gói dịch vụ (multiple)" name="service_package_multi" />
        </div>

        <div class="mt-6 grid gap-3 rounded-lg bg-slate-900 p-4 text-sm text-emerald-50">
          <div class="flex items-center justify-between text-xs text-slate-200">
            <span>Giá trị hiện tại</span>
            <button class="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-1 text-[11px] font-semibold text-emerald-100 ring-1 ring-slate-700 transition hover:bg-slate-700" @click="copyState">
              <Icon :name="copied ? 'ri:check-line' : 'ri:clipboard-line'" class="h-3.5 w-3.5" />
              <span>{{ copied ? "Đã copy" : "Copy" }}</span>
            </button>
          </div>
          <pre class="whitespace-pre-wrap break-words">{{ stateJson }}</pre>
        </div>

        <a-alert class="mt-4" type="info" show-icon message="Cần token hợp lệ trước khi mở trang này để gọi /service_packages" />
      </section>
    </div>
  </div>
</template>

<script setup>
const selected = ref(null);
const selectedMany = ref([]);
const copied = ref(false);

const stateJson = computed(() => JSON.stringify({ selected: selected.value, selectedMany: selectedMany.value }, null, 2));

const copyState = async () => {
  if (!import.meta.client || !navigator?.clipboard) return;
  await navigator.clipboard.writeText(stateJson.value);
  copied.value = true;
  setTimeout(() => (copied.value = false), 1500);
};
</script>
