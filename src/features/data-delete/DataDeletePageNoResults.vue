<script setup>
import DataDeleteCard from "@/features/data-delete/atoms/DataDeleteCard.vue";
import DataDeleteThreatLevel from "@/features/data-delete/atoms/DataDeleteThreatLevel.vue";
import DataDeleteSticky from "@/features/data-delete/atoms/DataDeleteSticky.vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import { computed, onMounted } from "vue";
import { posthogCapture } from "@/scripts/posthog.js";
import { PH_EVENT_USER_VIEWED_DATA_DELETION_NO_RESULTS } from "@/scripts/posthogEvents.js";
import { useIdentityTheftProtection } from "@/composables/useIdentityTheftProtection";

defineEmits(["complete"]);

const { insuranceAmountFormattedCoverage } = useIdentityTheftProtection();

const protectionFeatures = computed(() => [
  `Ongoing defense from fraud and identity theft with ${insuranceAmountFormattedCoverage.value}.`,
  "Identity protection with unlimited generated phone numbers, emails, and credit cards.",
  "Ultimate safety and security with encrypted messaging, integrated password manager, and more.",
]);

onMounted(() => {
  posthogCapture(PH_EVENT_USER_VIEWED_DATA_DELETION_NO_RESULTS);
});
</script>

<template>
  <div class="data-delete-results data-delete-no-results">
    <div class="data-delete-results__column">
      <DataDeleteThreatLevel
        threat-level="unknown"
        :has-modal="false"
      />
      <BaseText
        as="p"
        variant="headline-6-medium"
        class="data-delete-no-results__text"
      >
        Your phone number poses no immediate threats, but your data is not
        totally safe. Cloaked permanently protects you.
      </BaseText>
      <DataDeleteSticky>
        <BaseButton
          type="primary"
          size="lg"
          full-width
          class="data-delete-no-results__subscribe"
          @click="$emit('complete')"
        >
          Subscribe now
        </BaseButton>
      </DataDeleteSticky>
    </div>
    <div class="data-delete-results__column">
      <DataDeleteCard class="data-delete-no-results__card">
        <BaseText
          as="h2"
          variant="headline-4-bold"
          class="data-delete-no-results__subtitle"
        >
          How Cloaked protects you:
        </BaseText>
        <ul
          class="data-delete-no-results__list data-delete-no-results__list--how"
        >
          <li
            v-for="(item, index) in protectionFeatures"
            :key="index"
          >
            <DataDeleteCard
              type="dark"
              class="data-delete-no-results__list-item"
            >
              <BaseIcon
                name="check"
                class="data-delete-no-results__icon"
              />
              <BaseText variant="body-2-semibold">
                {{ item }}
              </BaseText>
            </DataDeleteCard>
          </li>
        </ul>
        <BaseText
          as="h2"
          variant="headline-4-bold"
          class="data-delete-no-results__subtitle"
        >
          Why protection is important:
        </BaseText>
        <ul
          class="data-delete-no-results__list data-delete-no-results__list--why"
        >
          <li
            v-for="(item, index) in [
              'Fraudsters with your name and social security can apply for: a new bank account or Credit Card; a Driver\'s License; an IRS Tax Refund; even a job using your name.',
              'Scammers with your relationship information can change insurance policies and access important documents requiring popular verification methods.',
              'Spammers can use your email and phone number to automate phone calls, texts and emails, subjecting you to unwanted advertising and dangerous phishing attempts.',
            ]"
            :key="index"
          >
            <DataDeleteCard
              type="dark"
              class="data-delete-no-results__list-item"
            >
              <BaseIcon
                name="info"
                class="data-delete-no-results__icon"
              />
              <BaseText variant="body-2-semibold">
                {{ item }}
              </BaseText>
            </DataDeleteCard>
          </li>
        </ul>
      </DataDeleteCard>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.data-delete-no-results {
  &__subtitle {
    animation: appear-bottom-5 0.3s 0.3s forwards ease-out;
    opacity: 0;
    margin-top: 24px;

    &:first-child {
      margin-top: 0;
    }

    &:nth-child(3) {
      animation-delay: 0.5s;
    }
  }

  &__text {
    animation: appear-bottom-5 0.5s forwards ease-out;
    opacity: 0;
    animation-delay: 0.2s;
    margin-top: 16px;
  }

  &__card {
    padding: 24px 16px;
    margin-top: 24px;
  }

  &__icon {
    font-size: 18px;
    flex-shrink: 0;
  }

  &__list {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    & > * {
      animation: appear-bottom-5 0.4s forwards ease-out;
      opacity: 0;

      @for $i from 1 through 3 {
        &:nth-child(#{$i}) {
          animation-delay: 0.3s + $i * 0.05s;
        }
      }
    }

    &-item {
      display: flex;
      align-items: center;
      padding: 20px 16px;
      gap: 16px;
    }
  }

  &__subscribe {
    opacity: 0;
    margin-top: 16px;
    animation: appear-bottom-5 0.5s 0.5s forwards ease-out;
  }
}
</style>
