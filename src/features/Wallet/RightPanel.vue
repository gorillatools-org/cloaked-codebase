<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import store from "@/store";
import inlineSvg from "@/features/InlineSvg.vue";
import TransactionDetails from "./RightPanel/TransactionDetails.vue";
import CardDetails from "./RightPanel/CardDetails.vue";
import SettingsDetails from "./RightPanel/SettingsDetails.vue";
import DeleteCard from "./RightPanel/DeleteCard.vue";
import { useToast } from "@/composables/useToast.js";
import router from "@/routes/router";
import CardsServices from "@/api/actions/cards-services";
import { tools } from "@/scripts/tools";

const isDeleting = ref(false);
const toast = useToast();

const transaction = computed(() => {
  return store.state.cards.rightPanel?.transaction;
});

const card = computed(() => {
  return store.state.cards.rightPanel?.card;
});

const settings = computed(() => {
  return store.state.cards.rightPanel?.settings;
});

const active = computed(() => {
  return store.state.cards.rightPanel?.show;
});

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
});

function identity(id) {
  const identity = store.state.localdb.db_cloaks.find((item) => item.id === id);
  return identity;
}

function close() {
  if (isDeleting.value) return;
  store.commit("closeRightPanel");
}

function copyToClipboard(text) {
  tools.copyToClipboard(text);
  toast.success("Copied to clipboard");
}

function showDeleteModal() {
  return store.dispatch("openModal", {
    header: "Cancel card",
    paragraphs: [
      "Are you sure you want to cancel this card? This card's activity will still be accessible should you need to download it later.",
    ],
    button: {
      text: "Yes, cancel card",
      danger: true,
      onClick: deleteCard,
    },
  });
}

function deleteCard() {
  isDeleting.value = true;

  CardsServices.deleteCard(card.value.identity_id, card.value.id)
    .then(() => {
      router
        .push("/wallet")
        .then(() => {
          setTimeout(() => {
            store.dispatch("addCardList", "");
            store.dispatch("closeRightPanel");
            CardsServices.getCardList();
          }, 1);
        })
        .catch((e) => e);
    })
    .catch((err) => {
      toast.error(
        err.response?.data?.message || "Failed to cancel Virtual Card."
      );
    })
    .finally(() => {
      isDeleting.value = false;
    });
}

function handleKeydown(e) {
  if (e.key === "Escape" && active.value && !isDeleting.value) {
    close();
  }
}
</script>

<template>
  <div>
    <div
      class="right-panel"
      tabindex="0"
      :class="{ active: active, loading: isDeleting }"
    >
      <div class="container">
        <div class="header">
          <h1 v-if="transaction">Transaction details</h1>
          <h1 v-if="card">
            {{ identity(card.identity_id)?.nickname || "New identity" }}
            settings
          </h1>
          <h1 v-if="settings">Wallet settings</h1>

          <div
            class="close"
            @click="close"
          >
            <inlineSvg name="double-chevron-right" />
          </div>
        </div>

        <TransactionDetails v-if="transaction" />
        <CardDetails v-if="card" />
        <SettingsDetails v-if="settings" />

        <div class="footer">
          <DeleteCard
            v-if="card"
            :loading="isDeleting"
            @show-delete-modal="showDeleteModal"
          />

          <div class="id">
            <h1 v-if="transaction">Transaction ID</h1>
            <h1 v-if="card">Virtual Card ID</h1>

            <span
              v-if="transaction"
              @click="copyToClipboard(transaction.id)"
            >
              {{ transaction.id }}
            </span>
            <span
              v-if="card"
              @click="copyToClipboard(card.id)"
            >
              {{ card.id }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div
      class="overlay"
      :class="{ active: active }"
      @click="close"
    />
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.right-panel {
  width: 550px;
  position: fixed;
  bottom: 0;
  right: 0;
  height: 100vh;
  z-index: 451;
  background-color: $color-base-white-100;
  overflow: auto;

  @include custom-scroll-bar;

  transition: all 0.4s ease;

  @include transform(translateX(550px));

  border-left: 1px solid $color-primary-10;

  &.loading {
    pointer-events: none;
  }

  &.active {
    @include transform(translateX(0));
  }

  .container {
    padding: 0 24px 24px;
    min-height: -webkit-fill-available;
    display: flex;
    flex-direction: column;
  }

  .header {
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $color-base-white-100;
    padding: 24px 0;
    z-index: 1;

    h1 {
      color: $color-primary-100;
      font-size: 15px;
      font-style: normal;
      font-weight: 600;
      line-height: normal;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      max-width: 270px;
      width: 100%;
      display: inline-block;
    }

    .close {
      position: absolute;
      width: 36px;
      height: 36px;
      left: 0;
      top: 50%;
      padding: 6px;
      color: $color-primary-100;
      transform: translateY(-50%);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;

      svg {
        width: 14px;
        height: 14px;
        display: block;
      }

      &::after {
        content: "";
        width: 0;
        height: 0;
        border-radius: 50%;
        background-color: $color-primary-100;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: -1;
      }

      &:hover {
        color: $color-primary-1;

        &::after {
          width: 100%;
          height: 100%;
        }
      }
    }
  }

  .footer {
    margin-top: 24px;
    flex: 1;
    display: flex;
    flex-flow: column wrap;
    place-content: stretch flex-end;
    align-items: stretch;
    gap: 24px;
  }

  .id {
    text-align: center;

    h1 {
      color: $color-primary-50;
      font-size: 13px;
      font-style: normal;
      font-weight: 600;
      line-height: normal;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      max-width: 270px;
      width: 100%;
      display: inline-block;
    }

    span {
      display: inline-block;
      padding: 2px 5px;
      border-radius: 4px;
      font-size: 13px;
      color: $color-primary-30;

      &:hover {
        cursor: pointer;
        background-color: $color-primary-10;
        color: $color-primary-50;
      }
    }
  }
}

.overlay {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 104;
  opacity: 0;
  pointer-events: none;
  transition: all 0.4s ease;
  visibility: hidden;
  background: rgba($black, 0.5);

  &.active {
    opacity: 1;
    pointer-events: all;
    visibility: visible;
  }
}
</style>
