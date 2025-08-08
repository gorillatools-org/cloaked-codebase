<script setup>
import Close from "@/assets/icons/close-modal-full.svg";
import { onMounted, onUnmounted, ref } from "vue";

const emit = defineEmits(["close"]);

const closing = ref(false);

onMounted(() => {
  document.body.classList.add("overflow-hidden");
});
onUnmounted(() => {
  document.body.classList.remove("overflow-hidden");
});

function onClose() {
  closing.value = true;
  setTimeout(() => {
    emit("close");
  }, 500);
}
</script>
<template>
  <div
    class="modal-full"
    :class="{ 'animate-close': closing }"
  >
    <div class="modal-full__header">
      <slot name="header-left">
        <button
          class="modal-full__button"
          @click="onClose"
        >
          <Close />
        </button>
      </slot>
      <slot name="header-center" />
      <slot name="header-right" />
    </div>
    <div class="modal-full__content">
      <slot />
    </div>
  </div>
</template>
<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.modal-full {
  position: fixed;
  background: $color-base-white-100;
  inset: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  top: 100px;
  opacity: 0;
  animation:
    fade-in 0.5s ease-in-out forwards,
    slide-up 0.5s ease-in-out forwards;

  &.animate-close {
    animation:
      fade-out 0.5s ease-in-out forwards,
      slide-down 0.5s ease-in-out forwards;
  }

  &__header {
    height: 84px;
    border-bottom: 1px solid $color-primary-10;
    display: grid;
    grid-template-columns: 1fr minmax(150px, 520px) minmax(290px, 1fr);
    align-items: center;
    padding: 0 24px;
    flex-shrink: 0;

    & > *:nth-child(1) {
      justify-self: left;
    }

    & > *:nth-child(2) {
      justify-self: center;
    }

    & > *:nth-child(3) {
      justify-self: right;
    }
  }

  &__button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 100%;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    color: $color-primary-100;

    &:hover {
      opacity: 0.7;
    }
  }

  &__content {
    padding: 24px;
    overflow: auto;
    height: calc(100vh - 84px);
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

  @keyframes slide-up {
    0% {
      top: 100px;
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
}
</style>
