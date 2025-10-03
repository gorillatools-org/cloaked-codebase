<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import store from "@/store";
import ValueDisplay from "@/features/ui/value-display.vue";
import BaseText from "@/library/BaseText.vue";
import useFundingSource from "@/composables/Wallet/useFundingSource.ts";
import FundingSourceListItem from "@/features/Wallet/FundingSource/FundingSourceListItem.vue";
import type { FundingSource } from "@/types/Wallet/funding-source";

const {
  fundingSources,
  refetchFundingSources,
  openAddModal,
  openDeleteModal,
  openEditModal,
  openUpdateModal,
  setDefault,
} = useFundingSource();
const loadingFundingSourceId = ref<string>();

const kycValidated = computed(() => {
  return store.state.authentication?.user?.cloaked_card_kyc_configured;
});

onMounted(() => {
  window.addEventListener("focus", refetchFundingSources);
});

onUnmounted(() => {
  window.removeEventListener("focus", refetchFundingSources);
});

const handleRemove = (fundingSource: FundingSource) => {
  if (loadingFundingSourceId.value) return;

  loadingFundingSourceId.value = fundingSource.id;
  openDeleteModal(fundingSource.id).finally(() => {
    loadingFundingSourceId.value = undefined;
  });
};

const handleSetDefault = (fundingSource: FundingSource) => {
  if (loadingFundingSourceId.value || fundingSource.primary) return;

  loadingFundingSourceId.value = fundingSource.id;
  setDefault(fundingSource.id).finally(() => {
    loadingFundingSourceId.value = undefined;
  });
};
</script>

<template>
  <div
    v-if="kycValidated"
    class="cloaked-pay-settings-fs"
  >
    <header>
      <BaseText
        as="h1"
        variant="headline-3-bold"
        class="cloaked-pay-settings-fs__title"
      >
        Funding sources
      </BaseText>
      <BaseText
        as="p"
        variant="body-2-semibold"
        class="cloaked-pay-settings-fs__description"
      >
        Add at least one payment method to begin using Cloaked Pay. Your
        information is secure and encrypted.
      </BaseText>
    </header>

    <div class="cloaked-pay-settings-fs__content">
      <div
        v-if="fundingSources"
        class="cloaked-pay-settings-fs__cards"
      >
        <TransitionGroup
          name="funding-source-list"
          tag="div"
          class="cloaked-pay-settings-fs__cards-list"
        >
          <div
            v-for="fundingSource in fundingSources"
            :key="fundingSource.id"
            class="cloaked-pay-settings-fs__cards-list-item-wrapper"
          >
            <FundingSourceListItem
              :funding-source="fundingSource"
              :show-default-badge="(fundingSources || []).length > 1"
              :show-actions="true"
              :is-select-mode="false"
              :is-loading="fundingSource.id === loadingFundingSourceId"
              :is-disabled="
                !!loadingFundingSourceId &&
                fundingSource.id !== loadingFundingSourceId
              "
              @remove="handleRemove(fundingSource)"
              @settings="openEditModal(fundingSource.id)"
              @update="openUpdateModal(fundingSource.id)"
              @set-default="handleSetDefault(fundingSource)"
            />
          </div>
        </TransitionGroup>
      </div>

      <footer class="cloaked-pay-settings-fs__footer">
        <ValueDisplay
          label="Link new funding source"
          :value="''"
          name="card"
          arrow
          @click="openAddModal()"
        />
      </footer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$component-name: "cloaked-pay-settings-fs";

.#{$component-name} {
  padding-bottom: 80px;
  margin-top: 48px;

  &__title {
    color: $color-primary-100;
  }

  &__description {
    margin-top: 16px;
    color: $color-primary-70;
  }

  &__content {
    margin-top: 24px;
  }

  &__cards {
    width: 100%;

    &-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  }

  &__footer {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-top: 24px;
  }
}

.funding-source-list-item-wrapper {
  transition: all 0.2s ease;
}

// Transition styles for funding source list items
.funding-source-list-enter-active,
.funding-source-list-leave-active {
  transition: all 0.2s ease;
}

.funding-source-list-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.funding-source-list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.funding-source-list-move {
  position: relative;
  transition: all 0.2s ease;
}

.funding-source-list-leave-active {
  position: absolute;
  width: 100%;
}
</style>
