<script setup>
import { computed } from "vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseMedallion from "@/library/BaseMedallion.vue";
import BaseButton from "@/library/BaseButton.vue";
import DataDeleteSticky from "@/features/data-delete/atoms/DataDeleteSticky.vue";
import { useDisplay } from "@/composables/useDisplay";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";
import { PH_FEATURE_FLAG_DOWNLOAD_APP_EXPERIMENT } from "@/scripts/posthogEvents";

const emit = defineEmits(["continue", "complete", "skip"]);
const { isMobile } = useDisplay();

const onContinue = () => {
  emit("continue");
};

const onSkip = () => {
  emit("skip");
};

const { featureFlag, hasLoadedFeatureFlag } = usePostHogFeatureFlag(
  PH_FEATURE_FLAG_DOWNLOAD_APP_EXPERIMENT
);

const isDiagnostic3Q = computed(
  () =>
    hasLoadedFeatureFlag.value &&
    featureFlag.value === "post-checkout-diagnostic-3q"
);
</script>

<template>
  <section
    v-if="hasLoadedFeatureFlag"
    class="questionnaire-intro"
    role="region"
    aria-labelledby="qi-title"
  >
    <div class="questionnaire-intro__hero">
      <BaseMedallion
        icon="shield-user-filled"
        color="spam-protection"
        size="lg"
        class="questionnaire-intro__medallion"
        aria-hidden="true"
      />

      <BaseText
        id="qi-title"
        as="h1"
        :variant="isMobile ? 'headline-2-semibold' : 'headline-1-medium'"
        class="questionnaire-intro__title"
      >
        Let's Build Your
        <br />
        Personalized Protection Plan
      </BaseText>

      <BaseText
        as="p"
        variant="body-2-semibold"
        class="questionnaire-intro__subtitle"
      >
        {{
          isDiagnostic3Q
            ? "Answer 3 quick questions so we can recommend the best way to protect your data"
            : "Answer 1 quick question so we can recommend the best way to protect your data"
        }}
      </BaseText>

      <BaseText
        as="p"
        variant="label-semibold"
        class="questionnaire-intro__caption"
      >
        {{
          isDiagnostic3Q
            ? "This will take less than 15 seconds"
            : "This will take less than 5 seconds"
        }}
      </BaseText>
    </div>

    <div
      class="questionnaire-intro__benefits"
      aria-label="What you get"
    >
      <div class="questionnaire-intro__card">
        <BaseText
          as="h2"
          variant="body-2-semibold"
          class="questionnaire-intro__card-title"
        >
          What you get
        </BaseText>
        <ul class="questionnaire-intro__list">
          <li class="questionnaire-intro__item">
            <BaseIcon
              name="check"
              class="questionnaire-intro__item-icon"
            />
            <BaseText
              as="span"
              variant="body-3-regular"
              class="questionnaire-intro__item-text"
            >
              Get features that match your data exposure risks
            </BaseText>
          </li>
          <li class="questionnaire-intro__item">
            <BaseIcon
              name="check"
              class="questionnaire-intro__item-icon"
            />
            <BaseText
              as="span"
              variant="body-3-regular"
              class="questionnaire-intro__item-text"
            >
              Start protecting what matters most
            </BaseText>
          </li>
        </ul>
      </div>
    </div>

    <div
      v-if="!isMobile"
      class="questionnaire-intro__actions"
    >
      <BaseButton
        variant="primary"
        size="lg"
        icon="arrow-right"
        class="questionnaire-intro__actions__plan"
        full-width
        @click="onContinue"
      >
        Build My Plan
      </BaseButton>
      <BaseText
        as="span"
        variant="body-2-semibold"
        class="questionnaire-intro__actions__skip"
        @click="onSkip"
      >
        Skip questions, let's finish enrollment
      </BaseText>
    </div>
    <DataDeleteSticky v-else>
      <div class="questionnaire-intro__actions">
        <BaseButton
          variant="primary"
          size="lg"
          icon="arrow-right"
          class="questionnaire-intro__actions__plan"
          full-width
          @click="onContinue"
        >
          Build My Plan
        </BaseButton>
        <BaseText
          as="span"
          variant="body-2-semibold"
          class="questionnaire-intro__actions__skip"
          @click="onSkip"
        >
          Skip questions, let's finish enrollment
        </BaseText>
      </div>
    </DataDeleteSticky>
  </section>
</template>

<style lang="scss" scoped>
.questionnaire-intro {
  position: relative;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 16px;

  &__hero {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  &__medallion {
    margin-top: 8px;
    margin-bottom: 4px;
  }

  &__title {
    margin: 0;
  }

  &__subtitle {
    opacity: 0.9;
    max-width: 335px;
    width: 100%;
    margin: 8px auto 0;
  }

  &__caption {
    text-transform: uppercase;
    color: $color-brand-5-100-light;
    margin-top: 4px;
  }

  &__benefits {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 8px 0 0;
  }

  &__card {
    width: 100%;
    max-width: 335px;
    background: $color-base-black-5-dark;
    border-radius: 24px;
    padding: 20px;
    border: 1px solid $color-base-black-10-dark;
    box-shadow: 0 10px 24px 0 $color-base-white-15-dark;

    &-title {
      color: $color-primary-100;
      margin-bottom: 8px;
      text-align: left;
    }
  }

  &__list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 10px;
  }

  &__item {
    display: grid;
    grid-template-columns: 20px 1fr;
    align-items: start;
    gap: 10px;

    &-icon {
      color: $color-primary-100;
      margin-top: 2px;
    }

    &-text {
      color: $color-primary-30-light;
      text-align: left;
    }
  }

  &__actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    margin-top: 24px;
    width: 100%;

    &__plan {
      max-width: 335px;
      margin-top: 2rem;

      @media screen and (min-width: $screen-lg) {
        margin-top: auto;
      }
    }

    &__skip {
      text-decoration: underline;
      cursor: pointer;
    }
  }
}
</style>
