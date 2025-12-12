<template>
  <div>
    {{ userStore }}
  </div>
</template>
<script setup>
const userStore = useUserStore();
</script>
