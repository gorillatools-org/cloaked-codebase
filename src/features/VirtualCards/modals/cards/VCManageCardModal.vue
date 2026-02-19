<script setup lang="ts">
import ModalTemplate from "@/features/ModalTemplate.vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import VCBaseCopyText from "@/features/VirtualCards/base/VCBaseCopyText.vue";
import store from "@/store";
import useVirtualCard from "../../composables/useVirtualCard";
import VCBaseCardAction from "../../base/card/VCBaseCardAction.vue";
import VCBaseCardToggle from "../../base/card/VCBaseCardToggle.vue";
import VCBaseCardDropdownSelect from "../../base/card/VCBaseCardDropdownSelect.vue";
import { computed, ref, watch } from "vue";
import type { DropdownSelectOption } from "@/features/VirtualCards/base/VCBaseDropdownSelect.vue";
import { capitalizeFirstLetter } from "@/scripts/format";
import { CARD_LABEL_BY_PROVIDER_TYPE } from "@/scripts/constants";
import useVirtualCardModals from "../../composables/useVirtualCardModals";
import useVirtualCardLimit from "../../composables/useVirtualCardLimit";
import type { VirtualCardExpiresAt } from "@/types/Wallet/virtual-card";
import useVirtualCardManagement from "../../composables/useVirtualCardManagement";
import moment from "moment";
import VCMerchantDropdown, {
  type MerchantDropdownModel,
} from "@/features/VirtualCards/VCMerchantDropdown.vue";
import VCCloseModalButton from "../VCCloseModalButton.vue";
import { EXPIRATION_DESCRIPTIONS } from "../../constants/virtual-card-constants";

type Props = {
  cardId: string;
};

const emit = defineEmits(["close"]);
const props = defineProps<Props>();

const cardBorderConfig = {
  borderRadius: 30,
};

const {
  card,
  cardFundingSource,
  isLocked,
  isMerchantLocked: _isMerchantLocked,
  canToggleLockState,
  expiresAtDetailed,
  cardIdentity,
} = useVirtualCard(props.cardId);

const {
  lockCard,
  unlockCard,
  showCancelConfirmationModal,
  isCancelingCard,
  lockMerchant,
  unlockMerchant,
  updateSelfDestructDate,
  updateMerchant,
} = useVirtualCardManagement(props.cardId);

const { formattedLimit, periodDescription, openSpendingLimitModal } =
  useVirtualCardLimit(props.cardId);

const { openFundingSourcePatchModal } = useVirtualCardModals(props.cardId);

const isMerchantLocked = ref(false);
const isCardLocked = ref(false);
const deactivateOption = ref<VirtualCardExpiresAt>("custom");
const selectedMerchant = ref<MerchantDropdownModel>("");

const deactivateOptions = computed<
  DropdownSelectOption<VirtualCardExpiresAt>[]
>(() => {
  return Object.keys(EXPIRATION_DESCRIPTIONS).map((key: string) => {
    const value = key as VirtualCardExpiresAt;
    return {
      label: EXPIRATION_DESCRIPTIONS[value],
      value: value,
      visible: value !== "custom",
    };
  });
});

const fundingSourceDescription = computed(() => {
  const fundingSourceProvider = cardFundingSource.value?.provider;
  const fundingSourceType = fundingSourceProvider
    ? CARD_LABEL_BY_PROVIDER_TYPE[fundingSourceProvider]
    : "Unknown";

  return `${capitalizeFirstLetter(cardFundingSource.value?.card_brand || "Unknown")} **** ${cardFundingSource.value?.pan_last_four || "Unknown"} • ${fundingSourceType}`;
});

const cardLimitDescription = computed(() => {
  return `${formattedLimit.value} • ${capitalizeFirstLetter(periodDescription.value)}`;
});

const expiresAtDescription = computed(() => {
  if (!expiresAtDetailed.value.date) {
    return "";
  }

  const date = moment(expiresAtDetailed.value.date);
  return `Expires on ${date.format("MMMM DD, YYYY")}`;
});

const closeModal = () => {
  emit("close");
  store.dispatch("closeModal");
};

const handleCardLockChange = () => {
  if (isCardLocked.value) {
    lockCard();
  } else {
    unlockCard();
  }
};

const handleMerchantLockChange = () => {
  if (isMerchantLocked.value) {
    lockMerchant();
  } else {
    unlockMerchant();
  }
};

const handleDeactivateCardChange = () => {
  updateSelfDestructDate(deactivateOption.value);
};

const handleCancelCard = () => {
  if (isCancelingCard.value) return;

  showCancelConfirmationModal(() => {
    setTimeout(() => {
      closeModal();
    }, 100); // UX purposes
  });
};

