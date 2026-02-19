import store from "@/store";
import type { FundingSource } from "@/types/Wallet/funding-source";
import { computed, markRaw, reactive, type CSSProperties } from "vue";
import FundingSourceListModal from "@/features/modals/Wallet/FundingSourceListModal.vue";
import CardsServices from "@/api/actions/cards-services";
import { useToast } from "@/composables/useToast";
import WalletConfirmationModal from "@/features/modals/Wallet/WalletConfirmationModal.vue";
import FundingSourceAddModal from "@/features/modals/Wallet/FundingSourceAddModal.vue";
import { posthogCapture } from "@/scripts/posthog";
import { CARD_PROVIDER_TYPE, constants } from "@/scripts/constants";
import FundingSourceCardFormModal from "@/features/modals/Wallet/FundingSourceCardFormModal.vue";
import FundingSourceEditModal from "@/features/modals/Wallet/FundingSourceEditModal.vue";
import FundingSourceSelectModal from "@/features/modals/Wallet/FundingSourceSelectModal.vue";
import { formattedPrice } from "@/features/subscribe/composables/utils";
import moment from "moment";
import type { CardFormSubmitPayload } from "@/features/modals/Wallet/FundingSourceCardFormModal.vue";
import isString from "lodash-es/isString";
import router from "@/routes/router";
import type { FundingSourceType } from "@/types/Wallet/funding-source";
import { useDevice } from "@/composables/useDevice";

export type CardProviderType =
  (typeof CARD_PROVIDER_TYPE)[keyof typeof CARD_PROVIDER_TYPE];

