<template>
  <div class="space-y-8">
    <section class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-gray-900">Nuxt Icon test</h1>
          <p class="text-sm text-gray-600">
            Danh sách icon từ nhiều bộ khác nhau để kiểm tra render và props size/color.
          </p>
        </div>
        <div class="flex items-center gap-2 text-xs text-gray-600">
          <!-- <span class="rounded bg-sky-50 px-2 py-1 font-semibold text-sky-700">
            `
            <Icon />
            `
          </span> -->
          <span class="rounded bg-gray-100 px-2 py-1">@nuxt/icon</span>
        </div>
      </div>
    </section>

    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <ClientOnly>
        <div
          v-for="icon in icons"
          :key="icon.name"
          class="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <div class="flex h-12 w-12 items-center justify-center rounded-lg" :class="icon.bg">
            <Icon :name="icon.name" size="26" :class="icon.color" />
          </div>
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-gray-800">{{ icon.label }}</p>
            <p class="truncate text-xs text-gray-600">{{ icon.name }}</p>
          </div>
        </div>
      </ClientOnly>
    </section>

    <section class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-600">Usage</p>
          <h2 class="text-lg font-semibold text-gray-900">Cách dùng nhanh</h2>
          <p class="text-sm text-gray-600">
            Copy snippet để gắn icon bất kỳ từ @nuxt/icon (Remix, Phosphor, MDI, Heroicons...).
          </p>
        </div>
        <button
          class="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-600"
          @click="copyUsage">
          <Icon :name="copiedUsage ? 'ri:check-line' : 'ri:clipboard-line'" class="h-4 w-4" />
          <span>{{ copiedUsage ? "Đã copy" : "Copy" }}</span>
        </button>
      </div>
      <pre
        class="mt-4 whitespace-pre-wrap break-words rounded-xl bg-slate-900 p-4 font-mono text-xs leading-relaxed text-emerald-50 shadow-inner ring-1 ring-slate-800"
        >{{ usageCode }}
      </pre>
    </section>
  </div>
</template>

<script setup>
const icons = [
  {
    name: "ri:image-2-line",
    label: "Remix Icon",
    bg: "bg-sky-50",
    color: "text-sky-600",
  },
  {
    name: "ph:lightning-duotone",
    label: "Phosphor",
    bg: "bg-amber-50",
    color: "text-amber-600",
  },
  {
    name: "mdi:checkbox-marked-circle-outline",
    label: "Material Design Icons",
    bg: "bg-emerald-50",
    color: "text-emerald-600",
  },
  {
    name: "heroicons-outline:sparkles",
    label: "Heroicons",
    bg: "bg-indigo-50",
    color: "text-indigo-600",
  },
  {
    name: "tabler:brand-nuxt",
    label: "Tabler",
    bg: "bg-gray-100",
    color: "text-gray-800",
  },
  {
    name: "ic:baseline-star",
    label: "Material Symbols",
    bg: "bg-rose-50",
    color: "text-rose-600",
  },
];

const usageCode = `<Icon name="ri:time-line" size="24" class="text-emerald-600" />
<Icon name="ph:lightning-duotone" size="28" />
<Icon name="mdi:checkbox-marked-circle-outline" size="24" />`;

const copiedUsage = ref(false);
const copyUsage = async () => {
  if (!import.meta.client || !navigator?.clipboard) return;
  await navigator.clipboard.writeText(usageCode.trim());
  copiedUsage.value = true;
  setTimeout(() => {
    copiedUsage.value = false;
  }, 1500);
};
definePageMeta({
  layout: "empty",
});
</script>
