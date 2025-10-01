<script setup>
import BaseIcon from "@/library/BaseIcon.vue";

defineProps({
  to: {
    type: String,
    default: "MonitoringStatus",
  },
});
</script>

<template>
  <RouterLink
    class="monitoring-detail-header-close"
    :to="{ name: to }"
  >
    <BaseIcon name="close" />
  </RouterLink>
</template>

<style scoped lang="scss">
.monitoring-detail-header-close {
  width: 28px;
  height: 28px;
  background-color: $color-primary-10;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100px;

  &:hover {
    background-color: $color-primary-20;
  }
}
</style>
