<template>
  <div class="flex h-screen w-full flex-col overflow-auto bg-gray-200">
    <div class="h-14">
      <BaseHeader />
    </div>
    <div class="flex min-h-[calc(100vh-60px)] w-full flex-1 overflow-hidden">
      <BaseMenu />
      <!-- BaseMenu -->
      <div class="flex flex-1 flex-col overflow-hidden">
        <div class="sticky top-0 z-10 bg-white">
          <!-- <BaseBreadcrumb /> -->
          BaseBreadcrumb
        </div>
        <div class="flex-1 overflow-y-auto p-2">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>
