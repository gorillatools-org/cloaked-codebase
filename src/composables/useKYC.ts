import type { WalletStatusSectionProps } from "@/features/Wallet/WalletStatusSection.vue";
import type { BaseMedallionProps } from "@/library/BaseMedallion.vue";
import { EDDBehaviorEnum, type KYCApiResponse } from "@/types/Wallet/kyc";

export type KYCStatusButtonAction = "close" | "tryAgain" | "emailSupport";

export enum KYCFlowEnum {
  DEFAULT = "default",
  EXISTING_USER_SUBSCRIPTION = "existing-user-subscription",
  NEW_USER_SUBSCRIPTION = "new-user-subscription",
}

export type KYCState =
  | "LOADING"
  | "PENDING"
  | "MAX_ATTEMPTS_REACHED"
  | "REJECT_KYC"
  | "PENDING_KYC"
  | "MANUAL_REVIEW"
  | "RETRY_KYC"
  | "PAYMENT_PROCESSING"
  | "PAYMENT_ERROR"
  | "ONE_ATTEMPT_REMAINING";

export interface KYCStatusSpecs {
  state: KYCState;
  statusSectionProps: WalletStatusSectionProps;
  primaryButtonAction?: KYCStatusButtonAction;
  secondaryButtonAction?: KYCStatusButtonAction;
}

// EDD Document Type to readable text mapping
export const EDD_DOCUMENT_EXAMPLES: Record<string, string[]> = {
  GOVERNMENT_ISSUED_ID: [
    "U.S. Driver's License",
    "U.S. Passport or Passport Card",
  ],
  SSN_PROOF: ["Social Security Card", "W-2 Form"],
  ADDRESS_PROOF: [
    "Utility bill (gas, water, electric)",
    "Bank or credit card statement",
  ],
};

/**
 * Composable for handling KYC and EDD (Enhanced Due Diligence) logic
 */
