<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
import router from "@/routes/router";

import { reactive, watch } from "vue";

import EsimHeader from "@/features/eSim/EsimHeader.vue";

const state = reactive({
  closing: false,
});

const props = defineProps({
  center: {
    type: Boolean,
    default: false,
  },
  showLogo: {
    type: Boolean,
    default: false,
  },
  animate: {
    type: Boolean,
    default: false,
  },
  animateClose: {
    type: Boolean,
    default: false,
  },
  screenEvent: {
    type: String,
    required: true,
  },
  showFireworks: {
    type: Boolean,
    default: false,
  },
  isDD: {
    type: Boolean,
    default: true,
  },
  logo: {
    type: String,
    default: "cloaked-logo-full",
  },
  esimStep: {
    type: Number,
    required: false,
    default: null,
  },
});

function navToMainPage() {
  router.push({ name: "Home" });
}

function closeOnboarding() {
  navToHome();
}

function navToHome() {
  state.closing = true;
  setTimeout(() => {
    router.push({ name: "Home" });
  }, 300);
}

watch(
  () => props.animateClose,
  (newVal) => {
    if (newVal) {
      navToHome();
    }
  }
);
</script>
<template>
  <div
    class="dd-onboarding-ui-page"
    :class="{
      center: props.center,
      animate: props.animate,
      'animate-close': state.closing,
    }"
  >
    <div class="overlay">
      <div class="shape" />
    </div>

    <div class="top-nav">
      <InlineSvg
        v-if="props.showLogo"
        :name="props.logo"
      />
      <div
        v-else
        class="back-button-wrapper"
        @click="navToMainPage"
      >
        <InlineSvg name="left-arrow" />
        <span>Back to main menu</span>
      </div>
      <EsimHeader
        v-if="props.esimStep"
        :step="props.esimStep"
      />

      <div class="close-section">
        <div
          class="close-wrapper"
          @click="closeOnboarding"
        >
          <span>Close</span>
          <InlineSvg name="close-x-borderless" />
        </div>
      </div>
    </div>

    <div
      class="main-content"
      :class="{ center: props.center, animate: !props.animate }"
    >
      <slot />
    </div>
  </div>
</template>
<style lang="scss" scoped>
/* stylelint-disable */
.dd-onboarding-ui-page {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  background: $color-base-white-100;
  overflow-y: scroll;
  z-index: 1000;
  padding: 16px;

  &.animate {
    top: 100px;
    opacity: 0;
    animation:
      fade-in 0.5s ease-in-out forwards,
      slide-up 0.5s ease-in-out forwards;
  }

  &.animate-close {
    animation:
      fade-out 0.5s ease-in-out forwards,
      slide-down 0.5s ease-in-out forwards;
  }

  &.center {
    padding-top: 0;
    justify-content: center;
  }

  .overlay {
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
  }

  .shape {
    height: 700px;
    width: 700px;
    background: $background-rainbow;
    filter: $background-rainbow-filter;
    z-index: 1001;
    mix-blend-mode: screen;
    opacity: 0.45;
    border-radius: 59.159px;
    transform: rotate(280deg) skew(20deg, 10deg);
  }

  .top-nav {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 60px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    z-index: 1003;

    svg {
      color: $color-primary-100;
      height: 27px;
      width: auto;
    }

    .close-section {
      width: 140px;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;

      @media (width >= 1075px) {
        width: auto;
      }

      .close-wrapper {
        @media (max-width: $screen-md) {
          span {
            display: none;
          }
        }

        cursor: pointer;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;
        gap: 9px;
        color: $color-primary-100;
        font-size: 14px;
        font-style: normal;
        font-weight: 600;
        line-height: normal;
        transition: opacity 0.3s;
        width: auto;

        &:hover {
          opacity: 0.7;
          transition: opacity 0.3s;
        }

        svg {
          height: 14px;
          width: auto;
        }
      }
    }

    .back-button-wrapper {
      @media (max-width: $screen-md) {
        span {
          display: none;
        }
      }

      cursor: pointer;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      gap: 9px;
      color: $color-primary-100;
      transition: opacity 0.3s;
      font-size: 14px;
      font-style: normal;
      font-weight: 600;
      line-height: normal;

      &:hover {
        opacity: 0.7;
        transition: opacity 0.3s;
      }

      svg {
        height: 14px;
        width: auto;
      }
    }
  }

  .main-content {
    z-index: 1002;
    width: 100%;
    height: auto;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: column;
    padding: 72px 0;

    &.animate {
      animation:
        fade-in 0.5s ease-in-out forwards,
        slide-left 0.5s ease-in-out forwards;
    }

    &.center {
      justify-content: center;
      padding: 0;
    }
  }

  @keyframes slide-up {
    0% {
      top: 200px;
    }

    100% {
      top: 0;
    }
  }

  @keyframes slide-down {
    0% {
      top: 0;
    }

    100% {
      top: 100px;
    }
  }

  @keyframes slide-left {
    0% {
      margin-left: 200px;
    }

    100% {
      margin-left: 0;
    }
  }

  @keyframes slide-right {
    0% {
      margin-left: 0;
    }

    100% {
      margin-left: 100px;
    }
  }

  @keyframes fade-in {
    0% {
      opacity: 0.5;
    }

    100% {
      opacity: 1;
    }
  }

  @keyframes fade-out {
    0% {
      opacity: 1;
    }

    100% {
      opacity: 0;
    }
  }
}

:deep(.esim-text) {
  color: $color-base-white-100 !important;
  fill: $color-base-white-100 !important;
}
</style>
