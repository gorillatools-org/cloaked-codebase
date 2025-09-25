<script setup>
import { computed, markRaw } from "vue";
import { useToast } from "@/composables/useToast.js";
import { useRoute } from "vue-router";
import store from "@/store";
import InformationHeader from "./InformationHeader.vue";
import DetailSection from "./DetailSection.vue";
import CardsServices from "@/api/actions/cards-services";
import IdentityService from "@/api/actions/identity-service";
import PatchSelfDestructModal from "@/features/modals/Wallet/PatchSelfDestructModal.vue";
import useVirtualCard from "@/composables/Wallet/useVirtualCard";

const route = useRoute();
const toast = useToast();
const { openFundingSourcePatchModal } = useVirtualCard(() => card);

const card = computed(() => {
  if (route.params.id && store.state.cards?.cards?.results) {
    return store.state.cards.cards.results.find(
      (card) => card.id === route.params.id
    );
  }
  return {};
});

function toggleMerchantLock() {
  const newLockedValue = !card.value.is_merchant_locked;

  store.dispatch("updateCard", {
    ...card.value,
    is_merchant_locked: newLockedValue,
  });

  CardsServices.patchUpdateCloakedCardDetails(card.value.id, {
    is_merchant_locked: newLockedValue,
  })
    .then((response) => {
      IdentityService.patchIdentityUpdatedAt(card.value.identity_id);
      if (response.data.is_merchant_locked) {
        toast.success("Merchant locking enabled");
      } else {
        toast.success("Merchant locking disabled");
      }
    })
    .catch((error) => {
      toast.error(error.response.data.detail);
      store.dispatch("updateCard", {
        ...card.value,
        is_merchant_locked: !newLockedValue,
      });
    });
}

function lockCard() {
  store.dispatch("updateCard", { ...card.value, state: "locked_by_user" });

  CardsServices.lockCard(card.value.identity_id, card.value.id)
    .then(() => {
      toast.success("Card locked");
    })
    .catch((error) => {
      toast.error(error.response.data.detail);
      store.dispatch("updateCard", { ...card.value, state: "unlocked" });
    });
}

function unlockCard() {
  store.dispatch("updateCard", { ...card.value, state: "unlocked" });

  CardsServices.unlockCard(card.value.identity_id, card.value.id)
    .then(() => {
      toast.success("Card unlocked");
    })
    .catch((error) => {
      toast.error(error.response.data.detail);
      store.dispatch("updateCard", { ...card.value, state: "unlocked" });
    });
}

function toggleCardLock() {
  const state = card.value.state;

  if (state === "locked_by_user" || state === "locked_by_system") {
    unlockCard();
  } else {
    lockCard();
  }
}

const currentCard = computed(() => {
  if (route.params.id && store.state.cards.cards.results) {
    return store.state.cards.cards.results.find(
      (card) => card.id === route.params.id
    );
  } else {
    return "";
  }
});

const fundingSources = computed(() => {
  return store.state.cards.fundingSources.results;
});

const currentCardFundingSource = computed(() => {
  if (currentCard.value?.funding_source) {
    return fundingSources.value.find(
      (source) => source.id === currentCard.value.funding_source
    );
  } else {
    return null;
  }
});

const openSelfDestruct = () => {
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(PatchSelfDestructModal),
      props: {
        isVisible: true,
        currentCardID: currentCard.value.id,
        currentSource: currentCardFundingSource.value,
        currentCard: currentCard.value,
      },
    },
  });
};

const subtext = computed(() => {
  const pan = "•••• " + currentCardFundingSource.value?.pan_last_four;
  const nickname = currentCardFundingSource.value?.nickname;

  if (pan && nickname) {
    return `${pan} • ${nickname}`;
  } else if (currentCardFundingSource.value?.pan_last_four) {
    return pan;
  } else {
    return null;
  }
});

const loading = computed(() => {
  if (!currentCardFundingSource.value) {
    return true;
  } else {
    return false;
  }
});

const cardState = computed(() => {
  const state = card.value.state;
  if (state === "locked_by_user" || state === "locked_by_system") {
    return true;
  } else {
    return false;
  }
});
</script>

<template>
  <div>
    <InformationHeader :information="card" />

    <div class="details">
      <DetailSection
        title="Lock card"
        description="Disable all transactions while card is locked"
        icon="lock-filled"
        multi-line
        toggle
        :toggle-status="cardState"
        :disabled="card.state === 'locked_by_system'"
        @toggle-clicked="toggleCardLock"
      />

      <DetailSection
        title="Merchant locking"
        description="Lock this card to a single merchant after the first transaction"
        icon="merchant-lock"
        multi-line
        toggle
        :toggle-status="card.is_merchant_locked"
        @toggle-clicked="toggleMerchantLock"
      />

      <div class="sources">
        <DetailSection
          :loading="loading"
          icon="bank"
          :description="
            currentCardFundingSource?.card_brand + '\n' + subtext || 'Unknown'
          "
          multi-line
          title="Funding Source"
          link
          @click="openFundingSourcePatchModal"
        />
      </div>

      <div class="self-destruct">
        <!-- need css ^ -->
        <DetailSection
          :loading="loading"
          icon="delete"
          description="Set a self destruct timer for this Virtual Card"
          title="Self-Destruct"
          link
          @click="openSelfDestruct"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.details {
  > * {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.sources {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
