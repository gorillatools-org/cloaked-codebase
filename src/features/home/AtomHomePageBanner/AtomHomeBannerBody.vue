<script setup>
const props = defineProps({
  image: {
    type: String,
    default: "",
  },
  rainbowBackground: {
    type: Boolean,
    default: false,
  },
});
</script>
<template>
  <div
    class="body-section"
    :class="{ 'rainbow-background': props.rainbowBackground }"
  >
    <img
      src="@/assets/icons/data-delete/monitoring.png"
      alt="Monitoring icon"
      width="360"
      height="240"
      class="monitoring-icon"
    />
    <div class="no-filter">
      <slot />
    </div>
  </div>
</template>
<style scoped lang="scss">
.body-section {
  color: $color-primary-100;
  border-radius: 12px;
  border: 1px solid $color-primary-10;
  background-image: linear-gradient(
    to bottom right,
    $color-base-white-100,
    $color-primary-5
  );
  padding: 32px 24px;
  overflow: hidden;
  position: relative;
  margin-top: 24px;
  z-index: 2;

  .monitoring-icon {
    position: absolute;
    top: -85px;
    right: -130px;
    z-index: -1;
  }

  .esim-icon {
    position: absolute;
    top: -14px;
    right: 0;
    height: 175px;
    width: auto;
  }
}

.rainbow-background {
  background-image: $background-rainbow-lite;
}
</style>
