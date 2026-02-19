<script setup>
import AtomTopBannerButton from "@/library/AtomTopBannerButton.vue";
import AtomTopBanner from "@/library/AtomTopBanner.vue";
import { usePlansModal } from "@/features/subscribe/composables/usePlansModal.ts";
import InlineSvg from "../InlineSvg.vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import { PH_EVENT_USER_DISMISSED_BLACK_FRIDAY_2025_PROMOTION } from "@/scripts/posthogEvents";
import { posthogCapture } from "@/scripts/posthog.js";

defineProps({
  modelValue: Boolean,
});

const emit = defineEmits(["update:modelValue"]);

const { openPlansModal } = usePlansModal();

function dismissPromotionBanner() {
  emit("update:modelValue", true);
  localStorage.setItem("blackFridayBannerDismissed", true);
  posthogCapture(PH_EVENT_USER_DISMISSED_BLACK_FRIDAY_2025_PROMOTION);
}
</script>

<template>
  <div>
    <AtomTopBanner
      class="black-friday-banner"
      variant="info"
    >
      <div class="black-friday-banner__container">
        <div class="black-friday-banner__main">
          <InlineSvg
            class="black-friday-banner__icon"
            name="star-check"
          />
          <div class="black-friday-banner__content">
            <div class="black-friday-banner__title">
              <BaseText variant="headline-4-bold">
                Limited-Time Cyber Monday Offer — Get 50% Off Annual Plans!
              </BaseText>
            </div>
            <div class="black-friday-banner__description">
              <BaseText variant="headline-6-bold">
                Save up to $60/year when you upgrade today.
              </BaseText>
            </div>
          </div>
        </div>
        <div class="black-friday-banner__actions">
          <BaseButton
            icon="chevron-right"
            @click="openPlansModal"
          >
            Upgrade Now
          </BaseButton>
          <AtomTopBannerButton @click="dismissPromotionBanner">
            I'll pass this time
          </AtomTopBannerButton>
        </div>
      </div>
    </AtomTopBanner>
  </div>
</template>

<style scoped lang="scss">
.black-friday-banner {
  padding: 18px 16px;
  background: linear-gradient(
    225.31deg,
    #8dbbff -14.01%,
    #ff4949 61.58%,
    #ff7a00 116.66%
  );

  @media screen and (min-width: $screen-md) {
    padding: 20px 24px;
  }

  :deep(.atom-top-banner__content) {
    max-width: 100%;
  }

  &__container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 100%;

    @media screen and (min-width: $screen-md) {
      flex-direction: row;
      align-items: center;
    }
  }

  &__main {
    display: flex;
    flex: 1;
    gap: 12px;

    @media screen and (min-width: $screen-md) {
      gap: 10px;
    }
  }

  &__icon {
    width: 40px;
    height: 40px;
    flex-shrink: 0;

    @media screen and (min-width: $screen-md) {
      width: 49px;
      height: 49px;
    }
  }

  &__content {
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;

    @media screen and (min-width: $screen-md) {
      gap: 3px;
    }
  }

  &__title {
    :deep(.base-text--headline-4-bold) {
      font-size: 18px;
    }

    @media screen and (min-width: $screen-md) {
      :deep(.base-text--headline-4-bold) {
        font-size: 20px;
      }
    }
  }

  &__description {
    :deep(.base-text--headline-6-bold) {
      font-size: 13px;
      line-height: 1.4;
    }

    @media screen and (min-width: $screen-md) {
      :deep(.base-text--headline-6-bold) {
        font-size: 16px;
      }
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-left: 50px;

    @media screen and (min-width: $screen-md) {
      margin-left: 0;
      gap: 16px;
    }

    :deep(.atom-top-banner-button) {
      font-size: 13px;
      font-weight: 600;
    }

    :deep(.base-button--primary) {
      display: flex;
      padding-inline: 11px;
      min-height: 40px;
      gap: 0;
    }

    :deep(.base-button__text) {
      font-size: 13px;
    }

    :deep(.base-button__icon) {
      display: none;
    }

    @media screen and (min-width: $screen-md) {
      :deep(.base-button__text) {
        font-size: 14px;
      }

      :deep(.base-button--primary) {
        padding-inline: 14px;
        min-height: 46px;
        gap: 0;
      }

      :deep(.base-button__icon) {
        display: flex;
        background-color: transparent;
        width: auto;
      }
    }
  }
}
</style>
