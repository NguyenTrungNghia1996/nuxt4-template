<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
    <div class="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="space-y-1">
          <div
            class="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            <Icon name="ri:quill-pen-line" class="h-4 w-4" />
            TinyMCE playground
          </div>
          <h1 class="text-2xl font-semibold text-gray-900">Trang test TinyMCE</h1>
          <p class="max-w-2xl text-sm text-gray-600">
            Kiểm tra render editor, đồng bộ v-model và xem trước HTML. Script được load từ
            <code>/public/tinymce</code>
            .
          </p>
        </div>
        <div class="flex items-center gap-2 text-xs text-gray-600">
          <span class="rounded-lg bg-white px-3 py-1 shadow-sm ring-1 ring-gray-200">
            SSR safe (ClientOnly)
          </span>
          <span class="rounded-lg bg-white px-3 py-1 shadow-sm ring-1 ring-gray-200">
            Toolbar: link, list, table
          </span>
        </div>
      </header>

      <section class="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <article class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-600">
                Editor
              </p>
              <h2 class="text-lg font-semibold text-gray-900">TinyMCE + v-model</h2>
            </div>
            <span
              class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Live
            </span>
          </div>
          <div class="mt-4 overflow-hidden rounded-xl border border-gray-100 shadow-sm">
            <TinyMCE v-model="data" :init="editorInit" class="w-full" />
          </div>
        </article>

        <aside class="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <div class="flex items-center gap-2 text-gray-900">
            <Icon name="ri:information-line" class="h-5 w-5 text-emerald-600" />
            <h3 class="text-base font-semibold">Ghi chú nhanh</h3>
          </div>
          <ul class="space-y-2 text-sm text-gray-700">
            <li class="flex items-start gap-2">
              <span class="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
              Script TinyMCE lấy từ thư mục public:
              <code>/public/tinymce</code>
              .
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
              Cấu hình mẫu toolbar: undo/redo, định dạng chữ, list, link, image, table, code.
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
              Đồng bộ hai chiều qua v-model, sự kiện change được phát ra khi nội dung thay đổi.
            </li>
          </ul>
          <div
            class="rounded-xl bg-gradient-to-br from-emerald-50 to-sky-50 p-4 text-sm text-gray-800 ring-1 ring-emerald-100">
            <p class="font-semibold text-emerald-800">Tip</p>
            <p>Thử chọn text và chèn link hoặc tạo danh sách để xem preview HTML bên dưới.</p>
          </div>
        </aside>
      </section>

      <section class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-sky-600">Preview</p>
            <h2 class="text-lg font-semibold text-gray-900">HTML hiện tại</h2>
          </div>
          <span class="text-xs text-gray-500">Auto-updated</span>
        </div>
        <div class="mt-4 grid gap-4 lg:grid-cols-2">
          <div class="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-800">
            <p class="mb-2 font-semibold text-gray-700">Rendered</p>
            <div
              class="prose max-w-none"
              v-html="
                data || '<p class=&quot;text-gray-400&quot;>Nội dung sẽ xuất hiện ở đây...</p>'
              " />
          </div>
          <div
            class="rounded-xl border border-gray-100 bg-slate-900 p-4 font-mono text-xs text-emerald-100">
            <p class="mb-2 font-semibold text-slate-200">Markup</p>
            <pre class="whitespace-pre-wrap break-words text-slate-100">
{{ data || "<!-- Nội dung trống -->" }}
            </pre>
          </div>
        </div>
      </section>

      <section class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-600">
              Usage
            </p>
            <h2 class="text-lg font-semibold text-gray-900">Cách dùng nhanh</h2>
            <p class="text-sm text-gray-600">
              Copy block này để gắn TinyMCE (SSR safe) vào trang của bạn với v-model và cấu hình mẫu.
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
          class="mt-4 rounded-xl bg-slate-900 p-4 text-xs font-mono leading-relaxed text-emerald-50 shadow-inner ring-1 ring-slate-800 whitespace-pre-wrap break-words">
{{ usageCode }}
        </pre>
      </section>
    </div>
  </div>
</template>

<script setup>
const data = ref(
  `<h3>Chào TinyMCE 👋</h3><p>Đây là nội dung mẫu. Hãy chỉnh sửa, chèn link, danh sách hoặc hình ảnh.</p><ul><li>Gạch đầu dòng</li><li><strong>In đậm</strong> và <em>in nghiêng</em></li></ul>`,
);

const editorInit = {
  menubar: false,
  height: 420,
  plugins: "link lists code table image",
  toolbar:
    "undo redo | blocks | bold italic underline forecolor | alignleft aligncenter alignright | bullist numlist | link image table | code",
  branding: false,
  content_style: "body { font-family: Roboto, sans-serif; font-size:14px; color:#0f172a; }",
  placeholder: "Nhập nội dung...",
};

const usageCode = `<ClientOnly>
  <TinyMCE v-model="content" :init="editorInit" />
</ClientOnly>

const content = ref("<p>Hello TinyMCE</p>");
const editorInit = {
  menubar: false,
  height: 400,
  plugins: "link lists code table image",
  toolbar:
    "undo redo | blocks | bold italic underline forecolor | alignleft aligncenter alignright | bullist numlist | link image table | code",
};`;

const copiedUsage = ref(false);
const copyUsage = async () => {
  if (!process.client || !navigator?.clipboard) return;
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
