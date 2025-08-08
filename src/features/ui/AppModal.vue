<script setup>
import { onMounted, onBeforeUnmount } from "vue";

const emit = defineEmits(["close", "input"]);

const props = defineProps({
  value: {
    type: Boolean,
    default: true,
  },
  withoutOverlay: {
    type: Boolean,
    default: false,
  },
  hasOutsideClickClose: {
    type: Boolean,
    default: true,
  },
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", checkForEscape);
});

onMounted(() => {
  document.addEventListener("keydown", checkForEscape);
});

function checkForEscape(event) {
  if (event?.key?.toLowerCase() === "escape") {
    onClose();
  }
}

function onClose() {
  if (props.hasOutsideClickClose) {
    emit("close");
    emit("input", false);
  }
}
</script>
<template>
  <Teleport to="#modals">
    <transition
      name="app-modal"
      appear
      :duration="{ enter: 650, leave: 450 }"
    >
      <div
        v-if="props.value"
        class="app-modal"
      >
        <div
          class="app-modal__background"
          :class="{
            'app-modal__background--without-overlay': props.withoutOverlay,
          }"
          @click="onClose"
        />
        <div class="app-modal__content">
          <slot />
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.app-modal {
  position: fixed;
  z-index: 1000;
  display: flex;

  &__background {
    position: fixed;
    inset: 0;
    background: rgba($black, 0.5);

    @at-root .theme-dark & {
      backdrop-filter: blur(3px);
      background: rgba($black, 0.7);
    }

    &--without-overlay {
      opacity: 0;
    }
  }

  &__content {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate3d(-50%, -50%, 0);
  }
}

.app-modal-enter-active,
.app-modal-leave-active {
  .app-modal__background,
  .app-modal__content {
    transition: all 0.45s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  }
}

.app-modal-enter-active {
  .app-modal__content {
    transition-delay: 0.2s;
  }
}

.app-modal-enter-from,
.app-modal-leave-to {
  .app-modal__background {
    opacity: 0;
  }

  .app-modal__content {
    opacity: 0;
    transform: translate3d(-50%, -50%, 0) scale(0.9);
  }
}
</style>
