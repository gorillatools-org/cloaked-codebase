<script setup>
const props = defineProps({
  variant: {
    required: true,
    validator: (value) =>
      [
        "big-heading-semibold",
        "headline-1-medium",
        "headline-2-regular",
        "headline-2-semibold",
        "headline-3-medium",
        "headline-3-bold",
        "headline-4-medium",
        "headline-4-bold",
        "headline-5-bold",
        "headline-6-medium",
        "headline-6-bold",
        "body-2-semibold",
        "body-3-regular",
        "body-3-semibold",
        "body-small-medium",
        "body-small-semibold",
        "caption-semibold",
        "caption-bold",
        "label-medium",
      ].includes(value.toLowerCase()),
  },
  as: {
    type: String,
    default: "span",
  },
  count: {
    type: Number,
    default: 10,
  },
});
</script>
<template>
  <Component
    :is="props.as"
    :class="[
      'base-text-hidden-dots',
      `base-text-hidden-dots--${props.variant.toLowerCase()}`,
    ]"
  >
    {{ "•".repeat(props.count) }}
  </Component>
</template>
<style lang="scss" scoped>
@import "@/assets/scss/recursive/library";

.base-text-hidden-dots {
  font-family: $global-font;
  font-style: normal;
  font-size: $font-size-hidden-dots;

  &--big-heading-semibold {
    @include line-height-size("big-heading-semibold");
  }

  &--headline-1-medium {
    @include line-height-size("headline-1-medium");
  }

  &--headline-2-semibold,
  &--headline-2-regular {
    @include line-height-size("headline-2-semibold");
  }

  &--headline-3-medium,
  &--headline-3-bold {
    @include line-height-size("headline-3-bold");
  }

  &--headline-4-medium,
  &--headline-4-bold {
    @include line-height-size("headline-4-bold");
  }

  &--headline-5-bold {
    @include line-height-size("headline-5-bold");
  }

  &--headline-6-medium,
  &--headline-6-bold {
    @include line-height-size("headline-6-medium");
  }

  &--body-2-semibold {
    @include line-height-size("body-2-semibold");
  }

  &--body-3-regular,
  &--body-3-semibold {
    @include line-height-size("body-3-semibold");
  }

  &--body-small-medium,
  &--body-small-semibold {
    @include line-height-size("body-small-medium");
  }

  &--caption-semibold,
  &--caption-bold {
    @include line-height-size("caption-semibold");
  }

  &--label-medium {
    @include line-height-size("label-medium");
  }
}
</style>
