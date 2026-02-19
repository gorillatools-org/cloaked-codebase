<script setup>
import { computed } from "vue";
import InlineSvg from "@/features/InlineSvg.vue";
import { parsePhoneNumber } from "awesome-phonenumber";
import BaseText from "@/library/BaseText.vue";

const props = defineProps({
  username: {
    type: String,
    default: null,
  },
});

defineEmits(["continue"]);

const parsedPhoneNumber = computed(() => parsePhoneNumber(props.username));
const visualPhoneNumberParts = computed(
  () => parsedPhoneNumber.value?.number?.national.split("-") ?? []
);
</script>

<template>
  <div class="passwordless-card">
    <BaseText variant="body-2-semibold">Your username</BaseText>
    <BaseText
      v-if="parsedPhoneNumber?.number?.national"
      variant="headline-6-medium"
      class="passwordless-card__phone"
    >
      <InlineSvg
        v-if="parsedPhoneNumber?.regionCode === 'US'"
        name="flag-usa"
        class="passwordless-card__country-icon"
      />
      <InlineSvg
        v-else-if="parsedPhoneNumber?.regionCode === 'CA'"
        name="flag-canada"
        class="passwordless-card__country-icon"
      />
      <span class="passwordless-card__country-code">
        {{ `+${parsedPhoneNumber.countryCode}` }}
      </span>
      <template
        v-for="(phonePart, index) in visualPhoneNumberParts"
        :key="index"
      >
        <span class="passwordless-card__phone-part">
          {{ phonePart }}
        </span>
        <span
          v-if="index < visualPhoneNumberParts.length - 1"
          class="passwordless-card__separator"
        >
          -
        </span>
      </template>
    </BaseText>
    <BaseText
      variant="headline-6-medium"
      class="passwordless-card__text"
    >
      Cloaked will text you a one-time password each time you login.
    </BaseText>
  </div>
</template>

<style scoped lang="scss">
.passwordless-card {
  text-align: center;
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  background: rgba($color-primary-100-dark, 0.07);
  border-radius: 20px;
  backdrop-filter: blur(22px);
  padding: 24px;
  border: 1px solid rgba($color-primary-100-dark, 0.015);
  box-shadow: 0 4px 16px 0 rgb(0 0 0 / 15%);

  &__phone {
    padding: 20px 24px;
    border-radius: 10px;
    background-color: $color-base-black-10;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;

    @media all and (min-width: $screen-xl) {
      font-size: 20px;
    }

    &-part {
      flex-shrink: 0;
    }
  }

  &__country {
    &-icon {
      flex-shrink: 0;
      width: 24px;
      height: 24px;

      @media all and (min-width: $screen-xl) {
        width: 32px;
        height: 32px;
      }
    }

    &-code {
      opacity: 0.3;
      flex-shrink: 0;
    }
  }

  &__separator {
    opacity: 0.3;
    margin: 0 -3px;
  }

  &__text {
    opacity: 0.6;
    max-width: 90%;
    margin: 0 auto;
  }

  &__footer {
    font-size: 14px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
    text-align: center;
    margin-top: 16px;
  }

  &__support {
    text-decoration: underline;

    &:hover {
      opacity: 0.8;
    }
  }

  &__cta {
    width: 100%;
    margin: 24px auto 0;

    @media all and (min-width: $screen-xl) {
      display: flex;
      width: 80%;
    }
  }

  @keyframes appear {
    0% {
      transform: scale(0);
    }

    100% {
      transform: scale(1);
    }
  }
}
</style>
