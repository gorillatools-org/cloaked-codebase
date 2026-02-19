<script setup>
// Link to figma font conversion
// https://www.figma.com/design/IxeUSe3MZYfJa0DGjSjy3F/New_Delivery_Styleguide?node-id=5923-64984&p=f&m=dev
import { useTemplateRef } from "vue";

const baseTextRef = useTemplateRef("baseTextRef");

defineExpose({
  baseTextRef: baseTextRef,
});

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
        "label-semibold",
      ].includes(value.toLowerCase()),
  },
  as: {
    type: String,
    default: "span",
  },
  underline: {
    type: Boolean,
    default: false,
  },
  legible: {
    type: Boolean,
    default: false,
  },
});
</script>
<template>
  <Component
    :is="props.as"
    ref="baseTextRef"
    :class="[
      'base-text',
      `base-text--${props.variant.toLowerCase()}`,
      {
        'base-text--underline': props.underline,
        'base-text--legible': props.legible,
      },
    ]"
  >
    <slot />
  </Component>
</template>

<style scoped lang="scss">
@import "@/assets/scss/recursive/library";

.base-text {
  font-family: $global-font;
  font-style: normal;

  &--big-heading-semibold {
    @include font-style-by-type("big-heading-semibold");
  }

  &--headline-1-medium {
    @include font-style-by-type("headline-1-medium");
  }

  &--headline-2-regular {
    @include font-style-by-type("headline-2-regular");
  }

  &--headline-2-semibold {
    @include font-style-by-type("headline-2-semibold");
  }

  &--headline-3-medium {
    @include font-style-by-type("headline-3-medium");
  }

  &--headline-3-bold {
    @include font-style-by-type("headline-3-bold");
  }

  &--headline-4-medium {
    @include font-style-by-type("headline-4-medium");
  }

  &--headline-4-bold {
    @include font-style-by-type("headline-4-bold");
  }

  &--headline-5-bold {
    @include font-style-by-type("headline-5-bold");
  }

  &--headline-6-medium {
    @include font-style-by-type("headline-6-medium");
  }

  &--headline-6-bold {
    @include font-style-by-type("headline-6-bold");
  }

  &--body-2-semibold {
    @include font-style-by-type("body-2-semibold");
  }

  &--body-3-regular {
    @include font-style-by-type("body-3-regular");
  }

  &--body-3-semibold {
    @include font-style-by-type("body-3-semibold");
  }

  &--body-small-medium {
    @include font-style-by-type("body-small-medium");
  }

  &--body-small-semibold {
    @include font-style-by-type("body-small-semibold");
  }

  &--caption-semibold {
    @include font-style-by-type("caption-semibold");
  }

  &--caption-bold {
    @include font-style-by-type("caption-bold");
  }

  &--label-medium {
    @include font-style-by-type("label-medium");
  }

  &--label-semibold {
    @include font-style-by-type("label-semibold");
  }

  &--underline {
    text-decoration-line: underline;
  }

  &--legible {
    font-family: $global-font-legible;
  }
}
</style>
