<script setup>
const props = defineProps({
  leftAlign: {
    type: Boolean,
    default: false,
  },
  maxWidth: {
    type: String,
    default: "650px",
  },
});
</script>
<template>
  <div
    class="dd-onboarding-ui-header"
    :class="{ 'left-align': props.leftAlign }"
    :style="{ 'max-width': props.maxWidth }"
  >
    <slot />
  </div>
</template>
<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.dd-onboarding-ui-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: $color-primary-100;
  width: 100%;

  &.left-align {
    text-align: left;
    align-items: flex-start;
  }

  h1 {
    font-feature-settings:
      "clig" off,
      "liga" off;
    font-size: 32px;
    font-style: normal;
    font-weight: 600;
    line-height: 1.18;
    width: 100%;

    @media all and (min-width: $screen-md) {
      font-size: 54px;
    }
  }

  h2 {
    font-size: 32px;
    font-style: normal;
    font-weight: 600;
    line-height: 40px; /* 125% */
    width: 100%;
  }

  h3 {
    font-size: 24px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    width: 100%;
  }

  h5 {
    font-size: 15px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    width: 100%;
  }

  h6 {
    font-size: 10px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    width: 100%;
  }

  p {
    font-size: 15px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    width: 100%;
  }
}
</style>
