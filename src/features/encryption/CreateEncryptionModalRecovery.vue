<script setup>
import AppModalContent from "@/features/ui/AppModalContent.vue";
import AppModalTitle from "@/features/ui/AppModalTitle.vue";
import AppModalParagraph from "@/features/ui/AppModalParagraph.vue";
import RecoveryKeyCard from "@/features/subscribe/RecoveryKeyCard.vue";
import { ref } from "vue";
import { createPDF } from "@/scripts/tools";
import BaseButton from "@/library/BaseButton.vue";
import { SUPPORT_EMAIL } from "@/scripts/constants";
import BaseText from "@/library/BaseText.vue";

const props = defineProps({
  account: {
    type: Object,
    required: true,
  },
});

defineEmits(["done"]);

const hasDownloadedRecoveryKey = ref(false);

const onDownload = () => {
  hasDownloadedRecoveryKey.value = true;
  createPDF(props.account.recovery, null, props.account.username);
};
</script>

<template>
  <AppModalContent width="500px">
    <AppModalTitle size="lg">New Cloaked login info</AppModalTitle>
    <AppModalParagraph>
      Make sure you save this unique key to a secure location (e.g. private
      photo folder, air-gapped device, encrypted hard drive). You cannot regain
      access to Cloaked if you ever lose your password and recovery key.
    </AppModalParagraph>
    <RecoveryKeyCard
      :had-downloaded-key="hasDownloadedRecoveryKey"
      :username="account.username"
      :password="account.password"
      :recovery-key="account.recovery"
      class="create-encryption-recovery__card"
    />
    <div class="flex-row">
      <BaseButton
        variant="primary"
        size="lg"
        class="recovery-key-card__cta"
        :disabled="!account.recovery"
        icon="download"
        @click="onDownload"
      >
        Download recovery key
      </BaseButton>
      <BaseButton
        variant="primary"
        size="lg"
        icon="arrow-right"
        class="recovery-key-card__cta"
        @click="$emit('done')"
      >
        Continue
      </BaseButton>
    </div>
    <footer class="page-checkout-success-recovery__footer">
      <BaseText variant="body-small-medium">{{ "For help, email " }}</BaseText>
      <BaseText
        as="a"
        variant="body-small-medium"
        :href="`mailto:${SUPPORT_EMAIL}`"
        target="_blank"
        class="page-checkout-success-recovery__support"
      >
        {{ SUPPORT_EMAIL }}
      </BaseText>
    </footer>
  </AppModalContent>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.create-encryption-recovery__card {
  padding: 32px;
  margin: 24px;
}

.flex-row {
  display: flex;
  flex-direction: row;
  gap: 8px;
  justify-content: center;
  align-items: center;
  padding: 0 25px;

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
  &__footer {
    grid-column: 1/3;
    text-align: center;
    margin-top: 16px;
  }

  &__support {
    text-decoration: underline;
    padding-bottom: 16px;

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
