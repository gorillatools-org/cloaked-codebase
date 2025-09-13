<script setup lang="ts">
import BaseText from "@/library/BaseText.vue";

interface Item {
  name: string;
  value?: string;
  subItems?: Item[];
}

const items: Item[] = [
  {
    name: "Finance Charge(s)",
    value: "$0",
  },
  {
    name: "Transaction Fees",
    subItems: [{ name: "Foreign Transaction", value: "$0" }],
  },
  {
    name: "Penalty Fees",
    subItems: [
      { name: "Late Payment", value: "$0" },
      { name: "Returned Payment", value: "$0" },
    ],
  },
];
</script>

<template>
  <div class="kyc-flow-fees">
    <ul class="kyc-flow-fees__list">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="kyc-flow-fees__item"
      >
        <div class="kyc-flow-fees__item-container">
          <header class="kyc-flow-fees__item-header">
            <BaseText
              variant="body-2-semibold"
              class="kyc-flow-fees__item-name"
            >
              {{ item.name }}
            </BaseText>
            <BaseText
              v-if="item.value"
              variant="body-small-semibold"
              class="kyc-flow-fees__item-value"
            >
              {{ item.value }}
            </BaseText>
          </header>
          <ul
            v-if="item.subItems"
            class="kyc-flow-fees__item-sublist"
          >
            <li
              v-for="subItem in item.subItems"
              :key="subItem.name"
              class="kyc-flow-fees__item-subitem"
            >
              <BaseText
                variant="body-small-semibold"
                class="kyc-flow-fees__item-subitem-name"
              >
                {{ subItem.name }}
              </BaseText>
              <BaseText
                v-if="subItem.value"
                variant="body-small-semibold"
                class="kyc-flow-fees__item-subitem-value"
              >
                {{ subItem.value }}
              </BaseText>
            </li>
          </ul>
        </div>
      </li>
    </ul>

    <div class="kyc-flow-fees__content">
      <p>
        Billing Rights: Information on your rights to dispute transactions and
        how to exercise those rights is provided in your account agreement.
      </p>
      <p>
        Cloaked Pay availability is included in your subscription to Cloaked,
        which includes all Cloaked core and Cloaked Pay products and services.
        If you are eligible for Cloaked Pay, you can gain Cloaked Pay access
        with an active and paid Cloaked subscription.
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
$component-name: "kyc-flow-fees";

.#{$component-name} {
  display: flex;
  flex-direction: column;

  &__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__item {
    margin-top: 0;

    &-container {
      background: $color-primary-10;
      border-radius: 8px;
      padding: 16px;
    }

    &-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    &-name {
    }

    &-value {
      color: $color-primary-70;
    }

    &-sublist {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 8px;
    }

    &-subitem {
      display: flex;
      justify-content: space-between;
      align-items: center;

      &-name {
        color: $color-primary-50;
      }

      &-value {
        color: $color-primary-70;
      }
    }
  }

  &__content * {
    margin-top: 16px;
    font-size: 12px;
    font-style: normal;
    line-height: 16.8px;
    font-weight: 500;
  }
}
</style>
