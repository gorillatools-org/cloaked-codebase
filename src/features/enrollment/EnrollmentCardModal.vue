<script setup>
import AppModal from "@/features/ui/AppModal.vue";
import BaseText from "@/library/BaseText.vue";
import BaseSheet from "@/library/BaseSheet.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseMedallion from "@/library/BaseMedallion.vue";
import BaseButton from "@/library/BaseButton.vue";
import AppModalContent from "@/features/ui/AppModalContent.vue";
import { useDisplay } from "@/composables/useDisplay.js";
import { WEBSITE_PRIVACY_POLICY_URL } from "@/scripts/constants.js";

const isOpen = defineModel({ type: Boolean });

const { isMobile } = useDisplay();

const onOpenPrivacyPolicy = () =>
  window.open(WEBSITE_PRIVACY_POLICY_URL, "_blank");

const props = defineProps({
  subheaderText: {
    type: String,
    default:
      "We protect your account and personal data with advanced security measures.",
  },
  headerText: {
    type: String,
    default: "Your security and privacy matter to us",
  },
});
</script>

<template>
  <AppModal
    :value="isOpen"
    @input="isOpen = $event"
  >
    <AppModalContent class="enrollment-card-modal">
      <button
        class="enrollment-card-modal__close"
        @click="isOpen = false"
      >
        <BaseIcon name="close" />
      </button>
      <BaseMedallion
        :size="isMobile ? 'md' : 'lg'"
        icon="shield-tick"
        class="enrollment-card-modal__medallion"
        color="spam-protection"
      />
      <BaseText
        :variant="isMobile ? 'headline-3-bold' : 'headline-2-semibold'"
        as="h2"
        class="enrollment-card-modal__title"
      >
        {{ props.headerText }}
      </BaseText>
      <BaseText
        variant="headline-6-medium"
        as="p"
        class="enrollment-card-modal__text"
      >
        {{ props.subheaderText }}
      </BaseText>
      <BaseSheet
        elevation="md"
        spacing-x="md"
        spacing-y="lg"
        class="enrollment-card-modal__features"
      >
        <ul class="enrollment-card-modal__list">
          <li class="enrollment-card-modal__list-item">
            <div class="enrollment-card-modal__list-icon">
              <BaseIcon name="shield-tick" />
            </div>
            <BaseText
              :variant="isMobile ? 'headline-6-bold' : 'headline-5-bold'"
              class="enrollment-card-modal__list-title"
            >
              Privacy Commitment
            </BaseText>
            <BaseText
              :variant="isMobile ? 'body-small-medium' : 'headline-6-medium'"
              class="enrollment-card-modal__list-description"
            >
              We request your details only to verify your identity and ensure
              your protection is activated effectively.
            </BaseText>
          </li>
          <li class="enrollment-card-modal__list-item">
            <div class="enrollment-card-modal__list-icon">
              <BaseIcon name="lock" />
            </div>
            <BaseText
              :variant="isMobile ? 'headline-6-bold' : 'headline-5-bold'"
              class="enrollment-card-modal__list-title"
            >
              Zero-Knowledge Encryption
            </BaseText>
            <BaseText
              :variant="isMobile ? 'body-small-medium' : 'headline-6-medium'"
              class="enrollment-card-modal__list-description"
            >
              Your data is secured with industry-standard encryption methods
              like TLS and AES-256.
            </BaseText>
          </li>
        </ul>
      </BaseSheet>
      <footer class="enrollment-card-modal__footer">
        <BaseButton
          variant="outline"
          class="enrollment-card-modal__cta"
          @click="onOpenPrivacyPolicy"
        >
          Read more in our Privacy Policy
        </BaseButton>
      </footer>
    </AppModalContent>
  </AppModal>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.enrollment-card-modal {
  padding: 24px;
  text-align: center;

  @media all and (min-width: $screen-lg) {
    padding: 24px 36px;
  }

  &__close {
    position: absolute;
    right: 16px;
    top: 16px;
    width: 28px;
    height: 28px;
    border-radius: 100px;
    border: none;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 19px;
    background-color: $color-base-white-5;
    color: $color-primary-100;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }

  &__medallion {
    margin: 0 auto;
  }

  &__title {
    margin-top: 8px;
  }

  &__text {
    margin-top: 12px;
  }

  &__features {
    margin-top: 24px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 16px;

    @media all and (min-width: $screen-lg) {
      gap: 32px;
    }

    &-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 6px;

      @media all and (min-width: $screen-lg) {
        display: grid;
        grid-template-columns: 64px 1fr;
        grid-template-areas: "icon title" "icon description";
        column-gap: 16px;
        row-gap: 4px;
        text-align: left;
      }
    }

    &-icon {
      grid-area: icon;
      font-size: 19px;
      justify-self: center;
      color: $color-safe-zone-green;
      background-color: $color-safe-zone-green-15;
      border-radius: 12px;
      width: 42px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;

      @media all and (min-width: $screen-lg) {
        align-self: start;
        width: 64px;
        height: 64px;
        font-size: 36px;
        border-radius: 16px;
      }
    }

    &-title {
      grid-area: title;
    }

    &-description {
      grid-area: description;
      color: $color-primary-50;
    }
  }

  &__footer {
    margin-top: 24px;
  }

  &__cta {
    margin: 0 auto;
    width: 80%;
  }
}
</style>
