<script setup lang="ts">
import useFundingSource from "@/composables/Wallet/useFundingSource";
import ModalTemplate from "@/features/ModalTemplate.vue";
import BaseText from "@/library/BaseText.vue";
import Button from "@/features/Button.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import store from "@/store";
import { ref, onMounted, onUnmounted, computed } from "vue";
import FundingSourceListItem from "@/features/Wallet/FundingSource/FundingSourceListItem.vue";
import type { FundingSource } from "@/types/Wallet/funding-source";
import VCBaseAlert from "@/features/VirtualCards/base/VCBaseAlert.vue";

const emit = defineEmits(["close"]);
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
});

const {
  fundingSources,
  hasExpiredFundingSources,
  refetchFundingSources,
  setDefault,
  openDeleteModal,
  openAddModal,
  openEditModal,
  openUpdateModal,
} = useFundingSource();
const loadingFundingSourceId = ref<string>();

// This is used to refetch funding sources when the provider is closed and the user returns to the dashboard
onMounted(() => {
  window.addEventListener("focus", refetchFundingSources);
});

onUnmounted(() => {
  window.removeEventListener("focus", refetchFundingSources);
});

const _title = computed(() => {
  return props.title || "Manage your funding sources";
});

const _description = computed(() => {
  return props.description || "";
});

const closeModal = () => {
  emit("close");
  store.dispatch("closeModal");
};

const handleSetDefault = (fundingSource: FundingSource) => {
  if (loadingFundingSourceId.value || fundingSource.primary) return;

  loadingFundingSourceId.value = fundingSource.id;
  setDefault(fundingSource.id).finally(() => {
    loadingFundingSourceId.value = undefined;
  });
};

const handleRemove = (fundingSource: FundingSource) => {
  if (loadingFundingSourceId.value) return;

  loadingFundingSourceId.value = fundingSource.id;
  openDeleteModal(fundingSource.id).finally(() => {
    loadingFundingSourceId.value = undefined;
  });
};
</script>

<template>
  <ModalTemplate
    :show="true"
    @close="closeModal"
  >
    <template #body>
      <header class="fs-list-modal__header">
        <div class="fs-list-modal__header-icon-container">
          <BaseIcon
            class="fs-list-modal__header-icon"
            name="money-filled"
          />
        </div>
        <BaseText
          as="h3"
          variant="headline-3-bold"
          class="fs-list-modal__header-title"
        >
          {{ _title }}
        </BaseText>
        <BaseText
          as="p"
          variant="body-small-medium"
          class="fs-list-modal__header-description"
        >
          {{ _description }}
        </BaseText>
      </header>
      <VCBaseAlert
        v-if="hasExpiredFundingSources"
        color="danger"
        :icon-with-background="true"
        icon="info-filled"
        description="You have expired funding sources. Click on the menu to update."
      />
      <TransitionGroup
        name="funding-source-list"
        tag="div"
        class="fs-list-modal__list"
      >
        <div
          v-for="fundingSource in fundingSources"
          :key="fundingSource.id"
          class="funding-source-list-item-wrapper"
        >
          <FundingSourceListItem
            :funding-source="fundingSource"
            :show-default-badge="(fundingSources || []).length > 1"
            :show-actions="true"
            :is-loading="fundingSource.id === loadingFundingSourceId"
            :is-select-mode="false"
            :is-selected="fundingSource.primary"
            :is-disabled="
              !!loadingFundingSourceId &&
              fundingSource.id !== loadingFundingSourceId
            "
            @set-default="handleSetDefault(fundingSource)"
            @remove="handleRemove(fundingSource)"
            @settings="openEditModal(fundingSource.id)"
            @update="openUpdateModal(fundingSource.id)"
          />
        </div>
      </TransitionGroup>
      <div class="fs-list-modal__footer">
        <Button
          class="fs-list-modal__footer-btn-add"
          type="secondary"
          @click="openAddModal"
        >
          Link New Funding Source
        </Button>
        <Button
          class="fs-list-modal__footer-btn-close"
          type="primary"
          @click="closeModal"
        >
          Close
        </Button>
      </div>
    </template>
  </ModalTemplate>
</template>

<style scoped lang="scss">
/* stylelint-disable */
$component-name: "fs-list-modal";

.#{$component-name} {
  &__header {
    display: flex;
    flex-direction: column;

    &-icon {
      font-size: 56px;
      font-weight: 200;

      &-container {
        width: 70px;
        height: 70px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background-color: var(--color-primary-10);
      }
    }

    &-title {
      margin-top: 24px;
    }

    &-description {
      margin-top: 8px;
      margin-bottom: 8px;
      color: var(--color-primary-70);
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 16px;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 24px;

    &-btn-close {
      width: 79px;
    }
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
