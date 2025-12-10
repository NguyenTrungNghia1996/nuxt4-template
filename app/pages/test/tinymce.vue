<template>
  <div>
    {{ data }}
    <TinyMCE v-model="data" class="w-full" />

    <!-- <div>{{ now }}</div> -->
  </div>
</template>
<script setup>
// const { $dayjs } = useNuxtApp();

// const now = $dayjs("2019-01-25").format("DD/MM/YYYY");
const data = ref("");
definePageMeta({
  layout: "empty",
});
</script>
