<script setup>
import inlineSvg from "@/features/InlineSvg.vue";
const props = defineProps({
  color: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
});
</script>
<template>
  <div class="tile-wrapper">
    <div
      class="icon-wrapper"
      :class="{
        'color-brand-1-100-light': props.color === 'color-brand-1-100-light',
        'color-brand-3-100': props.color === 'color-brand-3-100',
        'color-brand-4-100': props.color === 'color-brand-4-100',
        'color-brand-5-100': props.color === 'color-brand-5-100',
        'color-brand-6-100': props.color === 'color-brand-6-100',
        'color-in-progress': props.color === 'color-in-progress',
      }"
    >
      <inlineSvg :name="props.icon" />
    </div>
    <div class="title">
      <slot />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.color-brand-1-100-light {
  background-color: $color-brand-1-100-light;
}

.color-brand-3-100 {
  background-color: $color-brand-3-100;
}

.color-brand-4-100 {
  background-color: $color-brand-4-100;
}

.color-brand-5-100 {
  background-color: $color-brand-5-100;
}

.color-brand-6-100 {
  background-color: $color-brand-6-100;
}

.color-in-progress {
  background-color: $color-in-progress;
}

.tile-wrapper {
  height: 115px;
  width: 182px;
  border-radius: 18.5px;
  color: $color-primary-100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  flex-grow: 0;
  gap: 15.5px;
  padding: 21px;
  background: rgba($color-primary-100-light, 0.3);

  @at-root .theme-dark & {
    background: rgba($color-primary-100-dark, 0.3);
  }

  .icon-wrapper {
    height: 45.5px;
    width: 45.5px;
    border-radius: 50%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    flex-grow: 0;

    svg {
      color: $white;
      width: 29px;
      height: auto;
      max-height: 29px;
    }
  }

  .title {
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    color: $color-primary-100;
    flex-shrink: 0;
    flex-grow: 0;
  }
}
</style>
