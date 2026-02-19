import { computed, markRaw, reactive, ref } from "vue";
import { defineStore } from "pinia";
import { type ProgressStep } from "@/features/VirtualCards/Subscription/application/VirtualCardsApplicationProgress.vue";
import store from "@/store";
import WalletConfirmationModal from "@/features/modals/Wallet/WalletConfirmationModal.vue";
import { useUserMergedAutofill } from "@/composables/useUserMergedAutofill";
import moment from "moment";
import CardsServices from "@/api/actions/cards-services";
import { posthogCapture } from "@/scripts/posthog";
import {
  KYCFlowEnum,
  useKYC,
  type KYCState,
  type KYCStatusSpecs,
} from "@/composables/useKYC";
import type { EDDBehaviorEnum } from "@/types/Wallet/kyc";
import { type Plan, type Subscription } from "@/features/subscribe/types.js";

import SubscriptionService from "@/api/settings/subscription-services";
import { useToast } from "@/composables/useToast";
import type { ProfileFormData } from "@/features/VirtualCards/Subscription/application/VirtualCardsProfileForm.vue";
import { pollRequest } from "@/features/VirtualCards/utils/polling-request";
import type { User } from "@/types/user";
import UserService from "@/api/actions/user-service";

type KYCData = {
  requiredDocuments: string[];
  eddBehavior: EDDBehaviorEnum | null;
  kycFailureStatus: KYCStatusSpecs | null;
  isSubmitting: boolean;
};

type ApplicationTransition = "back" | "forward";
type ApplicationSection =
  | "upgrade-plan"
  | "details-form"
  | "ssn-form"
  | "profile-review"
  | "agreements"
  | "submission-status";

type DetailsFormData = ProfileFormData & {
  ssn: string;
  agreementsAccepted: boolean;
};

