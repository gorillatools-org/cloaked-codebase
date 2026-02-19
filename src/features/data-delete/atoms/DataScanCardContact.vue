<script setup lang="ts">
import { computed } from "vue";
import DataDeleteCard from "@/features/data-delete/atoms/DataDeleteCard.vue";
import DataDeleteExpandableCard from "@/features/data-delete/atoms/DataDeleteExpandableCard.vue";
import BaseText from "@/library/BaseText.vue";
import DataScanCardHeaderShared from "@/features/data-delete/atoms/DataScanCardHeaderShared.vue";
import DataScanWarning from "@/features/data-delete/atoms/DataScanWarning.vue";
import DataDeleteThumbsFeedback from "@/features/data-delete/DataDeleteThumbsFeedback.vue";
import { formatPhone } from "@/scripts/format";

const props = defineProps({
  phones: {
    type: Array,
    required: true,
  },
});

const collapsedPhones = computed(() => props.phones.slice(0, 2));
const warningCopy =
  "Scammers can use this information to automate phone calls, texts, and emails, subjecting you to unwanted advertising and dangerous phishing attempts.";
</script>

<template>
  <DataDeleteExpandableCard class="contact-card">
    <template #header>
      <DataScanCardHeaderShared
        icon="email-filled"
        title="Contact Information"
        :subtitle="`${phones.length} Past ${phones.length === 1 ? 'Number' : 'Numbers'} Found`"
      >
        <template #feedback>
          <DataDeleteThumbsFeedback result-id="contact-phones" />
        </template>
      </DataScanCardHeaderShared>
    </template>

    <template #collapsed>
      <DataDeleteCard
        type="alert"
        class="contact-card__wrapper"
      >
        <div class="contact-card__phone-list">
          <BaseText
            v-for="phone in collapsedPhones"
            :key="`collapsed-${phone}`"
            as="p"
            variant="body-3-semibold"
            class="contact-card__phone"
          >
            {{ formatPhone(phone) }}
          </BaseText>
          <BaseText
            v-if="props.phones.length > 2"
            as="p"
            variant="body-3-regular"
            class="contact-card__more"
          >
            + {{ props.phones.length - 2 }} more
            {{
              props.phones.length - 2 === 1 ? "phone number" : "phone numbers"
            }}
          </BaseText>
        </div>
      </DataDeleteCard>
    </template>

    <template #expanded>
      <DataDeleteCard
        type="alert"
        class="contact-card__wrapper"
      >
        <div class="contact-card__phone-list">
          <BaseText
            v-for="phone in props.phones"
            :key="`expanded-${phone}`"
            as="p"
            variant="body-3-semibold"
            class="contact-card__phone"
          >
            {{ formatPhone(phone) }}
          </BaseText>
        </div>
      </DataDeleteCard>

      <DataScanWarning :message="warningCopy" />
    </template>
  </DataDeleteExpandableCard>
</template>

<style lang="scss" scoped>
.contact-card {
  margin-block: 8px;

  :deep(.expandable-card--open) {
    border-color: $color-status-error;
  }

  :deep(.contact-card__wrapper) {
    border: 1px solid $color-status-error-15 !important;

    &:hover {
      border-color: $color-status-error-15 !important;
    }
  }

  &__phone-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__phone {
    color: $color-primary-100;
  }

  &__more {
    color: $color-base-black-60;
  }
}

@media screen and (width <= 420px) {
  .contact-card__phone-list {
    gap: 10px;
  }
}
</style>
