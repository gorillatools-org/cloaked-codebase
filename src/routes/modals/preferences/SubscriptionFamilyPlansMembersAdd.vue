<script setup>
import { ref } from "vue";
import SubscriptionInputInvite from "@/routes/modals/preferences/SubscriptionInputInvite.vue";
import SubscriptionModalExceededInvites from "@/routes/modals/preferences/SubscriptionModalExceededInvites.vue";
import { useInvites } from "@/features/subscribe/composables/useInvites.js";

const { freeSpots, inviteMember, isSendingInvite } = useInvites();
const memberEmail = ref("");

const isLimitExceededModalOpen = ref(false);

const onInvite = async () => {
  if (!isSendingInvite.value) {
    try {
      await inviteMember(memberEmail);
      memberEmail.value = "";
    } catch {
      isLimitExceededModalOpen.value = true;
    }
  }
};
</script>

<template>
  <div
    v-if="freeSpots"
    class="plan-member-add"
  >
    <p class="plan-member-add__spots">
      {{ freeSpots }} member {{ freeSpots === 1 ? "spot" : "spots" }} open
    </p>
    <SubscriptionInputInvite
      v-model="memberEmail"
      :is-loading="isSendingInvite"
      @submit="onInvite"
    />
  </div>
  <SubscriptionModalExceededInvites
    :value="isLimitExceededModalOpen"
    @input="isLimitExceededModalOpen = $event"
  />
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.plan-member-add {
  &__spots {
    font-size: 14px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
    color: $color-primary-100;
  }

  .app-form-input {
    margin-top: 16px;
  }
}
</style>
