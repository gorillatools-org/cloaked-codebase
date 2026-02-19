<script setup>
import { ref, computed, onBeforeUnmount } from "vue";
import DataDeletePageQuestionnaireIntro from "@/features/data-delete/DataDeletePageQuestionnaireIntro.vue";
import DataDeletePageQuestionnaireQuestions from "@/features/data-delete/DataDeletePageQuestionnaireQuestions.vue";
import DataDeletePageQuestionnaireLoader from "@/features/data-delete/DataDeletePageQuestionnaireLoader.vue";
import LineProgress from "@/features/ui/LineProgress.vue";
import InlineSvg from "@/features/InlineSvg.vue";
import PageCheckoutReviews from "@/features/subscribe/PageCheckoutReviews.vue";
import { useDisplay } from "@/composables/useDisplay";

const emit = defineEmits(["complete", "skip"]);

const { isMobile } = useDisplay();

const props = defineProps({
  questions: {
    type: Array,
    default: null,
  },
});

const currentStep = ref(0); // 0 = intro, 1..N = questions, N+1 = loader
const answers = ref({});

const totalQuestions = computed(() => props.questions.length);

const currentQuestion = computed(() => {
  if (currentStep.value === 0 || currentStep.value > totalQuestions.value) {
    return null;
  }
  return props.questions[currentStep.value - 1];
});

const isIntroStep = computed(() => currentStep.value === 0);
const isQuestionStep = computed(
  () => currentStep.value >= 1 && currentStep.value <= totalQuestions.value
);
const isLoaderStep = computed(
  () => currentStep.value === totalQuestions.value + 1
);

const isCompleting = ref(false);
const COMPLETE_DELAY_MS = 400;

let completionTimerId;

const progressValue = computed(() => {
  if (totalQuestions.value === 0) return 0;
  if (isLoaderStep.value || isCompleting.value) return 1;
  if (!isQuestionStep.value) return 0;
  return Math.max(
    0,
    Math.min(1, (currentStep.value - 1) / totalQuestions.value)
  );
});

const selectOption = (value, isOtherTextInput = false) => {
  if (!currentQuestion.value) return;

  const questionId = currentQuestion.value.id;
  const isMulti = currentQuestion.value.type === "multi-select";

  if (isOtherTextInput) {
    const formattedOther = `Other: ${value}`;
    if (isMulti) {
      if (!answers.value[questionId]) {
        answers.value[questionId] = [];
      }
      answers.value[questionId] = answers.value[questionId].filter(
        (opt) => !opt.startsWith("Other:")
      );
      answers.value[questionId].push(formattedOther);
    } else {
      answers.value[questionId] = formattedOther;
    }
    return;
  }

  if (isMulti) {
    if (!answers.value[questionId]) {
      answers.value[questionId] = [];
    }

    if (value === "other") {
      answers.value[questionId] = ["Other"];
      return;
    }

    answers.value[questionId] = answers.value[questionId].filter(
      (opt) => !opt.startsWith("Other")
    );

    const index = answers.value[questionId].indexOf(value);
    if (index > -1) {
      answers.value[questionId].splice(index, 1);
    } else {
      answers.value[questionId].push(value);
    }
  } else {
    if (value === "other") {
      answers.value[questionId] = "Other";
      return;
    }

    answers.value[questionId] = value;
  }
};

onBeforeUnmount(() => {
  clearTimeout(completionTimerId);
});

function redirectToSubscribe() {
  emit("complete");
}

function handleSkip() {
  emit("skip");
}
const goToLoaderAfterDelay = () => {
  clearTimeout(completionTimerId);
  completionTimerId = setTimeout(() => {
    isCompleting.value = false;
    currentStep.value++; // enter loader step
  }, COMPLETE_DELAY_MS);
};

const prevStep = () => {
  if (isQuestionStep.value) {
    isCompleting.value = false;
    if (currentStep.value > 1) {
      currentStep.value--;
    } else {
      currentStep.value = 0;
    }
  }
};

const nextStep = () => {
  if (
    (currentStep.value === 0 || isQuestionStep.value) &&
    currentStep.value < totalQuestions.value
  ) {
    isCompleting.value = false;
    currentStep.value++;
  } else if (
    isQuestionStep.value &&
    currentStep.value === totalQuestions.value
  ) {
    if (isCompleting.value) return;
    isCompleting.value = true; // progress -> 1 immediately
    goToLoaderAfterDelay(); // then switch to loader
  }
};

const skipStep = () => {
  if (isQuestionStep.value && currentStep.value < totalQuestions.value) {
    isCompleting.value = false;
    currentStep.value++;
  } else if (
    isQuestionStep.value &&
    currentStep.value === totalQuestions.value
  ) {
    if (isCompleting.value) return;
    isCompleting.value = true;
    goToLoaderAfterDelay();
  }
};
</script>