export default function useFundingSource() {
  const toast = useToast();
  const { isMobile } = useDevice();

  const fundingSources = computed(() => {
    // The default funding source is always first, rest sorted alphabetically
    return [...(store.state.cards.fundingSources?.results || [])].sort(
      (a, b) => {
        if (a.primary && !b.primary) return -1;
        if (!a.primary && b.primary) return 1;

        const nameA = (a.nickname || a.name_on_card || "").toLowerCase();
        const nameB = (b.nickname || b.name_on_card || "").toLowerCase();
        return nameA.localeCompare(nameB);
      }
    ) as FundingSource[];
  });

  const defaultFundingSource = computed(() => {
    return fundingSources.value?.find((source) => source.primary) || undefined;
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

  const expiredFundingSources = computed(() => {
    return fundingSources.value?.filter((fundingSource) => {
      return moment(fundingSource.expires_at).isBefore(moment());
    });
  });

  const hasExpiredFundingSources = computed(() => {
    return (expiredFundingSources.value?.length || 0) > 0;
  });

  const newestFundingSource = computed(() => {
    return [...(fundingSources.value || [])].sort((a, b) => {
      return moment(b.created_at).diff(moment(a.created_at));
    })[0];
  });

  const checkExpiredFundingSource = (fundingSource: string | FundingSource) => {
    const fundingSourceId =
      typeof fundingSource === "string" ? fundingSource : fundingSource?.id;
    return (
      !!expiredFundingSources.value?.some(
        (fundingSource) => fundingSource.id === fundingSourceId
      ) || false
    );
  };

  const refetchFundingSources = () => {
    return CardsServices.getFundingSources();
  };

  const getFundingSourcesByType = (
    type: FundingSourceType,
    exceptionId?: string
  ) => {
    return (
      fundingSources.value?.filter(
        (fundingSource) =>
          fundingSource.type === type && fundingSource.id !== exceptionId
      ) || []
    );
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

  const openListModal = () => {
    store.dispatch("openModal", {
      customTemplate: {
        template: markRaw(FundingSourceListModal),
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

  const openUpdateModal = (fundingSourceId: string) => {
    const fundingSource = fundingSources.value?.find(
      (fundingSource) => fundingSource.id === fundingSourceId
    );

    if (!fundingSource) {
      return;
    }

    if (fundingSource.type === "ach") {
      openAddPopup(fundingSource.type);
      return;
    }

    router.push({
      name: "VirtualCardsWalletFundingSourceUpdate",
      params: { fsId: fundingSourceId },
    });
  };

  const openDeleteModal = async (fundingSourceId: string) => {
    const fundingSource = fundingSources.value?.find(
      (fundingSource) => fundingSource.id === fundingSourceId
    );

    if (!fundingSource) {
      return;
    }

    const isDefault = fundingSource.primary;
    const isLast = fundingSources.value?.length === 1;
    const isLastOrDefault = isDefault || isLast;

    const fundingSourcesByType = getFundingSourcesByType(
      fundingSource.type as FundingSourceType,
      fundingSourceId
    );

    // Avoid loading all cards linked to the funding source if there are no other funding sources of the same type or if it's the last or default funding source
    const cardsLinkedToFundingSourceLength =
      !isLastOrDefault && fundingSourcesByType.length > 0
        ? await CardsServices.getFundingSourceCards(fundingSourceId).then(
            (response) => response.results?.length
          )
        : 0;
    const canSwitchFundingSource =
      !isLastOrDefault &&
      fundingSourcesByType.length > 0 &&
      cardsLinkedToFundingSourceLength > 0;

    const modalProps = {
      title: canSwitchFundingSource
        ? "Remove or switch this funding source?"
        : "Remove this funding source?",
      description: canSwitchFundingSource
        ? "Removing the funding source will delete all linked cards. <br/> <br/> If you switch to another funding source of the same type, your cards will stay active and be updated to use the new source."
        : "If you remove this funding source, all cards linked to it will also be deleted. Your past activity will remain visible on your dashboard.",
      primaryButtonText: "Remove",
      secondaryButtonText: canSwitchFundingSource ? "Switch source" : "Cancel",
      showCloseInHeader: canSwitchFundingSource,
      primaryButtonColor: "danger",
      secondaryButtonColor: "outline",
      hideSecondaryButton: false,
      primaryButtonStyle: {} as CSSProperties,
      secondaryButtonStyle: {} as CSSProperties,
      onConfirm: () => {
        _delete(fundingSourceId);
      },
      onCancel: () => {
        if (!canSwitchFundingSource) return;
        _openSwitchAndDeleteFundingSourceModal(fundingSource);
      },
    };

    if (isLast) {
      modalProps.title = "At least one funding source required";
      modalProps.description =
        "Link another funding source before removing this one.";
      modalProps.primaryButtonText = "Link new funding source";
      modalProps.secondaryButtonText = "Cancel";
      modalProps.primaryButtonColor = "primary";
      modalProps.secondaryButtonColor = "outline";
      modalProps.showCloseInHeader = false;
      modalProps.secondaryButtonStyle = { width: "170px", flex: "unset" };
      modalProps.primaryButtonStyle = { flexGrow: 1, flex: 1 };
      modalProps.onConfirm = () => {
        openAddModal();
      };
    }

    if (isDefault && !isLast) {
      modalProps.title = "Default funding source required";
      modalProps.description =
        "Please select a new default before removing your current funding source.";
      modalProps.primaryButtonColor = "primary";
      modalProps.primaryButtonText = "Got it";
      modalProps.primaryButtonStyle = { width: "150px", flex: "unset" };
      modalProps.hideSecondaryButton = true;
      modalProps.onConfirm = () => {};
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

  const _openSwitchAndDeleteFundingSourceModal = async (
    fundingSource: FundingSource,
    onSuccess?: () => void
  ) => {
    const deleteAndReplaceFundingSource = (
      replacementFundingSource: FundingSource
    ) => {
      modalProps.isSaving = true;
      _switchAndDelete(fundingSource.id, replacementFundingSource.id)
        .then(() => {
          if (onSuccess) {
            onSuccess();
          }
          store.dispatch("closeModal");
        })
        .finally(() => {
          modalProps.isSaving = false;
        });
    };

    const modalProps = reactive({
      title: "Choose a new funding source",
      description:
        "Switch this card’s funding source to another of the same type. All linked cards will be updated to use the new source.",
      extraDescription: "",
      fundingSources: getFundingSourcesByType(
        fundingSource.type as FundingSourceType,
        fundingSource.id
      ),
      filterBySameType: true,
      isSaving: false,
      isLoadingExtraDescription: false,
      saveButtonText: "Confirm",
      onSave: deleteAndReplaceFundingSource,
      onSelect: ({
        fundingSource: selectedFundingSource,
      }: {
        fundingSource: FundingSource;
        isCurrentFundingSource: boolean;
      }) => {
        modalProps.isLoadingExtraDescription = true;
        getLightningCheckAmount(fundingSource.id, selectedFundingSource.id)
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

  const openAddPopup = (type: FundingSourceType, onAddSuccess?: () => void) => {
    const isMobileDevice = isMobile.value;
    let popup: Window | null = null;

    // Handle CARD OWN flow
    if (
      cardFundingSourceVersion.value === constants.CARD_FS_VERSION_OWN_CARD &&
      type !== "ach"
    ) {
      store.dispatch("closeModal");
      _openAddCardModal(type, onAddSuccess);
      return;
    }

    // Handle mobile devices - We need to open a placeholder popup to avoid the mobile-browser blocking the popup
    if (isMobileDevice) {
      popup = window.open("", "_blank");
      popup?.document.write("<p>Loading...</p>");
    }

    return CardsServices.postCreateAPaymentSource({ flow: type })
      .then(async ({ data }) => {
        posthogCapture("pay_wallet_add_funding_source_popup_viewed", { type });

        const flowUrl = data?.flow_url;

        if (isMobileDevice) {
          if (!popup) {
            toast.error("Your browser blocked the popup.");
            return;
          }

          popup.location.href = flowUrl;
        } else {
          popup = window.open(
            flowUrl,
            "",
            "resizable=1,width=500,height=580,top=80,left=50"
          );

          popup?.focus();
        }

        if (popup) {
          const beforeLen = fundingSources.value?.length || 0;

          const interval = setInterval(() => {
            if (popup!.closed) {
              clearInterval(interval);

              refetchFundingSources().then(() => {
                if ((fundingSources.value?.length || 0) > beforeLen) {
                  posthogCapture(
                    "pay_wallet_add_funding_source_popup_success",
                    { type }
                  );
                  onAddSuccess?.();
                }
              });
            }
          }, 500);
        }
      })
      .catch((err) => {
        popup?.close();
        posthogCapture("pay_wallet_add_funding_source_popup_failed", { type });

        toast.error(
          err?.response?.data?.detail ||
            "Oops! We could not process your request."
        );
      });
  };

  function _openAddCardModal(
    type: FundingSourceType,
    onAddSuccess?: () => void
  ) {
    const modalProps = reactive({
      cardType: type,
      isSubmitting: false,
      onSubmit,
    });

    function checkIfNewFundingSourceAdded() {
      const tempFsListLength = fundingSources.value?.length || 0;
      refetchFundingSources().then(() => {
        if ((fundingSources.value?.length || 0) > tempFsListLength) {
          if (onAddSuccess) {
            onAddSuccess();
          }
        }
      });
    }

    function onSubmit(payload: CardFormSubmitPayload) {
      modalProps.isSubmitting = true;
      CardsServices.addBankCard(payload)
        .then(() => {
          checkIfNewFundingSourceAdded();
          posthogCapture("pay_wallet_add_funding_source_success", {
            type: payload.channel,
          });
          store.dispatch("closeModal");
          toast.success("Card was added successfully");
        })
        .catch((error) => {
          const errorMessage = error.response.data?.error;
          if (
            errorMessage &&
            isString(errorMessage) &&
            errorMessage.toLowerCase().includes("exists")
          ) {
            toast.error(
              "This card has already been added as a funding source."
            );
          } else {
            toast.error(
              "We could not add your funding source. Please double check the card data you provided."
            );
          }

          posthogCapture("pay_wallet_add_funding_source_failed", {
            type: payload.channel,
          });
        })
        .finally(() => {
          modalProps.isSubmitting = false;
        });
    }

    posthogCapture("pay_wallet_add_funding_source_viewed");

    store.dispatch("openModal", {
      customTemplate: {
        template: markRaw(FundingSourceCardFormModal),
        props: modalProps,
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

  const getLightningCheckAmount = async (
    fundingSourceId: string,
    replacementFundingSourceId?: string
  ) => {
    return CardsServices.getLightningCheckAmount(
      fundingSourceId,
      replacementFundingSourceId
    ).then((response) => response as { lightning_check_amount: number });
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
          "pay_wallet_add_funding_source_modal_funding_source_removed"
        );
      })
      .catch(() => {
        toast.error("Failed to remove funding source");
        store.dispatch("fundingSourcesList", tempFundingSources);
        posthogCapture(
          "pay_wallet_add_funding_source_modal_funding_source_removal_failed"
        );
      });
  };

  const _switchAndDelete = (
    fundingSourceId: string,
    replacementFundingSourceId: string
  ) => {
    return CardsServices.switchFundingSource(
      fundingSourceId,
      replacementFundingSourceId
    )
      .then(() => {
        CardsServices.getCardList();
        refetchFundingSources();
        toast.success("Funding source switched and deleted");
        posthogCapture(
          "pay_wallet_add_funding_source_modal_funding_source_switch_and_delete_success"
        );
      })
      .catch((error) => {
        toast.error(
          error.response.data.message ||
            error.message ||
            "Failed to switch and delete funding source"
        );
        posthogCapture(
          "pay_wallet_add_funding_source_modal_funding_source_switch_and_delete_failed"
        );
      });
  };

  const updateAutoPay = (fundingSourceId: string, enabled: boolean) => {
    // Used for optimistic update in case of rollback
    const tempFundingSources = { ...store.state.cards.fundingSources };

    // Optimistically update funding source auto pay
    store.dispatch("switchFundingSourceAutoPay", { fundingSourceId, enabled });

    return CardsServices.patchUpdateCardDetails(fundingSourceId, {
      auto_debit: enabled,
    })
      .then(() => {
        CardsServices.getCardList();
        toast.success("Autopay turned " + (enabled ? "on" : "off"));
        posthogCapture(
          "pay_wallet_funding_source_auto_pay_turned_" +
            (enabled ? "on" : "off")
        );
      })
      .catch(() => {
        toast.error("Failed to turn " + (enabled ? "on" : "off") + " autopay");
        store.dispatch("fundingSourcesList", tempFundingSources);
        posthogCapture(
          "pay_wallet_funding_source_auto_pay_turned_" +
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
        posthogCapture("pay_wallet_update_funding_source_nickname");
        return CardsServices.getFundingSources();
      })
      .catch((error) => {
        toast.error(
          error.message || "Oops! We could not process your request."
        );
        posthogCapture("pay_wallet_update_funding_source_nickname_failed");
      });
  };

  const setDefault = (fundingSourceId: string) => {
    return CardsServices.patchUpdateCardDetails(fundingSourceId, {
      primary: true,
    })
      .then(() => {
        toast.success("This funding source is now the default one.");
        posthogCapture("pay_wallet_update_funding_source_set_default");
        return CardsServices.getFundingSources();
      })
      .catch((error) => {
        toast.error(error || "Oops! We could not process your request.");
        posthogCapture("pay_wallet_update_funding_source_set_default_failed");
      });
  };

  return {
    fundingSources,
    defaultFundingSource,
    cardFundingSourceVersion,
    enabledFundingSourceTypes,
    expiredFundingSources,
    hasExpiredFundingSources,
    checkExpiredFundingSource,
    newestFundingSource,
    getLightningCheckAmount,
    getFundingSourcesByType,
    refetchFundingSources,
    openListModal,
    openAddPopup,
    openAddModal,
    openEditModal,
    openDeleteModal,
    openUpdateModal,
    updateNickname,
    setDefault,
    getProviderIcon,
    getCardBrandImgURL,
    openAutoPayOffConfirmationModal,
    updateAutoPay,
    generateCardNameBasedOnFundingSource,
  };
}
