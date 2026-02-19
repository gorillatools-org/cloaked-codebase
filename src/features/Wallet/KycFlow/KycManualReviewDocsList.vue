<script setup lang="ts">
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import { posthogCapture } from "@/scripts/posthog.js";
import { SUPPORT_EMAIL } from "@/scripts/constants";
import { tools } from "@/scripts/tools";
import { ref } from "vue";
import { useDevice } from "@/composables/useDevice";

defineProps<{
  documents: string[][];
}>();

const { isMobile } = useDevice();
const isEmailCopied = ref(false);

const emailDocuments = () => {
  posthogCapture(
    "pay_wallet_kyc_flow_manual_review_send_documents_button_tapped"
  );

  const subject = encodeURIComponent("Identity Verification for Cloaked Pay");
  const body = encodeURIComponent(
    `Hi,

    I am reaching out to begin the identity verification process for Cloaked Pay.

    Thank you.`
  );

  window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
};

const copyEmail = async () => {
  if (isEmailCopied.value) return;

  try {
    await tools.copyToClipboard(SUPPORT_EMAIL);
    isEmailCopied.value = true;
    posthogCapture(
      "pay_wallet_kyc_flow_manual_review_copy_email_button_tapped"
    );

    setTimeout(() => {
      isEmailCopied.value = false;
    }, 2000);
  } catch (error) {
    console.error("Failed to copy email:", error);
  }
};
</script>

<template>
  <div class="kyc-manual-review-docs">
    <header class="kyc-manual-review-docs__header">
      <BaseText
        class="kyc-manual-review-docs__title"
        as="h1"
        :variant="isMobile ? 'headline-3-medium' : 'headline-2-semibold'"
      >
        We need a few more details to verify your identity
      </BaseText>
      <p class="kyc-manual-review-docs__description">
        Please reach out to
        <u><a href="mailto:support@cloaked.com">support@cloaked.com</a></u>
        and be prepared to present one document from each section listed below.
        <strong>
          Do not send any documents until you've received a response from our
          team.
        </strong>
      </p>
    </header>

    <div class="kyc-manual-review-docs__documents-list">
      <div
        v-for="(documentList, index) in documents"
        :key="index"
        class="kyc-manual-review-docs__documents-item"
      >
        <template
          v-for="(document, docIndex) in documentList"
          :key="docIndex"
        >
          <div class="kyc-manual-review-docs__documents-item-doc">
            <div class="kyc-manual-review-docs__documents-item-doc-num">
              <BaseText
                class="kyc-manual-review-docs__documents-item-doc-num-text"
                as="p"
                variant="caption-semibold"
              >
                {{ docIndex + 1 }}
              </BaseText>
            </div>
            <BaseText
              class="kyc-manual-review-docs__documents-item-doc-name"
              as="p"
              variant="body-3-semibold"
            >
              {{ document }}
            </BaseText>
          </div>
          <BaseText
            v-if="docIndex < documentList.length - 1"
            class="kyc-manual-review-docs__documents-item-or"
            as="p"
            variant="caption-semibold"
          >
            OR
          </BaseText>
        </template>
      </div>
    </div>

    <footer class="kyc-manual-review-docs__footer">
      <BaseText
        class="kyc-manual-review-docs__footer-text"
        as="p"
        :variant="isMobile ? 'body-small-medium' : 'body-3-regular'"
      >
        Once you submit, we'll review them and get back to you within two
        business days.
        <br />
        If you do not have the required documents, contact Cloaked Support for
        further assistance.
      </BaseText>
      <div class="kyc-manual-review-docs__footer-actions-container">
        <BaseButton
          variant="primary"
          icon="email"
          class="kyc-manual-review-docs__footer-button"
          @click="emailDocuments"
        >
          Contact Support
        </BaseButton>
        <div
          v-if="$slots['extra-actions']"
          class="kyc-manual-review-docs__footer-extra-actions"
        >
          <slot name="extra-actions" />
        </div>
      </div>
      <div
        class="kyc-manual-review-docs__copy-section"
        @click="copyEmail"
      >
        <BaseText
          variant="body-3-semibold"
          class="kyc-manual-review-docs__copy-email"
          :title="isEmailCopied ? 'Copied!' : 'Copy support email'"
        >
          {{ SUPPORT_EMAIL }}
        </BaseText>
        <BaseIcon
          :name="isEmailCopied ? 'check-square' : 'copy'"
          class="kyc-manual-review-docs__copy-icon"
        />
      </div>
    </footer>
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
$component-name: "kyc-manual-review-docs";

.#{$component-name} {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  padding-bottom: 24px;

  @media screen and (min-width: $screen-md) {
    padding-bottom: 0;
    height: 100%;
  }

  &__header {
    max-width: 900px;
  }

  &__title {
    text-align: center;
  }

  &__description {
    text-align: center;
    margin-top: 12px;
    font-size: 14px;
    font-weight: 400;
    line-height: 140%;

    @media screen and (min-width: $screen-lg) {
      font-size: 18px;
      line-height: normal;
    }
  }

  &__documents {
    &-list {
      margin-top: 36px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 20px;
      width: 100%;
      max-width: 900px;

      @media screen and (min-width: $screen-lg) {
        flex-direction: row;
      }
    }

    &-item {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 12px;
      padding: 24px;
      border-radius: 30px;
      border: 1px solid $color-status-yield;
      background: rgba(250, 165, 66, 0.15);
      max-width: 100%;

      @media screen and (min-width: $screen-lg) {
        max-width: 50%;
      }

      &-or {
        align-self: stretch;
        display: flex;
        align-items: center;
        color: $color-primary-90;

        &::before,
        &::after {
          content: "";
          flex: 1;
          height: 1px;
          background: rgba(136, 136, 136, 0.45);
          margin: 0 12px;
        }
      }

      &-doc {
        display: flex;
        gap: 10px;

        &-num {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          min-width: 20px;
          min-height: 20px;
          border-radius: 50%;
          border: 1px solid $color-primary-100;

          &-text {
            line-height: 0;
          }
        }
      }
    }
  }

  &__footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 24px;
    margin-top: 36px;
    width: 100%;

    &-text {
      text-align: center;
      font-weight: 400;
    }

    &-actions-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      width: 100%;
    }

    &-button {
      width: 100%;
      max-width: 305px;
    }

    &-extra-actions {
      width: 100%;
      max-width: 305px;
    }
  }

  &__copy {
    &-section {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;

      &:hover {
        color: $color-primary-90;
      }
    }
  }
}
</style>
