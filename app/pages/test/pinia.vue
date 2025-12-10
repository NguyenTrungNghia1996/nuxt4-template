<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 px-4 py-10">
    <div class="mx-auto max-w-5xl space-y-8">
      <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="space-y-1">
          <div
            class="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            <Icon name="ri:database-2-line" class="h-4 w-4" />
            Pinia playground
          </div>
          <h1 class="text-2xl font-semibold text-gray-900">Demo Pinia + persist</h1>
          <p class="max-w-2xl text-sm text-gray-600">
            Store đếm đơn giản với actions và getters. Dữ liệu được lưu bằng
            pinia-plugin-persistedstate (localStorage).
          </p>
        </div>
        <div class="flex items-center gap-2 text-xs text-gray-600">
          <span class="rounded-lg bg-white px-3 py-1 shadow-sm ring-1 ring-gray-200">
            Persist: on
          </span>
          <span class="rounded-lg bg-white px-3 py-1 shadow-sm ring-1 ring-gray-200">
            Getter: doubleCount
          </span>
        </div>
      </header>

      <section class="grid gap-6 md:grid-cols-2">
        <article class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-amber-600">
                Counter
              </p>
              <h2 class="text-lg font-semibold text-gray-900">Trạng thái hiện tại</h2>
            </div>
            <span class="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              Store
            </span>
          </div>
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <div class="rounded-xl bg-slate-900 p-4 text-amber-100 shadow-inner">
              <p class="text-xs uppercase text-amber-200">Count</p>
              <p class="mt-1 text-4xl font-semibold text-white">{{ count }}</p>
            </div>
            <div class="rounded-xl bg-amber-50 p-4 text-amber-800 ring-1 ring-amber-100">
              <p class="text-xs uppercase text-amber-700">Double (getter)</p>
              <p class="mt-1 text-3xl font-semibold">{{ doubleCount }}</p>
            </div>
          </div>
          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <a-input-number v-model:value="step" :min="1" :max="50" class="w-full" />
            <div class="flex items-center gap-2 text-xs text-gray-600">
              <span class="rounded-full bg-gray-100 px-2 py-1">Step</span>
              <span>{{ step }}</span>
            </div>
          </div>
          <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <a-button type="primary" class="w-full" @click="increment()">Tăng +{{ step }}</a-button>
            <a-button type="default" class="w-full" @click="decrement()">Giảm -{{ step }}</a-button>
            <a-button type="dashed" class="w-full" @click="setCount(100)">Set 100</a-button>
            <a-button danger ghost class="w-full" @click="reset()">Reset</a-button>
          </div>
        </article>

        <article class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-sky-600">
                Actions & log
              </p>
              <h2 class="text-lg font-semibold text-gray-900">Lịch sử cập nhật</h2>
            </div>
            <span class="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
              Realtime
            </span>
          </div>
          <div class="mt-4 space-y-3 text-sm text-gray-800">
            <div class="rounded-lg bg-gray-50 p-3 ring-1 ring-gray-100">
              <p class="text-xs font-semibold uppercase text-gray-600">Last updated</p>
              <p class="mt-1 font-mono text-gray-900">
                {{ lastUpdated ? lastUpdated : "Chưa có" }}
              </p>
            </div>
            <div
              class="rounded-lg bg-gradient-to-br from-amber-50 to-white p-3 ring-1 ring-amber-100">
              <p class="text-xs font-semibold uppercase text-amber-700">Hydrated</p>
              <p class="mt-1 font-medium text-gray-900">
                {{ hydrated ? "Store đã load từ localStorage" : "Đang chờ..." }}
              </p>
            </div>
            <div class="rounded-lg bg-slate-900 p-3 text-emerald-100 shadow-inner">
              <p class="text-xs uppercase text-emerald-200">Snapshot (JSON)</p>
              <pre class="mt-2 whitespace-pre-wrap break-words text-xs"
                >{{ JSON.stringify(snapshot, null, 2) }}
              </pre>
            </div>
          </div>
        </article>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useCounterStore } from "~/stores/counter";

const store = useCounterStore();
const { count, doubleCount, lastUpdated } = storeToRefs(store);

const step = ref(1);
const hydrated = ref(false);
const snapshot = ref({ count: 0, lastUpdated: "" });

const syncSnapshot = () => {
  snapshot.value = {
    count: count.value,
    lastUpdated: lastUpdated.value,
  };
};

const increment = () => store.increment(step.value);
const decrement = () => store.decrement(step.value);
const reset = () => {
  store.reset();
  syncSnapshot();
};
const setCount = (value: number) => {
  store.setCount(value);
  syncSnapshot();
};

watch(
  () => [count.value, lastUpdated.value],
  () => {
    syncSnapshot();
  },
  { immediate: true },
);

onMounted(() => {
  hydrated.value = true;
  syncSnapshot();
});
definePageMeta({
  layout: "empty",
});
</script>
