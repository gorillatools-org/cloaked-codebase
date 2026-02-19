<script setup lang="ts">
import DataScanPasswordBreachCard from "@/features/data-delete/atoms/DataScanPasswordBreachCard.vue";
import DataDeleteExpandableCard from "@/features/data-delete/atoms/DataDeleteExpandableCard.vue";
import BaseText from "@/library/BaseText.vue";
import DataScanCardHeaderShared from "@/features/data-delete/atoms/DataScanCardHeaderShared.vue";
import type { Breach } from "@/features/data-delete/atoms/DataScanPasswordBreachCard.vue";

defineProps<{
  breaches: Breach[];
}>();

const descriptionCopy =
  "For your protection, we've hidden all passwords. They were exposed and are no longer safe to use.";
</script>

<template>
  <DataDeleteExpandableCard
    class="password-card"
    :class="{ 'password-card--not-expandable': breaches.length < 3 }"
  >
    <template #header>
      <DataScanCardHeaderShared
        icon="key-filled"
        title="Password Breaches"
        :subtitle="`${breaches.length} ${breaches.length === 1 ? 'Password' : 'Passwords'} Found`"
      />
    </template>

    <template #collapsed>
      <div class="password-card__content">
        <BaseText
          as="p"
          variant="body-3-regular"
          class="password-card__copy"
        >
          {{ descriptionCopy }}
        </BaseText>

        <div class="password-card__breach-list">
          <DataScanPasswordBreachCard
            v-for="breach in breaches.slice(0, 2)"
            :key="breach.document_id"
            :breach="breach"
          />

          <BaseText
            v-if="breaches.length > 2"
            as="p"
            variant="body-3-regular"
            class="password-card__more-count"
          >
            + {{ breaches.length - 2 }} more
            {{ breaches.length - 2 === 1 ? "password" : "passwords" }}
          </BaseText>
        </div>
      </div>
    </template>

    <template #expanded>
      <div class="password-card__content">
        <BaseText
          as="p"
          variant="body-3-regular"
          class="password-card__copy"
        >
          {{ descriptionCopy }}
        </BaseText>

        <div class="password-card__breach-list">
          <DataScanPasswordBreachCard
            v-for="breach in breaches"
            :key="breach.document_id"
            :breach="breach"
          />
        </div>
      </div>
    </template>
  </DataDeleteExpandableCard>
</template>

<style lang="scss" scoped>
.password-card {
  margin-top: 8px;

  &--not-expandable {
    &:deep(.expandable-card__footer) {
      display: none;
    }
  }

  &__copy {
    color: $color-base-black-80;
  }

  &__breach-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 16px;
  }

  &__more-count {
    color: $color-base-black-60;
  }
}
</style>
