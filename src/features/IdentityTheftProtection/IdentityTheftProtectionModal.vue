<script setup>
import { ref } from "vue";
import ModalTemplate from "@/features/ModalTemplate.vue";
import IdentityTheftProtectionContent from "./IdentityTheftProtectionContent.vue";
import BaseSheet from "@/library/BaseSheet.vue";
import BaseText from "@/library/BaseText.vue";
import BaseMedallion from "@/library/BaseMedallion.vue";
import BaseProgressTag from "@/library/BaseProgressTag.vue";
import { useIdentityTheftProtection } from "@/composables/useIdentityTheftProtection";
import CardsServices from "@/api/actions/cards-services";

const { insuranceAmountFormattedMillion, termsLink, isSubscribedToCloakedPay } =
  useIdentityTheftProtection();

const isLoadingToken = ref(false);
const termsLinkRef = ref(null);

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

const handleViewTerms = async (event) => {
  // Only fetch token if subscribed to Cloaked Pay, or block if already loading
  if (!isSubscribedToCloakedPay.value || isLoadingToken.value) {
    return;
  }

  event.preventDefault();

  try {
    isLoadingToken.value = true;

    const tokenData = await CardsServices.getInsurancePolicyUserToken(5);

    if (tokenData?.user_token && tokenData?.app_key) {
      const url = new URL(termsLink.value);
      url.searchParams.set("user_access_token", tokenData.user_token);
      url.searchParams.set("app_key", tokenData.app_key);
      window.open(url.toString(), "_blank");
    } else {
      window.open(termsLink.value, "_blank");
    }
  } catch {
    window.open(termsLink.value, "_blank");
  } finally {
    isLoadingToken.value = false;
  }
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
          Thank you for being a subscriber of Cloaked. You now have
          {{ insuranceAmountFormattedMillion }} in comprehensive Identity Theft
          insurance coverage* with additional features.
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
            ref="termsLinkRef"
            class="identity-theft-protection-modal__terms-link"
            :class="{
              'identity-theft-protection-modal__terms-link--loading':
                isLoadingToken,
            }"
            :href="isSubscribedToCloakedPay ? 'javascript:;' : termsLink"
            :target="isSubscribedToCloakedPay ? undefined : '_blank'"
            @click="handleViewTerms"
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
      cursor: pointer;
      text-decoration: none;

      &--loading {
        opacity: 0.6;
        cursor: wait;
      }

      &:hover:not(&--loading) {
        opacity: 0.8;
      }
    }
  }
}
</style>
