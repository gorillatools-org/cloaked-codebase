<script setup>
import ModalTemplate from "@/features/ModalTemplate.vue";
import IdentityTheftProtectionContent from "./IdentityTheftProtectionContent.vue";
import BaseSheet from "@/library/BaseSheet.vue";
import BaseText from "@/library/BaseText.vue";
import BaseMedallion from "@/library/BaseMedallion.vue";
import BaseProgressTag from "@/library/BaseProgressTag.vue";
import { WEBSITE_ID_THEFT_URL } from "@/scripts/constants";

defineProps({
  show: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const handleClose = () => {
  emit("close");
};
</script>

<template>
  <ModalTemplate
    size="medium"
    :show="show"
    class="identity-theft-protection-modal"
    @close="handleClose"
  >
    <template #body>
      <div class="identity-theft-protection-modal__title">
        <BaseMedallion
          class="identity-theft-protection-modal__medallion"
          icon="shield-tick"
        />

        <BaseProgressTag>Active</BaseProgressTag>

        <BaseText
          variant="headline-2-semibold"
          as="h2"
          class="identity-theft-protection-modal__title-text"
        >
          Identity Theft Protection
        </BaseText>
      </div>

      <BaseSheet class="identity-theft-protection-modal__content">
        <BaseText
          variant="body-3-semibold"
          as="div"
        >
          Thank you for being a subscriber of Cloaked. You now have $1 million
          dollars in comprehensive Identity Theft insurance coverage* with
          additional features.
        </BaseText>
      </BaseSheet>

      <IdentityTheftProtectionContent large-padding />

      <BaseSheet
        variant="secondary"
        class="identity-theft-protection-modal__terms"
      >
        <BaseText
          variant="caption-semibold"
          as="div"
        >
          *Cloaked Identity Theft Insurance only provided during a current, paid
          subscription offering. Coverage is limited to U.S. individuals, and
          may not be available in all jurisdictions.
          <a
            class="identity-theft-protection-modal__terms-link"
            :href="WEBSITE_ID_THEFT_URL"
            target="_blank"
          >
            View terms and conditions.
          </a>
        </BaseText>
      </BaseSheet>
    </template>
  </ModalTemplate>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.identity-theft-protection-modal {
  &__title {
    margin-bottom: 16px;
    display: flex;
    gap: 8px;
    flex-direction: row;
    justify-content: space-between;
    flex-wrap: wrap;
    align-items: center;

    &-text {
      margin-top: 8px;
      width: 100%;
    }
  }

  &__content {
    margin-bottom: 16px;
  }

  &__terms {
    margin-top: 16px;

    &-link {
      color: $color-primary-100;
      border-bottom: 1px solid $color-primary-100;
    }
  }
}
</style>
