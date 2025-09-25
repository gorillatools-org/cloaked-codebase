<script lang="ts" setup>
import {
  markRaw,
  ref,
  watch,
  computed,
  onUnmounted,
  onMounted,
  useTemplateRef,
} from "vue";
import SubscriptionOnboardingNavbar from "@/features/Subscription/onboarding/SubscriptionOnboardingNavbar.vue";
import { useRouter } from "vue-router";
import store from "@/store";
import WalletConfirmationModal from "@/features/modals/Wallet/WalletConfirmationModal.vue";
import type { SubscriptionOnboardingProgressStep } from "./SubscriptionOnboardingProgressbar.vue";

export type CloseModalConfig = {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

export type LayoutProgressStep = SubscriptionOnboardingProgressStep & {
  activeOnSections?: string[];
  completedOnSections?: string[];
};

const DEFAULT_CLOSE_MODAL_CONFIG: CloseModalConfig = {
  title: "Almost done - don't miss out.",
  description:
    "You're just a few steps to finish the onboarding. Want to finish later or keep going?",
  primaryButtonText: "I'll finish later",
  secondaryButtonText: "Keep going",
  onConfirm: () => {
    finish();
  },
  onCancel: () => {},
};

const emit = defineEmits<{
  (e: "back"): void;
  (e: "close"): void;
  (e: "exit-modal-opened"): void;
  (e: "exit-modal-confirmed"): void;
}>();

const props = withDefaults(
  defineProps<{
    disableBackBtn?: boolean;
    disableCloseBtn?: boolean;
    finishRedirectRoute?: string;
    closeModalConfig?: Partial<CloseModalConfig>;
    showCloseModal?: boolean;
    progressSteps: LayoutProgressStep[];
    currentSection?: string;
  }>(),
  {
    disableBackBtn: false,
    disableCloseBtn: false,
    showCloseModal: false,
    finishRedirectRoute: "/home",
    closeModalConfig: undefined,
    progressSteps: () => [],
    currentSection: undefined,
  }
);

const router = useRouter();
const isComplete = ref(false);
const transition = ref<"forward" | "back">("forward");
const internalProgressSteps = ref<LayoutProgressStep[]>(props.progressSteps);
const onboardingContentElement = useTemplateRef<HTMLDivElement>(
  "onboardingContentElement"
);

const derivedSteps = computed<SubscriptionOnboardingProgressStep[]>(() => {
  const currentSection = props.currentSection;

  return internalProgressSteps.value.map((step) => {
    if (currentSection === undefined) {
      return step;
    }

    const updatedStep: SubscriptionOnboardingProgressStep = {
      id: step.id,
      label: step.label,
      status: step.status,
      visible: step.visible,
    };

    const matchesCompleted = step.completedOnSections?.some(
      (section) => section === currentSection
    );

    const matchesActive = step.activeOnSections?.some(
      (section) => section === currentSection
    );

    if (matchesCompleted) {
      updatedStep.status = "completed";
    } else if (matchesActive) {
      updatedStep.status = "active";
    } else if (updatedStep.status !== "completed") {
      // Do not overwrite completed status; otherwise default to pending
      updatedStep.status = "pending";
    }

    return updatedStep;
  });
});

onMounted(() => {
  document.body.classList.add("overflow-hidden");
});

onUnmounted(() => {
  document.body.classList.remove("overflow-hidden");
});

const handleClose = () => {
  if (!props.showCloseModal) {
    finish();
  } else {
    const modalProps = {
      icon: "info",
      title: props.closeModalConfig?.title || DEFAULT_CLOSE_MODAL_CONFIG.title,
      description:
        props.closeModalConfig?.description ||
        DEFAULT_CLOSE_MODAL_CONFIG.description,
      primaryButtonText:
        props.closeModalConfig?.primaryButtonText ||
        DEFAULT_CLOSE_MODAL_CONFIG.primaryButtonText,
      secondaryButtonText:
        props.closeModalConfig?.secondaryButtonText ||
        DEFAULT_CLOSE_MODAL_CONFIG.secondaryButtonText,
      primaryButtonColor: "danger",
      secondaryButtonColor: "outline",
      onConfirm: () => {
        emit("exit-modal-confirmed");
        if (props.closeModalConfig?.onConfirm) {
          props.closeModalConfig.onConfirm();
          return;
        }
        finish();
      },
      onCancel: () => {
        if (props.closeModalConfig?.onCancel) {
          props.closeModalConfig.onCancel();
        }
      },
    };

    emit("exit-modal-opened");
    store.dispatch("openModal", {
      customTemplate: {
        template: markRaw(WalletConfirmationModal),
        props: {
          ...modalProps,
        },
      },
    });
  }
};

const finish = (
  customRedirectRoute?: string,
  beforeRedirect?: () => void,
  afterRedirect?: () => void
) => {
  isComplete.value = true;
  if (beforeRedirect) {
    beforeRedirect();
  }

  setTimeout(() => {
    router
      .push(customRedirectRoute || props.finishRedirectRoute)
      .then(() => {
        if (afterRedirect) {
          afterRedirect();
        }
      })
      .finally(() => {
        isComplete.value = false;
      });
  }, 300);
};

const goBack = (emitEvent = true) => {
  transition.value = "back";
  if (emitEvent) {
    emit("back");
  }
};

const goForward = () => {
  transition.value = "forward";
};

const hideProgressStep = (step: string) => {
  const stepIndex = internalProgressSteps.value.findIndex(
    (_step) => _step.id === step
  );
  if (stepIndex !== -1) {
    internalProgressSteps.value[stepIndex].visible = false;
  }
};

const scrollToTop = () => {
  const content = onboardingContentElement.value;
  if (content) {
    content.scrollTo({ top: 0 });
  }
};

watch(
  () => props.progressSteps,
  (newVal) => {
    internalProgressSteps.value = newVal;
  }
);

watch(
  () => props.currentSection,
  () => {
    setTimeout(() => {
      scrollToTop();
    }, 170); // Wait for the section to transition out to prevent the scroll animation
  }
);

defineExpose({
  finish,
  goForward,
  goBack: () => goBack(false),
  hideProgressStep,
});
</script>

<template>
  <div
    class="subs-onboarding-layout"
    :class="{ 'subs-onboarding-layout--complete': isComplete }"
  >
    <header>
      <SubscriptionOnboardingNavbar
        :steps="derivedSteps"
        :disable-back-btn="disableBackBtn"
        :disable-close-btn="false"
        @back="goBack"
        @close="handleClose"
      />
    </header>
    <div
      id="subs-onboarding-layout-content"
      ref="onboardingContentElement"
      class="subs-onboarding-layout__content"
    >
      <Transition
        :name="transition === 'forward' ? 'step-forward' : 'step-back'"
        mode="out-in"
      >
        <slot />
      </Transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.subs-onboarding-layout {
  position: fixed;
  top: 0;
  left: 0;
  opacity: 0;
  width: 100%;
  height: 100dvh;
  background: $color-base-white-100;
  z-index: 1000;
  animation: fade-in 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  animation-fill-mode: forwards;

  &--complete {
    animation: fade-out 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    animation-fill-mode: forwards;
  }

  &__content {
    overflow: hidden auto;
    height: calc(100dvh - 76px); // Subtracting navbar height
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;

    @media screen and (min-width: $screen-md) {
      height: calc(100vh - 86px); // Subtracting navbar height
      -webkit-overflow-scrolling: auto;
      overscroll-behavior: auto;
    }
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes fade-out {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.4s cubic-bezier(0.25, 0.8, 0.25, 1),
    transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(-15px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.step-forward-enter-active,
.step-forward-leave-active,
.step-back-enter-active,
.step-back-leave-active {
  transition:
    transform 200ms cubic-bezier(0.77, 0, 0.18, 1),
    opacity 200ms cubic-bezier(0.77, 0, 0.18, 1),
    filter 150ms cubic-bezier(0.77, 0, 0.18, 1);
}

.step-forward-enter-from {
  opacity: 0;
  transform: translateX(24px);
  filter: blur(2px);
}

.step-forward-enter-to {
  opacity: 1;
  transform: translateX(0);
  filter: blur(0);
}

.step-forward-leave-from {
  opacity: 1;
  transform: translateX(0);
  filter: blur(0);
}

.step-forward-leave-to {
  opacity: 0;
  transform: translateX(-24px);
  filter: blur(2px);
}

.step-back-enter-from {
  opacity: 0;
  transform: translateX(-24px);
  filter: blur(2px);
}

.step-back-enter-to {
  opacity: 1;
  transform: translateX(0);
  filter: blur(0);
}

.step-back-leave-from {
  opacity: 1;
  transform: translateX(0);
  filter: blur(0);
}

.step-back-leave-to {
  opacity: 0;
  transform: translateX(24px);
  filter: blur(2px);
}
</style>
