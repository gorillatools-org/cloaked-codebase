import store from "@/store";
import type { FundingSource } from "@/types/Wallet/funding-source";
import { computed, markRaw, type CSSProperties } from "vue";
import FundingSourceListModal from "@/features/modals/Wallet/FundingSourceListModal.vue";
import CardsServices from "@/api/actions/cards-services";
import { useToast } from "@/composables/useToast";
import WalletConfirmationModal from "@/features/modals/Wallet/WalletConfirmationModal.vue";
import FundingSourceAddModal from "@/features/modals/Wallet/FundingSourceAddModal.vue";
import { posthogCapture } from "@/scripts/posthog";
import { CARD_PROVIDER_TYPE, constants } from "@/scripts/constants";
import AddCreditCard from "@/features/modals/Wallet/AddCreditCard.vue";
import FundingSourceEditModal from "@/features/modals/Wallet/FundingSourceEditModal.vue";

export type FundingSourceType =
  | (typeof constants.CARD_TYPE)[keyof typeof constants.CARD_TYPE]
  | "ach";

export type CardProviderType =
  (typeof CARD_PROVIDER_TYPE)[keyof typeof CARD_PROVIDER_TYPE];

export default function useFundingSource() {
  const toast = useToast();

  const fundingSources = computed(() => {
    return store.state.cards.fundingSources?.results as
      | FundingSource[]
      | undefined;
  });

  const cardFundingSourceVersion = computed(() => {
    return store.state.authentication?.user?.card_fs_version;
  });

  const enabledFundingSourceTypes = computed(() => {
    const allowDebitAch =
      store.state.authentication?.user?.allow_debit_ach_only;
    return {
      credit_card: true,
      debit_card: !!allowDebitAch,
      ach: !!allowDebitAch,
    };
  });

  const refetchFundingSources = () => {
    return CardsServices.getFundingSources();
  };

  const generateCardNameBasedOnFundingSource = (fundingSourceId: string) => {
    const sourceCardBrand = fundingSources.value?.find(
      (source) => source.id === fundingSourceId
    )?.card_brand;

    if (!sourceCardBrand) {
      return "Unknown";
    }

    const capitalizedSourceCardBrand =
      sourceCardBrand?.charAt(0)?.toUpperCase() + sourceCardBrand?.slice(1);

    const cardsNames =
      store.state.cards.cards?.results?.map(
        (card: any) => card.identity_name
      ) || [];

    let generatedCardName = `${capitalizedSourceCardBrand}`;

    let i = 1;
    do {
      generatedCardName = `${capitalizedSourceCardBrand} ${i}`;
      i++;
    } while (cardsNames.includes(generatedCardName));

    return generatedCardName;
  };

  const getCardBrandImgURL = (cardBrand: string) => {
    switch (cardBrand.toLowerCase()) {
      case "mastercard":
        return new URL(
          "@/assets/images/card-brands/mastercard-logo.jpeg",
          import.meta.url
        ).href;
      case "visa":
        return new URL(
          "@/assets/images/card-brands/visa-logo.png",
          import.meta.url
        ).href;
      case "unionpay":
        return new URL(
          "@/assets/images/card-brands/unionpay-logo.png",
          import.meta.url
        ).href;
      case "discover":
        return new URL(
          "@/assets/images/card-brands/discover-logo.jpeg",
          import.meta.url
        ).href;
      case "amex":
        return new URL(
          "@/assets/images/card-brands/amex-logo.png",
          import.meta.url
        ).href;
      default:
        return undefined;
    }
  };

  const getProviderIcon = (
    provider?: CardProviderType | FundingSourceType | "ach"
  ) => {
    switch (provider) {
      case CARD_PROVIDER_TYPE.CHECKOUT_FLOW_ACH:
      case CARD_PROVIDER_TYPE.PLAID_STRIPE_FLOW_ACH:
      case "ach":
        return "bank";
      case CARD_PROVIDER_TYPE.CHECKOUT_FLOW_CREDIT:
      case CARD_PROVIDER_TYPE.STRIPE_FLOW_CREDIT:
      case "credit_card":
        return "wallet";
      case CARD_PROVIDER_TYPE.CHECKOUT_FLOW_DEBIT:
      case CARD_PROVIDER_TYPE.STRIPE_FLOW_DEBIT:
      case "debit_card":
      default:
        return "card-pos";
    }
  };

  /**
   * Modals
   */

  const openListModal = (isSelectMode: boolean = false) => {
    store.dispatch("openModal", {
      customTemplate: {
        template: markRaw(FundingSourceListModal),
        props: {
          isSelectMode: isSelectMode,
        },
      },
    });
  };

  const openAddModal = (onAddSuccess?: () => void) => {
    store.dispatch("openModal", {
      customTemplate: {
        template: markRaw(FundingSourceAddModal),
        props: {
          onAddSuccess: () => {
            if (onAddSuccess) {
              onAddSuccess();
            }
          },
        },
      },
    });
  };

  const openEditModal = (fundingSourceId: string) => {
    store.dispatch("openModal", {
      customTemplate: {
        template: markRaw(FundingSourceEditModal),
        props: {
          fundingSourceId,
        },
      },
    });
  };

  const openDeleteModal = (fundingSourceId: string) => {
    const fundingSource = fundingSources.value?.find(
      (fundingSource) => fundingSource.id === fundingSourceId
    );

    if (!fundingSource) {
      return;
    }

    const modalProps = {
      title: "Remove this funding source?",
      description:
        "Are you sure you want to delete this funding source? Activity from this funding source will remain on the dashboard.",
      primaryButtonText: "Yes, Remove",
      secondaryButtonText: "Cancel",
      primaryButtonColor: "danger",
      secondaryButtonColor: "outline",
      primaryButtonStyle: {} as CSSProperties,
      secondaryButtonStyle: {} as CSSProperties,
      onConfirm: () => {
        _delete(fundingSourceId);
      },
    };

    if (fundingSource.primary) {
      modalProps.title = "Are you sure you want to remove this funding source?";
      modalProps.description =
        "Virtual cards linked to this funding source may be removed. If applicable, we will update your default funding source.";
      modalProps.onConfirm = () => {
        _delete(fundingSourceId).then(() => {
          refetchFundingSources();
          posthogCapture(
            "dashboard_pay_wallet_update_funding_source_remove_default"
          );
        });
      };
    }

    if (fundingSources.value?.length === 1) {
      modalProps.title = "You need at least one funding source";
      modalProps.description =
        "To remove this one, please link another source first.";
      modalProps.primaryButtonText = "Link New Funding Source";
      modalProps.secondaryButtonText = "Cancel";
      modalProps.primaryButtonColor = "primary";
      modalProps.secondaryButtonColor = "outline";
      modalProps.secondaryButtonStyle = { width: "170px", flex: "unset" };
      modalProps.primaryButtonStyle = { flexGrow: 1, flex: 1 };
      modalProps.onConfirm = () => {
        openAddModal();
      };
    }

    store.dispatch("openModal", {
      customTemplate: {
        template: markRaw(WalletConfirmationModal),
        props: {
          ...modalProps,
        },
      },
    });
  };

  const openAddPopup = (type: FundingSourceType, onAddSuccess?: () => void) => {
    function openPopup(flowUrl: string) {
      const popup = window.open(
        flowUrl,
        "",
        "resizable=1,width=500,height=580,top=80,left=50"
      );
      popup?.focus();

      // Poll to detect when popup closes and refetch funding sources
      if (popup) {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            URL.revokeObjectURL(flowUrl);

            // After the popup closes, refetch and check if a new funding source was added
            const tempFsListLength = fundingSources.value?.length || 0;
            refetchFundingSources().then(() => {
              if ((fundingSources.value?.length || 0) > tempFsListLength) {
                // New fs
                onAddSuccess?.();
              }
            });
          }
        }, 1000);
      }
    }

    if (
      cardFundingSourceVersion.value === constants.CARD_FS_VERSION_OWN_CARD &&
      type !== "ach"
    ) {
      store.dispatch("closeModal"); // Closes the current modal
      posthogCapture("dashboard_pay_wallet_add_funding_source_viewed");
      openAddCreditCardModal(type, onAddSuccess);
      return;
    }

    return CardsServices.postCreateAPaymentSource({ flow: type })
      .then(({ data }) => {
        posthogCapture("dashboard_pay_wallet_add_funding_source_modal_viewed");
        if (data?.flow_url) {
          openPopup(data.flow_url);
        } else {
          const blob = new Blob([data], { type: "text/html" });
          const flowUrl = URL.createObjectURL(blob);
          openPopup(flowUrl);
        }
      })
      .catch((err) => {
        posthogCapture("dashboard_pay_wallet_add_funding_source_modal_failed");
        toast.error(
          err?.response?.data?.detail ||
            "Oops! We could not process your request."
        );
      });
  };

  function openAddCreditCardModal(
    type: FundingSourceType | "ach",
    onAddSuccess?: () => void
  ) {
    store.dispatch("openModal", {
      customTemplate: {
        template: markRaw(AddCreditCard),
        props: {
          isVisible: true,
          cardType: type,
          onClose: () => {},
          onAddSuccess: () => {
            // Refetch and check if a new funding source was added
            const tempFsListLength = fundingSources.value?.length || 0;
            refetchFundingSources().then(() => {
              if ((fundingSources.value?.length || 0) > tempFsListLength) {
                // New fs
                if (onAddSuccess) {
                  onAddSuccess();
                }
              }
            });
          },
        },
      },
    });
  }

  const openAutoPayOffConfirmationModal = (fundingSourceId: string) => {
    store.dispatch("openModal", {
      customTemplate: {
        template: markRaw(WalletConfirmationModal),
        props: {
          title: "Turn off Autopay?",
          description:
            "AutoPay keeps your Virtual Card balance paid, and turning it off may cause you to lose rewards from your linked payment method.",
          icon: "no-sync",
          primaryButtonText: "Keep AutoPay On",
          secondaryButtonText: "Turn Off AutoPay",
          primaryButtonColor: "primary",
          secondaryButtonColor: "outline",
          onCancel: () => {
            updateAutoPay(fundingSourceId, false);
          },
        },
      },
    });
  };

  /**
   * Actions
   */

  const _delete = (fundingSourceId: string) => {
    // Used for optimistic update in case of rollback
    const tempFundingSources = { ...store.state.cards.fundingSources };

    // Optimistically remove funding source from the list
    store.dispatch("removeFundingSource", fundingSourceId);

    return CardsServices.deleteFundingSource(fundingSourceId)
      .then(() => {
        CardsServices.getCardList();
        toast.success("Funding source removed");
        posthogCapture(
          "dashboard_pay_wallet_add_funding_source_modal_funding_source_removed"
        );
      })
      .catch(() => {
        toast.error("Failed to remove funding source");
        store.dispatch("fundingSourcesList", tempFundingSources);
        posthogCapture(
          "dashboard_pay_wallet_add_funding_source_modal_funding_source_removal_failed"
        );
      });
  };

  const updateAutoPay = (fundingSourceId: string, enabled: boolean) => {
    // Used for optimistic update in case of rollback
    const tempFundingSources = { ...store.state.cards.fundingSources };

    // Optimistically update funding source auto pay
    store.dispatch("switchFundingSourceAutoPay", { fundingSourceId, enabled });

    return CardsServices.patchUpdateCardDetails(fundingSourceId, {
      is_auto_debit: enabled,
    })
      .then(() => {
        CardsServices.getCardList();
        toast.success("Autopay turned " + (enabled ? "on" : "off"));
        posthogCapture(
          "dashboard_pay_wallet_funding_source_auto_pay_turned_" +
            (enabled ? "on" : "off")
        );
      })
      .catch(() => {
        toast.error("Failed to turn " + (enabled ? "on" : "off") + " autopay");
        store.dispatch("fundingSourcesList", tempFundingSources);
        posthogCapture(
          "dashboard_pay_wallet_funding_source_auto_pay_turned_" +
            (enabled ? "on" : "off") +
            "_failed"
        );
      });
  };

  const updateNickname = (fundingSourceId: string, nickname: string) => {
    return CardsServices.patchUpdateCardDetails(fundingSourceId, {
      nickname,
    })
      .then(() => {
        toast.success("Funding source updated");
        posthogCapture("dashboard_pay_wallet_update_funding_source_nickname");
        return CardsServices.getFundingSources();
      })
      .catch((error) => {
        toast.error(
          error.message || "Oops! We could not process your request."
        );
        posthogCapture(
          "dashboard_pay_wallet_update_funding_source_nickname_failed"
        );
      });
  };

  const setDefault = (fundingSourceId: string) => {
    return CardsServices.patchUpdateCardDetails(fundingSourceId, {
      primary: true,
    })
      .then(() => {
        toast.success("This funding source is now the default one.");
        posthogCapture(
          "dashboard_pay_wallet_update_funding_source_set_default"
        );
        return CardsServices.getFundingSources();
      })
      .catch((error) => {
        toast.error(error || "Oops! We could not process your request.");
        posthogCapture(
          "dashboard_pay_wallet_update_funding_source_set_default_failed"
        );
      });
  };

  return {
    fundingSources,
    cardFundingSourceVersion,
    enabledFundingSourceTypes,
    refetchFundingSources,
    openListModal,
    openAddPopup,
    openAddModal,
    openEditModal,
    openDeleteModal,
    updateNickname,
    setDefault,
    getProviderIcon,
    getCardBrandImgURL,
    openAutoPayOffConfirmationModal,
    updateAutoPay,
    generateCardNameBasedOnFundingSource,
  };
}
