<script lang="ts" setup>
import BaseText from "@/library/BaseText.vue";
import SubscriptionBillingDetailsRow from "@/features/Subscription/Billing/SubscriptionBillingDetailsRow.vue";
import { computed, useSlots } from "vue";
import UiTooltip from "@/features/ui/ui-tooltip.vue";
import BaseIcon from "@/library/BaseIcon.vue";

export type BillingDetailsSaving = {
  amount?: number;
  description: string;
};

export type BillingDetailsProps = {
  subtotalDescription?: string;
  subtotalInterval?: string;
  subtotal?: number;
  savings?: BillingDetailsSaving[];
  dueToday?: number;
  last4?: string;
  cardBrand?: string;
  footerText?: string;
};

const props = withDefaults(defineProps<BillingDetailsProps>(), {
  subtotalDescription: "Subtotal",
  subtotalInterval: undefined,
  subtotal: undefined,
  savings: undefined,
  dueToday: undefined,
  last4: "",
  cardBrand: "",
  footerText: undefined,
});

const slots = useSlots();

const tooltipTitle = `If you upgrade before your renewal date, any prorated amount will be included in the total billed today.`;

const paymentMethod = computed(() => {
  if (!props.last4 && !props.cardBrand) {
    return undefined;
  }
  return `****${props.last4} • ${props.cardBrand}`;
});

const formatCurrency = (amount: number | string) => {
  if (typeof amount === "number") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100);
  }
  return amount;
};
</script>

<template>
  <div class="subs-billing-details">
    <div class="subs-billing-details__content">
      <ul class="subs-billing-details__list">
        <li class="subs-billing-details__list-item">
          <SubscriptionBillingDetailsRow
            :title="props.subtotalDescription"
            :value="
              formatCurrency(props.subtotal ?? 0) +
              (props.subtotalInterval ? ` ${props.subtotalInterval}` : '')
            "
            :is-value-loading="props.subtotal === undefined"
          />
        </li>
        <li
          v-for="(saving, index) in props.savings"
          :key="index"
          class="subs-billing-details__list-item"
        >
          <SubscriptionBillingDetailsRow
            :title="saving?.description"
            :value="formatCurrency(saving?.amount ?? 0)"
            :is-value-loading="saving?.amount === undefined"
          >
            <template #value>
              <BaseText
                variant="body-3-semibold"
                class="subs-billing-details__list-item-discount-value"
              >
                {{ formatCurrency(saving?.amount ?? 0) }}
              </BaseText>
            </template>
          </SubscriptionBillingDetailsRow>
        </li>
        <li
          class="subs-billing-details__list-item subs-billing-details__list-item--divider"
        ></li>
        <li class="subs-billing-details__list-item">
          <SubscriptionBillingDetailsRow
            :value="formatCurrency(props.dueToday ?? 0)"
            :is-value-loading="props.dueToday === undefined"
          >
            <template #title>
              <div class="subs-billing-details__list-item-title-container">
                <BaseText
                  variant="headline-6-bold"
                  class="subs-billing-details__list-item-title-text"
                >
                  Total due today
                </BaseText>
                <UiTooltip
                  :max-width="300"
                  align-x="center"
                  is-multiline
                  :title="tooltipTitle"
                >
                  <BaseIcon
                    class="subs-billing-details__list-item-title-icon"
                    name="info"
                  />
                </UiTooltip>
              </div>
            </template>
            <template #value>
              <div class="subs-billing-details__list-item-value-container">
                <BaseText
                  v-if="
                    props.savings?.length &&
                    props.savings.length > 0 &&
                    props.subtotal !== undefined &&
                    props.dueToday !== undefined &&
                    props.subtotal !== props.dueToday
                  "
                  variant="headline-6-bold"
                  class="subs-billing-details__list-item-value-text subs-billing-details__list-item-value-text--original"
                >
                  {{ formatCurrency(props.subtotal ?? 0) }}
                </BaseText>
                <BaseText
                  variant="headline-6-bold"
                  class="subs-billing-details__list-item-value-text"
                >
                  {{ formatCurrency(props.dueToday ?? 0) }}
                </BaseText>
              </div>
            </template>
          </SubscriptionBillingDetailsRow>
        </li>
        <li
          class="subs-billing-details__list-item subs-billing-details__list-item--divider"
        ></li>
        <li class="subs-billing-details__list-item">
          <SubscriptionBillingDetailsRow
            title="Payment method"
            :value="paymentMethod"
            :is-value-loading="!paymentMethod"
          />
        </li>
      </ul>
    </div>

    <footer
      v-if="footerText || slots['footer-content']"
      class="subs-billing-details__footer"
    >
      <slot name="footer-content">
        <BaseText
          variant="caption-semibold"
          class="subs-billing-details__footer-text"
        >
          {{ footerText }}
        </BaseText>
      </slot>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
$component-name: "subs-billing-details";

.#{$component-name} {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: $color-base-white-80;
  border-radius: 24px;
  border: 1px solid $color-base-black-10;
  padding: 20px 16px 16px;
  box-shadow: 0 5px 20px 0 rgb(0 0 0 / 5%);

  &__content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 16px;

    &-item {
      display: flex;
      justify-content: space-between;
      align-items: center;

      &--divider {
        height: 1px;
        min-height: 1px;
        background-color: $color-base-black-10;
      }

      &-value {
        &-container {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        &-text {
          color: $color-base-black-100;

          &--original {
            color: $color-primary-30;
            text-decoration: line-through;
          }
        }
      }

      &-discount-value {
        color: $color-status-success;
      }

      &-title {
        &-container {
          display: flex;
          align-items: center;
          gap: 4px;
          color: $color-primary-100;
        }

        &-icon {
          margin-top: 2px;
        }
      }
    }
  }

  &__footer {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 4px 6px;
    background: $color-base-black-10;
    border-radius: 12px;
    text-align: center;
    font-weight: 500;
  }
}
</style>
