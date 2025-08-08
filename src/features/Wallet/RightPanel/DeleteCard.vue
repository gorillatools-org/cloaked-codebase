<script setup>
import BaseButton from "@/library/BaseButton.vue";
import store from "@/store";
import router from "@/routes/router";
import CardsServices from "@/api/actions/cards-services";

const props = defineProps({
  cardId: {
    type: String,
    required: true,
  },
  identityId: {
    type: Number,
    required: true,
  },
});

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
  router.push("/wallet").catch((e) => e);
  store.dispatch("closeRightPanel");
  store.dispatch("addCardList", "");

  CardsServices.deleteCard(props.identityId, props.cardId).then(() => {
    CardsServices.getCardList();
  });
}
</script>

<template>
  <div>
    <BaseButton
      size="lg"
      variant="primary"
      backgroundColor="danger"
      fullWidth
      @click="showDeleteModal()"
    >
      Cancel card
    </BaseButton>
  </div>
</template>
