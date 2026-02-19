<script setup>
import { computed } from "vue";
import store from "@/store";
import CardExampleGroup from "@/features/Wallet/CardExampleGroup.vue";
import VirtualCardsOffboardedUserSection from "@/features/VirtualCards/Sections/VirtualCardsOffboardedUserSection.vue";
import VirtualCardsWaitlistSection from "@/features/VirtualCards/Sections/VirtualCardsWaitlistSection.vue";

// Used to show the offboarded section
const shouldContactSupport = computed(() => {
  const user = store.state.authentication?.user;
  return user?.cloaked_card_onboarded && !user?.cloaked_card_enabled;
});
</script>

<template>
  <section class="waitlist">
    <VirtualCardsOffboardedUserSection v-if="shouldContactSupport" />
    <VirtualCardsWaitlistSection v-else />

    <CardExampleGroup
      v-if="shouldContactSupport"
      class="waitlist__card-examples"
    />
  </section>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.waitlist {
  position: relative;
  overflow: hidden !important;

  .waitlist {
    &__card-examples {
      position: absolute;
      left: 580px;
      top: 180px;
    }
  }
}
</style>
