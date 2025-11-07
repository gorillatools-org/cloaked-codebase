<script setup lang="ts">
import { ref, computed } from "vue";
import store from "@/store";
import Button from "@/features/Button.vue";
import ModalTemplate from "@/features/ModalTemplate.vue";
import FundingSourceListItem from "@/features/Wallet/FundingSource/FundingSourceListItem.vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import type { FundingSource } from "@/types/Wallet/funding-source";
import useFundingSource from "@/composables/Wallet/useFundingSource";
import { safe_html } from "@/scripts/sanitize";

export type FundingSourceSelectPayload = {
  fundingSource: FundingSource;
  isCurrentFundingSource: boolean;
};

type Props = {
  title: string;
  description?: string;
  extraDescription?: string;
  saveButtonText?: string;
  currentFundingSource?: FundingSource; // It's optional in case we don't have a current funding source
  fundingSources?: FundingSource[];
  filterBySameType?: boolean;
  isSaving?: boolean;
  isLoadingExtraDescription?: boolean;
  closeOnSelect?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  description: undefined,
  extraDescription: undefined,
  saveButtonText: "Save changes",
  currentFundingSource: undefined,
  fundingSources: undefined,
  filterBySameType: false,
  isSaving: false,
  isLoadingExtraDescription: false,
  closeOnSelect: false,
});

const emit = defineEmits<{
  (e: "save", fundingSource: FundingSource): void;
  (e: "select", payload: FundingSourceSelectPayload): void;
  (e: "close"): void;
}>();

const selectedFundingSource = ref<FundingSource | undefined>(
  props.currentFundingSource
);
const { fundingSources: allFundingSources } = useFundingSource();

const sanitizedDescription = computed(() => {
  return props.description ? safe_html(props.description) : "";
});

const sanitizedExtraDescription = computed(() => {
  return props.extraDescription ? safe_html(props.extraDescription) : "";
});

const fundingSourceList = computed(() => {
  const fundingSources = props.fundingSources ?? allFundingSources.value ?? [];
  if (props.filterBySameType && props.currentFundingSource?.type) {
    return fundingSources.filter(
      (source) => source.type === props.currentFundingSource?.type
    );
  }

  return fundingSources;
});

const isSaveBtnDisabled = computed(() => {
  if (
    props.isSaving ||
    props.isLoadingExtraDescription ||
    !selectedFundingSource.value
  )
    return true;

  // Current selected funding source is the same as the one we're editing
  if (
    props.currentFundingSource?.id &&
    selectedFundingSource.value?.id === props.currentFundingSource?.id
  )
    return true;

  return false;
});

const save = () => {
  if (selectedFundingSource.value) {
    emit("save", selectedFundingSource.value);
  }
};

const selectSource = (source: FundingSource) => {
  selectedFundingSource.value = source;
  emit("select", {
    fundingSource: source,
    isCurrentFundingSource: source.id === props.currentFundingSource?.id,
  });

  if (props.closeOnSelect) {
    closeModal();
  }
};

const closeModal = () => {
  emit("close");
  store.dispatch("closeModal");
};
</script>

<template>
  <ModalTemplate
    :show="true"
    @close="closeModal"
  >
    <template #body>
      <header class="fs-select-modal__header">
        <div class="fs-select-modal__header-icon-container">
          <BaseIcon
            class="fs-select-modal__header-icon"
            name="money-filled"
          />
        </div>
        <BaseText
          as="h3"
          variant="headline-3-bold"
          class="fs-select-modal__header-title"
        >
          {{ props.title }}
        </BaseText>
        <!-- eslint-disable vue/no-v-html -->
        <!-- eslint-disable vue/no-v-text-v-html-on-component -->
        <BaseText
          as="p"
          variant="body-3-regular"
          class="fs-select-modal__header-subtitle"
          v-html="sanitizedDescription"
        />
        <!-- eslint-enable vue/no-v-text-v-html-on-component -->
        <!-- eslint-enable vue/no-v-html -->
      </header>
      <div
        v-if="fundingSourceList"
        class="fs-select-modal__body"
      >
        <div
          v-for="source in fundingSourceList"
          :key="source.id"
          class="fs-select-modal__body-item"
        >
          <FundingSourceListItem
            :is-selected="source.id === selectedFundingSource?.id"
            :is-select-mode="true"
            :funding-source="source"
            :show-actions="false"
            :is-loading="isSaving && source.id === selectedFundingSource?.id"
            :is-disabled="isSaving && source.id !== selectedFundingSource?.id"
            @select="selectSource(source)"
          />
        </div>
      </div>

      <div
        v-if="isLoadingExtraDescription || extraDescription"
        class="fs-select-modal__header-extra-description"
      >
        <div
          v-if="isLoadingExtraDescription"
          class="fs-select-modal__header-extra-description-skeletons"
        >
          <div
            class="fs-select-modal__header-extra-description-skeleton"
            style="width: 60%"
          ></div>
          <div
            class="fs-select-modal__header-extra-description-skeleton"
            style="width: 40%"
          ></div>
        </div>

        <!-- eslint-disable vue/no-v-html -->
        <!-- eslint-disable vue/no-v-text-v-html-on-component -->
        <BaseText
          v-else-if="!isLoadingExtraDescription && sanitizedExtraDescription"
          as="p"
          variant="caption-semibold"
          class="fs-select-modal__header-extra-description-text"
          v-html="sanitizedExtraDescription"
        />
        <!-- eslint-enable vue/no-v-text-v-html-on-component -->
        <!-- eslint-enable vue/no-v-html -->
      </div>
    </template>
    <template #footer>
      <template v-if="!closeOnSelect">
        <Button
          type="secondary"
          @click="closeModal"
        >
          Cancel
        </Button>
        <Button
          :disabled="isSaveBtnDisabled"
          :loading="isSaving"
          @click="save"
        >
          {{ props.saveButtonText }}
        </Button>
      </template>
    </template>
  </ModalTemplate>
</template>

<style lang="scss" scoped>
.fs-select-modal {
  &__header {
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

    &-subtitle {
      margin-top: 8px;
    }

    &-extra-description {
      width: 100%;
      display: flex;
      margin-top: 16px;

      &-text {
        font-weight: 400;
        color: $color-primary-50;
        text-align: center;
      }

      &-skeletons {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        gap: 3px;
        margin-top: 2px;
      }

      &-skeleton {
        height: 13px;

        @at-root .theme-dark & {
          @include base-skeleton($color-primary-20, 0.3, #000, 0.5);
        }

        @at-root .theme-light & {
          @include base-skeleton($color-primary-20, 0.6);
        }
      }
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 24px;
  }
}
</style>
