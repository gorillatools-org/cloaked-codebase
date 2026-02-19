<script setup>
import PageCheckoutSuccess from "@/features/subscribe/PageCheckoutSuccess.vue";
import RecoveryKeyCard from "@/features/subscribe/RecoveryKeyCard.vue";
import { ref } from "vue";
import { createPDF } from "@/scripts/tools";
import BulkPlanCard from "@/features/subscribe/BulkPlanCard.vue";
import BaseButton from "@/library/BaseButton.vue";
import { SUPPORT_EMAIL } from "@/scripts/constants";
import BaseText from "@/library/BaseText.vue";
import { useDisplay } from "@/composables/useDisplay.js";

const hasDownloadedRecoveryKey = ref(false);

const emit = defineEmits(["continue"]);

const props = defineProps({
  account: {
    type: Object,
    required: true,
  },
});

const onDownload = () => {
  hasDownloadedRecoveryKey.value = true;
  createPDF(props.account.recovery, null, props.account.username);
};

const { isMobile } = useDisplay();
</script>

<template>
  <PageCheckoutSuccess class="page-checkout-success-recovery">
    <template #header>
      <BaseText
        as="h1"
        :variant="isMobile ? 'headline-2-semibold' : 'headline-1-medium'"
        class="page-checkout-success-recovery__title"
      >
        Save your Cloaked recovery key
      </BaseText>
      <BaseText
        as="p"
        variant="headline-6-medium"
        class="page-checkout-success-recovery__text"
      >
        Make sure you save this unique key to a secure location (e.g. private
        photo folder, air-gapped device, encrypted hard drive). You cannot
        regain access to Cloaked if you ever lose your password and recovery
        key.
      </BaseText>
    </template>
    <template #left-column>
      <RecoveryKeyCard
        :had-downloaded-key="hasDownloadedRecoveryKey"
        :username="account.username"
        :password="account.password"
        :recovery-key="account.recovery"
        class="page-checkout-success-recovery__card"
      />
    </template>
    <template #right-column>
      <BulkPlanCard
        never-center
        class="page-checkout-success-recovery__card"
      />
    </template>
    <template #footer>
      <div class="flex-row">
        <BaseButton
          variant="primary"
          size="lg"
          class="recovery-key-card__cta"
          :disabled="!account.recovery"
          icon="download"
          :full-width="isMobile"
          @click="onDownload"
        >
          Download recovery key
        </BaseButton>
        <BaseButton
          variant="primary"
          size="lg"
          icon="arrow-right"
          class="recovery-key-card__cta"
          :full-width="isMobile"
          @click="emit('continue')"
        >
          Continue
        </BaseButton>
      </div>
      <BaseText
        as="footer"
        variant="body-2-semibold"
        class="page-checkout-success-recovery__footer"
      >
        {{ "For help, email " }}
        <a
          :href="`mailto:${SUPPORT_EMAIL}`"
          target="_blank"
          class="page-checkout-success-recovery__support"
        >
          {{ SUPPORT_EMAIL }}
        </a>
      </BaseText>
    </template>
  </PageCheckoutSuccess>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.flex-row {
  display: flex;
  flex-direction: row;
  gap: 8px;
  justify-content: center;
  align-items: center;
  padding: 0 25px;
  opacity: 0;
  animation: appear-bottom-5 0.5s 0.15s forwards ease-out;

  .recovery-key-card__cta {
    &:first-of-type {
      min-width: 275px;
    }
  }

  @media (max-width: $screen-sm) {
    flex-direction: column;

    .recovery-key-card__cta {
      width: 100%;
    }
  }
}

.page-checkout-success-recovery {
  color: $color-primary-100;
  background-color: $color-base-white-100;
  padding: 0;

  @include cloaked-gradient-background;

  &__footer {
    grid-column: 1/3;
    text-align: center;
    margin-top: 16px;
  }

  &__support {
    text-decoration: underline;

    &:hover {
      opacity: 0.8;
    }
  }

  &__title {
    opacity: 0;
    animation: appear-bottom-5 0.5s forwards ease-out;
  }

  &__text {
    margin-top: 24px;
    opacity: 0;
    animation: appear-bottom-5 0.5s 0.05s forwards ease-out;
  }

  &__card {
    opacity: 0;
    height: 100%;
    animation: appear-bottom-5 0.5s 0.1s forwards ease-out;
  }

  :deep(.page-checkout-success__footer) {
    opacity: 0;
    animation: appear-bottom-5 0.5s 0.5s forwards ease-out;
  }
}
</style>
