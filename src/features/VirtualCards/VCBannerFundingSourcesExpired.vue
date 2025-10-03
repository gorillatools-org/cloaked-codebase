<script setup lang="ts">
import VCBaseAlert from "@/features/VirtualCards/base/VCBaseAlert.vue";
import BaseButton from "@/library/BaseButton.vue";
import useFundingSource from "@/composables/Wallet/useFundingSource";

const { openUpdateModal, openListModal, expiredFundingSources } =
  useFundingSource();

const handleUpdateFundingSource = () => {
  if (expiredFundingSources.value?.length === 1) {
    openUpdateModal(expiredFundingSources.value[0].id);
  } else {
    openListModal();
  }
};
</script>

<template>
  <VCBaseAlert
    class="vc-banner-funding-sources-expired"
    color="danger"
    size="lg"
    icon="info-filled"
    icon-with-background
    title="Expired Funding Source"
    description="One or more of your funding sources have expired. Update or add a new method to continue using your cards."
  >
    <template #extra>
      <div class="vc-banner-funding-sources-expired__actions">
        <BaseButton
          class="vc-banner-funding-sources-expired__button"
          background-color="danger"
          variant="primary"
          size="md"
          icon="new-tab"
          @click="handleUpdateFundingSource"
        >
          Update Funding Source
        </BaseButton>
      </div>
    </template>
  </VCBaseAlert>
</template>

<style lang="scss" scoped>
.vc-banner-funding-sources-expired {
  &__actions {
    display: flex;
    justify-content: flex-end;
    padding-left: 12px;
  }

  &__button {
    width: 222px;
  }
}
</style>
