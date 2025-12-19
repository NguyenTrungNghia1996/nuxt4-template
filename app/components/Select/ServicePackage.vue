<template>
  <template v-if="!noFormItem">
    <a-form-item
      :label="label"
      :name="name"
      :rules="rules"
      :label-col="inlineLabel ? { span: 8 } : { span: 24 }"
      :wrapper-col="inlineLabel ? { span: 16 } : { span: 24 }"
    >
      <div class="flex w-full items-center gap-2">
        <a-select
          :value="modelValue"
          @update:value="handleUpdateValue"
          v-model:searchValue="search"
          :mode="multiple ? 'multiple' : undefined"
          show-search
          :placeholder="placeholder"
          :size="size"
          :loading="loading"
          :disabled="disabled"
          allow-clear
          class="flex-1"
          :options="options"
          @search="onSearch"
          @clear="onClear"
          :filter-option="false"
        />
        <template v-if="hasNavigation">
          <a-button :size="size" :disabled="!canSelectPrev" @click.stop="selectPrevious" title="Trước">
            <Icon name="ant-design:left-outlined" />
          </a-button>
          <a-button :size="size" :disabled="!canSelectNext" @click.stop="selectNext" title="Sau">
            <Icon name="ant-design:right-outlined" />
          </a-button>
        </template>
      </div>
    </a-form-item>
  </template>
  <template v-else>
    <div v-if="inlineLabel" class="flex items-center gap-2 py-3">
      <label v-if="label" class="min-w-[50px] text-sm font-medium">{{ label }}</label>
      <div class="flex flex-1 items-center gap-2">
        <a-select
          :value="modelValue"
          @update:value="handleUpdateValue"
          v-model:searchValue="search"
          :mode="multiple ? 'multiple' : undefined"
          show-search
          :placeholder="placeholder"
          :size="size"
          :loading="loading"
          :disabled="disabled"
          allow-clear
          class="flex-1"
          :options="options"
          @search="onSearch"
          @clear="onClear"
          :filter-option="false"
        />
        <template v-if="hasNavigation">
          <a-button :size="size" :disabled="!canSelectPrev" @click.stop="selectPrevious" title="Trước">
            <Icon name="ant-design:left-outlined" />
          </a-button>
          <a-button :size="size" :disabled="!canSelectNext" @click.stop="selectNext" title="Sau">
            <Icon name="ant-design:right-outlined" />
          </a-button>
        </template>
      </div>
    </div>
    <template v-else>
      <label v-if="label" class="mb-1 block text-sm font-medium">{{ label }}</label>
      <div class="flex items-center gap-2">
        <a-select
          :value="modelValue"
          @update:value="handleUpdateValue"
          v-model:searchValue="search"
          :mode="multiple ? 'multiple' : undefined"
          show-search
          :placeholder="placeholder"
          :size="size"
          :loading="loading"
          :disabled="disabled"
          allow-clear
          class="w-full"
          :options="options"
          @search="onSearch"
          @clear="onClear"
          :filter-option="false"
        />
        <template v-if="hasNavigation">
          <a-button :size="size" :disabled="!canSelectPrev" @click.stop="selectPrevious" title="Trước">
            <Icon name="ant-design:left-outlined" />
          </a-button>
          <a-button :size="size" :disabled="!canSelectNext" @click.stop="selectNext" title="Sau">
            <Icon name="ant-design:right-outlined" />
          </a-button>
        </template>
      </div>
    </template>
  </template>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from "vue";
import debounce from "lodash/debounce";

const { servicePackages } = useApi();

const props = defineProps({
  modelValue: [Array, Number, String],
  label: { type: String, default: "Gói dịch vụ" },
  name: { type: String, default: "service_package" },
  multiple: { type: Boolean, default: false },
  placeholder: { type: String, default: "Chọn gói dịch vụ" },
  size: { type: String, default: "middle" },
  rules: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
  autoSelectFirst: { type: Boolean, default: false },
  noFormItem: { type: Boolean, default: false },
  inlineLabel: { type: Boolean, default: false },
  showNavigationButtons: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const options = ref([]);
const loading = ref(false);
const search = ref("");

const hasNavigation = computed(() => props.showNavigationButtons && !props.multiple);
const currentIndex = computed(() => options.value.findIndex(option => option.value == props.modelValue));
const canSelectPrev = computed(() => hasNavigation.value && options.value.length > 0 && (currentIndex.value > 0 || currentIndex.value === -1));
const canSelectNext = computed(() => hasNavigation.value && options.value.length > 0 && (currentIndex.value === -1 || currentIndex.value < options.value.length - 1));

const isEmptyValue = val => val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0);

const fetchServicePackages = async (searchTerm = "") => {
  loading.value = true;
  try {
    const params = { page: 1, limit: 0 };
    const query = (searchTerm || "").trim();
    if (query) params.q = query;

    const { data, error } = await servicePackages.get({ params });
    if (data.value?.status === "success") {
      const items = Array.isArray(data.value?.data?.items) ? data.value.data.items : [];
      options.value = items
        .map(item => ({
          label: item.name || item.title || "",
          value: item.id ?? item._id ?? item.key ?? "",
        }))
        .filter(item => item.label && !isEmptyValue(item.value));

      if (props.autoSelectFirst && !query && isEmptyValue(props.modelValue)) {
        const firstOption = options.value[0];
        if (firstOption) {
          const defaultValue = props.multiple ? [firstOption.value] : firstOption.value;
          emit("update:modelValue", defaultValue);
        }
      }
    } else {
      throw new Error(error.value?.data?.message || data.value?.message);
    }
  } catch (err) {
    options.value = [];
    message.error(err?.message || "Không thể tải danh sách gói dịch vụ");
  } finally {
    loading.value = false;
  }
};

const debouncedFetch = debounce(val => {
  fetchServicePackages((val || "").trim());
}, 300);

const onSearch = val => {
  search.value = val;
  debouncedFetch(val);
};

const onClear = () => {
  emit("update:modelValue", props.multiple ? [] : null);
  search.value = "";
  fetchServicePackages("");
};

const handleUpdateValue = val => {
  emit("update:modelValue", val);
  const cleared = isEmptyValue(val);
  if (cleared || search.value) {
    search.value = "";
    fetchServicePackages("");
  }
};

const selectPrevious = () => {
  if (!canSelectPrev.value || options.value.length === 0) return;
  const idx = currentIndex.value === -1 ? options.value.length - 1 : Math.max(currentIndex.value - 1, 0);
  const target = options.value[idx];
  if (target) {
    emit("update:modelValue", target.value);
  }
};

const selectNext = () => {
  if (!canSelectNext.value || options.value.length === 0) return;
  const idx = currentIndex.value === -1 ? 0 : Math.min(currentIndex.value + 1, options.value.length - 1);
  const target = options.value[idx];
  if (target) {
    emit("update:modelValue", target.value);
  }
};

onBeforeUnmount(() => {
  debouncedFetch.cancel();
});

await fetchServicePackages();
</script>

<style scoped></style>