export function useKYC(flow: KYCFlowEnum = KYCFlowEnum.DEFAULT) {
  const getEddDocumentsDescriptions = (documentTypes: string[]) => {
    if (documentTypes.length === 0) {
      return [];
    }

    return documentTypes
      .map((type) => {
        const docExamples = EDD_DOCUMENT_EXAMPLES[type];
        if (docExamples == null) {
          console.warn(`Unknown document type: ${type}`);
          return [""];
        }
        return docExamples;
      })
      .filter(Boolean);
  };

  const _getStatusesButton = () => {
    return {
      backButton: {
        text: "Close",
        action: "close",
      },
      tryAgainButton: {
        text: "Try again",
        action: "tryAgain",
      },
      emailSupportButton: {
        text: "Contact Cloaked Support",
        action: "emailSupport",
      },
    } as Record<
      "backButton" | "tryAgainButton" | "emailSupportButton",
      {
        text: string;
        action: KYCStatusButtonAction;
      }
    >;
  };

  const _getStatusesMedallion = () => {
    return {
      error: {
        size: "lg",
        color: "error",
        icon: "info",
      },
      pending: {
        size: "lg",
        color: "yield",
        icon: "calendar",
      },
    } as Record<"error" | "pending", BaseMedallionProps>;
  };

  // Centralized status configurations for each KYC state
  const getKYCStatusConfigs = (): Record<
    KYCState,
    {
      statusSectionProps: WalletStatusSectionProps;
      primaryButtonAction?: KYCStatusButtonAction;
      secondaryButtonAction?: KYCStatusButtonAction;
    }
  > => {
    const { backButton, tryAgainButton, emailSupportButton } =
      _getStatusesButton();
    const { error: errorMedallion, pending: pendingMedallion } =
      _getStatusesMedallion();

    const isExistingUserSubscription =
      flow === KYCFlowEnum.EXISTING_USER_SUBSCRIPTION;

    const isNewUserSubscription = flow === KYCFlowEnum.NEW_USER_SUBSCRIPTION;

    const defaultPendingDescription =
      "We're reviewing your information. We'll notify you by email once verification is complete.";
    const pendingDescription = isExistingUserSubscription
      ? `${defaultPendingDescription} <br/><br/> You will only be billed upon successful identity verification.`
      : defaultPendingDescription;

    const defaultRetryDescription =
      "We couldn't verify your identity from the information provided. Please contact Cloaked Support or submit additional documentation.";
    const retryDescription = isExistingUserSubscription
      ? `${defaultRetryDescription} <br/><br/> You will only be billed upon successful identity verification.`
      : defaultRetryDescription;

    return {
      LOADING: {
        statusSectionProps: {
          title: "Checking verification status",
          description: "Please wait while we load your verification status.",
          medallion: pendingMedallion,
        },
        secondaryButtonAction: backButton.action,
      },
      PENDING: {
        statusSectionProps: {
          title: "We're reviewing your information",
          description: pendingDescription,
          medallion: pendingMedallion,
          primaryButtonIcon: isNewUserSubscription ? "arrow-right" : undefined,
          primaryButtonText: isNewUserSubscription
            ? "Finish profile"
            : emailSupportButton.text,
          secondaryButtonText: isNewUserSubscription
            ? emailSupportButton.text
            : backButton.text,
        },
        primaryButtonAction: isNewUserSubscription
          ? "close"
          : emailSupportButton.action,
        secondaryButtonAction: isNewUserSubscription
          ? emailSupportButton.action
          : backButton.action,
      },
      MANUAL_REVIEW: {
        statusSectionProps: {
          // Intentionally minimal; UI will render manual review requirements elsewhere
        },
      },
      MAX_ATTEMPTS_REACHED: {
        statusSectionProps: {
          title: "We weren't able to verify your identity",
          description: "You're no longer eligible for Cloaked Pay.",
          medallion: errorMedallion,
          primaryButtonText: emailSupportButton.text,
          secondaryButtonText: backButton.text,
        },
        primaryButtonAction: emailSupportButton.action,
        secondaryButtonAction: backButton.action,
      },
      REJECT_KYC: {
        // Same as MAX_ATTEMPTS_REACHED
        statusSectionProps: {
          title: "We weren't able to verify your identity",
          description: "You're no longer eligible for Cloaked Pay.",
          medallion: errorMedallion,
          primaryButtonText: emailSupportButton.text,
          secondaryButtonText: backButton.text,
        },
        primaryButtonAction: emailSupportButton.action,
        secondaryButtonAction: backButton.action,
      },
      RETRY_KYC: {
        statusSectionProps: {
          title: "Identity verification failed",
          description: retryDescription,
          medallion: errorMedallion,
          primaryButtonText: tryAgainButton.text,
          secondaryButtonText: emailSupportButton.text,
        },
        primaryButtonAction: tryAgainButton.action,
        secondaryButtonAction: emailSupportButton.action,
      },
      PENDING_KYC: {
        statusSectionProps: {
          title: "We couldn't verify your identity just yet",
          description: "Contact Cloaked Support for further assistance.",
          medallion: errorMedallion,
          secondaryButtonText: emailSupportButton.text,
        },
        secondaryButtonAction: emailSupportButton.action,
      },
      PAYMENT_PROCESSING: {
        statusSectionProps: {
          title: "We're processing your payment",
          description:
            "If this is taking longer than expected, please contact Cloaked Support.",
          medallion: pendingMedallion,
          secondaryButtonText: emailSupportButton.text,
        },
        secondaryButtonAction: emailSupportButton.action,
      },
      PAYMENT_ERROR: {
        statusSectionProps: {
          title: "Payment failed",
          description:
            "We were unable to process your payment. Please contact Cloaked Support.",
          medallion: errorMedallion,
          secondaryButtonText: emailSupportButton.text,
        },
        secondaryButtonAction: emailSupportButton.action,
      },
      ONE_ATTEMPT_REMAINING: {
        statusSectionProps: {
          title: "One attempt remaining",
          description:
            "Please review your information carefully before submitting again, or contact Cloaked Support to submit additional documentation.",
          medallion: errorMedallion,
          primaryButtonText: tryAgainButton.text,
          secondaryButtonText: emailSupportButton.text,
        },
        primaryButtonAction: tryAgainButton.action,
        secondaryButtonAction: emailSupportButton.action,
      },
    };
  };

  const getKYCFailureMessage = (
    data: KYCApiResponse["data"]
  ): KYCStatusSpecs => {
    const statusConfigs = getKYCStatusConfigs();

    // Default failure status: contact support only, no retry button
    const defaultFailureStatus: KYCStatusSpecs = {
      state: "PENDING_KYC",
      ...statusConfigs.PENDING_KYC,
    };

    if (!data) {
      return defaultFailureStatus;
    }

    const { message, edd } = data || {};
    const behavior = edd?.behavior;
    const remaining_attempts = edd?.remaining_attempts;

    // Pending KYC - Check first to ensure it takes precedence
    if (behavior === EDDBehaviorEnum.PENDING_KYC) {
      return {
        state: "PENDING_KYC",
        ...statusConfigs.PENDING_KYC,
      };
    }

    // Pending - Manual review
    if (behavior === EDDBehaviorEnum.MANUAL_REVIEW) {
      return {
        state: "MANUAL_REVIEW",
        ...statusConfigs.MANUAL_REVIEW,
      };
    }

    // KYC rejected
    if (behavior === EDDBehaviorEnum.REJECT_KYC) {
      return {
        state: "REJECT_KYC",
        ...statusConfigs.REJECT_KYC,
      };
    }

    // Error - Max attempts reached
    if (
      (message && message.includes("Max KYC attempts reached.")) ||
      remaining_attempts === 0
    ) {
      return {
        state: "MAX_ATTEMPTS_REACHED",
        ...statusConfigs.MAX_ATTEMPTS_REACHED,
      };
    }

    // Error - Can retry
    if (
      remaining_attempts &&
      remaining_attempts > 0 &&
      behavior === EDDBehaviorEnum.RETRY_KYC
    ) {
      const isLastAttempt = remaining_attempts === 1;
      if (isLastAttempt) {
        return {
          state: "ONE_ATTEMPT_REMAINING",
          ...statusConfigs.ONE_ATTEMPT_REMAINING,
        };
      }

      return {
        state: "RETRY_KYC",
        ...statusConfigs.RETRY_KYC,
      };
    }

    return defaultFailureStatus;
  };

  return {
    getEddDocumentsDescriptions,
    getKYCFailureMessage,
    getKYCStatusConfigs,
  };
}
