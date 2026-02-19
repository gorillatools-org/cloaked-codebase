<script setup lang="ts">
import type { VCBaseCardInfoProps } from "./VCBaseCardInfo.vue";
import VCBaseCardInfo from "./VCBaseCardInfo.vue";
import VCBaseDropdownSelect from "../VCBaseDropdownSelect.vue";
import type { DropdownSelectOption } from "../VCBaseDropdownSelect.vue";

type Props = VCBaseCardInfoProps & {
  disabled?: boolean;
  options?: DropdownSelectOption[];
};

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  options: () => [],
});

const model = defineModel<string>({ required: true });
</script>

<template>
  <VCBaseCardInfo v-bind="props">
    <template #right>
      <VCBaseDropdownSelect
        v-model="model"
        :options="props.options"
      />
    </template>
  </VCBaseCardInfo>
</template>
