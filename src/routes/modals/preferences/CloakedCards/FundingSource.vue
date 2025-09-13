<script setup>
import { computed, onMounted, onUnmounted } from "vue";
import store from "@/store";
import ValueDisplay from "@/features/ui/value-display.vue";
import BaseText from "@/library/BaseText.vue";
import useFundingSource from "@/composables/Wallet/useFundingSource.ts";
import FundingSourceListItem from "@/features/Wallet/FundingSource/FundingSourceListItem.vue";

const {
  fundingSources,
  refetchFundingSources,
  openAddModal,
  openDeleteModal,
  openEditModal,
} = useFundingSource();

const kycValidated = computed(() => {
  return store.state.authentication?.user?.cloaked_card_kyc_configured;
});

onMounted(() => {
  window.addEventListener("focus", refetchFundingSources);
});

onUnmounted(() => {
  window.removeEventListener("focus", refetchFundingSources);
});
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
              :is-selected="fundingSource.primary"
              @remove="openDeleteModal(fundingSource.id)"
              @edit="openEditModal(fundingSource.id)"
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
