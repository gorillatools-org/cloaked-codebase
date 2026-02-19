<script setup lang="ts">
import { ref, computed } from "vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import { posthogCapture } from "@/scripts/posthog.js";
import {
  PH_EVENT_USER_VIEWED_INTERMEDIATE_QUESTION_SCREEN,
  PH_EVENT_USER_SKIPPED_INTERMEDIATE_QUESTION_SCREEN,
  PH_EVENT_USER_CLICKED_NEXT_ON_INTERMEDIATE_QUESTION_SCREEN,
} from "@/scripts/posthogEvents";
import { onMounted } from "vue";
import PageCheckoutReviews from "@/features/subscribe/PageCheckoutReviews.vue";
import PageCheckoutHeader from "@/features/subscribe/PageCheckoutHeader.vue";

type Option = {
  id: string;
  title: string;
  description: string;
};

const emit = defineEmits(["skip", "next"]);

const selectedOptionId = ref<string | null>(null);
const surveyOptions: Option[] = [
  {
    id: "spam-protection",
    title: "Stop spam calls & Text",
    description: "Screen calls and block junk messages",
  },
  {
    id: "data-removal",
    title: "Remove my data from the web",
    description: "Delete your info from 27 broker sites",
  },
  {
    id: "identity-theft",
    title: "Protect against identity theft",
    description: "$1M insurance + 24/7 monitoring",
  },
];

const hasSelection = computed(() => selectedOptionId.value !== null);

onMounted(() => {
  posthogCapture(PH_EVENT_USER_VIEWED_INTERMEDIATE_QUESTION_SCREEN);
});

const toggleOption = (optionId: string) => {
  if (selectedOptionId.value === optionId) {
    selectedOptionId.value = null;
    return;
  }

  selectedOptionId.value = optionId;
};

const handleSkip = () => {
  posthogCapture(PH_EVENT_USER_SKIPPED_INTERMEDIATE_QUESTION_SCREEN);
  emit("skip");
};

const handleNext = () => {
  if (!selectedOptionId.value) {
    return;
  }

  posthogCapture(PH_EVENT_USER_CLICKED_NEXT_ON_INTERMEDIATE_QUESTION_SCREEN, {
    answer: selectedOptionId.value,
  });
  emit("next");
};
</script>