const handleMerchantChange = () => {
  updateMerchant(selectedMerchant.value);
};

watch(
  card,
  () => {
    isMerchantLocked.value = _isMerchantLocked.value ?? false;
    isCardLocked.value = isLocked.value ?? false;
    deactivateOption.value = expiresAtDetailed.value.type;
    selectedMerchant.value = {
      name: card.value?.identity_name ?? "",
      logo_url: card.value?.identity_logo_url ?? "",
      cloak_brand_color: cardIdentity.value?.cloak_brand_color ?? "",
    };
  },
  { immediate: true, deep: true }
);
</script>

<template>
  <ModalTemplate
    :show="true"
    :prevent-close="isCancelingCard"
    :prevent-escape-on-input-focus="true"
    width="520px"
    without-header-padding
    without-body-padding
    class="vc-manage-card-modal"
    :class="{ 'vc-manage-card-modal--canceling': isCancelingCard }"
    @close="closeModal"
  >
    <template #header>
      <header class="vc-manage-card-modal__header">
        <BaseText
          as="h3"
          variant="headline-3-bold"
          class="vc-manage-card-modal__header-title"
        >
          Manage card
        </BaseText>
        <VCCloseModalButton
          class="vc-manage-card-modal__header-close-button"
          @close="closeModal"
        />
      </header>
    </template>
    <template #body>
      <div class="vc-manage-card-modal__body">
        <div class="vc-manage-card-modal__cards-list">
          <div class="select-merchant-dropdown">
            <VCMerchantDropdown
              v-model="selectedMerchant"
              :show-edit-action="true"
              :cloak-brand-color="cardIdentity?.cloak_brand_color"
              @edited="handleMerchantChange"
            />
          </div>
          <div class="vc-manage-card-modal__limit-card-container">
            <VCBaseCardAction
              :border="cardBorderConfig"
              title="Card Limit"
              :description="cardLimitDescription"
              icon="money"
              @click="openSpendingLimitModal"
            />
          </div>
          <VCBaseCardAction
            :border="cardBorderConfig"
            title="Funding Source"
            :description="fundingSourceDescription"
            icon="bank"
            @click="openFundingSourcePatchModal"
          />
          <VCBaseCardToggle
            v-model="isMerchantLocked"
            :border="cardBorderConfig"
            title="Merchant Locking"
            description="Auto-lock to the first merchant after use"
            icon="lock"
            @update:model-value="handleMerchantLockChange"
          />
          <VCBaseCardToggle
            v-model="isCardLocked"
            :border="cardBorderConfig"
            :disabled="!canToggleLockState"
            title="Lock Card"
            description="Block all transactions while the card is locked"
            icon="card-lock"
            @update:model-value="handleCardLockChange"
          />
          <VCBaseCardDropdownSelect
            v-model="deactivateOption"
            :border="cardBorderConfig"
            :options="deactivateOptions"
            title="Deactivate Card"
            icon="shield-tick"
            :description="expiresAtDescription"
            style="min-height: 81px"
            @update:model-value="handleDeactivateCardChange"
          />
        </div>
      </div>
      <footer class="vc-manage-card-modal__footer">
        <div class="vc-manage-card-modal__footer-card-id-container">
          <BaseText
            as="span"
            variant="body-small-medium"
          >
            Card ID
          </BaseText>
          <VCBaseCopyText
            class="vc-manage-card-modal__footer-card-id-text"
            :value="card?.id || ''"
          />
        </div>
        <BaseButton
          class="vc-manage-card-modal__footer-cancel-btn"
          variant="primary"
          background-color="danger"
          :loading="isCancelingCard"
          :disabled="isCancelingCard"
          @click="handleCancelCard"
        >
          Cancel Card
        </BaseButton>
      </footer>
    </template>
  </ModalTemplate>
</template>

<style scoped lang="scss">
$base-padding: 32px;

.vc-manage-card-modal {
  &--canceling {
    pointer-events: none;
  }

  &__header {
    padding-top: 32px;
    padding-bottom: 8px;
    padding-inline: $base-padding;

    &-close-button {
      position: absolute;
      top: 12px;
      right: 12px;
    }
  }

  &__body {
    padding-top: 24px;
    padding-inline: $base-padding;
  }

  &__cards-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: 24px;
    padding-inline: $base-padding;
    padding-bottom: $base-padding;

    &-card-id-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    &-cancel-btn {
      width: 155px;
    }

    &-card-id-text {
      margin-left: -4px;
    }
  }
}
</style>
