<script setup>
import inlineSvg from "@/features/InlineSvg.vue";

const props = defineProps({
  icon: { type: String, default: null },
});
</script>

<template>
  <div class="form">
    <div
      v-if="props.icon"
      class="icon"
    >
      <inlineSvg :name="props.icon" />
    </div>

    <div class="inputs">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.form {
  margin-top: 48px;
  margin-bottom: 32px;
  opacity: 0;
  transform: translateX(20px);
  animation: fade-in 0.4s forwards;
  animation-delay: 0.2s;

  @keyframes fade-in {
    0% {
      opacity: 0;
      transform: translateX(20px);
    }

    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .icon {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 40px;
    color: $color-primary-100;

    svg {
      width: 60px;
      height: auto;
      max-height: 64px;
    }
  }

  .inputs {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
}
</style>
