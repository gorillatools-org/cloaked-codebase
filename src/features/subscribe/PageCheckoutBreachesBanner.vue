<script setup>
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";

defineProps({
  dataScanBreachesCount: {
    type: Number,
    default: 0,
  },
  breachStatus: {
    type: String,
    default: "Unknown",
  },
});
</script>

<template>
  <div class="checkout-breaches-banner">
    <div class="checkout-breaches-banner__icon">
      <BaseIcon
        name="scan-filled"
        class="checkout-breaches-banner__icon-svg"
      />
    </div>
    <div class="checkout-breaches-banner__content">
      <BaseText
        as="h2"
        variant="body-small-medium"
        class="checkout-breaches-banner__text"
      >
        Threat Level:
        <span class="checkout-breaches-banner__threat-level">
          {{ breachStatus }}
        </span>
      </BaseText>
      <BaseText
        as="p"
        variant="headline-6-bold"
        class="checkout-breaches-banner__text"
      >
        Your personal info was exposed,
        <span class="checkout-breaches-banner__threat-count">
          {{ dataScanBreachesCount }}
        </span>
        compromised
        {{ dataScanBreachesCount === 1 ? "record" : "records" }}
        found
      </BaseText>
    </div>
  </div>
</template>

<style scoped lang="scss">
.checkout-breaches-banner {
  border: 1px solid $color-status-error;
  padding: 12px 16px;
  background: rgba($color-status-error, 0.1);
  border-radius: 24px;
  display: flex;
  align-items: center;
  gap: 8px;

  @media screen and (min-width: $screen-xl) {
    border-radius: 16px;
  }

  &__icon {
    width: 40px;
    height: 40px;
    background-color: $color-status-error;
    flex-shrink: 0;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__icon-svg {
    width: 24px;
    height: 24px;
    font-size: 24px;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__text {
    color: $color-base-black-100;
  }

  &__threat-level {
    text-transform: capitalize;
  }

  &__threat-count {
    color: $color-status-error;
  }
}
</style>
