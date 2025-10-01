<script setup lang="ts">
import type { BaseIconName } from "@/library/baseIconTypes.ts";

export type BaseIconProps = {
  name: BaseIconName;
};

defineProps<BaseIconProps>();
</script>

<template>
  <i
    :class="['base-icon', `icon-${name}`]"
    aria-hidden="true"
  />
</template>

<style scoped lang="scss">
@import "@/assets/scss/recursive/mixins";

.base-icon {
  display: inline-block;
  font-family: $cloaked-icon-font;
  font-size: inherit;
  font-style: inherit;
  font-weight: inherit;
  line-height: inherit;
  color: inherit;
}
</style>
