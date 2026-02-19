<script setup>
// Link to figma font conversion
// https://www.figma.com/design/vyFqig4bd3ALLFMC7CFmA0/Cloaked-Design-System-4.0--2026-?node-id=13551-7782&t=KHyxUWkQtYus7T9N-0
import { useTemplateRef, computed } from "vue";

const baseTextRef = useTemplateRef("baseTextRef");

defineExpose({
  baseTextRef: baseTextRef,
});

const props = defineProps({
  variant: {
    required: true,
    validator: (value) =>
      [
        //OLD STYLE VARIANTS
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
        //NEW STYLE VARIANTS
        "big-heading-emphasized",
        "big-heading-regular",
        "large-title-emphasized",
        "large-title-regular",
        "title-1-regular",
        "title-1-emphasized",
        "title-2-emphasized",
        "title-2-regular",
        "title-3-emphasized",
        "title-3-regular",
        "headline-emphasized",
        "headline-regular",
        "body-regular",
        "body-emphasized",
        "callout-emphasized",
        "subhead-regular",
        "subhead-emphasized",
        "footnote-regular",
        "footnote-emphasized",
        "caption-1-regular",
        "caption-1-emphasized",
        "caption-2-regular",
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

const computedVariant = computed(() => {
  // OLD STYLE CONVERSION
  const variantMapping = {
    "big-heading-semibold": "big-heading-emphasized",
    "headline-1-medium": "large-title-emphasized",
    "headline-2-regular": "title-1-regular",
    "headline-2-semibold": "title-1-emphasized",
    "headline-3-bold": "title-2-emphasized",
    "headline-3-medium": "title-2-regular",
    "headline-4-bold": "title-3-emphasized",
    "headline-4-medium": "title-3-regular",
    "headline-5-bold": "headline-emphasized",
    "headline-6-medium": "body-regular",
    "headline-6-bold": "body-emphasized",
    "body-2-semibold": "callout-emphasized",
    "body-3-regular": "subhead-regular",
    "body-3-semibold": "subhead-emphasized",
    "body-small-medium": "footnote-regular",
    "body-small-semibold": "footnote-emphasized",
    "caption-semibold": "caption-1-regular",
    "caption-bold": "caption-1-emphasized",
    "label-medium": "caption-2-regular",
    "label-semibold": "caption-2-regular",
  };
  return (
    variantMapping[props.variant.toLowerCase()] || props.variant.toLowerCase()
  );
});
</script>
<template>
  <Component
    :is="props.as"
    ref="baseTextRef"
    :class="[
      'base-text',
      `base-text--${computedVariant}`,
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

  &--big-heading-emphasized {
    @include font-style-by-type("big-heading-emphasized");
  }

  &--big-heading-regular {
    @include font-style-by-type("big-heading-regular");
  }

  &--large-title-emphasized {
    @include font-style-by-type("large-title-emphasized");
  }

  &--large-title-regular {
    @include font-style-by-type("large-title-regular");
  }

  &--title-1-regular {
    @include font-style-by-type("title-1-regular");
  }

  &--title-1-emphasized {
    @include font-style-by-type("title-1-emphasized");
  }

  &--title-2-emphasized {
    @include font-style-by-type("title-2-emphasized");
  }

  &--title-2-regular {
    @include font-style-by-type("title-2-regular");
  }

  &--title-3-emphasized {
    @include font-style-by-type("title-3-emphasized");
  }

  &--title-3-regular {
    @include font-style-by-type("title-3-regular");
  }

  &--headline-emphasized {
    @include font-style-by-type("headline-emphasized");
  }

  &--body-regular {
    @include font-style-by-type("body-regular");
  }

  &--body-emphasized {
    @include font-style-by-type("body-emphasized");
  }

  &--callout-emphasized {
    @include font-style-by-type("callout-emphasized");
  }

  &--subhead-regular {
    @include font-style-by-type("subhead-regular");
  }

  &--subhead-emphasized {
    @include font-style-by-type("subhead-emphasized");
  }

  &--footnote-regular {
    @include font-style-by-type("footnote-regular");
  }

  &--footnote-emphasized {
    @include font-style-by-type("footnote-emphasized");
  }

  &--caption-1-regular {
    @include font-style-by-type("caption-1-regular");
  }

  &--caption-1-emphasized {
    @include font-style-by-type("caption-1-emphasized");
  }

  &--caption-2-regular {
    @include font-style-by-type("caption-2-regular");
  }

  &--underline {
    text-decoration-line: underline;
    text-decoration-style: solid;
    text-decoration-skip-ink: auto;
    text-decoration-thickness: auto;
    text-underline-offset: auto;
  }

  &--legible {
    font-family: $global-font-legible;
  }
}
</style>
