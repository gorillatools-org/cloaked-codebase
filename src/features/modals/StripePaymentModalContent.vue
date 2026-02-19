<script setup lang="ts">
import { useTemplateRef, watch, onUnmounted } from "vue";
import BaseButton from "@/library/BaseButton.vue";
import BaseText from "@/library/BaseText.vue";
import BaseMedallion from "@/library/BaseMedallion.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import type { BaseIconName } from "@/library/baseIconTypes";
import type { MedallionColor } from "@/library/BaseMedallion.vue";

type Props = {
  show: boolean;
  title: string;
  description: string;
  medallionIcon: BaseIconName;
  medallionColor: MedallionColor;
  isLoading: boolean;
  isSubmitting: boolean;
  buttonText: string;
  buttonTextLoading?: string;
  buttonVariant?: string;
  dangerDescription?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  buttonTextLoading: "Processing...",
  buttonVariant: "primary",
  dangerDescription: false,
});

const emit = defineEmits<{
  (e: "close"): void;
  (e: "submit"): void;
}>();

const stripeElementRef = useTemplateRef<HTMLDivElement>("stripeElementRef");

const handleKeydown = (event: KeyboardEvent) => {
  if (
    event.key === "Enter" &&
    props.show &&
    !props.isSubmitting &&
    !props.isLoading
  ) {
    event.preventDefault();
    emit("submit");
  }
};

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      document.addEventListener("keydown", handleKeydown);
    } else {
      document.removeEventListener("keydown", handleKeydown);
    }
  }
);

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});

defineExpose({
  stripeElementRef,
});
</script>

