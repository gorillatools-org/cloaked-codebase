<script setup lang="ts">
import { ref, computed, onUnmounted } from "vue";
import BaseButton from "@/library/BaseButton.vue";
import BaseText from "@/library/BaseText.vue";
import BaseMedallion from "@/library/BaseMedallion.vue";
import store from "@/store";
import { useToast } from "@/composables/useToast.js";
import { useFormattedDate } from "@/composables/useFormattedDate";
import { useIdentityTheftProtection } from "@/composables/useIdentityTheftProtection";

interface Props {
  show: boolean;
}

interface Emits {
  (e: "close"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const toast = useToast();
const isCancellingSubscription = ref(false);

// Get subscription details
const subscription = computed(() => store.getters["settings/getSubscription"]);
const subscriptionEndDate = useFormattedDate(
  computed(() => subscription.value?.expires_date)
);

const { millions } = useIdentityTheftProtection();

// Modal content
const modalContent = computed(() => {
  const formattedDate = subscriptionEndDate.value
    ? subscriptionEndDate.value
    : null;

  const description = formattedDate
    ? `If you cancel this subscription, your access will end on ${formattedDate} and you will no longer have access to $${millions.value} million in identity theft insurance after this date.`
    : `If you cancel this subscription, your access will end at the end of your current billing period and you will no longer have access to $${millions.value} million in identity theft insurance.`;

  return {
    medallionIcon: "exclamation-mark-triangle" as const,
    medallionColor: "error" as const,
    title: "Cancel subscription",
    description,
    buttonText: isCancellingSubscription.value
      ? "Cancelling..."
      : "Cancel Subscription",
  };
});

const handleClose = () => {
  if (!isCancellingSubscription.value) {
    emit("close");
  }
};

const handleCancel = async () => {
  try {
    isCancellingSubscription.value = true;
    await store.dispatch("subscription/cancelSubscriptionRenewal");
    toast.success("Your subscription was cancelled successfully");
    emit("close");
  } catch {
    toast.error("Failed to cancel subscription");
  } finally {
    isCancellingSubscription.value = false;
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && props.show && !isCancellingSubscription.value) {
    event.preventDefault();
    handleClose();
  }
};

// Keyboard handling
document.addEventListener("keydown", handleKeydown);

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <Teleport to="body">
    <transition
      name="cancel-modal"
      :duration="{ enter: 400, leave: 400 }"
    >
      <div
        v-if="props.show"
        class="cancel-subscription-modal"
      >
        <!-- Backdrop -->
        <div
          class="cancel-subscription-modal__backdrop"
          @click="handleClose"
        />

        <!-- Sheet Content -->
        <div class="cancel-subscription-modal__sheet">
          <!-- Scrollable Content -->
          <div class="cancel-subscription-modal__content">
            <!-- Header -->
            <div class="cancel-subscription-modal__header">
              <div class="cancel-subscription-modal__header-top">
                <BaseMedallion
                  class="cancel-subscription-modal__medallion"
                  :icon="modalContent.medallionIcon"
                  :color="modalContent.medallionColor"
                />

                <button
                  class="cancel-subscription-modal__close-button"
                  aria-label="Close"
                  :disabled="isCancellingSubscription"
                  @click="handleClose"
                >
                  <svg
                    class="cancel-subscription-modal__close-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 6L6 18M6 6L18 18"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>

              <BaseText
                variant="headline-2-semibold"
                as="h2"
                class="cancel-subscription-modal__title"
              >
                {{ modalContent.title }}
              </BaseText>

              <BaseText
                variant="body-small-medium"
                as="div"
                class="cancel-subscription-modal__description"
              >
                {{ modalContent.description }}
              </BaseText>
            </div>

            <!-- Actions -->
            <div class="cancel-subscription-modal__actions">
              <BaseButton
                variant="danger"
                size="lg"
                full-width
                :loading="isCancellingSubscription"
                :disabled="isCancellingSubscription"
                @click="handleCancel"
              >
                {{ modalContent.buttonText }}
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.cancel-subscription-modal {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: flex-end;
  justify-content: center;

  @media (width >= 768px) {
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
    max-height: 80vh;
    background: var(--color-primary-1);
    border: 1px solid var(--color-primary-10);
    border-radius: 16px 16px 0 0;
    box-shadow: 0 -4px 24px rgb(0 0 0 / 15%);
    display: flex;
    flex-direction: column;
    overflow: hidden;

    @media (width >= 768px) {
      max-width: 480px;
      max-height: 90vh;
      border-radius: 20px;
    }
  }

  &__content {
    overflow: hidden auto;
    padding: 24px;
    -webkit-overflow-scrolling: touch;
    display: flex;
    flex-direction: column;
    gap: 32px;
    min-height: 0;
  }

  &__header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    gap: 12px;
  }

  &__header-top {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__medallion {
    flex-shrink: 0;
  }

  &__close-button {
    width: 36px;
    height: 36px;
    margin-top: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $color-primary-10;
    border: none;
    border-radius: 50%;
    color: $color-primary-70;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background-color: $color-primary-10;
      color: $color-primary-100;
    }

    &:active {
      transform: scale(0.95);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__close-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  &__title {
    color: var(--color-primary-100);
    margin: 0;
  }

  &__description {
    color: var(--color-primary-70);
    line-height: 1.5;
    margin: 0;
  }

  &__actions {
    display: flex;
    flex-direction: row;
    gap: 12px;

    @media (width < 480px) {
      flex-direction: column;
    }
  }
}

// Transition animations
.cancel-modal-enter-active .cancel-subscription-modal__sheet {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1) 0.05s;

  @media (width >= 768px) {
    transition:
      transform 0.35s cubic-bezier(0.4, 0, 0.2, 1) 0.05s,
      opacity 0.35s ease 0.05s;
  }
}

.cancel-modal-leave-active .cancel-subscription-modal__sheet {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);

  @media (width >= 768px) {
    transition:
      transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.35s ease;
  }
}

.cancel-modal-enter-from {
  .cancel-subscription-modal__backdrop {
    opacity: 0;
    backdrop-filter: blur(0);
  }

  .cancel-subscription-modal__sheet {
    transform: translateY(100%);

    @media (width >= 768px) {
      transform: translateY(32px) scale(0.95);
      opacity: 0;
    }
  }
}

.cancel-modal-leave-to {
  .cancel-subscription-modal__backdrop {
    opacity: 0;
    backdrop-filter: blur(0);
  }

  .cancel-subscription-modal__sheet {
    transform: translateY(100%);

    @media (width >= 768px) {
      transform: translateY(32px) scale(0.95);
      opacity: 0;
    }
  }
}
</style>
