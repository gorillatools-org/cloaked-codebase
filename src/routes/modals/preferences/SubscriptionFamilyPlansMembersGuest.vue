<script setup>
import { computed, ref } from "vue";
import InlineSvg from "@/features/InlineSvg.vue";
import SubscriptionModalLeavePlan from "@/routes/modals/preferences/SubscriptionModalLeavePlan.vue";
import Button from "@/features/Button.vue";
import AppCard from "@/features/ui/AppCard.vue";

const props = defineProps({
  member: {
    type: Object,
    required: true,
  },
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const formattedDate = computed(() =>
  dateFormatter.format(new Date(props.member.joined_at))
);

const isModalOpen = ref(false);
</script>

<template>
  <AppCard
    type="outline"
    class="plan-member"
    v-bind="$attrs"
  >
    <InlineSvg
      name="user-key"
      class="plan-member__icon plan-member__icon--neutral"
    />
    <div>
      <h4 class="plan-member__name">You are a member</h4>
      <p class="plan-member__joined-at">Joined {{ formattedDate }}</p>
    </div>
    <div class="plan-member__actions">
      <Button
        type="danger-secondary"
        size="md"
        @click="isModalOpen = true"
      >
        Leave plan
      </Button>
    </div>
  </AppCard>
  <SubscriptionModalLeavePlan
    :value="isModalOpen"
    @input="isModalOpen = $event"
  />
</template>