<template>
  <Teleport to="body">
    <transition
      name="payment-modal"
      :duration="{ enter: 400, leave: 400 }"
    >
      <div
        v-if="props.show"
        class="payment-method-modal"
        :class="{
          'payment-method-modal--danger': props.dangerDescription,
        }"
      >
        <!-- Backdrop -->
        <div
          class="payment-method-modal__backdrop"
          @click="emit('close')"
        />

        <!-- Sheet Content -->
        <div class="payment-method-modal__sheet">
          <!-- Scrollable Content -->
          <div class="payment-method-modal__content">
            <!-- Header -->
            <div class="payment-method-modal__header">
              <div class="payment-method-modal__header-top">
                <BaseMedallion
                  class="payment-method-modal__medallion"
                  :icon="props.medallionIcon"
                  :color="props.medallionColor"
                />

                <button
                  class="payment-method-modal__close-button"
                  aria-label="Close"
                  @click="emit('close')"
                >
                  <BaseIcon
                    name="close"
                    class="payment-method-modal__close-icon"
                  />
                </button>
              </div>

              <BaseText
                variant="headline-2-semibold"
                as="h2"
                class="payment-method-modal__title"
              >
                {{ props.title }}
              </BaseText>

              <BaseText
                variant="body-small-medium"
                as="div"
                class="payment-method-modal__description"
              >
                {{ props.description }}
              </BaseText>
            </div>

            <!-- Form -->
            <div class="payment-method-modal__form-container">
              <div
                v-show="props.isLoading"
                class="payment-method-modal__loading-state"
              >
                <div class="payment-method-modal__spinner" />
              </div>

              <div
                ref="stripeElementRef"
                class="payment-method-modal__stripe-element"
                :class="{
                  'payment-method-modal__stripe-element--hidden':
                    props.isLoading,
                }"
              />
            </div>

            <!-- Actions -->
            <div class="payment-method-modal__actions">
              <BaseButton
                :variant="props.buttonVariant"
                size="lg"
                full-width
                :loading="props.isSubmitting"
                :disabled="props.isSubmitting || props.isLoading"
                @click="emit('submit')"
              >
                {{
                  props.isSubmitting
                    ? props.buttonTextLoading
                    : props.buttonText
                }}
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.payment-method-modal {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: flex-end;
  justify-content: center;

  @media (min-width: $screen-lg) {
    align-items: center;
  }

  &__backdrop {
    position: absolute;
    inset: 0;
    background-color: rgb(0 0 0 / 50%);
    backdrop-filter: blur(4px);
    transition:
      opacity 0.2s ease,
      backdrop-filter 0.2s ease;
  }

  &__sheet {
    position: relative;
    width: 100%;
    max-width: 100%;
    height: auto;
    min-height: 50vh;
    max-height: 90vh;
    background: var(--color-primary-1);
    border: 1px solid var(--color-primary-10);
    border-radius: 16px 16px 0 0;
    box-shadow: 0 -4px 24px rgb(0 0 0 / 15%);
    display: flex;
    flex-direction: column;
    overflow: hidden;

    @media (min-width: $screen-lg) {
      max-width: 540px;
      height: auto;
      min-height: auto;
      max-height: 90vh;
      border-radius: 20px;
    }
  }

  &__content {
    flex: 1;
    overflow: hidden auto;
    padding: 24px;
  }

  &__header {
    margin-bottom: 24px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    gap: 12px;
  }

  &__header-top {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  &__medallion {
    flex-shrink: 0;
  }

  &__close-button {
    width: 36px;
    height: 36px;
    margin-top: 6px;
    border: none;
    background-color: $color-primary-10;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: $color-primary-70;
    transition: all 0.2s ease;
    flex-shrink: 0;
    padding: 0;

    &:hover {
      background-color: $color-primary-10;
      color: $color-primary-100;
    }

    &:active {
      transform: scale(0.95);
    }
  }

  &__close-icon {
    font-size: 18px;
  }

  &__title {
    margin: 0;
    color: $color-primary-100;
  }

  &__description {
    color: $color-primary-50;
    line-height: 1.5;
  }

  &--danger {
    .payment-method-modal__description {
      color: $color-alert;
    }
  }

  &__form-container {
    position: relative;
    margin-bottom: 24px;
    border: 1px solid $color-primary-20;
    border-radius: 12px;
    background-color: $color-base-white-100;
    min-height: 80px;
  }

  &__loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    background-color: $color-base-white-100;
    border-radius: 12px;
  }

  &__stripe-element {
    min-height: 120px;
    padding: 16px;
    opacity: 1;
    transform: translateY(0);
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;

    &--hidden {
      opacity: 0;
      transform: translateY(8px);
      pointer-events: none;
      position: absolute;
      inset: 0;
      z-index: -1;
    }

    /* stylelint-disable-next-line selector-class-pattern */
    :deep(.p-Element) {
      padding: 0;
    }
  }

  &__spinner {
    width: 24px;
    height: 24px;
    border: 2px solid $color-primary-10;
    border-top: 2px solid $color-primary-100;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  &__actions {
    display: flex;
    justify-content: center;
  }
}

.payment-modal-enter-active {
  .payment-method-modal__backdrop {
    transition:
      opacity 0.2s ease,
      backdrop-filter 0.2s ease;
  }

  .payment-method-modal__sheet {
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1) 0.05s;

    @media (min-width: $screen-lg) {
      transition:
        transform 0.35s cubic-bezier(0.4, 0, 0.2, 1) 0.05s,
        opacity 0.35s ease 0.05s;
    }
  }
}

.payment-modal-leave-active {
  .payment-method-modal__backdrop {
    transition:
      opacity 0.25s ease 0.1s,
      backdrop-filter 0.25s ease 0.1s;
  }

  .payment-method-modal__sheet {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    @media (min-width: $screen-lg) {
      transition:
        transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
        opacity 0.3s ease;
    }
  }
}

.payment-modal-enter-from {
  .payment-method-modal__backdrop {
    opacity: 0;
    backdrop-filter: blur(0);
  }

  .payment-method-modal__sheet {
    transform: translateY(100%);

    @media (min-width: $screen-lg) {
      transform: translateY(20px) scale(0.95);
      opacity: 0;
    }
  }
}

.payment-modal-leave-to {
  .payment-method-modal__backdrop {
    opacity: 0;
    backdrop-filter: blur(0);
  }

  .payment-method-modal__sheet {
    transform: translateY(100%);

    @media (min-width: $screen-lg) {
      transform: translateY(20px) scale(0.95);
      opacity: 0;
    }
  }
}

.payment-modal-enter-to,
.payment-modal-leave-from {
  .payment-method-modal__backdrop {
    opacity: 1;
    backdrop-filter: blur(4px);
  }

  .payment-method-modal__sheet {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
