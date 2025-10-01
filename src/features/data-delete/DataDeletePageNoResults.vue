<script setup>
import InlineSvg from "@/features/InlineSvg.vue";

import DataDeleteCard from "@/features/data-delete/atoms/DataDeleteCard.vue";
import DataDeleteSubscribe from "@/features/data-delete/atoms/DataDeleteSubscribe.vue";
import DataDeleteThreatLevel from "@/features/data-delete/atoms/DataDeleteThreatLevel.vue";
import BaseText from "@/library/BaseText.vue";

defineEmits(["complete"]);
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
        class="data-delete__text"
      >
        Your phone number poses no immediate threats, but your data is not
        totally safe. Cloaked permanently protects you.
      </BaseText>
      <DataDeleteSubscribe
        class="data-delete-no-results__subscribe"
        @click="$emit('complete')"
      />
    </div>
    <div class="data-delete-results__column">
      <DataDeleteCard class="data-delete-no-results__card">
        <BaseText
          as="h2"
          variant="headline-4-bold"
          class="data-delete__subtitle"
        >
          How Cloaked protects you:
        </BaseText>
        <ul class="data-delete-no-results__how">
          <li>
            <DataDeleteCard
              type="dark"
              class="data-delete-no-results__list-item data-delete-no-results__list-item--benefits"
            >
              <InlineSvg
                name="checkmark"
                class="data-delete-no-results__icon"
              />
              <BaseText variant="body-2-semibold">
                Ongoing defense from fraud and identity theft with $1 million
                coverage
              </BaseText>
            </DataDeleteCard>
          </li>
          <li>
            <DataDeleteCard
              type="dark"
              class="data-delete-no-results__list-item data-delete-no-results__list-item--benefits"
            >
              <InlineSvg
                name="checkmark"
                class="data-delete-no-results__icon"
              />
              <BaseText variant="body-2-semibold">
                Identity protection with unlimited generated phone numbers,
                emails, and credit cards
              </BaseText>
            </DataDeleteCard>
          </li>
          <li>
            <DataDeleteCard
              type="dark"
              class="data-delete-no-results__list-item data-delete-no-results__list-item--benefits"
            >
              <InlineSvg
                name="checkmark"
                class="data-delete-no-results__icon"
              />
              <BaseText variant="body-2-semibold">
                Ultimate safety and security with encrypted messaging,
                integrated password manager, and more.
              </BaseText>
            </DataDeleteCard>
          </li>
        </ul>
        <BaseText
          as="h2"
          variant="headline-4-bold"
          class="data-delete__subtitle"
        >
          Why protection is important:
        </BaseText>
        <ul class="data-delete-no-results__why">
          <li>
            <DataDeleteCard
              type="dark"
              class="data-delete-no-results__list-item"
            >
              <InlineSvg
                name="tip-info"
                class="data-delete-no-results__icon"
              />
              <BaseText variant="body-2-semibold">
                Fraudsters with your name and social security can apply for: a
                new bank account or Credit Card; a Driver's License; an IRS Tax
                Refund; even a job using your name.
              </BaseText>
            </DataDeleteCard>
          </li>
          <li>
            <DataDeleteCard
              type="dark"
              class="data-delete-no-results__list-item"
            >
              <InlineSvg
                name="tip-info"
                class="data-delete-no-results__icon"
              />
              <BaseText variant="body-2-semibold">
                Scammers with your relationship information can change insurance
                policies and access important documents requiring popular
                verification methods.
              </BaseText>
            </DataDeleteCard>
          </li>
          <li>
            <DataDeleteCard
              type="dark"
              class="data-delete-no-results__list-item"
            >
              <InlineSvg
                name="tip-info"
                class="data-delete-no-results__icon"
              />
              <BaseText variant="body-2-semibold">
                Spammers can use your email and phone number to automate phone
                calls, texts and emails, subjecting you to unwanted advertising
                and dangerous phishing attempts.
              </BaseText>
            </DataDeleteCard>
          </li>
        </ul>
      </DataDeleteCard>
    </div>
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.data-delete-no-results {
  .data-delete {
    &__subtitle {
      animation: appear-bottom-5 0.3s 0.3s forwards ease-out;
      opacity: 0;
      margin-top: 16px;

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
    }
  }

  &__card {
    padding: 24px 16px;
    margin-top: 24px;
  }

  &__icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  &__how {
    & > * {
      animation: appear-bottom-5 0.4s forwards ease-out;
      opacity: 0;

      @for $i from 1 through 3 {
        &:nth-child(#{$i}) {
          opacity: 0;
          animation-delay: 0.3s + $i * 0.05s;
        }
      }
    }
  }

  &__why {
    // replace with a better alternative
    width: 100%;
    display: flex;
    overflow: scroll;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    flex: 0;
    flex-direction: column;
    gap: 0;

    &::-webkit-scrollbar {
      display: none;
    }

    & > * {
      animation: appear-bottom-5 0.4s forwards ease-out;
      opacity: 0;
      width: 100%;
      flex-shrink: 0;
      scroll-snap-align: center;

      @for $i from 1 through 3 {
        &:nth-child(#{$i}) {
          opacity: 0;
          animation-delay: 0.5s + $i * 0.05s;
        }
      }
    }
  }

  &__list-item {
    display: flex;
    align-items: center;
    padding: 24px 16px;
    gap: 24px;
    margin-top: 8px;

    @media all and (min-width: $screen-xl) {
      margin-top: 8px;
    }

    &--benefits {
      font-weight: 600;
    }
  }

  &__subscribe {
    @media all and (min-width: $screen-xl) {
      align-items: center;
      margin-top: 16px;
    }

    &.data-delete-subscribe {
      animation-delay: 0.65s;
    }

    .data-delete-subscribe {
      &__guarantee {
        @media all and (min-width: $screen-xl) {
          animation-delay: 0.8s;
        }
      }

      &__cta {
        @media all and (min-width: $screen-xl) {
          animation-delay: 0.7s;
        }
      }
    }
  }
}
</style>
