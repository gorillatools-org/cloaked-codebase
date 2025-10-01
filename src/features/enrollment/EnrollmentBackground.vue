<script setup>
import InlineSvg from "@/features/InlineSvg.vue";

defineProps({
  type: {
    type: String,
    default: "removal",
    validator: (value) => {
      return ["removal", "monitoring"].includes(value);
    },
  },
  animated: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <div
    class="enrollment-background"
    :class="{ 'enrollment-background--animated': animated }"
  >
    <div class="enrollment-background__phone">
      <InlineSvg :name="`enrollment/phone-${type}`" />
    </div>
    <div class="enrollment-background__notification">
      <InlineSvg :name="`enrollment/notification-${type}`" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.enrollment-background {
  height: 300px;
  overflow: hidden;
  container-type: inline-size;
  position: relative;
  max-height: 30vw;

  @media all and (min-width: $screen-lg) {
    max-height: 130px;
  }

  &__phone {
    position: absolute;
    left: 50%;
    top: 0;
    transform: translate3d(-50%, 0, 0);
    width: 70%;

    & > * {
      width: 100%;
      height: auto;

      @at-root .enrollment-background--animated & {
        opacity: 0;
        animation: appear-bottom-5 0.4s ease forwards;
      }
    }
  }

  &__notification {
    position: absolute;
    left: 50%;
    top: 8cqw;
    transform: translate3d(-50%, 0, 0);
    z-index: 1;
    width: 90%;

    & > * {
      width: 100%;
      height: auto;

      @at-root .enrollment-background--animated & {
        opacity: 0;
        animation:
          show 0.5s 0.3s forwards,
          hide 0.5s 6s forwards,
          show 0.5s 6.8s forwards,
          hide 0.5s 12s forwards,
          show 0.5s 12.8s forwards;
      }

      @keyframes show {
        0% {
          transform: translateY(10px);
          opacity: 0;
        }

        100% {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes hide {
        0% {
          transform: translateY(0);
          opacity: 1;
        }

        100% {
          transform: translateY(-25px);
          opacity: 0;
        }
      }
    }
  }
}
</style>
