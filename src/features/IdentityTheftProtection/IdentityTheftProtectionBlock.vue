<script setup>
import BaseSheet from "@/library/BaseSheet.vue";
import BaseText from "@/library/BaseText.vue";
import BaseProgressTag from "@/library/BaseProgressTag.vue";
import IdentityTheftProtectionContent from "@/features/IdentityTheftProtection/IdentityTheftProtectionContent.vue";
import { useIdentityTheftProtection } from "@/composables/useIdentityTheftProtection";

const { insuranceAmountFormattedM } = useIdentityTheftProtection();
</script>

<template>
  <BaseSheet class="identity-theft-protection-block">
    <div class="identity-theft-protection-block__title">
      <BaseText
        variant="headline-4-bold"
        as="h4"
        class="identity-theft-protection-block__title-text"
      >
        {{ insuranceAmountFormattedM }} Insurance
      </BaseText>
      <BaseProgressTag>Active</BaseProgressTag>
      <BaseText
        variant="body-small-medium"
        as="p"
        class="identity-theft-protection-block__title-description"
      >
        We've got you covered with {{ insuranceAmountFormattedM }} insurance for
        your identity theft protection.
      </BaseText>
    </div>
    <IdentityTheftProtectionContent
      class="identity-theft-protection-block__contact"
    />
  </BaseSheet>
</template>

<style lang="scss" scoped>
.identity-theft-protection-block {
  /* stylelint-disable */
  &__title {
    padding: 8px 0;
    display: flex;
    gap: 8px;
    flex-direction: row;
    justify-content: space-between;
    flex-wrap: wrap;
    align-items: center;

    &-description {
      margin-top: 8px;
    }
  }

  &__contact {
    margin-top: 16px;
  }
}
</style>
