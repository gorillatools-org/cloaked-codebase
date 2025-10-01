<script setup>
import CardLogo from "@/features/creditCards/CardLogo.vue";
import { computed } from "vue";
import InlineSvg from "@/features/InlineSvg.vue";
import BaseText from "@/library/BaseText.vue";
import BaseTextHiddenDots from "@/library/BaseTextHiddenDots.vue";

const props = defineProps({
  card: {
    type: Object,
    default: () => ({}),
  },
});

defineEmits(["click"]);

const cardTypeFormatted = computed(() => {
  return props.card?.card_type?.replace("-", " ");
});

const address = computed(() => {
  const {
    billing_name,
    billing_address_1,
    billing_address_2,
    billing_city,
    billing_state,
    billing_zip,
    billing_country,
  } = props.card;

  let line = "";

  const existingParts = [
    billing_name,
    billing_address_1,
    billing_address_2,
    billing_city,
    billing_state,
    billing_country,
    billing_zip,
  ].filter((part) => part);
  if (existingParts.length > 0) {
    line = existingParts.join(", ");
  }
  return line;
});
</script>

<template>
  <section
    class="credit-card-display"
    @click="$emit('click')"
  >
    <CardLogo :card-type="card.card_type" />
    <div class="card-id">
      <div class="card-info">
        <BaseText
          as="div"
          variant="body-2-semibold"
          class="card-name"
        >
          {{ cardTypeFormatted }}
        </BaseText>
      </div>
      <BaseText
        as="div"
        variant="body-2-semibold"
        class="card-row"
      >
        <BaseTextHiddenDots
          :count="4"
          variant="body-2-semibold"
        />
        {{ props.card.last_4_digits }}, Exp {{ props.card.expiry_date }}
      </BaseText>

      <BaseText
        v-if="address"
        as="div"
        variant="body-2-semibold"
        class="card-row"
      >
        {{ address }}
      </BaseText>
    </div>
    <div class="card-actions">
      <InlineSvg name="chevron-right" />
    </div>
  </section>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.credit-card-display {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 20px 10px;
  border-top: 1px solid $color-primary-10;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);

  &:first-of-type {
    border-top: 1px solid transparent;
  }

  &:last-of-type {
    border-bottom: 1px solid $color-primary-10;
  }

  &:hover {
    border-radius: 16px;
    border-top: 1px solid $color-primary-5;
    background: $color-primary-5;
    transform: scale(1.003);
    transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);

    > div:first-child {
      background-color: $color-primary-10;
    }
  }

  .card-id {
    flex: 1;
    width: 100%;
    justify-content: space-between;
    .card-info {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .card-name {
        color: $color-primary-100;
        text-transform: capitalize;
      }
    }
    .card-row {
      display: flex;
      align-items: center;
      text-align: left;
      color: $color-primary-50;
    }
  }
  > svg {
    width: 40px;
    height: 40px;
    margin-right: 20px;
    border: 1px solid $color-primary-10;
    border-radius: 20px;
  }
  .card-actions {
    cursor: pointer;
    align-self: center;
    background-color: transparent;
    border: none;
    color: $color-primary-100;
    margin-left: 30px;
  }
}
</style>
