import { toValue } from "@vueuse/core";
import { computed, type MaybeRefOrGetter } from "vue";
import useWalletTransactions from "./useWalletTransactions";
import type { Transaction } from "@/types/Wallet/transaction";
import store from "@/store";
import moment from "moment";
import { formatCurrency } from "../utils/currency-utils";
import useFundingSource from "@/composables/Wallet/useFundingSource";
import { capitalizeFirstLetter } from "@/scripts/format";
import {
  TRANSACTION_REJECTION_REASON_DESCRIPTIONS,
  TRANSACTION_STATUS_DESCRIPTIONS,
} from "../constants/transaction-constants";

export default function useWalletTransaction(
  transactionId?: MaybeRefOrGetter<string | undefined | null>
) {
  const { transactions } = useWalletTransactions();
  const { fundingSources } = useFundingSource();

  const transactionIdValue = computed(() => {
    return toValue(transactionId);
  });

  const transaction = computed(() => {
    return transactions.value?.find(
      (transaction: Transaction) => transaction.id === transactionIdValue.value
    );
  });

  const transactionFundingSource = computed(() => {
    if (!transaction.value?.funding_source) return null;
    return fundingSources.value?.find(
      (source) => source.id === transaction.value?.funding_source
    );
  });

  const transactionIdentity = computed(() => {
    return (
      store.state.localdb?.db_cloaks?.find(
        (item: any) => item.id === transaction.value?.identity
      ) ?? null
    );
  });

  const merchantIdentity = computed(() => {
    return {
      logo_url: transaction.value?.merchant_logo_url,
      cloak_brand_color: "crest_blue", // Logo fallback color
    };
  });

  const dateFormatted = computed(() => {
    return moment(transaction.value?.created_at).format("MMM D, h:mm A");
  });

  const amountFormatted = computed(() => {
    const formatted = formatCurrency(
      transaction.value?.transaction_amount ?? 0
    );

    if (transaction.value?.status === "settled") {
      return `- ${formatted}`;
    }

    if (transaction.value?.status === "refunded") {
      return `+ ${formatted}`;
    }

    return formatted;
  });

  const rejectionReasonDescription = computed(() => {
    if (
      transaction.value?.status === "declined" &&
      transaction.value?.rejection_reason
    ) {
      return (
        TRANSACTION_REJECTION_REASON_DESCRIPTIONS[
          transaction.value?.rejection_reason
        ] || null
      );
    }
    return null;
  });

  const statusDescription = computed(() => {
    const description =
      TRANSACTION_STATUS_DESCRIPTIONS[transaction.value?.status ?? "unknown"] ||
      capitalizeFirstLetter(transaction.value?.status ?? "unknown");

    if (rejectionReasonDescription.value) {
      return `${description} • ${rejectionReasonDescription.value}`;
    }

    return description;
  });

  const identityDisplayName = computed(() => {
    const nickname = transactionIdentity.value?.nickname || "Deleted Identity";
    const canceledText = transaction.value?.is_card_canceled
      ? "(Canceled)"
      : "";

    return `${nickname} ${canceledText}`.trim();
  });

  const statusTagColor = computed(() => {
    switch (transaction.value?.status) {
      case "authorization":
      case "pending":
        return "status-yield";
      case "settled":
      case "refunded":
        return "safe-zone-green";
      case "voided":
      case "expired":
      case "declined":
        return "status-error";
      default:
        return "cloaked";
    }
  });

  const statusTagTooltip = computed(() => {
    const status = transaction.value?.status;

    if (status === "pending") {
      return `Your transaction is processing and funds haven't been withdrawn from your funding source. If it stays pending for more than 5 days, please reach out to support@cloaked.com for assistance.`;
    }

    if (status === "settled") {
      return `This transaction has been processed successfully, and funds will be withdrawn from your funding source.`;
    }

    if (status === "authorization") {
      return `A hold has been placed for the authorized amount, but funds haven't been withdrawn from your funding source.`;
    }

    if (status === "declined") {
      if (rejectionReasonDescription.value) {
        return `The transaction was declined. Please review the decline reason or contact support@cloaked.com for assistance.`;
      }

      return `The transaction was declined, so funds were not withdrawn from your funding source. Please contact support@cloaked.com for assistance.`;
    }

    if (status === "refunded") {
      return `The merchant has refunded this transaction. Funds will be credited back to the funding source linked to this transaction. If you do not see this return to your transaction within 10 business days, please reach out to support@cloaked.com.`;
    }

    if (status === "expired") {
      return `Authorization has expired. No funds have been deducted from your funding source. Please retry the transaction.`;
    }

    if (status === "voided") {
      return `The transaction was canceled before processing was completed. No funds have been deducted from your funding source.`;
    }

    return `We couldn’t determine the transaction status. Please try again later or contact support@cloaked.com if this persists.`;
  });

  return {
    transaction,
    transactionIdentity,
    merchantIdentity,
    dateFormatted,
    amountFormatted,
    statusDescription,
    statusTagColor,
    statusTagTooltip,
    transactionFundingSource,
    identityDisplayName,
  };
}
