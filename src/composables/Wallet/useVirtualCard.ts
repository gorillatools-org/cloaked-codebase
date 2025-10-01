import { toValue } from "@vueuse/core";
import { computed, markRaw, reactive, unref, type MaybeRefOrGetter } from "vue";
import { useToast } from "@/composables/useToast.js";
import store from "@/store";
import CardsServices from "@/api/actions/cards-services";
import FundingSourceSelectModal from "@/features/modals/Wallet/FundingSourceSelectModal.vue";
import type { FundingSource } from "@/types/Wallet/funding-source";
import useFundingSource from "./useFundingSource";
import { formattedPrice } from "@/features/subscribe/composables/utils";
import { posthogCapture } from "@/scripts/posthog";

// TODO: Add type for "card"
export default function useVirtualCard(
  card: MaybeRefOrGetter<any | undefined | null>
) {
  const toast = useToast();
  const { fundingSources } = useFundingSource();

  const _card = computed(() => {
    const value = toValue(card);
    return unref(value);
  });

  const cardFundingSource = computed(() => {
    return fundingSources.value?.find(
      (source) => source.id === _card.value?.funding_source
    );
  });

  const openFundingSourcePatchModal = async () => {
    const onSave = (fundingSource: FundingSource) => {
      modalProps.isSaving = true;
      _updateFundingSourceLinkedToCard(fundingSource.id)
        .then(() => {
          store.dispatch("closeModal");
        })
        .finally(() => {
          modalProps.isSaving = false;
        });
    };

    const modalProps = reactive({
      title: "Edit funding source",
      description:
        "You can switch this card's funding source to another of the same type (credit, debit, or bank account).",
      currentFundingSource: cardFundingSource.value,
      filterBySameType: true,
      isSaving: false,
      isLoadingExtraDescription: false,
      extraDescription: "",
      onSave: onSave,
      onSelect: ({
        fundingSource,
        isCurrentFundingSource,
      }: {
        fundingSource: FundingSource;
        isCurrentFundingSource: boolean;
      }) => {
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
          .finally(() => {
            modalProps.isLoadingExtraDescription = false;
          });
      },
    });

    store.dispatch("openModal", {
      customTemplate: {
        template: markRaw(FundingSourceSelectModal),
        props: modalProps,
      },
    });
  };

  const _updateFundingSourceLinkedToCard = (
    replacementFundingSourceId: string
  ) => {
    return CardsServices.switchFundingSource(
      _card.value.funding_source,
      replacementFundingSourceId,
      _card.value.id
    )
      .then(() => {
        posthogCapture(
          "dashboard_pay_wallet_card_funding_source_switch_success"
        );
        return CardsServices.getCardList();
      })
      .catch((error) => {
        toast.error(
          error.response.data.message ||
            error.message ||
            "Failed to switch funding source"
        );
        posthogCapture(
          "dashboard_pay_wallet_card_funding_source_switch_failed"
        );
      });
  };

  const getLightningCheckAmount = (
    includeCard = true,
    replacementFundingSourceId?: string | undefined
  ) => {
    return CardsServices.getLightningCheckAmount(
      _card.value.funding_source,
      replacementFundingSourceId,
      includeCard ? _card.value.id : undefined
    ).then((response) => response as { lightning_check_amount: number });
  };

  return {
    card: _card,
    cardFundingSource,
    openFundingSourcePatchModal,
  };
}
