<script setup>
import { ref, computed } from "vue";
import store from "@/store";
import Button from "@/features/Button.vue";
import CardsServices from "@/api/actions/cards-services";
import { useToast } from "@/composables/useToast.js";
import ModalTemplate from "@/features/ModalTemplate.vue";
import FundingSourceListItem from "@/features/Wallet/FundingSource/FundingSourceListItem.vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";

const toast = useToast();

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  currentSource: {
    type: Object,
    default: () => {},
  },
  sources: {
    type: Array,
    default: () => [],
  },
  currentCardID: {
    type: Number,
    default: null,
  },
});

function closeModal() {
  store.dispatch("closeModal");
}

const currentFundingSource = ref(props.currentSource.id);

const disabled = ref(true);

const isButtonDisabled = computed(() => {
  if (
    currentFundingSource.value === props.currentSource.id ||
    !currentFundingSource.value ||
    loading.value
  ) {
    return true;
  } else {
    return false;
  }
});

function selectSource(source) {
  currentFundingSource.value = source.id;
}

const selectedSource = computed(() => {
  return currentFundingSource.value;
});

function updateSource(source) {
  loading.value = true;
  disabled.value = true;
  CardsServices.patchUpdateCloakedCardDetails(props.currentCardID, {
    funding_source: source,
  })
    .then(() => {
      return CardsServices.getFundingSources();
    })
    .then(() => {
      loading.value = false;
      closeModal();
      store.commit("closeRightPanel");
    })
    .then(() => {
      return CardsServices.getCardList();
    })
    .catch((error) => {
      loading.value = false;
      disabled.value = false;
      toast.error(error.message);
    });
}

const loading = ref(false);
</script>

<template>
  <ModalTemplate
    :show="props.isVisible"
    @close="closeModal"
  >
    <template #body>
      <header class="fs-patch-modal__header">
        <div class="fs-patch-modal__header-icon-container">
          <BaseIcon
            class="fs-patch-modal__header-icon"
            name="money-filled"
          />
        </div>
        <BaseText
          as="h3"
          variant="headline-3-bold"
          class="fs-patch-modal__header-title"
        >
          Edit funding source
        </BaseText>
        <BaseText
          as="p"
          variant="body-3-regular"
          class="fs-patch-modal__header-subtitle"
        >
          You can switch this card's funding source to another of the same type
          (credit, debit, or bank account).
        </BaseText>
      </header>
      <div
        v-if="sources"
        class="fs-patch-modal__body"
      >
        <div
          v-for="source in sources"
          :key="source.id"
          class="fs-patch-modal__body-item"
        >
          <FundingSourceListItem
            :is-selected="source.id === selectedSource"
            :is-select-mode="true"
            :funding-source="source"
            :show-actions="false"
            @select="selectSource(source)"
          />
        </div>
      </div>
    </template>
    <template #footer>
      <Button
        type="secondary"
        @click="closeModal"
      >
        Cancel
      </Button>
      <Button
        :disabled="isButtonDisabled"
        :loading="loading"
        @click="updateSource(selectedSource)"
      >
        Save changes
      </Button>
    </template>
  </ModalTemplate>
</template>

<style lang="scss" scoped>
$component-name: "fs-patch-modal";

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

    &-subtitle {
      margin-top: 8px;
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
