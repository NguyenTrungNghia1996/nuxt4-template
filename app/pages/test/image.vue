<template>
  <div class="space-y-8">
    <section class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-xl font-semibold text-gray-900">Nuxt Image test</h1>
          <p class="text-sm text-gray-600">
            Ví dụ dùng ảnh internet với
            <code>NuxtImg</code>
            để kiểm tra tối ưu hóa, placeholder và sizes.
          </p>
        </div>
        <div class="flex items-center gap-2 text-xs text-gray-600">
          <span class="rounded bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">Remote</span>
          <span class="rounded bg-gray-100 px-2 py-1">images.unsplash.com</span>
        </div>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-2">
      <article class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <header class="flex items-center justify-between">
          <div class="text-sm font-semibold text-gray-800">Responsive sizes</div>
          <code class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
            sizes=&quot;sm:100vw md:640px&quot;
          </code>
        </header>
        <NuxtImg
          class="mt-3 h-56 w-full rounded-lg object-cover"
          src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80"
          alt="Mountain sunset"
          sizes="sm:100vw md:640px"
          width="640"
          height="360"
          format="webp"
          placeholder="/images/placeholder.png"
          loading="lazy" />
        <p class="mt-3 text-sm text-gray-600">
          Ảnh internet được render qua IPX, tự co giãn theo viewport (full width trên mobile, 640px
          trên desktop) và dùng placeholder local.
        </p>
      </article>

      <article class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <header class="flex items-center justify-between">
          <div class="text-sm font-semibold text-gray-800">Fixed container + placeholders</div>
          <code class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
            placeholder=&quot;blur&quot;
          </code>
        </header>
        <div class="relative mt-3 overflow-hidden rounded-lg bg-slate-50">
          <NuxtImg
            class="h-56 w-full object-cover"
            src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80"
            alt="Forest river"
            placeholder="/images/placeholder.png"
            width="640"
            height="360"
            quality="80" />
        </div>
        <p class="mt-3 text-sm text-gray-600">
          Ví dụ khung cố định có placeholder custom từ
          <code>/public/images/placeholder.png</code>
          trước khi ảnh tải xong. Bạn có thể thử inspect để xem srcset/sizes.
        </p>
      </article>
    </section>

    <section class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-600">Usage</p>
          <h2 class="text-lg font-semibold text-gray-900">Cách dùng nhanh</h2>
          <p class="text-sm text-gray-600">
            Copy snippet để nhúng ảnh remote với placeholder và sizes responsive qua Nuxt Image.
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
const usageCode = `<NuxtImg
  src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80"
  alt="Mountain sunset"
  width="640"
  height="360"
  sizes="sm:100vw md:640px"
  format="webp"
  placeholder="/images/placeholder.png"
  loading="lazy"
/>`;

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
