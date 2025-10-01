<script setup>
import BaseIcon from "@/library/BaseIcon.vue";
import BaseText from "@/library/BaseText.vue";

defineProps({
  to: {
    type: String,
    default: "MonitoringStatus",
  },
});
</script>

<template>
  <RouterLink
    :to="{ name: to }"
    class="monitoring-detail-header-back"
  >
    <BaseText
      variant="headline-5-bold"
      class="monitoring-detail-header-back__text"
    >
      <BaseIcon name="chevron-left" />
      <slot />
    </BaseText>
  </RouterLink>
</template>

<style scoped lang="scss">
.monitoring-detail-header-back {
  &:hover {
    opacity: 0.8;
  }

  &__text {
    display: inline-flex;
    align-items: baseline;
    gap: 12px;
  }
}
</style>
