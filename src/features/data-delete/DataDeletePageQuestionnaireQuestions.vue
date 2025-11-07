<script setup>
import { computed, onMounted } from "vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseButton from "@/library/BaseButton.vue";
import DataDeleteSticky from "@/features/data-delete/atoms/DataDeleteSticky.vue";
import { useDisplay } from "@/composables/useDisplay";
import { posthogCapture } from "@/scripts/posthog.js";
import {
  PH_EVENT_PERSONALIZED_THREE_QUESTIONS_SPAM_CALLS_VIEWED,
  PH_EVENT_PERSONALIZED_THREE_QUESTIONS_SPAM_CALLS_ANSWERED,
  PH_EVENT_PERSONALIZED_THREE_QUESTIONS_SPAM_CALLS_SKIPPED,
  PH_EVENT_PERSONALIZED_THREE_QUESTIONS_SERVICES_USED_VIEWED,
  PH_EVENT_PERSONALIZED_THREE_QUESTIONS_SERVICES_USED_ANSWERED,
  PH_EVENT_PERSONALIZED_THREE_QUESTIONS_SERVICES_USED_SKIPPED,
  PH_EVENT_PERSONALIZED_THREE_QUESTIONS_SECURITY_CONCERNS_VIEWED,
  PH_EVENT_PERSONALIZED_THREE_QUESTIONS_SECURITY_CONCERNS_ANSWERED,
  PH_EVENT_PERSONALIZED_THREE_QUESTIONS_SECURITY_CONCERNS_SKIPPED,
  PH_EVENT_PERSONALIZED_ONE_QUESTION_PRIVACY_THREAT_VIEWED,
  PH_EVENT_PERSONALIZED_ONE_QUESTION_PRIVACY_THREAT_ANSWERED,
  PH_EVENT_PERSONALIZED_ONE_QUESTION_PRIVACY_THREAT_SKIPPED,
} from "@/scripts/posthogEvents";

const OTHER_PREFIX = "Other:";

const props = defineProps({
  questions: {
    type: Array,
    required: true,
  },
  currentQuestion: {
    type: Object,
    required: true,
  },
  currentStep: {
    type: Number,
    required: true,
  },
  answers: {
    type: Object,
    required: true,
  },
  isCompleting: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "select-option",
  "next-step",
  "skip-step",
  "prev-step",
]);

const { isMobile } = useDisplay();

const isRequired = computed(() => props.currentQuestion?.required === true);

const isThreeQuestionFlow = computed(() => props.questions.length === 3);
const isOneQuestionFlow = computed(() => props.questions.length === 1);

const getEventNames = (questionId) => {
  if (isThreeQuestionFlow.value) {
    const events = {
      1: {
        viewed: PH_EVENT_PERSONALIZED_THREE_QUESTIONS_SPAM_CALLS_VIEWED,
        answered: PH_EVENT_PERSONALIZED_THREE_QUESTIONS_SPAM_CALLS_ANSWERED,
        skipped: PH_EVENT_PERSONALIZED_THREE_QUESTIONS_SPAM_CALLS_SKIPPED,
      },
      2: {
        viewed: PH_EVENT_PERSONALIZED_THREE_QUESTIONS_SERVICES_USED_VIEWED,
        answered: PH_EVENT_PERSONALIZED_THREE_QUESTIONS_SERVICES_USED_ANSWERED,
        skipped: PH_EVENT_PERSONALIZED_THREE_QUESTIONS_SERVICES_USED_SKIPPED,
      },
      3: {
        viewed: PH_EVENT_PERSONALIZED_THREE_QUESTIONS_SECURITY_CONCERNS_VIEWED,
        answered:
          PH_EVENT_PERSONALIZED_THREE_QUESTIONS_SECURITY_CONCERNS_ANSWERED,
        skipped:
          PH_EVENT_PERSONALIZED_THREE_QUESTIONS_SECURITY_CONCERNS_SKIPPED,
      },
    };
    return events[questionId] || {};
  } else if (isOneQuestionFlow.value) {
    return {
      viewed: PH_EVENT_PERSONALIZED_ONE_QUESTION_PRIVACY_THREAT_VIEWED,
      answered: PH_EVENT_PERSONALIZED_ONE_QUESTION_PRIVACY_THREAT_ANSWERED,
      skipped: PH_EVENT_PERSONALIZED_ONE_QUESTION_PRIVACY_THREAT_SKIPPED,
    };
  }
  return {};
};

