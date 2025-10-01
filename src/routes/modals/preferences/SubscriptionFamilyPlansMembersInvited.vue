<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
import { computed, ref } from "vue";
import Button from "@/features/Button.vue";
import AppCard from "@/features/ui/AppCard.vue";
import SubscriptionModalCancelInvite from "@/routes/modals/preferences/SubscriptionModalCancelInvite.vue";
import { copyToClipboard } from "@/scripts/tools";
import { useToast } from "@/composables/useToast.js";

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
  dateFormatter.format(new Date(props.member.created_at))
);

const { success } = useToast();

const onCopyInviteLink = () => {
  copyToClipboard(`${window.location.origin}/invitation/${props.member.code}`);
  success("Invite link copied!");
};

const isModalOpen = ref(false);
</script>

<template>
  <AppCard class="plan-member plan-member--invited">
    <InlineSvg
      name="pending"
      class="plan-member__icon"
    />
    <div>
      <h4 class="plan-member__name">
        {{ member.recipient_email }}
      </h4>
      <p class="plan-member__invited-at">
        <span
          v-if="member.status"
          class="plan-member__invite-status"
        >
          {{ member.status }} •
        </span>
        Invited {{ formattedDate }}
      </p>
    </div>
    <div class="plan-member__actions">
      <Button
        size="md"
        @click="onCopyInviteLink"
      >
        Invite link
        <InlineSvg name="copy" />
      </Button>
      <Button
        type="secondary"
        size="md"
        @click="isModalOpen = true"
      >
        Cancel
      </Button>
    </div>
  </AppCard>
  <SubscriptionModalCancelInvite
    :invite="member"
    :value="isModalOpen"
    @input="isModalOpen = $event"
  />
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.plan-member {
  &__icon {
    @at-root .plan-member--invited & {
      color: $color-in-progress;
    }
  }
}
</style>
