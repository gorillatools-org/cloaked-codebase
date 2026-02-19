<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
import BaseText from "@/library/BaseText.vue";
</script>

<template>
  <ul class="choose-plan-benefits__list">
    <li class="choose-plan-benefits__list-item">
      <InlineSvg
        name="checkmark"
        class="choose-plan-benefits__list-icon"
      />
      <BaseText variant="body-2-semibold">Unlimited devices</BaseText>
    </li>
    <li class="choose-plan-benefits__list-item">
      <InlineSvg
        name="checkmark"
        class="choose-plan-benefits__list-icon"
      />
      <BaseText variant="body-2-semibold">Monthly data removal</BaseText>
    </li>
    <li class="choose-plan-benefits__list-item">
      <InlineSvg
        name="checkmark"
        class="choose-plan-benefits__list-icon"
      />
      <BaseText variant="body-2-semibold">
        Unlimited phone and email aliases
      </BaseText>
    </li>
    <li class="choose-plan-benefits__list-item">
      <InlineSvg
        name="checkmark"
        class="choose-plan-benefits__list-icon"
      />
      <BaseText variant="body-2-semibold">
        Full-featured password manager
      </BaseText>
    </li>
    <li class="choose-plan-benefits__list-item">
      <InlineSvg
        name="checkmark"
        class="choose-plan-benefits__list-icon"
      />
      <BaseText variant="body-2-semibold">
        $1M in identity theft insurance (
        <span class="choose-plan-benefits__flag">🇺🇸</span>
        only)
      </BaseText>
    </li>
  </ul>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.choose-plan-benefits {
  &__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 22px;

    &-item {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-left: 10px;
    }

    &-icon {
      color: $color-primary-100;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }
  }

  &__flag {
    display: inline-block;
    vertical-align: middle;
  }
}
</style>
