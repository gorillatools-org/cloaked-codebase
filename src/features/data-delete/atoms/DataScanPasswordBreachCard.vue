<script setup lang="ts">
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import DataDeleteCard from "@/features/data-delete/atoms/DataDeleteCard.vue";

export type Breach = {
  document_id: string;
  breach_date: string;
  email: string;
  password: string;
  breached_year: number;
  company_logo: string;
  company_name: string;
};

const props = defineProps<{
  breach: Breach;
}>();
</script>

<template>
  <DataDeleteCard
    type="alert"
    class="data-scan-breach-card"
  >
    <div class="data-scan-breach-card__container">
      <div class="data-scan-breach-card__head">
        <div class="data-scan-breach-card__company">
          <div class="data-scan-breach-card__company-avatar">
            <BaseIcon
              v-if="!props.breach.company_logo"
              name="shield-lock-filled"
              class="data-scan-breach-card__icon-svg"
            />
            <img
              v-else
              :src="props.breach.company_logo"
              alt="breach logo"
              class="data-scan-breach-card__icon"
            />
          </div>

          <BaseText
            as="p"
            variant="headline-6-bold"
          >
            {{ props.breach.company_name ?? "Unknown" }}
          </BaseText>
        </div>

        <div
          v-if="props.breach.breached_year"
          class="data-scan-breach-card__year-badge"
        >
          <BaseText
            as="span"
            variant="caption-semibold"
          >
            Year {{ props.breach.breached_year }}
          </BaseText>
        </div>
      </div>

      <div
        v-if="props.breach.email"
        class="data-scan-breach-card__field"
      >
        <BaseText
          as="label"
          variant="body-3-semibold"
          class="data-scan-breach-card__field-label"
        >
          Email Address
        </BaseText>
        <BaseText
          as="p"
          variant="headline-6-bold"
          class="data-scan-breach-card__field-value"
        >
          {{ props.breach.email }}
        </BaseText>
      </div>

      <div
        v-if="props.breach.password"
        class="data-scan-breach-card__field"
      >
        <BaseText
          as="label"
          variant="body-3-semibold"
          class="data-scan-breach-card__field-label"
        >
          Password
        </BaseText>
        <BaseText
          as="p"
          variant="headline-4-bold"
          class="data-scan-breach-card__field-value data-scan-breach-card__field-value--danger"
        >
          {{ props.breach.password }}
        </BaseText>
      </div>
    </div>
  </DataDeleteCard>
</template>

<style lang="scss" scoped>
.data-scan-breach-card {
  border: 1px solid $color-status-error-15;

  &__container {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__company {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__company-avatar {
    width: 40px;
    height: 40px;
    border-radius: 20px;
    display: grid;
    place-items: center;
    background: $color-base-black-10-dark;
  }

  &__year-badge {
    padding: 4px 10px;
    border-radius: 20px;
    background-color: $color-base-black-15;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__field-label {
    color: $color-base-black-80;
  }

  &__field-value {
    color: $color-primary-100;

    &--danger {
      color: $color-status-error;
    }
  }
}
</style>
