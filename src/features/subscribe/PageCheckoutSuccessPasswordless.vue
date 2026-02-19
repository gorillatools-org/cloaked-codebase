<script setup>
import PasswordlessCard from "@/features/subscribe/PasswordlessCard.vue";
import BulkPlanCard from "@/features/subscribe/BulkPlanCard.vue";
import PageCheckoutHeader from "@/features/subscribe/PageCheckoutHeader.vue";
import BaseButton from "@/library/BaseButton.vue";
import { SUPPORT_EMAIL } from "@/scripts/constants";
import BaseText from "@/library/BaseText.vue";
import { useDisplay } from "@/composables/useDisplay.js";
import { computed } from "vue";

const props = defineProps({
  account: {
    type: Object,
    required: true,
  },
  isCloakedPayOnboarding: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["continue"]);

const { isMobile } = useDisplay();

const titleText = computed(() => {
  return props.isCloakedPayOnboarding
    ? "You're signed in, let's finish enrolling in Cloaked Pay"
    : "You're signed in, let's finish enrolling in data removal";
});

const buttonText = computed(() => {
  return props.isCloakedPayOnboarding
    ? "Finish Cloaked Pay setup"
    : "Finish data removal setup";
});

const onContinue = () => {
  emit("continue");
};
</script>

<template>
  <div class="page-checkout-success-recovery">
    <PageCheckoutHeader />
    <div class="page-checkout-success-recovery__content">
      <BaseText
        as="h1"
        :variant="isMobile ? 'headline-2-semibold' : 'headline-1-medium'"
        class="page-checkout-success-recovery__title"
      >
        {{ titleText }}
      </BaseText>
      <div class="page-checkout-success-recovery__cards">
        <PasswordlessCard
          :username="account.username"
          class="page-checkout-success-recovery__card"
        />
        <BulkPlanCard class="page-checkout-success-recovery__card" />
      </div>

      <BaseButton
        variant="primary"
        size="lg"
        icon="arrow-right"
        class="passwordless-card__cta"
        @click="onContinue"
      >
        {{ buttonText }}
      </BaseButton>
      <BaseText
        as="footer"
        variant="body-2-semibold"
        class="passwordless-card__footer"
      >
        {{ "For help, email " }}
        <a
          :href="`mailto:${SUPPORT_EMAIL}`"
          target="_blank"
          class="passwordless-card__support"
        >
          {{ SUPPORT_EMAIL }}
        </a>
      </BaseText>
    </div>
  </div>
</template>

<style scoped lang="scss">
.passwordless-card {
  &__footer {
    text-align: center;
    padding-bottom: 40px;
  }

  &__support {
    text-decoration: underline;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }

  &__cta {
    width: 100%;
    cursor: pointer;
    max-width: 330px;
    margin-top: 30px;
    flex-shrink: 0;

    @media all and (min-width: $screen-xl) {
      display: flex;
      width: 80%;
    }
  }
}

.page-checkout-success-recovery {
  color: $color-primary-100;
  background-color: $color-base-white-100;
  padding: 0;

  @include cloaked-gradient-background;

  &__content {
    max-width: 785px;
    padding: 0 25px;
    align-items: center;
    gap: 16px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  &__title {
    text-align: center;
    opacity: 0;
    animation: appear-bottom-5 0.5s forwards ease-out;
    margin: 45px auto 15px;

    @media all and (min-width: $screen-md) {
      margin: 6px auto 0;
    }
  }

  &__cards {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 0 auto;
    margin-top: 16px;
    align-items: stretch;

    @media all and (min-width: $screen-xl) {
      margin-top: 15px;
      flex-direction: row;
      gap: 24px;
    }
  }

  &__card {
    width: 100%;
    max-width: 450px;
    opacity: 0;
    animation: appear-bottom-5 0.5s 0.1s forwards ease-out;
  }

  :deep(.page-checkout-success__footer) {
    opacity: 0;
    animation: appear-bottom-5 0.5s 0.5s forwards ease-out;
  }
}
</style>