<template>
  <div class="questionnaire">
    <PageCheckoutReviews
      v-if="!isMobile"
      :class="isLoaderStep ? 'questionnaire__reviews' : ''"
    />

    <div
      class="questionnaire__header"
      :class="{
        'questionnaire__header--active': isQuestionStep,
      }"
    >
      <div
        v-if="!isMobile && !isLoaderStep"
        class="questionnaire__header__logo"
      >
        <InlineSvg
          name="cloaked-logo-full"
          class="questionnaire__header__logo-image"
        />
      </div>
      <div
        v-else-if="isQuestionStep"
        class="questionnaire__header__logo"
      >
        <button
          v-if="isMobile"
          class="questionnaire__header__logo__button"
          @click="prevStep"
        >
          <InlineSvg name="chevron-left" />
        </button>
      </div>
      <div
        v-if="isQuestionStep"
        class="questionnaire__progress"
      >
        <button
          v-if="!isMobile"
          class="questionnaire__progress__logo__button"
          @click="prevStep"
        >
          <InlineSvg name="chevron-left" />
        </button>
        <LineProgress
          :progress="progressValue"
          class="questionnaire__progress-bar"
        />
      </div>
    </div>

    <div
      class="questionnaire__content"
      :class="{
        'questionnaire__content--intro': !isQuestionStep && !isLoaderStep,
      }"
    >
      <Transition
        name="fade"
        mode="out-in"
      >
        <DataDeletePageQuestionnaireIntro
          v-if="isIntroStep"
          key="intro"
          @complete="redirectToSubscribe"
          @skip="handleSkip"
          @continue="nextStep"
        />

        <DataDeletePageQuestionnaireQuestions
          v-else-if="isQuestionStep"
          :key="currentStep"
          :questions="questions"
          :current-question="currentQuestion"
          :current-step="currentStep"
          :answers="answers"
          :is-completing="isCompleting"
          @select-option="selectOption"
          @next-step="nextStep"
          @skip-step="skipStep"
          @prev-step="prevStep"
        />

        <DataDeletePageQuestionnaireLoader
          v-else-if="isLoaderStep"
          :key="'loader'"
          @complete="redirectToSubscribe"
        />
      </Transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.questionnaire {
  position: relative;
  padding: 0;

  &__reviews {
    transition: opacity 0.3s ease-in-out;
    opacity: 0;
  }

  &__header {
    padding: 16px 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    height: 60px;
    max-width: 1140px;
    margin: 0 auto;
    gap: 24px;

    @media screen and (min-width: $screen-sm) {
      height: 88px;
    }

    &__logo {
      position: absolute;
      width: 32px;

      &-image {
        width: 32px;
      }

      &__button {
        border: 0;
        background-color: transparent;
        padding: 0;
        width: 100%;
        height: 100%;
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      @media screen and (min-width: $screen-sm) {
        width: 128px;

        &-image {
          width: 128px;
        }
      }
    }

    &--active {
      .questionnaire {
        &__header__logo {
          left: 10px;

          @media screen and (min-width: $screen-sm) {
            left: 32px;
          }
        }
      }
    }
  }

  &__progress {
    position: relative;
    width: 100%;
    max-width: 235px;
    padding: 0 24px;
    text-align: center;
    margin: 8px 0 12px;

    &-bar {
      height: 6px;
      border-radius: 20px;
      width: inherit;

      :deep(.progress-line__indicator) {
        stroke: $color-primary-100;
        stroke-width: 10px;
        border-radius: 20px;
        transition: stroke-dasharray 300ms ease-out;
      }

      :deep(.progress-line__background) {
        stroke: $color-base-white-20-light;
        stroke-width: 10px;
        border-radius: 20px;
      }
    }

    &__logo {
      &__button {
        position: absolute;
        left: -5px;
        top: calc(50% + 2px);
        transform: translateY(-50%);
        border: 0;
        background-color: transparent;
        padding: 0;
        width: 100%;
        height: 100%;
        font-size: 20px;
        display: flex;
        align-items: center;

        @media screen and (min-width: $screen-xl) {
          left: -29px;
        }
      }
    }

    @media screen and (min-width: $screen-sm) {
      max-width: 260px;
    }

    @media screen and (min-width: $screen-md) {
      max-width: 425px;
    }
  }

  &__content {
    margin: 0 auto;
    border-radius: 30px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 28px;
    width: 100%;
    max-width: 609px;
    padding-inline: 24px;

    &--intro {
      // max-width: 100%;
      max-width: 609px;
    }

    &:not(&--intro) {
      padding-bottom: 108px;
    }

    @media all and (min-width: $screen-sm) {
      padding: 0;

      &:not(&--intro) {
        max-height: initial;
      }
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 300ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
