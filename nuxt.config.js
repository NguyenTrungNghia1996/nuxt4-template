// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  app: {
    head: {
      titleTemplate: "%s - Nuxt4",
      title: "Nuxt4 - Template",
      link: [
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap",
        },
        // { rel: "icon", type: "image/x-icon", href: "/logo.png" },
      ],
    },
  },
  css: ["~/assets/css/tailwind.css"],
  antd: { extractStyle: true },
  vite: {
    build: {
      sourcemap: false,
    },
    server: {
      host: "0.0.0.0",
      port: 3000,
      allowedHosts: "all",
    },
  },
  devServer: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: "all",
  },
  modules: ["@nuxt/icon", "@nuxt/image", "@pinia/nuxt", "pinia-plugin-persistedstate", "@nuxtjs/tailwindcss", "@ant-design-vue/nuxt", "@vueuse/nuxt"],
  runtimeConfig: {
    encryptionKey: process.env.NUXT_ENCRYPTION_KEY || "default-strong-key-32-chars-123456",
    public: {
      baseURL: process.env.NUXT_PUBLIC_BASE_URL || "http://127.0.0.1:4000",
      superAdminName: process.env.NUXT_PUBLIC_SUPER_ADMIN_NAME || "Super Admin",
      superAdminSubdomain: process.env.NUXT_PUBLIC_SUPER_ADMIN_SUBDOMAIN || "sa",
      superAdminLogoUrl: process.env.NUXT_PUBLIC_SUPER_ADMIN_LOGO_URL || "https://cdn.nghia196.io.vn/admin/0bb442c5-ef40-494f-ab72-a694a7cf642b-logo.png",
      // Docker build/version info (injected via ENV or build args)
      buildTag: process.env.NUXT_PUBLIC_BUILD_TAG || "dev",
      buildSha: process.env.NUXT_PUBLIC_BUILD_SHA || "",
      buildTime: process.env.NUXT_PUBLIC_BUILD_TIME || "",
    },
    // https://api.testtkb.nguyenanh-est.com //https://api.dungthutkb.nguyenanh-est.com
  },
});
