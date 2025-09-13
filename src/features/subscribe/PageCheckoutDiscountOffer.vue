<script setup>
import { computed } from "vue";
import BaseText from "@/library/BaseText.vue";
import { useTimeLimitedDiscount } from "@/composables/useTimeLimitedDiscount";
import EnrollmentOrb from "@/features/enrollment/EnrollmentOrb.vue";

const props = defineProps({
  minutes: {
    type: Number,
    default: 5,
  },
  discountPercent: {
    type: Number,
    default: 20,
  },
});

const { timeLimitedDiscount, countdownTime } = useTimeLimitedDiscount({
  discountSize: props.discountPercent,
  expiresIn: props.minutes * 60,
});

const displayMinutes = computed(() =>
  String(Math.floor(countdownTime.value / 60)).padStart(2, "0")
);
const displaySeconds = computed(() =>
  String(countdownTime.value % 60).padStart(2, "0")
);

const isActive = computed(() => timeLimitedDiscount.value !== null);
</script>

<template>
  <div
    v-if="isActive"
    class="discount-banner"
  >
    <EnrollmentOrb
      class="discount-banner__orb discount-banner__orb--left"
      aria-hidden="true"
    />
    <EnrollmentOrb
      class="discount-banner__orb discount-banner__orb--right"
      aria-hidden="true"
    />
    <div class="discount-banner__content">
      <BaseText
        variant="headline-4-medium"
        class="discount-banner__text"
      >
        <span class="discount-banner__amount">
          {{ timeLimitedDiscount }}% discount
        </span>
        applied, offer expires in
      </BaseText>

      <div class="discount-banner__timer">
        <div
          class="discount-banner__timer__segment discount-banner__timer__segment--minutes"
        >
          <BaseText
            variant="headline-4-bold"
            class="discount-banner__timer__text"
          >
            <span class="discount-banner__timer__value">
              {{ displayMinutes }}
            </span>
            <small class="discount-banner__timer__unit">m</small>
          </BaseText>
        </div>

        <div class="discount-banner__timer__separator">:</div>

        <div
          class="discount-banner__timer__segment discount-banner__timer__segment--seconds"
        >
          <BaseText
            variant="headline-4-bold"
            class="discount-banner__timer__text"
          >
            <span class="discount-banner__timer__value">
              {{ displaySeconds }}
            </span>
            <small class="discount-banner__timer__unit">s</small>
          </BaseText>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.discount-banner {
  width: 100%;
  background: $color-safe-zone-blue-15;
  backdrop-filter: blur(10px);
  padding: 8px 0;
  text-align: center;
  position: relative;
  overflow: hidden;

  &__orb {
    position: absolute;
    width: 653px;
    height: 610px;
    background: transparent;
    top: -277px;
    opacity: 0.2;
    display: none;

    &--left {
      right: calc(100% - 200px);
    }

    &--right {
      left: calc(100% - 200px);
    }
  }

  &__content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 12px;
    color: $black;
  }

  &__text {
    font-weight: 400;
    font-size: 18px;
    line-height: 1.5;
  }

  &__amount {
    font-weight: 700;
    margin-right: 1px;
  }

  @media screen and (min-width: $screen-sm) {
    &__content {
      margin-top: 0;
      padding: 0 16px;
    }

    &__orb--left {
      right: calc(100% - 300px);
    }

    &__orb--right {
      left: calc(100% - 300px);
    }

    &__text {
      font-size: 20px;
      line-height: initial;
    }

    padding: 10px 0;
  }

  @media screen and (min-width: $screen-lg) {
    padding: 16px 0;

    &__content {
      flex-direction: row;
      gap: 8px;
      padding: 0 20px;
    }
  }

  @media screen and (min-width: $screen-xl) {
    &__content {
      max-width: 1200px;
    }
  }

  @at-root .theme-dark & {
    background: $white;

    &__orb {
      display: block;
    }
  }

  &__timer {
    display: inline-flex;
    align-items: center;
    gap: 1px;
    font-weight: 600;
    font-size: 1.125rem;

    &__segment {
      display: inline-flex;
      align-items: center;
      font-size: 1em;
    }

    &__text {
      display: inline-flex;
      align-items: center;
      font-size: 1em;
    }

    &__value {
      display: inline-flex;
      min-width: 22px;
      border-radius: 4px;
      text-align: right;
      justify-content: center;
      font-variant-numeric: tabular-nums;
      font-size: 1em;
    }

    &__unit {
      font-size: 1em;
    }

    &__separator {
      font-weight: 700;
      margin: 0 4px 0 6px;
      font-size: 1em;
    }

    @media screen and (min-width: $screen-sm) {
      font-size: 1.25rem;

      &__separator {
        margin: 0 4px;
      }

      &__value {
        min-width: 24px;
        text-align: center;
      }
    }
  }
}
</style>
