import { markRaw, reactive, type MaybeRefOrGetter } from "vue";
import store from "@/store";
import type { VirtualCard } from "@/types/Wallet/virtual-card";
import useVirtualCard from "./useVirtualCard";
import useVirtualCardActions from "./useVirtualCardActions";
import { useToast } from "@/composables/useToast";
import VCManageCardModal from "../modals/cards/VCManageCardModal.vue";
import FundingSourceSelectModal from "@/features/modals/Wallet/FundingSourceSelectModal.vue";
import type { FundingSource } from "@/types/Wallet/funding-source";
import { formattedPrice } from "@/features/subscribe/composables/utils";
import { posthogCapture } from "@/scripts/posthog";
import VCCardLimitModal from "../modals/cards/VCCardLimitModal.vue";
import useVirtualCards from "./useVirtualCards";

export default function useVirtualCardModals(
  card: MaybeRefOrGetter<VirtualCard | string>
) {
  const toast = useToast();
  const { refetchCards } = useVirtualCards();
  const { card: _card, cardFundingSource } = useVirtualCard(card);
  const { updateCardFundingSource, getLightningCheckAmount } =
    useVirtualCardActions(card);

  const openManageCardModal = () => {
    if (!_card.value) {
      toast.error("Virtual Card not found");
      throw new Error("Virtual Card not found");
    }

    store.dispatch("openModal", {
      customTemplate: {
        template: markRaw(VCManageCardModal),
        props: {
          cardId: _card.value.id,
        },
      },
    });
  };

  const openSpendingLimitModal = () => {
    if (!_card.value) {
      toast.error("Virtual Card not found");
      throw new Error("Virtual Card not found");
    }

    store.dispatch("openModal", {
      customTemplate: {
        template: markRaw(VCCardLimitModal),
        props: {
          cardId: _card.value.id,
        },
      },
    });
  };

  const openFundingSourcePatchModal = async () => {
    const modalProps = reactive({
      title: "Edit funding source",
      description:
        "You can switch this card's funding source to another of the same type (credit, debit, or bank account).",
      currentFundingSource: cardFundingSource.value,
      filterBySameType: true,
      isSaving: false,
      isLoadingExtraDescription: false,
      extraDescription: "",
      onSave,
      onSelect,
    });

    function onSave(fundingSource: FundingSource) {
      modalProps.isSaving = true;
      updateCardFundingSource(fundingSource.id)
        .then(() => {
          posthogCapture("pay_wallet_card_funding_source_switch_success");
          refetchCards();
          store.dispatch("closeModal");
        })
        .catch(() => {
          posthogCapture("pay_wallet_card_funding_source_switch_failed");
        })
        .finally(() => {
          modalProps.isSaving = false;
        });
    }

    function onSelect({
      fundingSource,
      isCurrentFundingSource,
    }: {
      fundingSource: FundingSource;
      isCurrentFundingSource: boolean;
    }) {
      if (isCurrentFundingSource) {
        modalProps.extraDescription = "";
        return;
      }

      modalProps.isLoadingExtraDescription = true;
      getLightningCheckAmount(true, fundingSource.id)
        .then(({ lightning_check_amount }) => {
          if (lightning_check_amount > 0) {
            modalProps.extraDescription = `We will issue a <strong>${formattedPrice(lightning_check_amount / 100)}</strong> hold on the selected account to verify funds. This will be released automatically.`;
          } else {
            modalProps.extraDescription = "";
          }
        })
        .catch(() => {
          modalProps.extraDescription = "";
        })
        .finally(() => {
          modalProps.isLoadingExtraDescription = false;
        });
    }

    store.dispatch("openModal", {
      customTemplate: {
        template: markRaw(FundingSourceSelectModal),
        props: modalProps,
      },
    });
  };

  return {
    openManageCardModal,
    openSpendingLimitModal,
    openFundingSourcePatchModal,
  };
}