<template>
  <div class="data-delete-protection-plans-survey">
    <PageCheckoutReviews class="data-delete-protection-plans-survey__reviews" />
    <PageCheckoutHeader
      class="data-delete-protection-plans-survey__checkout-header"
    >
      <RouterLink
        to="/auth/login"
        class="data-delete-protection-plans-survey__login"
      >
        <BaseText variant="body-3-semibold">Already Subscribed?</BaseText>
      </RouterLink>
    </PageCheckoutHeader>
    <div class="data-delete-protection-plans-survey__content">
      <div class="data-delete-protection-plans-survey__header">
        <BaseText
          as="h1"
          variant="headline-3-bold"
          class="data-delete-protection-plans-survey__title"
        >
          What matters most to you?
        </BaseText>
        <BaseText
          variant="body-3-regular"
          as="p"
          class="data-delete-protection-plans-survey__subtitle"
        >
          Everything is included. Choose what we should prioritize for you
        </BaseText>
      </div>

      <div class="data-delete-protection-plans-survey__options">
        <button
          v-for="option in surveyOptions"
          :key="option.id"
          class="data-delete-protection-plans-survey__option"
          :class="{
            'data-delete-protection-plans-survey__option--selected':
              selectedOptionId === option.id,
          }"
          @click="toggleOption(option.id)"
        >
          <div
            class="data-delete-protection-plans-survey__option-check"
            :class="{
              'data-delete-protection-plans-survey__option-check--checked':
                selectedOptionId === option.id,
            }"
            @click.stop="toggleOption(option.id)"
          >
            <Transition name="check-icon">
              <BaseIcon
                v-if="selectedOptionId === option.id"
                name="check"
                class="data-delete-protection-plans-survey__option-check-icon"
              />
            </Transition>
          </div>
          <div class="data-delete-protection-plans-survey__option-content">
            <BaseText
              variant="body-2-semibold"
              class="data-delete-protection-plans-survey__option-title"
            >
              {{ option.title }}
            </BaseText>
            <BaseText
              variant="body-3-regular"
              class="data-delete-protection-plans-survey__option-description"
            >
              {{ option.description }}
            </BaseText>
          </div>
        </button>
      </div>

      <div class="data-delete-protection-plans-survey__actions">
        <BaseButton
          variant="outline"
          size="md"
          class="data-delete-protection-plans-survey__skip-button"
          @click="handleSkip"
        >
          Skip
        </BaseButton>
        <BaseButton
          variant="primary"
          size="md"
          icon="arrow-right"
          class="data-delete-protection-plans-survey__next-button"
          :disabled="!hasSelection"
          @click="handleNext"
        >
          Next
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.data-delete-protection-plans-survey {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 0;

  &__reviews {
    display: none;
    animation: slide-down-fade-in 0.9s cubic-bezier(0.16, 1, 0.3, 1);

    @media all and (min-width: $screen-xl) {
      display: flex;
      width: 100%;
    }
  }

  &__checkout-header {
    background-color: transparent;
    padding: 43px 16px 0;
    animation: slide-down-fade-in 0.9s cubic-bezier(0.16, 1, 0.3, 1);

    @media all and (min-width: $screen-xl) {
      padding: 28px 16px;
      display: flex;
      width: 100%;
    }
  }

  &__content {
    width: 100%;
    display: flex;
    flex-direction: column;
    flex: 1;
    margin: 52px auto 0;
    padding: 0 16px;
    gap: 24px;
    min-height: 0;

    @media screen and (min-width: $screen-sm) {
      max-width: 540px;
    }
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: 4px;
    text-align: center;
    animation: slide-down-fade-in 0.9s cubic-bezier(0.16, 1, 0.3, 1);
  }

  &__title {
    color: $color-white;

    @media screen and (min-width: $screen-sm) {
      font-size: 32px;
      font-weight: 600;
      line-height: 120%;
    }
  }

  &__subtitle {
    color: rgba($color-white, 0.7);
    font-weight: 400;

    @media screen and (min-width: $screen-sm) {
      font-size: 18px;
      line-height: 120%;
    }
  }

  &__options {
    display: flex;
    flex-direction: column;
    gap: 8px;
    animation: slide-up-fade-in 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
  }

  &__option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 16px;
    border: 1px solid rgba($color-white, 0.1);
    background: rgba($color-white, 0.05);
    backdrop-filter: blur(13px);
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    width: 100%;

    &:hover:not(&--selected) {
      background: rgba($color-white, 0.08);
    }

    &--selected {
      background: $color-spam-protection-15;
      border-color: $color-spam-protection;
      box-shadow: 0 5px 20px 0 rgb(0 0 0 / 5%);

      &:hover {
        opacity: 0.98;
      }
    }

    &-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    &-title {
      color: $color-white;
    }

    &-description {
      color: rgba($color-white, 0.7);
    }

    &-check {
      flex-shrink: 0;
      margin-right: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border: 1px solid rgba($color-white, 0.3);
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.2s ease;

      &--checked {
        background: $color-white;
        color: #000;
      }

      &-icon {
        color: #000 !important;
        font-size: 16px;
      }
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 24px 0;
    margin-top: auto;
    flex-shrink: 0;
    animation: fade-in 0.9s cubic-bezier(0.4, 0, 0.2, 1) 0.7s both;

    @media screen and (min-width: $screen-sm) {
      margin-top: unset;
    }
  }

  &__skip-button {
    width: 96px;

    :deep(.base-button__text) {
      color: $color-white;
    }
  }

  &__next-button {
    flex: 1;
    max-width: 120px;

    :deep(.base-button__text) {
      color: $color-base-white-100;
    }

    :deep(.base-button__icon) {
      background-color: $color-base-white-10;
    }

    @media screen and (min-width: $screen-sm) {
      max-width: 238px;
    }
  }
}

@keyframes slide-down-fade-in {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-up-fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
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

.check-icon-enter-active {
  animation: check-icon-fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.check-icon-leave-active {
  animation: check-icon-fade-out 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes check-icon-fade-in {
  from {
    opacity: 0;
    transform: scale(0.2);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes check-icon-fade-out {
  from {
    opacity: 1;
    transform: scale(1);
  }

  to {
    opacity: 0;
    transform: scale(0.2);
  }
}
</style>
