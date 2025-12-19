<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 px-4 py-10">
    <div class="mx-auto max-w-5xl space-y-8">
      <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="space-y-1">
          <div class="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            <Icon name="ri:flask-line" class="h-4 w-4" />
            Test playground
          </div>
          <h1 class="text-2xl font-semibold text-gray-900">Danh sách trang test</h1>
          <p class="max-w-2xl text-sm text-gray-600">Chọn module bạn muốn kiểm tra. Mỗi trang đã cấu hình sẵn để thử nhanh chức năng và giao diện.</p>
        </div>
        <div class="flex items-center gap-2 text-xs text-gray-600">
          <span class="rounded-lg bg-white px-3 py-1 shadow-sm ring-1 ring-gray-200">Nuxt 4</span>
          <span class="rounded-lg bg-white px-3 py-1 shadow-sm ring-1 ring-gray-200">Tailwind + Icon</span>
        </div>
      </header>

      <section class="grid gap-4 sm:grid-cols-2">
        <NuxtLink v-for="item in items" :key="item.to" :to="item.to" class="group flex flex-col justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-0.5 hover:shadow-md">
          <div class="flex items-start justify-between gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl" :class="item.badgeBg">
              <Icon :name="item.icon" class="h-6 w-6" :class="item.badgeText" />
            </div>
            <span class="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
              {{ item.tag }}
            </span>
          </div>
          <div class="mt-4 space-y-2">
            <h2 class="text-lg font-semibold text-gray-900 group-hover:text-emerald-700">
              {{ item.title }}
            </h2>
            <p class="text-sm text-gray-600">
              {{ item.description }}
            </p>
          </div>
          <div class="mt-4 flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <span>Open</span>
            <Icon name="ri:arrow-right-line" class="h-4 w-4 transition group-hover:translate-x-1" />
          </div>
        </NuxtLink>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
const items = [
  {
    title: "Day.js",
    description: "Playground timezone, relative time, format/parse với plugin UTC + timezone.",
    to: "/test/dayjs",
    tag: "Datetime",
    icon: "ri:time-line",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-600",
  },
  {
    title: "TinyMCE",
    description: "Editor WYSIWYG SSR-safe, đồng bộ v-model, preview HTML và toolbar mẫu.",
    to: "/test/tinymce",
    tag: "Rich text",
    icon: "ri:quill-pen-line",
    badgeBg: "bg-sky-50",
    badgeText: "text-sky-600",
  },
  {
    title: "Nuxt Image",
    description: "Demo ảnh remote với placeholder local, responsive sizes và lazy load.",
    to: "/test/image",
    tag: "Media",
    icon: "ri:image-line",
    badgeBg: "bg-indigo-50",
    badgeText: "text-indigo-600",
  },
  {
    title: "Nuxt Icon",
    description: "Danh sách icon từ nhiều bộ (Remix, Phosphor, MDI, Heroicons, Tabler...).",
    to: "/test/icon",
    tag: "Icon set",
    icon: "ri:star-smile-line",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-600",
  },
  {
    title: "Pinia store",
    description: "Demo counter có persist, actions/getter, hiển thị snapshot JSON.",
    to: "/test/pinia",
    tag: "State",
    icon: "ri:database-2-line",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
  },
  {
    title: "Permission editor",
    description: "Test component phân quyền menu (bitmask) với dữ liệu từ API super admin.",
    to: "/test/permission",
    tag: "ACL",
    icon: "ri:shield-keyhole-line",
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-600",
  },
  {
    title: "Role group select",
    description: "Demo SelectRoleAdmin: fetch nhóm quyền, tìm kiếm, chọn đơn/đa và nút điều hướng.",
    to: "/test/role-admin-select",
    tag: "Form",
    icon: "ri:user-settings-line",
    badgeBg: "bg-teal-50",
    badgeText: "text-teal-600",
  },
  {
    title: "Service package select",
    description: "Test Select ServicePackage: fetch gói dịch vụ, search, chọn đơn/đa, copy state.",
    to: "/test/service_package_select",
    tag: "Form",
    icon: "ri:package-line",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-600",
  },
];
</script>
