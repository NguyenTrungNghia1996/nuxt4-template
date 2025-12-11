<template>
  <div
    class="relative min-h-screen w-full min-w-[350px] bg-[url('/images/background.svg')] bg-cover bg-center bg-no-repeat">
    <div class="px-0 pb-6 pt-8">
      <slot />
      <div class="absolute bottom-0 mx-0 mb-6 mt-12 w-full px-4 py-0 text-center">
        <div class="text-sm text-black">Copyright &copy; 2025 Produced by Nguyen Anh EST</div>
      </div>
    </div>
  </div>
</template>
