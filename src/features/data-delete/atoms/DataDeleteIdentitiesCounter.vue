<script setup lang="ts">
import BaseText from "@/library/BaseText.vue";
import NumberFlow, { continuous } from "@number-flow/vue";
import {
  useIdentitiesCounter,
  type IdentitiesDeleteCounterType,
} from "@/features/data-delete/composables/useIdentitiesCounter";
import { onMounted, ref } from "vue";

const props = withDefaults(
  defineProps<{
    type?: IdentitiesDeleteCounterType;
  }>(),
  {
    type: "exposures-removed",
  }
);

const { counter } = useIdentitiesCounter(props.type);
const addOneToReports = ref<boolean>(false);

onMounted(() => {
  setTimeout(() => {
    addOneToReports.value = true;
  }, 3500);
});
</script>

<template>
  <div
    class="identities-counter"
    :class="[
      `identities-counter--${type === 'identity-theft-reports' ? 'red' : 'green'}`,
    ]"
  >
    <NumberFlow
      class="identities-counter__number-flow"
      :value="counter + (addOneToReports ? 1 : 0)"
      :plugins="[continuous]"
    />
    <BaseText
      variant="body-small-semibold"
      class="identities-counter__label"
    >
      {{
        type === "identity-theft-reports"
          ? "Identities reported stolen this year. Protect yours."
          : "Data exposures removed by Cloaked. Stay protected."
      }}
    </BaseText>
  </div>
</template>

<style scoped lang="scss">
@keyframes slide-down {
  from {
    transform: translateY(-100%);
  }

  to {
    transform: translateY(0);
  }
}

.identities-counter {
  position: fixed;
  top: 0;
  left: 0;
  background-color: $color-base-white-70;
  backdrop-filter: blur(7.5px);
  box-shadow: 0 10px 24px 0 rgb(0 0 0 / 15%);
  width: 100%;
  z-index: 100;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid $color-base-black-15;
  transform: translateY(-100%);
  animation: slide-down 0.3s ease-out forwards;
  animation-delay: 1s;

  &__label {
    color: $color-primary-100;
    font-weight: 700;
    font-size: clamp(11px, 3.5vw, 13px);
    text-align: center;
  }

  &__number-flow {
    font-size: 28px;
    text-align: center;
    height: 45px;
    transform: scale(0.75);

    @media all and (min-width: $screen-md) {
      transform: unset;
    }

    .identities-counter--green & {
      color: $color-status-success;
    }

    .identities-counter--red & {
      color: $color-status-error;
    }
  }

  &__number-flow::part(number) {
    mask-image: unset;
  }

  &__number-flow::part(digit),
  &__number-flow::part(integer-digit) {
    text-align: center;
    width: 28px;
    height: 32px;
    border-radius: 8px;
    margin-left: 7px;
    overflow: hidden;
  }

  &__number-flow::part(symbol) {
    margin-left: 3px;
    transform: translate(2px, -8px);
  }

  &--red &__number-flow::part(digit),
  &--red &__number-flow::part(integer-digit) {
    color: $color-status-error;
    background-color: rgba($color-status-error, 0.3);
    border: 1px solid $color-status-error-15;
  }

  &--green &__number-flow::part(digit),
  &--green &__number-flow::part(integer-digit) {
    color: $color-status-success;
    background-color: rgba($color-status-success, 0.3);
    border: 1px solid $color-status-success-15;
  }
}
</style>
