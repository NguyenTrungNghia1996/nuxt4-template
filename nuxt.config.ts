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
      sourcemap: false
    }
  },
  modules: [
    "@nuxt/icon",
    "@nuxt/image",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate",
    "@nuxtjs/tailwindcss",
    "@ant-design-vue/nuxt",
    "@vueuse/nuxt",
  ],
});