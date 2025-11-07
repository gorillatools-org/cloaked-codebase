<script setup lang="ts">
import type { VCBaseCardInfoProps } from "./VCBaseCardInfo.vue";
import VCBaseCardInfo from "./VCBaseCardInfo.vue";
import BaseToggle from "@/library/BaseToggle.vue";
import { debounce } from "lodash-es";
import { ref, watch, onBeforeUnmount } from "vue";

type Props = VCBaseCardInfoProps & {
  disabled?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const model = defineModel<boolean>({ required: true });
const internalModel = ref(model.value);

onBeforeUnmount(() => {
  updateModel.cancel();
});

const handleToggle = () => {
  if (props.disabled) {
    return;
  }

  internalModel.value = !internalModel.value;
  updateModel();
};

const updateModel = debounce(() => {
  model.value = internalModel.value;
}, 300);

watch(model, (value) => {
  updateModel.cancel();
  internalModel.value = value;
});
</script>

<template>
  <VCBaseCardInfo
    v-bind="props"
    class="vc-base-card-toggle"
  >
    <template #right>
      <BaseToggle
        class="vc-base-card-toggle__toggle"
        :active="internalModel"
        :class="{ 'vc-base-card-toggle__toggle--disabled': props.disabled }"
        @click="handleToggle"
      />
    </template>
  </VCBaseCardInfo>
</template>

<style scoped lang="scss">
.vc-base-card-toggle {
  &__toggle {
    scale: 1.2;

    &--disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}
</style>