const formatAnswer = (question, answer) => {
  if (!question || !answer) return null;

  if (question.type === "multi-select" && Array.isArray(answer)) {
    return answer.map((value) => {
      if (value.startsWith(OTHER_PREFIX)) {
        return value;
      }
      if (value === "Other") {
        return value;
      }
      const option = question.options.find((opt) => opt.value === value);
      return option ? option.label : value;
    });
  }

  if (question.type === "single-select") {
    if (answer.startsWith(OTHER_PREFIX)) {
      return answer;
    }
    if (answer === "Other") {
      return answer;
    }
    const option = question.options.find((opt) => opt.value === answer);
    return option ? option.label : answer;
  }

  return answer;
};

onMounted(() => {
  const questionId = props.currentQuestion?.id;
  const events = getEventNames(questionId);
  if (events.viewed) {
    posthogCapture(events.viewed);
  }
});

const selectOption = (value) => {
  emit("select-option", value);
};

const handleOtherTextInput = (event) => {
  emit("select-option", event.target.value, true);
};

const handleOtherFocus = () => {
  emit("select-option", "other", false);
};

const nextStep = () => {
  const questionId = props.currentQuestion?.id;
  const events = getEventNames(questionId);
  if (events.answered) {
    const answer = props.answers[questionId];
    const formattedAnswer = formatAnswer(props.currentQuestion, answer);
    posthogCapture(events.answered, {
      answer: formattedAnswer,
    });
  }
  emit("next-step");
};

const skipStep = () => {
  const questionId = props.currentQuestion?.id;
  const events = getEventNames(questionId);
  if (events.skipped) {
    posthogCapture(events.skipped);
  }
  emit("skip-step");
};

const hasAnswer = () => {
  const questionId = props.currentQuestion.id;
  const answer = props.answers[questionId];

  if (props.currentQuestion.type === "single-select") {
    if (answer === "Other") {
      return false;
    }
    if (answer && answer.startsWith(OTHER_PREFIX)) {
      return answer.length > 7;
    }
    return !!answer;
  }

  if (props.currentQuestion.type === "multi-select" && Array.isArray(answer)) {
    if (
      answer.includes("Other") &&
      !answer.some((opt) => opt.startsWith(OTHER_PREFIX))
    ) {
      return false;
    }
    if (answer.some((opt) => opt.startsWith(OTHER_PREFIX))) {
      return answer.some(
        (opt) => opt.startsWith(OTHER_PREFIX) && opt.length > 7
      );
    }
    return answer.length > 0;
  }

  return !!(answer && (Array.isArray(answer) ? answer.length > 0 : true));
};

const regularOptions = computed(() => {
  return props.currentQuestion.options.filter((option) => !option.isTextInput);
});

const textInputOptions = computed(() => {
  return props.currentQuestion.options.filter((option) => option.isTextInput);
});
</script>

