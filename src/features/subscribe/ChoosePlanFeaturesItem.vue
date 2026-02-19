<script setup>
import { ref } from "vue";
import InlineSvg from "@/features/InlineSvg.vue";
import BaseText from "@/library/BaseText.vue";

defineProps({
  feature: {
    type: Object,
    required: true,
  },
});

const isExpanded = ref(false);
</script>

<template>
  <li
    class="choose-plan-feature-item"
    :class="{
      'choose-plan-feature-item--expanded': isExpanded,
    }"
    @click="isExpanded = !isExpanded"
  >
    <InlineSvg
      name="chevron-down"
      class="choose-plan-feature-item__expand"
    />
    <BaseText
      variant="body-2-semibold"
      class="choose-plan-feature-item__title"
    >
      {{ feature.title }}
    </BaseText>
    <InlineSvg
      name="checkmark-plain"
      class="choose-plan-feature-item__checkmark"
    />
    <BaseText
      variant="body-small-medium"
      class="choose-plan-feature-item__detail"
    >
      {{ feature.detail }}
    </BaseText>
  </li>
</template>

<style scoped lang="scss">
.choose-plan-feature-item {
  display: grid;
  grid-template-columns: 18px 1fr 18px;
  grid-template-areas: "expand title checkmark" "detail detail detail";
  align-items: center;
  column-gap: 8px;
  cursor: pointer;
  padding: 4px 0;

  &__title {
    grid-area: title;

    @at-root .choose-plan-feature-item:hover & {
      opacity: 0.8;
    }
  }

  &__detail {
    display: none;
    grid-area: detail;

    @at-root .choose-plan-feature-item--expanded & {
      display: block;
      flex-shrink: 0;
      width: 100%;
      padding: 0 25px;
      opacity: 0.7;
    }
  }

  &__checkmark {
    margin-left: auto;
    color: $color-success;
    grid-area: checkmark;
  }

  &__expand {
    width: 18px;
    height: 18px;
    grid-area: expand;

    @at-root .choose-plan-feature-item--expanded & {
      transform: rotate(180deg);
    }
  }
}
</style>
