<script setup lang="ts">
import BaseMedallion from "@/library/BaseMedallion.vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import { onMounted, ref } from "vue";

const emit = defineEmits<{
  (e: "continue"): void;
  (e: "setup-virtual-card"): void;
}>();

defineProps<{
  showSetUpVirtualCardButton: boolean;
}>();

const loaded = ref(false);

onMounted(() => {
  setTimeout(() => {
    loaded.value = true;
  }, 1570);
});
</script>

<template>
  <div
    class="subs-onboarding-success"
    :class="{ 'subs-onboarding-success--loaded': loaded }"
  >
    <div class="subs-onboarding-success__wrapper">
      <BaseMedallion
        size="lg"
        color="spam-protection"
        icon="check"
        class="subs-onboarding-success__medallion"
      />
      <BaseText
        variant="headline-2-semibold"
        class="subs-onboarding-success__title"
      >
        Your profile was successfully submitted!
      </BaseText>
      <BaseText
        variant="headline-5-bold"
        class="subs-onboarding-success__description"
      >
        Your first removal cycle starts today and runs about 30 days.
      </BaseText>
      <div class="subs-onboarding-success__actions-container">
        <BaseButton
          v-if="showSetUpVirtualCardButton"
          variant="primary"
          class="subs-onboarding-success__button"
          @click="emit('setup-virtual-card')"
        >
          Set up first card
        </BaseButton>
        <BaseButton
          :variant="showSetUpVirtualCardButton ? 'secondary' : 'primary'"
          class="subs-onboarding-success__button"
          @click="emit('continue')"
        >
          Done
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.subs-onboarding-success {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;

  &__wrapper {
    width: 343px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  &__medallion {
    animation: medallion-in 1s ease-out;
    animation-delay: 0.27s;
    animation-fill-mode: forwards;
    opacity: 0;
    transform: translateY(45vh);

    .subs-onboarding-success--loaded & {
      animation: medallion-out 500ms ease-in-out;
      animation-fill-mode: forwards;
      animation-delay: 0s;
    }
  }

  &__title {
    opacity: 0;
    visibility: hidden;
    text-align: center;
  }

  &__description {
    opacity: 0;
    visibility: hidden;
    text-align: center;
    font-weight: 400;
  }

  &__button {
    width: 100%;
  }

  &__actions-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    margin-top: 31px;
    opacity: 0;
    visibility: hidden;
  }

  .subs-onboarding-success--loaded & {
    &__title {
      visibility: visible;
      animation: fade-in 200ms ease-in-out;
      animation-delay: 0.2s;
      animation-fill-mode: forwards;
    }

    &__description {
      visibility: visible;
      animation: fade-in 200ms ease-in-out;
      animation-delay: 0.25s;
      animation-fill-mode: forwards;
    }

    &__actions-container {
      visibility: visible;
      animation: fade-in 200ms ease-in-out;
      animation-delay: 0.3s;
      animation-fill-mode: forwards;
    }
  }
}

@keyframes medallion-in {
  0% {
    transform: translateY(-200px);
    scale: 0.3;
    opacity: 0;
  }

  30% {
    opacity: 0.7;
    transform: translateY(30px);
  }

  50% {
    scale: 2.1;
    transform: translateY(20px);
    opacity: 0.9;
  }

  100% {
    scale: 2;
    transform: translateY(15px);
    opacity: 1;
  }
}

@keyframes medallion-out {
  0% {
    scale: 2;
    transform: translateY(15px);
    opacity: 1;
  }

  100% {
    scale: 1;
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fade-in {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