<template>
  <section class="questionnaire-questions">
    <BaseText
      :id="`question-${currentQuestion.id}`"
      as="h2"
      variant="headline-2-semibold"
      class="questionnaire-questions__title"
    >
      {{ currentQuestion.question }}
    </BaseText>

    <div
      v-if="currentQuestion.type === 'single-select'"
      class="questionnaire-questions__options"
      role="radiogroup"
      :aria-labelledby="`question-${currentQuestion.id}`"
    >
      <label
        v-for="option in regularOptions"
        :key="option.value"
        class="questionnaire-questions__option"
        :class="{
          'questionnaire-questions__option--selected':
            answers[currentQuestion.id] === option.value,
        }"
      >
        <input
          type="radio"
          :name="`question-${currentQuestion.id}`"
          :value="option.value"
          :checked="answers[currentQuestion.id] === option.value"
          class="questionnaire-questions__radio-input"
          @change="selectOption(option.value)"
        />
        <BaseIcon
          :name="
            answers[currentQuestion.id] === option.value
              ? 'circle-radio-filled'
              : 'circle-radio'
          "
          class="questionnaire-questions__option-icon"
          aria-hidden="true"
        />
        <BaseText
          variant="body-2-semibold"
          class="questionnaire-questions__option-label"
        >
          {{ option.label }}
        </BaseText>
      </label>

      <div
        v-for="option in textInputOptions"
        :key="option.value"
        class="questionnaire-questions__other-input-container"
      >
        <label class="questionnaire-questions__other-label">
          <input
            type="radio"
            :name="`question-${currentQuestion.id}`"
            value="other"
            :checked="
              answers[currentQuestion.id] === 'Other' ||
              (answers[currentQuestion.id] &&
                answers[currentQuestion.id].startsWith('Other:'))
            "
            class="questionnaire-questions__radio-input"
            @change="selectOption('other')"
          />
          <input
            :value="
              answers[currentQuestion.id] &&
              answers[currentQuestion.id].startsWith('Other:')
                ? answers[currentQuestion.id].substring(7)
                : ''
            "
            :placeholder="option.label"
            class="questionnaire-questions__other-input"
            @input="handleOtherTextInput"
            @focus="handleOtherFocus"
          />
        </label>
      </div>
    </div>

    <div
      v-else-if="currentQuestion.type === 'multi-select'"
      class="questionnaire-questions__options"
      role="group"
      :aria-labelledby="`question-${currentQuestion.id}`"
    >
      <label
        v-for="option in regularOptions"
        :key="option.value"
        class="questionnaire-questions__option questionnaire-questions__option--multi"
        :class="{
          'questionnaire-questions__option--selected': answers[
            currentQuestion.id
          ]?.includes(option.value),
        }"
      >
        <input
          type="checkbox"
          :name="`question-${currentQuestion.id}-${option.value}`"
          :value="option.value"
          :checked="answers[currentQuestion.id]?.includes(option.value)"
          class="questionnaire-questions__checkbox-input"
          @change="selectOption(option.value)"
        />
        <BaseIcon
          :name="
            answers[currentQuestion.id]?.includes(option.value)
              ? 'check-square-filled'
              : 'square-radio'
          "
          class="questionnaire-questions__option-icon"
          aria-hidden="true"
        />
        <BaseText
          variant="body-2-semibold"
          class="questionnaire-questions__option-label"
        >
          {{ option.label }}
        </BaseText>
      </label>

      <div
        v-for="option in textInputOptions"
        :key="option.value"
        class="questionnaire-questions__other-input-container"
      >
        <label class="questionnaire-questions__other-label">
          <input
            type="checkbox"
            :name="`question-${currentQuestion.id}-other`"
            value="other"
            :checked="
              answers[currentQuestion.id]?.includes('Other') ||
              answers[currentQuestion.id]?.some((opt) =>
                opt.startsWith('Other:')
              )
            "
            class="questionnaire-questions__checkbox-input"
            @change="selectOption('other')"
          />
          <input
            :value="
              answers[currentQuestion.id]
                ?.find((opt) => opt.startsWith('Other:'))
                ?.substring(7) || ''
            "
            :placeholder="option.label"
            class="questionnaire-questions__other-input"
            @input="handleOtherTextInput"
            @focus="handleOtherFocus"
          />
        </label>
      </div>
    </div>

    <DataDeleteSticky v-if="isMobile">
      <div class="questionnaire-questions__actions">
        <div>
          <BaseButton
            v-if="currentStep > 1 && !isRequired"
            variant="outline"
            size="lg"
            class="questionnaire-questions__skip"
            :disabled="isCompleting"
            @click="skipStep"
          >
            Skip
          </BaseButton>
        </div>

        <BaseButton
          variant="primary"
          size="lg"
          :disabled="!hasAnswer() || isCompleting"
          class="questionnaire-questions__next"
          @click="nextStep"
        >
          Next
        </BaseButton>
      </div>
    </DataDeleteSticky>
    <div
      v-else-if="!isMobile"
      class="questionnaire-questions__actions"
    >
      <div>
        <BaseButton
          v-if="currentStep > 1 && !isRequired"
          variant="outline"
          size="lg"
          class="questionnaire-questions__skip"
          :disabled="isCompleting"
          @click="skipStep"
        >
          Skip
        </BaseButton>
      </div>

      <BaseButton
        variant="primary"
        size="lg"
        :disabled="!hasAnswer() || isCompleting"
        class="questionnaire-questions__next"
        @click="nextStep"
      >
        Next
      </BaseButton>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.questionnaire-questions {
  text-align: center;
  min-height: 200px;
  margin-top: 8px;
  width: 100%;

  &__title {
    margin-bottom: 1.5rem;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    font-size: 1.5rem;

    @media all and (min-width: $screen-sm) {
      font-size: 2rem;
      margin-bottom: 2rem;
      padding-inline: 2.5rem;
    }
  }

  &__options {
    display: flex;
    margin: 0 auto;
    flex-direction: column;
    gap: 12px;
    justify-content: center;

    @media screen and (min-width: $screen-sm) {
      padding: 0 54.5px;
    }
  }

  &__option {
    display: flex;
    align-items: center;
    gap: 14px;
    background: rgba($white, 0.05);
    border: 1px solid $color-base-black-10-dark;
    border-radius: 16px;
    padding: 20px;
    color: $color-primary-100;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 500;
    backdrop-filter: blur(26px);
    box-shadow: 0 5px 20px 0 rgba($black, 0.05);

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &-icon {
      color: $color-base-black-20-dark;
      font-size: 24px;
    }

    &-label {
      font-size: 15px;
      text-align: left;
    }

    &--selected {
      border-color: $color-spam-protection;
      background: $color-spam-protection-15;

      .questionnaire-questions__option {
        &-icon {
          color: $color-primary-100;

          @media screen and (min-width: $screen-sm) {
            color: $color-spam-protection;
          }
        }
      }
    }

    @media screen and (min-width: $screen-sm) {
      &__option {
        padding: 14px 20px;
      }

      &:not(&--selected) {
        &:hover {
          background: rgba($white, 0.1);
        }
      }
    }
  }

  &__radio-input,
  &__checkbox-input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  &__other-label {
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
  }

  &__actions {
    display: flex;
    justify-content: space-between;
    width: 100%;

    @media screen and (min-width: $screen-sm) {
      padding: 0 54.5px;
      margin-top: 24px;
    }
  }

  &__skip {
    background: transparent;
    color: $color-primary-100;
    padding: 10px 4px;
    width: 74px;
    cursor: pointer;

    @media screen and (min-width: $screen-sm) {
      width: 96px;
      padding: 10px 16px;
    }
  }

  &__next {
    transition: opacity 0.2s ease;

    &.base-button--secondary {
      :deep(.base-button__icon) {
        background: $color-base-white-10-light;
      }
    }

    &:disabled {
      cursor: not-allowed;
    }

    @media screen and (min-width: $screen-sm) {
      width: 238px;
    }
  }

  &__text-input {
    display: flex;
    margin: 0 auto;
    flex-direction: column;
    justify-content: center;
    width: 100%;

    @media screen and (min-width: $screen-sm) {
      padding: 0 54.5px;
    }
  }

  &__textarea {
    background: rgba($white, 0.05);
    border: 1px solid $color-base-black-10-dark;
    border-radius: 16px;
    padding: 20px;
    color: $color-primary-100;
    font-size: 15px;
    font-family: inherit;
    resize: vertical;
    min-height: 120px;
    backdrop-filter: blur(26px);
    box-shadow: 0 5px 20px 0 rgba($black, 0.05);
    transition: all 0.2s ease;

    &::placeholder {
      color: $color-primary-30-light;
      opacity: 0.8;
    }

    &:focus {
      outline: none;
      border-color: $color-spam-protection;
      background: $color-spam-protection-15;
    }

    &:hover {
      background: rgba($white, 0.1);
    }

    @media screen and (min-width: $screen-sm) {
      padding: 14px 20px;
    }
  }

  &__other-input-container {
    width: 100%;
  }

  &__other-input {
    background: rgba($white, 0.05);
    border: 1px solid $color-base-black-10-dark;
    border-radius: 16px;
    padding: 20px;
    color: $color-primary-100;
    font-size: 15px;
    font-family: inherit;
    font-weight: 600;
    line-height: 1.4;
    backdrop-filter: blur(26px);
    box-shadow: 0 5px 20px 0 rgba($black, 0.05);
    transition: all 0.2s ease;
    width: 100%;
    height: 66px;

    &::placeholder {
      color: $color-primary-30-light;
      opacity: 0.8;
      font-weight: 600;
    }

    &:focus,
    &:not(:placeholder-shown) {
      outline: none;
      border-color: $color-spam-protection;
      background: $color-spam-protection-15;
    }

    &:hover {
      background: rgba($white, 0.1);
    }
  }
}
</style>
