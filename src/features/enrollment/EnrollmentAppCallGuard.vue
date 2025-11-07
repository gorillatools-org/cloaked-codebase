<script setup lang="ts">
import BaseText from "@/library/BaseText.vue";
import BaseSheet from "@/library/BaseSheet.vue";
import BaseButton from "@/library/BaseButton.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseMedallion from "@/library/BaseMedallion.vue";
import { computed, onMounted } from "vue";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag";
import { posthogCapture } from "@/scripts/posthog";

defineEmits(["download", "skip"]);

onMounted(() => {
  posthogCapture("user_viewed_download_app");
});

const { featureFlag } = usePostHogFeatureFlag("download-app-experiment");

const cta = computed(() => {
  if (featureFlag.value === "call-guard-1") {
    return "Download App";
  } else if (featureFlag.value === "call-guard-2") {
    return "Open App";
  } else if (featureFlag.value === "call-guard-3") {
    return "Protect My Number";
  } else if (featureFlag.value === "call-guard-4") {
    return "Get Call Guard";
  } else if (featureFlag.value === "call-guard-5") {
    return "Block Spam Now";
  } else if (featureFlag.value === "call-guard-6") {
    return "Stop Spam Calls";
  }

  return "Download App";
});
</script>

<template>
  <div class="enrollment-app-call-guard">
    <BaseMedallion
      icon="check"
      color="safe-zone-green"
      class="enrollment-app-call-guard__checkmark"
    />
    <BaseText
      variant="headline-2-semibold"
      as="h1"
      class="enrollment-app-call-guard__headline"
    >
      Your Data Removal is Underway ✓
    </BaseText>
    <BaseText
      variant="body-2-semibold"
      as="p"
      class="enrollment-app-call-guard__subheadline"
    >
      We're removing your info from 100+ brokers. Now let's protect your phone
      number from spam.
    </BaseText>
    <BaseSheet
      spacing-x="xl"
      spacing-y="xl"
      elevation="xl"
      class="enrollment-app-call-guard__spam"
    >
      <BaseText
        variant="headline-4-bold"
        as="h2"
      >
        Your Phone Number Gets Spam Calls
      </BaseText>
      <BaseText
        variant="body-3-semibold"
        as="p"
      >
        The average person gets 14+ spam calls per month.
      </BaseText>
    </BaseSheet>
    <BaseSheet
      class="enrollment-app-call-guard__download"
      spacing-x="xl"
      spacing-y="xl"
      elevation="xl"
    >
      <BaseText
        variant="headline-3-medium"
        as="h2"
        class="enrollment-app-call-guard__title"
      >
        Meet Call Guard
      </BaseText>
      <ol class="enrollment-app-call-guard__steps">
        <li
          v-for="(step, index) in [
            'Unknown number calls',
            'Call Guard answers for you',
            'Only real calls come through',
          ]"
          :key="index"
          class="enrollment-app-call-guard__steps-item"
        >
          <div class="enrollment-app-call-guard__steps-icon">
            <BaseText variant="body-3-semibold">{{ index + 1 }}.</BaseText>
          </div>
          <BaseText variant="body-2-semibold">
            {{ step }}
          </BaseText>
        </li>
      </ol>
      <ul class="enrollment-app-call-guard__features">
        <li
          v-for="(feature, index) in [
            'Automatic call screening',
            'Transcripts of screened calls',
            '2-minute setup',
          ]"
          :key="index"
          class="enrollment-app-call-guard__features-item"
        >
          <BaseIcon
            name="check"
            class="enrollment-app-call-guard__features-icon"
          />
          <BaseText variant="body-3-regular">{{ feature }}</BaseText>
        </li>
      </ul>
      <div class="enrollment-app-call-guard__footer">
        <BaseButton
          size="lg"
          full-width
          @click="$emit('download')"
        >
          {{ cta }}
        </BaseButton>
        <BaseButton
          variant="text"
          class="enrollment-app-call-guard__skip"
          @click="$emit('skip')"
        >
          Maybe Later
        </BaseButton>
      </div>
    </BaseSheet>
  </div>
</template>

<style lang="scss" scoped>
:global(
  .enrollment-v2-enroll:has(.enrollment-app-call-guard)
    .enrollment-v2-enroll__header
) {
  display: none;
}

:global(
  .enrollment-v2-enroll:has(.enrollment-app-call-guard)
    .enrollment-v2-enroll__content
) {
  padding-top: 0;
  padding-bottom: 0;
}

.enrollment-app-call-guard {
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  &__checkmark {
    margin-bottom: 16px;
  }

  &__headline {
    text-align: center;
    margin-bottom: 12px;
  }

  &__subheadline {
    margin-top: 8px;
    color: $color-primary-70;
    text-align: center;
    max-width: 440px;
  }

  &__spam {
    color: $color-alert;
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 24px;
    max-width: 440px;
    width: 100%;
    text-align: center;
  }

  &__download {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 1;
    margin: 24px auto;
    max-width: 440px;
    padding-bottom: 12px;
    width: 100%;
  }

  &__title,
  &__text {
    text-align: start;
    width: 100%;
  }

  &__text {
    margin-top: 12px;
    color: $color-primary-70;
  }

  &__steps {
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 8px;
    margin-top: 24px;
    width: 100%;

    &-item {
      display: flex;
      align-items: center;
      gap: 12px;
      color: $color-primary-90;
    }

    &-icon {
      width: 32px;
      height: 32px;
      background-color: $color-base-black-5;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 100px;
      color: $color-primary-70;
      flex-shrink: 0;
      padding-left: 3px;

      @at-root .theme-dark & {
        background-color: $color-base-black-10;
      }
    }
  }

  &__features {
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 8px;
    padding-top: 24px;
    margin-top: 24px;
    border-top: 1px solid $color-base-black-10;
    width: 100%;

    @at-root .theme-dark & {
      border-top: 1px solid $color-base-black-20;
    }

    &-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: $color-primary-70;
    }

    &-icon {
      font-size: 16px;
    }
  }

  &__footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    margin-top: 32px;
    width: 100%;
  }

  &__skip {
    color: $color-primary-50;
  }
}
</style>
