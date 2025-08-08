<script setup>
import AppFormRadio from "@/features/AppFormRadio.vue";
import { computed, onMounted } from "vue";
import ForwardingService from "@/api/actions/forwarding-service.js";
import { PH_EVENT_USER_VIEWED_SETUPONBOARDING_TEXT_FORWARDING } from "@/scripts/posthogEvents.js";
import { posthogCapture } from "@/scripts/posthog.js";
import InlineSvg from "@/features/InlineSvg.vue";

const props = defineProps({
  value: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["input", "next", "back"]);
const forwardPhone = computed({
  get: () => props.value.forwardPhone,
  set: (value) => emit("input", { ...props.value, forwardPhone: value }),
});

const phone2fa = computed(() => props.value.phone2fa);

function onNext() {
  if (phone2fa.value?.id) {
    ForwardingService.enablePhoneForwarding(phone2fa.value?.id);
  }
}

onMounted(() => {
  posthogCapture(PH_EVENT_USER_VIEWED_SETUPONBOARDING_TEXT_FORWARDING);
});
</script>

<template>
  <div class="onboarding-form__content">
    <h1 class="onboarding-form__title">
      Would you like to forward incoming texts and calls?
    </h1>
    <p class="onboarding-form__text">
      Texts and calls received to one of your Cloaked phone numbers can
      auto-forward to your personal number, protecting your real identity.
    </p>
    <fieldset class="onboarding-form__fieldset">
      <AppFormRadio
        id="Yes"
        :value="forwardPhone"
        name="phone-forwarding"
        @input="forwardPhone = $event"
      >
        Yes
      </AppFormRadio>
      <AppFormRadio
        id="Not now"
        :value="forwardPhone"
        name="phone-forwarding"
        @input="forwardPhone = $event"
      >
        Not now
      </AppFormRadio>
    </fieldset>
    <footer class="onboarding-form__footer">
      <button
        type="button"
        class="onboarding-form__secondary"
        @click="emit('back')"
      >
        Back
      </button>
      <button
        type="button"
        class="onboarding-form__primary"
        @click="
          emit('next');
          onNext();
        "
      >
        Next
        <InlineSvg name="arrow-right" />
      </button>
    </footer>
  </div>
</template>
