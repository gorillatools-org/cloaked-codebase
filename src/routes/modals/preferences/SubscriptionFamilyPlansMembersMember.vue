<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
import { computed, ref } from "vue";
import Button from "@/features/Button.vue";
import AppCard from "@/features/ui/AppCard.vue";
import SubscriptionModalRemoveMember from "@/routes/modals/preferences/SubscriptionModalRemoveMember.vue";

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
  dateFormatter.format(new Date(props.member.accepted_at))
);

const isModalOpen = ref(false);
</script>

<template>
  <AppCard class="plan-member plan-member--member">
    <InlineSvg
      name="verified"
      class="plan-member__icon"
    />
    <div>
      <h4 class="plan-member__name">
        {{ member.recipient_email }}
      </h4>
      <p class="plan-member__joined-at">
        <span class="plan-member__invite-status">Accepted •</span>
        Joined {{ formattedDate }}
      </p>
    </div>
    <div class="plan-member__actions">
      <Button
        type="danger-secondary"
        size="md"
        @click="isModalOpen = true"
      >
        Remove
      </Button>
    </div>
  </AppCard>
  <SubscriptionModalRemoveMember
    :member="member"
    :value="isModalOpen"
    @input="isModalOpen = $event"
  />
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.plan-member {
  &__icon {
    @at-root .plan-member--member & {
      color: $color-success;
    }
  }
}
</style>
