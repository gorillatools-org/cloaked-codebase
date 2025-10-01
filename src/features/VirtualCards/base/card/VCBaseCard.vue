<script setup lang="ts">
import VCBaseCardBorder, {
  type VCBaseCardBorderProps,
} from "./VCBaseCardBorder.vue";

const DEFAULT_BORDER_RADIUS = 16;

type Props = {
  border?: VCBaseCardBorderProps;
};

withDefaults(defineProps<Props>(), {
  border: () => ({
    loading: false,
    focused: false,
    enableSpotlight: false,
    borderRadius: DEFAULT_BORDER_RADIUS,
  }),
});
</script>

<template>
  <VCBaseCardBorder
    class="vc-base-card"
    :enable-spotlight="border.enableSpotlight"
    :border-radius="border.borderRadius || DEFAULT_BORDER_RADIUS"
    :loading="border.loading"
    :focused="border.focused"
  >
    <div class="vc-base-card__body">
      <slot />
    </div>
  </VCBaseCardBorder>
</template>

<style scoped lang="scss">
.vc-base-card {
  width: 100%;

  &__body {
    width: 100%;
    height: 100%;
    border-radius: var(--vc-base-card-border-radius);
    background-color: $color-base-white-100;
    position: relative;
  }
}
</style>
