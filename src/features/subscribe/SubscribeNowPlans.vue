<script setup>
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import { onMounted } from "vue";
import { posthogCapture } from "@/scripts/posthog.js";
import { PH_EVENT_PERSONALIZED_QUESTIONS_CHECKOUT_VIEWED } from "@/scripts/posthogEvents";

const props = defineProps({
  steps: {
    type: Array,
    default: () => [
      "Stop spam with Call Guard",
      "Clean your digital footprint with Data Removal and Identity Monitoring",
      "Protect your past mistakes with $1M Identity Theft Insurance",
    ],
  },
});

onMounted(() => {
  posthogCapture(PH_EVENT_PERSONALIZED_QUESTIONS_CHECKOUT_VIEWED);
});
</script>

<template>
  <section class="subscribe-now-plans subscribe-now-plans--simple">
    <div class="subscribe-now-plans__content">
      <BaseText
        as="h2"
        variant="headline-3-bold"
        class="subscribe-now-plans__title"
      >
        Your Plan
      </BaseText>

      <div class="subscribe-now-plans__steps">
        <div class="subscribe-now-plans__steps-container">
          <div
            v-for="(step, index) in props.steps"
            :key="index"
            class="subscribe-now-plans__step"
          >
            <div class="subscribe-now-plans__step-icon">
              <BaseIcon
                name="check"
                class="subscribe-now-plans__check-icon"
              />
            </div>
            <BaseText
              as="p"
              variant="body-3-regular"
              class="subscribe-now-plans__step-text"
            >
              {{ step }}
            </BaseText>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.subscribe-now-plans {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    rgba($color-primary-100, 0.1) 0%,
    rgba($color-spam-protection, 0.1) 100%
  );

  &--simple {
    height: auto;
    min-height: unset;
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    width: 100%;
  }

  &__title {
    color: $white;
    margin: 0;
    font-size: 24px;
    width: 100%;
  }

  &__steps {
    padding: 12px 20px 12px 10px;
    background: $color-base-black-5-dark;
    backdrop-filter: blur(15px);
    box-shadow: 0 10px 24px 0 $color-base-black-15-light;
    border: 1px solid $color-base-black-10-dark;
    border-radius: 16px;
    width: 100%;
    overflow: hidden;
  }

  &__steps-container {
    display: flex;
    flex-direction: column;
  }

  &__step {
    display: grid;
    grid-template-columns: 24px 1fr;
    align-items: center;
    gap: 6px;
    padding: 6px 0;
  }

  &__step-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__check-icon {
    color: $color-safe-zone-green;
    font-size: 16px;
  }

  &__step-text {
    color: $color-primary-100;
    margin: 0;
    text-align: left;
  }
}
</style>
