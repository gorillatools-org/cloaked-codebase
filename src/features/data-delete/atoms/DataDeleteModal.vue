<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: true,
  },
  hasOutsideClickClose: {
    type: Boolean,
    default: true,
  },
});

defineEmits(["update:modelValue"]);
</script>

<template>
  <teleport to="#modals">
    <transition
      name="data-delete-modal"
      appear
      :duration="{ enter: 550, leave: 450 }"
    >
      <div
        v-if="props.modelValue"
        class="data-delete-modal"
      >
        <div
          class="data-delete-modal__background"
          @click="hasOutsideClickClose && $emit('update:modelValue', false)"
        />
        <div class="data-delete-modal__content">
          <slot />
        </div>
      </div>
    </transition>
  </teleport>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.data-delete-modal {
  position: fixed;
  z-index: 1000;
  display: flex;

  &__background {
    position: fixed;
    inset: 0;
    background: rgba($black, 0.3);
    backdrop-filter: blur(15px);
  }

  &__content {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate3d(-50%, -50%, 0);
    width: calc(100vw - 2 * 22px);
    max-width: 560px;
  }
}

.data-delete-modal-enter-active,
.data-delete-modal-leave-active {
  .data-delete-modal__background,
  .data-delete-modal__content {
    transition: all 0.45s cubic-bezier(0.8, -0.25, 0.1, 1.15);
  }
}

.data-delete-modal-enter-active {
  .data-delete-modal__content {
    transition-delay: 0.1s;
  }
}

.data-delete-modal-enter-from,
.data-delete-modal-leave-to {
  .data-delete-modal__background {
    opacity: 0;
  }

  .data-delete-modal__content {
    opacity: 0;
    transform: translate3d(-50%, calc(-50% + 50vh), 0) scale(0.7);
  }
}
</style>
