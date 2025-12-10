<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 px-4 py-10">
    <div class="mx-auto max-w-5xl space-y-8">
      <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="space-y-1">
          <div
            class="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            <Icon name="ri:time-line" class="h-4 w-4" />
            Day.js playground
          </div>
          <h1 class="text-2xl font-semibold text-gray-900">Trang test Day.js</h1>
          <p class="max-w-2xl text-sm text-gray-600">
            Xem demo format, timezone, relative time và parse chuỗi ngày giờ. Dùng plugin
            UTC/Timezone/RelativeTime đã cấu hình sẵn.
          </p>
        </div>
        <div class="flex items-center gap-2 text-xs text-gray-600">
          <span class="rounded-lg bg-white px-3 py-1 shadow-sm ring-1 ring-gray-200">
            TZ: Asia/Ho_Chi_Minh
          </span>
          <span class="rounded-lg bg-white px-3 py-1 shadow-sm ring-1 ring-gray-200">
            Auto refresh 1s
          </span>
        </div>
      </header>

      <section class="grid gap-6 md:grid-cols-2">
        <article class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-600">Now</p>
              <h2 class="text-lg font-semibold text-gray-900">Thời gian hiện tại</h2>
            </div>
            <span
              class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Live
            </span>
          </div>
          <div class="mt-4 rounded-xl bg-slate-900 p-5 text-emerald-100 shadow-inner">
            <div class="text-sm uppercase text-emerald-200">Việt Nam (Asia/Ho_Chi_Minh)</div>
            <div class="mt-2 text-3xl font-semibold tracking-tight text-white">
              {{ now.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss") }}
            </div>
            <div class="text-sm text-emerald-200">
              {{ now.tz("Asia/Ho_Chi_Minh").format("dddd, DD MMM YYYY (Z)") }}
            </div>
          </div>
          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <div
              class="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 ring-1 ring-emerald-100">
              <p class="font-semibold">Relative</p>
              <ul class="mt-2 space-y-1">
                <li
                  v-for="item in relativeRows"
                  :key="item.label"
                  class="flex justify-between gap-2">
                  <span class="text-emerald-900">{{ item.label }}</span>
                  <span class="font-semibold text-emerald-700">{{ item.value }}</span>
                </li>
              </ul>
            </div>
            <div class="rounded-lg bg-white p-3 text-sm text-gray-800 ring-1 ring-gray-100">
              <p class="font-semibold text-gray-900">Parse nhanh</p>
              <p class="mt-1 text-xs text-gray-500">{{ parseInput }} ({{ parseFormat }})</p>
              <p class="mt-2">
                Hợp lệ:
                <span
                  class="rounded-full px-2 py-1 text-xs font-semibold"
                  :class="
                    parsed.isValid() ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  ">
                  {{ parsed.isValid() ? "Yes" : "No" }}
                </span>
              </p>
              <p class="mt-1 text-gray-700">Kết quả: {{ parsed.format("YYYY-MM-DD HH:mm:ss") }}</p>
            </div>
          </div>
        </article>

        <article class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-sky-600">Timezone</p>
              <h2 class="text-lg font-semibold text-gray-900">So sánh múi giờ</h2>
            </div>
            <span class="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
              TZ aware
            </span>
          </div>
          <div class="mt-4 space-y-3">
            <div
              v-for="row in timezoneRows"
              :key="row.zone"
              class="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm ring-1 ring-gray-100">
              <div>
                <p class="font-semibold text-gray-900">{{ row.zone }}</p>
                <p class="text-xs text-gray-500">Offset: {{ row.offset }}</p>
              </div>
              <p class="font-mono text-base text-gray-800">{{ row.time }}</p>
            </div>
          </div>
        </article>
      </section>

      <section class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-indigo-600">Format</p>
            <h2 class="text-lg font-semibold text-gray-900">Định dạng mẫu</h2>
          </div>
          <span class="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            {{ sample.format("YYYY-MM-DD HH:mm") }}
          </span>
        </div>
        <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="row in formatRows"
            :key="row.label"
            class="rounded-lg bg-gray-50 p-3 text-sm text-gray-800 ring-1 ring-gray-100">
            <p class="font-semibold text-gray-900">{{ row.label }}</p>
            <p class="text-xs text-gray-500">{{ row.fmt }}</p>
            <p class="mt-2 font-mono text-gray-900">{{ row.value }}</p>
          </div>
        </div>
      </section>

      <section class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-600">Usage</p>
            <h2 class="text-lg font-semibold text-gray-900">Cách dùng nhanh</h2>
            <p class="text-sm text-gray-600">
              Copy snippet dưới đây để dùng Day.js (UTC, timezone, relative time) trong component.
            </p>
          </div>
          <span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Plugin: app/plugins/dayjs.ts
          </span>
        </div>
        <div class="mt-4 grid gap-4 md:grid-cols-2">
          <article
            v-for="(block, idx) in usageBlocks"
            :key="block.title"
            class="flex flex-col rounded-xl bg-slate-900 p-4 text-slate-100 shadow-inner ring-1 ring-slate-800">
            <div class="flex items-center justify-between gap-3">
              <div class="space-y-1">
                <p class="text-xs uppercase tracking-[0.08em] text-emerald-300">Snippet</p>
                <h3 class="text-base font-semibold text-white">{{ block.title }}</h3>
              </div>
              <button
                class="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-600"
                @click="copyUsage(block.code, idx)">
                <Icon
                  :name="copiedUsage === idx ? 'ri:check-line' : 'ri:clipboard-line'"
                  class="h-4 w-4" />
                <span>{{ copiedUsage === idx ? "Đã copy" : "Copy" }}</span>
              </button>
            </div>
            <pre
              class="mt-3 whitespace-pre-wrap break-words text-xs leading-relaxed text-emerald-50"
              >{{ block.code }}
            </pre>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $dayjs } = useNuxtApp();
const now = ref($dayjs());
const sample = ref($dayjs("2024-12-25T15:30:00+07:00"));
const parseInput = "15/03/2025 14:20";
const parseFormat = "DD/MM/YYYY HH:mm";
const timer = ref<ReturnType<typeof setInterval> | null>(null);

const parsed = computed(() => $dayjs(parseInput, parseFormat));

const formatRows = computed(() =>
  [
    { label: "ISO 8601", fmt: "YYYY-MM-DDTHH:mm:ssZ" },
    { label: "Vi short", fmt: "DD/MM/YYYY HH:mm" },
    { label: "Weekday", fmt: "dddd, DD MMM YYYY" },
    { label: "Time only", fmt: "HH:mm:ss" },
    { label: "Full date time", fmt: "dddd, DD/MM/YYYY HH:mm:ss" },
    { label: "Unix (ms)", fmt: "[ms] x" },
  ].map(row => ({
    ...row,
    value: row.fmt.includes("[ms]") ? sample.value.valueOf() : sample.value.format(row.fmt),
  })),
);

const relativeRows = computed(() => [
  { label: "2 giờ trước", value: $dayjs().subtract(2, "hour").from(now.value) },
  { label: "Hôm qua", value: $dayjs().subtract(1, "day").from(now.value) },
  { label: "Trong 3 ngày tới", value: $dayjs().add(3, "day").from(now.value) },
  { label: "30 phút tới", value: $dayjs().add(30, "minute").from(now.value) },
]);

const timezoneList = ["Asia/Ho_Chi_Minh", "UTC", "America/New_York", "Europe/London", "Asia/Tokyo"];
const timezoneRows = computed(() =>
  timezoneList.map(zone => ({
    zone,
    time: now.value.tz(zone).format("YYYY-MM-DD HH:mm:ss"),
    offset: now.value.tz(zone).format("Z"),
  })),
);

onMounted(() => {
  timer.value = setInterval(() => {
    now.value = $dayjs();
  }, 1000);
});

onBeforeUnmount(() => {
  if (timer.value) clearInterval(timer.value);
});

const usageBlocks = [
  {
    title: "Inject Day.js trong component",
    code: `const { $dayjs } = useNuxtApp();

const localTime = computed(() =>
  $dayjs().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss"),
);

const relative = computed(() => $dayjs().add(3, "hour").fromNow());`,
  },
  {
    title: "Parse + format chuỗi ngày giờ",
    code: `const input = "15/03/2025 14:20";
const parsed = computed(() => $dayjs(input, "DD/MM/YYYY HH:mm"));
const display = computed(() =>
  parsed.value.format("dddd, DD/MM/YYYY HH:mm:ss"),
);`,
  },
];

const copiedUsage = ref<number | null>(null);
const copyUsage = async (code: string, idx: number) => {
  if (!import.meta.client || !navigator?.clipboard) return;
  await navigator.clipboard.writeText(code.trim());
  copiedUsage.value = idx;
  setTimeout(() => {
    copiedUsage.value = null;
  }, 1500);
};
definePageMeta({
  layout: "empty",
});
</script>
