<script setup lang="ts">
import FundingSourceCardFormModal from "./FundingSourceCardFormModal.vue";
import { computed, onMounted, watch, ref } from "vue";
import { useRoute } from "vue-router";
import BaseText from "@/library/BaseText.vue";
import VCBaseAlert from "@/features/VirtualCards/base/VCBaseAlert.vue";
import useFundingSource from "@/composables/Wallet/useFundingSource";
import store from "@/store";
import { formattedPrice } from "@/features/subscribe/composables/utils";
import { capitalizeFirstLetter } from "@/scripts/format";
import { useToast } from "@/composables/useToast";
import CardsServices from "@/api/actions/cards-services";
import type { CardFormSubmitPayload } from "@/features/modals/Wallet/FundingSourceCardFormModal.vue";
import { posthogCapture } from "@/scripts/posthog";

const emit = defineEmits(["close"]);

const {
  fundingSources,
  getLightningCheckAmount,
  expiredFundingSources,
  refetchFundingSources,
} = useFundingSource();
const lightningCheckAmount = ref<number | null>(null);
const route = useRoute();
const toast = useToast();
const isSaving = ref(false);

onMounted(() => {
  if (
    route.name !== "VirtualCardsWalletFundingSourceUpdate" ||
    !route.params.fsId
  ) {
    closeModal();
  }
});

const fundingSource = computed(() => {
  return fundingSources.value?.find(
    (fundingSource) => fundingSource.id === route.params.fsId
  );
});

const isLoadingLightningCheckAmount = computed(() => {
  return lightningCheckAmount.value === null;
});

const isFundingSourceExpired = computed(() => {
  return !!expiredFundingSources.value?.find(
    (fundingSource) => fundingSource.id === route.params.fsId
  );
});

const updateFundingSourceDescription = computed(() => {
  if (!fundingSource.value) {
    return "";
  }

  const brand = capitalizeFirstLetter(fundingSource.value?.card_brand || "");
  const lastFour = fundingSource.value?.pan_last_four || "";

  const nickname = fundingSource.value?.nickname
    ? `(${fundingSource.value.nickname})`
    : "";

  return `Update your ${brand} ${nickname} card ending in ****${lastFour}`
    .replace(/\s+/g, " ")
    .trim();
});

const _getLightningCheckAmount = () => {
  if (!fundingSource.value) {
    return;
  }

  lightningCheckAmount.value = null;
  return getLightningCheckAmount(fundingSource.value.id).then((response) => {
    lightningCheckAmount.value = response.lightning_check_amount;
  });
};

const updateFundingSource = (payload: CardFormSubmitPayload) => {
  isSaving.value = true;
  if (!fundingSource.value) return;

  CardsServices.updateFundingSource({
    ...payload,
    funding_source_id: fundingSource.value.id,
  })
    .then(() => {
      toast.success("Funding source updated");
      posthogCapture("pay_wallet_funding_source_update_modal_update_success");
      refetchFundingSources();
      closeModal();
    })
    .catch(() => {
      toast.error("Failed to update funding source");
      posthogCapture("pay_wallet_funding_source_update_modal_update_failed");
    })
    .finally(() => {
      isSaving.value = false;
    });
};

const closeModal = () => {
  emit("close");
  store.dispatch("closeModal");
};

watch(
  fundingSource,
  () => {
    if (fundingSource.value) {
      _getLightningCheckAmount();
      posthogCapture("pay_wallet_funding_source_update_modal_viewed", {
        funding_source_expired: isFundingSourceExpired.value,
      });
    }
  },
  { immediate: true }
);

watch(
  fundingSources,
  () => {
    // If the funding source is not found after funding sources are fetched, close the modal
    // We check for length because fundingSources are required to have at least one funding source
    if (!!fundingSources.value?.length && !fundingSource.value) {
      toast.error("Funding source not found");
      posthogCapture("pay_wallet_funding_source_update_modal_not_found");
      closeModal();
    }
  },
  { immediate: true }
);
</script>
<template>
  <FundingSourceCardFormModal
    class="fs-card-update-modal"
    :initial-card-name="fundingSource?.name_on_card"
    :is-submitting="isSaving"
    title="Update card information"
    :card-type="fundingSource?.type ?? 'credit_card'"
    @close="emit('close')"
    @submit="updateFundingSource"
  >
    <template #subheader>
      <div class="fs-card-update-modal__subheader">
        <VCBaseAlert
          v-if="isFundingSourceExpired"
          color="danger"
          icon="info-filled"
          :icon-with-background="true"
          title="Funding source expired"
          :description="updateFundingSourceDescription"
        />
        <BaseText
          v-else
          as="p"
          variant="body-small-semibold"
        >
          {{ updateFundingSourceDescription }}
        </BaseText>
      </div>
    </template>
    <template #footer-before-submit>
      <div
        v-if="isLoadingLightningCheckAmount || lightningCheckAmount"
        class="fs-card-update-modal__footer-before-submit"
      >
        <div
          v-if="isLoadingLightningCheckAmount"
          class="fs-card-update-modal__skeletons"
        >
          <div
            class="fs-card-update-modal__skeleton"
            style="width: 60%"
          ></div>
          <div
            class="fs-card-update-modal__skeleton"
            style="width: 40%"
          ></div>
        </div>
        <BaseText
          v-if="!isLoadingLightningCheckAmount && lightningCheckAmount"
          as="p"
          variant="caption-semibold"
          class="fs-card-update-modal__lightning-check-amount"
        >
          We will issue a
          <strong>{{ formattedPrice(lightningCheckAmount / 100) }}</strong>
          hold on the selected account to verify funds. This will be released
          automatically.
        </BaseText>
      </div>
    </template>
  </FundingSourceCardFormModal>
</template>

<style lang="scss" scoped>
.fs-card-update-modal {
  &__subheader {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 16px;
  }

  &__footer-before-submit {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-bottom: 16px;
  }

  &__skeletons {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 3px;
    margin-top: 2px;
  }

  &__skeleton {
    height: 13px;

    @at-root .theme-dark & {
      @include base-skeleton($color-primary-20, 0.3, #000, 0.5);
    }

    @at-root .theme-light & {
      @include base-skeleton($color-primary-20, 0.6);
    }
  }

  &__lightning-check-amount {
    font-weight: 400;
    color: $color-primary-50;
    text-align: center;
  }
}
</style>
