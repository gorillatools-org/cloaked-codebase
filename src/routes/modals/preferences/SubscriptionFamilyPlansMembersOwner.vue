<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
import { computed } from "vue";
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
</script>

<template>
  <AppCard
    type="background"
    class="plan-member plan-member--owner"
  >
    <InlineSvg
      name="user-key"
      class="plan-member__icon plan-member__icon--neutral"
    />
    <div>
      <h4 class="plan-member__name">You</h4>
      <p class="plan-member__joined-at">Joined {{ formattedDate }}</p>
    </div>
    <div class="plan-member__role">Subscription owner</div>
  </AppCard>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.plan-member {
  &--owner {
    background-color: $color-primary-5;
  }

  &__role {
    font-size: 10px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    color: $color-primary-100;

    @media all and (min-width: $screen-lg) {
      margin-left: auto;
    }
  }
}
</style>
