<script setup>
import BaseText from "@/library/BaseText.vue";
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
  count: {
    type: Number,
    default: 10,
  },
});
</script>
<template>
  <BaseText
    :as="props.as"
    :variant="props.variant"
  >
    {{ "•".repeat(props.count) }}
  </BaseText>
</template>