export const useVirtualCardsApplicationStore = defineStore(
  "virtual-cards-application-store",
  () => {
    const {
      getUserInfos,
      userMergedAutofill,
      isFetching: isAutofillLoading,
      resetState: resetUserInfos,
    } = useUserMergedAutofill();
    const toast = useToast();

    /* State */
    const isApplicationDone = ref(false);
    const currentSection = ref<"intro" | "application" | "success">("intro");
    const currentApplicationSection = ref<ApplicationSection>("upgrade-plan");
    const applicationSectionTransition = ref<ApplicationTransition>("forward");
    const steps = ref<ProgressStep[]>([
      {
        id: "confirm-your-plan",
        label: "Confirm Your Plan",
        shortLabel: "Start",
        state: "active",
      },
      {
        id: "verify-your-identity",
        label: "Verify Your Identity",
        shortLabel: "Verify",
        state: "pending",
      },
      {
        id: "review-and-finish",
        label: "Review and Finish",
        shortLabel: "Finish",
        state: "pending",
      },
    ]);

    const upgradePlanOptions = ref<Plan[]>([]);
    const currentSubscription = ref<Subscription | null>(null);
    const selectedPlan = ref<Plan | null>(null);

    const detailsFormData = reactive<DetailsFormData>({
      firstName: "",
      lastName: "",
      dob: "",
      address: {
        address1: "",
        address2: null,
        postal_code: "",
        city: "",
        state: "",
        country: "",
      },
      phone: "",
      email: "",
      ssn: "",
      agreementsAccepted: false,
    });

    const kycData = reactive<KYCData>({
      requiredDocuments: [],
      eddBehavior: null,
      kycFailureStatus: null,
      isSubmitting: false,
    });

    const isWebviewMode = computed(() => {
      return store.state.ui.webviewMode;
    });

    const isSubscribedToCloakedPay = computed(() => {
      return (
        store.state.authentication?.user?.cloaked_card_enabled_status === "new"
      );
    });

    /* Methods */
    const sendWebviewMessage = (message: string) => {
      // @ts-ignore
      window.webkit?.messageHandlers?.cloakedApp?.postMessage(message);
      // @ts-ignore
      window.cloakedAndroid?.onReceiveMessage?.({ action: message });
    };

    const setCurrentSection = (
      section: "intro" | "application" | "success"
    ) => {
      currentSection.value = section;
    };

    const restartApplicationFlow = () => {
      detailsFormData.firstName = "";
      detailsFormData.lastName = "";
      detailsFormData.dob = "";
      detailsFormData.address.address1 = "";
      detailsFormData.address.postal_code = "";
      detailsFormData.address.city = "";
      detailsFormData.address.country = "";
      detailsFormData.address.address2 = null;
      detailsFormData.address.state = "";
      detailsFormData.phone = "";
      detailsFormData.email = "";
      detailsFormData.ssn = "";
      detailsFormData.agreementsAccepted = false;

      kycData.requiredDocuments = [];
      kycData.eddBehavior = null;
      kycData.kycFailureStatus = null;
      kycData.isSubmitting = false;

      currentSubscription.value = null;
      selectedPlan.value = null;
      upgradePlanOptions.value = [];

      applicationSectionTransition.value = "forward";
      currentApplicationSection.value = "upgrade-plan";

      steps.value[0].state = "active";
      steps.value[1].state = "pending";
      steps.value[2].state = "pending";

      resetUserInfos();
      setCurrentSection("intro");
    };

    const openFinishApplicationFlowModal = (confirm: () => void) => {
      const modalProps = {
        icon: "close",
        title: "Are you sure?",
        description:
          "You're so close to finishing your Cloaked Pay application. Don't lose your progress.",
        primaryButtonText: "Continue",
        secondaryButtonText: "Exit",
        primaryButtonColor: "primary",
        secondaryButtonColor: "outline",
        onCancel: () => {
          // Trigger the confirm callback if it exists (user use the cancel to confirm)
          if (confirm) {
            sendWebviewMessage("dismiss");
            confirm();
          }
        },
        onConfirm: () => {},
      };

      store.dispatch("openModal", {
        customTemplate: {
          template: markRaw(WalletConfirmationModal),
          props: {
            ...modalProps,
          },
        },
      });
    };

    const goBack = () => {
      applicationSectionTransition.value = "back";
      if (currentApplicationSection.value === "upgrade-plan") {
        setCurrentSection("intro");
      } else if (currentApplicationSection.value === "details-form") {
        if (isSubscribedToCloakedPay.value) {
          setCurrentSection("intro");
        } else {
          goToUpgradePlan("back");
        }
      } else if (currentApplicationSection.value === "ssn-form") {
        goToDetailsForm("back");
      } else if (currentApplicationSection.value === "profile-review") {
        goToSSNForm("back");
      } else if (currentApplicationSection.value === "agreements") {
        goToProfileReview("back");
      } else if (currentApplicationSection.value === "submission-status") {
        goToDetailsForm("back");
      }
    };

    const setSelectedPlan = (plan: Plan) => {
      selectedPlan.value = plan;
    };

    const goToUpgradePlan = async (
      transition: ApplicationTransition = "forward"
    ) => {
      if (!currentSubscription.value) {
        SubscriptionService.getSubscription()
          .then((response: Subscription) => {
            currentSubscription.value = response;
          })
          .catch(() => {
            toast.error(
              "Sorry, we couldn't retrieve your billing details. Please refresh or contact Support if you continue experiencing issues."
            );
          });
      }

      if (!upgradePlanOptions.value.length) {
        SubscriptionService.getCloakedPaySubscriptionPlans()
          .then((response: Plan[]) => {
            upgradePlanOptions.value = [...response];
          })
          .catch(() => {
            toast.error(
              "Sorry, we couldn't retrieve your billing details. Please refresh or contact Support if you continue experiencing issues."
            );
          });
      }

      applicationSectionTransition.value = transition;
      currentApplicationSection.value = "upgrade-plan";
      steps.value[0].state = "active";
      steps.value[1].state = "pending";
      steps.value[2].state = "pending";
    };

    const goToDetailsForm = async (
      transition: ApplicationTransition = "forward"
    ) => {
      applicationSectionTransition.value = transition;
      currentApplicationSection.value = "details-form";
      steps.value[0].state = "done";
      steps.value[1].state = "active";
      steps.value[2].state = "pending";

      if (!userMergedAutofill.value) {
        getUserInfosAndSetDetailsFormData();
      }
    };

    const getUserInfosAndSetDetailsFormData = () => {
      getUserInfos().then(() => {
        const autofillData = userMergedAutofill.value;
        if (!autofillData) return;

        const address = autofillData.addresses?.[0];

        detailsFormData.firstName = autofillData.fullName?.first ?? "";
        detailsFormData.lastName = autofillData.fullName?.last ?? "";
        detailsFormData.dob = autofillData.dob ?? "";
        detailsFormData.address.address1 = address?.address1 ?? "";
        detailsFormData.address.country = address?.country ?? "";
        detailsFormData.address.address2 = address?.address2 ?? "";
        detailsFormData.address.postal_code = address?.postal_code ?? "";
        detailsFormData.address.city = address?.city ?? "";
        detailsFormData.address.state = address?.state ?? "";
        detailsFormData.phone = autofillData.phoneNumbers?.[0] ?? "";
        detailsFormData.email = autofillData.emailAddresses?.[0] ?? "";
      });
    };

    const goToSSNForm = async (
      transition: ApplicationTransition = "forward"
    ) => {
      applicationSectionTransition.value = transition;
      currentApplicationSection.value = "ssn-form";
      steps.value[0].state = "done";
      steps.value[1].state = "active";
      steps.value[2].state = "pending";
    };

    const goToProfileReview = async (
      transition: ApplicationTransition = "forward"
    ) => {
      applicationSectionTransition.value = transition;
      currentApplicationSection.value = "profile-review";
      steps.value[0].state = "done";
      steps.value[1].state = "done";
      steps.value[2].state = "active";
    };

    const goToAgreements = async (
      transition: ApplicationTransition = "forward"
    ) => {
      applicationSectionTransition.value = transition;
      currentApplicationSection.value = "agreements";
      steps.value[0].state = "done";
      steps.value[1].state = "done";
      steps.value[2].state = "active";
    };

    const _goToSubmissionStatus = (
      transition: ApplicationTransition = "forward"
    ) => {
      applicationSectionTransition.value = transition;
      currentApplicationSection.value = "submission-status";
      steps.value[0].state = "done";
      steps.value[1].state = "done";
      steps.value[2].state = "active";
    };

    const submitApplication = () => {
      if (!detailsFormData.agreementsAccepted) {
        return;
      }

      const sanitizedPhoneNumber = String(detailsFormData.phone || "").replace(
        /[()\s-]/g,
        ""
      );
      const sanitizedGovernmentId = String(detailsFormData.ssn || "").replace(
        /[\s-]/g,
        ""
      );

      const payload = {
        product_id: selectedPlan.value?.product_id,
        first_name: detailsFormData.firstName,
        last_name: detailsFormData.lastName,
        email: detailsFormData.email,
        phone_number: sanitizedPhoneNumber,
        dob: moment(detailsFormData.dob, "MM/DD/YYYY").format("YYYY-MM-DD"),
        government_id: sanitizedGovernmentId,
        address: {
          street: detailsFormData.address.address1,
          city: detailsFormData.address.city,
          postcode: detailsFormData.address.postal_code,
          state_province: detailsFormData.address.state,
          country: "USA", // Only USA is supported for virtual cards
        },
      };

      kycData.isSubmitting = true;
      _goToSubmissionStatus();

      const submitKYC = isSubscribedToCloakedPay.value
        ? CardsServices.submitKYC
        : CardsServices.submitVirtualCardApplication;

      posthogCapture("pay_kyc_submitted", {
        selected_plan_id: selectedPlan.value?.product_id,
        selected_plan_name: selectedPlan.value?.name,
        selected_plan_interval: selectedPlan.value?.recurring_interval,
        selected_plan_max_members:
          selectedPlan.value?.max_members?.toString() ?? "",
        current_plan_id: currentSubscription.value?.product_identifier,
        current_plan_name: currentSubscription.value?.product_plan_title,
        current_plan_interval: currentSubscription.value?.recurring_interval,
        current_plan_max_members:
          currentSubscription.value?.max_members?.toString() ?? "",
      });

      submitKYC(payload)
        .then(async () => {
          posthogCapture("pay_kyc_submission_validated");

          // Poll the user until the cloaked card is enabled
          await pollRequest<User | null>({
            timeout: 9000,
            retryDelay: 1000,
            request: async () => {
              const { data } = await UserService.getUserDetails();
              return data.results[0] as User | null;
            },
            shouldStop: (response) => {
              if (!response) return false;
              return response.cloaked_card_enabled_status === "enabled";
            },
            onStop: () => {
              if (isWebviewMode.value) {
                sendWebviewMessage("completed");
                return;
              }

              // Continue the flow after the cloaked card is enabled or the timeout is reached
              isApplicationDone.value = true;
              setCurrentSection("success");

              setTimeout(() => {
                void SubscriptionService.getSubscription();
                // Refresh the user data in the store
                void store.dispatch("authentication/getUser").then(() => {
                  restartApplicationFlow();
                });
              }, 300);
            },
          });
        })
        .catch((error) => {
          setTimeout(() => {
            _handleSubmissionRequestError(error);
            kycData.isSubmitting = false;
          }, 3000);
        });
    };

    const _handleSubmissionRequestError = (errorData: any) => {
      const setSubmissionRequestStepStatus = (kycState: KYCState) => {
        steps.value[0].state = "done";
        steps.value[1].state = "done";

        switch (kycState) {
          case "MAX_ATTEMPTS_REACHED":
          case "RETRY_KYC":
            steps.value[2].state = "error";
            break;
          case "PENDING_KYC":
          case "MANUAL_REVIEW":
            steps.value[2].state = "warning";
            break;
          default:
            break;
        }
      };

      const data = errorData?.response?.data || {};
      const edd = errorData.response?.data?.edd;

      const { getKYCFailureMessage } = useKYC(
        isSubscribedToCloakedPay.value
          ? KYCFlowEnum.NEW_USER_SUBSCRIPTION
          : KYCFlowEnum.EXISTING_USER_SUBSCRIPTION
      );

      const failureStatus = getKYCFailureMessage(data);
      kycData.kycFailureStatus = failureStatus;

      if (edd) {
        kycData.eddBehavior = edd?.behavior;
        kycData.requiredDocuments = edd?.required_documents || [];
      }

      setSubmissionRequestStepStatus(failureStatus.state);
      posthogCapture("pay_kyc_submission_failed", {
        state: failureStatus.state,
      });
    };

    return {
      steps,
      userMergedAutofill,
      kycData,
      detailsFormData,
      isAutofillLoading,
      currentSection,
      currentApplicationSection,
      applicationSectionTransition,
      currentSubscription,
      upgradePlanOptions,
      isApplicationDone,
      selectedPlan,
      isSubscribedToCloakedPay,
      setSelectedPlan,
      setCurrentSection,
      goBack,
      restartApplicationFlow,
      openFinishApplicationFlowModal,
      goToUpgradePlan,
      goToDetailsForm,
      goToSSNForm,
      goToProfileReview,
      goToAgreements,
      submitApplication,
    };
  }
);
