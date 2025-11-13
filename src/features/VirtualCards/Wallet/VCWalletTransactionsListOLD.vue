<script setup lang="ts">
import { ref, onBeforeMount, computed, watch } from "vue";
import store from "@/store";
import moment from "moment";
import inlineSvg from "@/features/InlineSvg.vue";
import CardsServices from "@/api/actions/cards-services";
import IdentityIcon from "@/features/ui/IdentityIcon.vue";
import { useToast } from "@/composables/useToast.js";
import useVirtualCard from "@/features/VirtualCards/composables/useVirtualCard";
import BaseText from "@/library/BaseText.vue";

type Props = {
  cardId?: string;
};

const props = defineProps<Props>();

const toast = useToast();
const { card } = useVirtualCard(() => props.cardId || "");

const loading = ref(true);

const transactionVariants = {
  pending: { text: "Pending final amount", icon: "pending" },
  declined: { text: "Declined", icon: "block" },
  voided: { text: "Voided", icon: "block" },
  settled: { text: "Purchase", icon: "cash" },
  expired: { text: "Expired", icon: "block" },
  refunded: { text: "Refunded", icon: "refunded" },
  unknown: { text: "Unknown", icon: "cog" },
};

const currentTransaction = computed(() => {
  return store.state.cards.rightPanel.transaction;
});

const transactions = computed(() => {
  return store.state.cards.transactions;
});

onBeforeMount(() => {
  getTransactions();
});

function getTransactions() {
  store.dispatch("setTransactions", { count: 0, results: [] });

  const request = props.cardId
    ? CardsServices.getTransactionsByCardId(props.cardId)
    : CardsServices.getTransactions();
  loading.value = true;

  // Transactions are set in the store
  request
    .catch((error) => {
      toast.error(error.message);
    })
    .finally(() => {
      loading.value = false;
    });
}

function exportTransactions() {
  const request = props.cardId
    ? CardsServices.exportTransactionsForCard(props.cardId)
    : CardsServices.exportTransactions();
  loading.value = true;

  request
    .then((response) => {
      const csvData = response.data;
      const blob = new Blob([csvData], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "cloaked-pay-transactions.csv");
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Transactions exported successfully");
    })
    .catch((error) => {
      toast.error(error.message);
    })
    .finally(() => {
      loading.value = false;
    });
}

function identity(id: any) {
  return store.state.localdb.db_cloaks.find((item: any) => item.id === id);
}

const transactionStatus = (status: keyof typeof transactionVariants) => {
  return transactionVariants[status];
};

function convertToDollar(amount: number) {
  return (amount / 100)
    .toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })
    .replace(/\.0+$/, "");
}

function addTransaction(transaction: any) {
  store.commit("openTransactionRightPanel", transaction);
}

watch(
  () => props.cardId,
  () => {
    getTransactions();
  }
);
</script>

<template>
  <div class="transactions">
    <div class="title">
      <BaseText
        v-if="!loading"
        class="title-text"
        variant="headline-5-bold"
      >
        {{ card?.identity_name || "All" }} activity
      </BaseText>
      <div
        v-if="loading"
        class="loading"
      />
      <div
        v-if="!loading"
        class="download"
        @click="exportTransactions"
      >
        <inlineSvg name="download" />
      </div>
    </div>

    <div
      v-if="!loading"
      class="list"
    >
      <div v-if="transactions.count !== 0">
        <div
          v-for="transaction in transactions.results"
          :key="transaction.id"
          class="transaction"
          :class="{ active: transaction?.id === currentTransaction?.id }"
          @click="addTransaction(transaction)"
        >
          <IdentityIcon
            class="icon"
            :identity="identity(JSON.parse(transaction?.identity || 0))"
          />

          <div class="information">
            <p>
              <span v-if="transaction.identity">
                {{
                  identity(JSON.parse(transaction.identity))?.nickname ||
                  "Deleted Identity"
                }}
              </span>
              <span v-else>Physical card</span>
              <span v-if="transactionStatus(transaction.status)">
                {{ transactionStatus(transaction.status)?.text }}
                <inlineSvg
                  :name="transactionStatus(transaction.status)?.icon"
                />
              </span>
            </p>
            <p>
              {{
                moment(transaction.created_at).format("MMMM Do YYYY, h:mm A")
              }}
            </p>
          </div>

          <div
            class="amount"
            :class="transaction.status"
          >
            <span>{{ convertToDollar(transaction.transaction_amount) }}</span>
          </div>

          <inlineSvg
            class="view-more"
            name="chevron-right"
          />
        </div>
      </div>
      <div
        v-else
        class="empty"
      >
        <p>No transactions found</p>
      </div>
    </div>

    <div
      v-if="loading"
      class="loader"
    >
      <inlineSvg name="loading-small" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.transactions {
  width: 100%;

  .title {
    margin: 0 16px 24px;
    display: flex;

    .title-text {
      flex: 1;
      &::first-letter {
        text-transform: uppercase;
      }
    }

    .download {
      cursor: pointer;
    }

    .loading {
      height: 27.5px;
      background-color: $color-primary-20;
      border-radius: 20px;
      flex: 1;
    }
  }

  .list {
    border: 1px solid $color-base-black-10;
    border-radius: 20px;
    overflow: hidden;
  }

  .loader {
    border: 1px solid $color-base-black-10;
    border-radius: 20px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-primary-100;

    svg {
      width: 30px;
      height: 30px;
    }
  }

  .empty {
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;

    p {
      font-size: 14px;
      font-weight: 400;
      color: $color-primary-70;
    }
  }

  .transaction {
    padding: 16px 39px 16px 16px;
    display: flex;
    align-items: center;
    color: $color-primary-100;
    position: relative;
    border-top: 1px solid $color-base-black-10;

    &.active {
      background-color: $color-primary-10;

      &:hover {
        background-color: $color-primary-10;
      }
    }

    &:first-of-type {
      border-top: none;
    }

    &:hover {
      background-color: $color-primary-10;
      cursor: pointer;
    }

    .icon {
      width: 48px !important;
      height: 48px !important;
      border-radius: 50%;
      background-color: $color-primary-20;
      margin-right: 8px;
    }

    .information {
      flex: 1;

      p {
        font-size: 15px;
        font-weight: 500;

        &:last-of-type {
          color: $color-primary-50;
          font-weight: 400;
          font-size: 13px;
        }

        span {
          display: inline-flex;
          align-items: center;

          svg {
            width: 19px;
            height: 19px;
            margin-left: 4px;
            display: inline-block;
          }

          &:nth-of-type(2) {
            margin-left: 15px;
            position: relative;

            &::before {
              content: "";
              width: 4px;
              height: 4px;
              border-radius: 50%;
              background-color: $color-primary-100;
              position: absolute;
              top: 50%;
              left: -9px;
              transform: translateY(-50%);
            }
          }
        }
      }
    }

    .amount {
      span {
        display: inline-block;
        font-size: 15px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
      }

      &.refunded {
        span {
          &::before {
            content: "+ ";
          }

          color: $color-success;
        }
      }

      &.pending {
        span {
          opacity: 0.6;
        }
      }

      &.declined {
        span {
          color: $color-alert;
        }
      }
    }

    .view-more {
      width: 14px;
      height: 14px;
      color: $color-primary-50;
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      padding: 2px;
    }
  }
}
</style>
