<script setup>
import BaseText from "@/library/BaseText.vue";
import BaseSheet from "@/library/BaseSheet.vue";
import BaseIcon from "@/library/BaseIcon.vue";

defineProps({
  features: {
    type: Array,
    default: () => [
      {
        icon: "notification",
        text: "24/7 Dark Web and Social Security Number monitoring",
      },
      {
        icon: "bolt",
        text: "Notifications about general and unusual activity as soon as they occur",
      },
    ],
  },
});
</script>

<template>
  <BaseSheet
    spacing-x="lg"
    spacing-y="lg"
    elevation="md"
    class="monitoring-features-sheet"
  >
    <BaseText
      variant="headline-4-medium"
      as="h3"
    >
      Monitor Your Identity
    </BaseText>
    <ul class="monitoring-features-sheet__list">
      <li
        v-for="(feature, index) in features"
        :key="index"
        class="monitoring-features-sheet__item"
      >
        <BaseIcon
          :name="feature.icon"
          class="monitoring-features-sheet__icon"
        />
        <BaseText
          variant="headline-6-medium"
          class="monitoring-features-sheet__text"
        >
          {{ feature.text }}
        </BaseText>
      </li>
    </ul>
  </BaseSheet>
</template>

<style scoped lang="scss">
.monitoring-features-sheet {
  &__list {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__item {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  &__icon {
    font-size: 19px;
    flex-shrink: 0;
  }

  &__text {
    color: $color-primary-70;
  }
}
</style>
