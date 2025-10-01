<script setup>
import UiTooltip from "@/features/ui/ui-tooltip";
defineProps({ url: { type: String, default: null } });
</script>

<template>
  <UiTooltip
    v-if="url"
    position="top"
    align-x="center"
    width="225"
    class="url-preview"
  >
    {{ url }}
    <template #content>
      <span class="url-preview__content">{{ url }}</span>
    </template>
  </UiTooltip>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
@import "@/assets/scss/recursive/_mixins";

.url-preview {
  @include line-clamp(2);

  word-break: break-all;

  &__content {
    word-break: break-all;
  }
}
</style>
