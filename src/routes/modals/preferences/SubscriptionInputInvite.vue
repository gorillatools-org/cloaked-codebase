<script setup>
import Button from "@/features/Button.vue";
import InlineSvg from "@/features/InlineSvg.vue";
import { email as isValidEmail } from "@/scripts/validation";
import { computed, ref } from "vue";
import AppFormError from "@/features/AppFormError.vue";
import AppFormInput from "@/features/AppFormInput.vue";
import { useWindowSize } from "@vueuse/core";
import { posthogCapture } from "@/scripts/posthog.js";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const { width } = useWindowSize();
const isMobile = computed(() => width.value <= 768);

const emit = defineEmits(["submit", "update:modelValue"]);

const validationError = ref(null);

const error = computed(() => validationError.value);

const onSubmit = async () => {
  validationError.value = !isValidEmail(props.modelValue)
    ? "Please provide a valid email!"
    : null;

  if (!validationError.value) {
    emit("submit", props.modelValue);
    posthogCapture("user_clicks_invite_button_members_section_bulk_plan");
  }
};
</script>

<template>
  <AppFormInput
    :value="modelValue"
    type="email"
    :placeholder="
      isMobile ? 'Enter email address' : `Enter a family member's email address`
    "
    :error="!!error"
    class="subscription-invite"
    @input="$emit('update:modelValue', $event)"
    @keydown.enter="onSubmit"
  >
    <template #after-input>
      <Button
        class="subscription-invite__send"
        :disabled="!modelValue || isLoading"
        @click="onSubmit"
      >
        <template v-if="isLoading">
          Inviting
          <InlineSvg
            name="spinner"
            class="subscription-invite__icon"
          />
        </template>
        <template v-else>
          Invite
          <InlineSvg
            name="data-delete/send"
            class="subscription-invite__icon"
          />
        </template>
      </Button>
    </template>
    <template #after>
      <AppFormError v-if="error">
        {{ error }}
      </AppFormError>
    </template>
  </AppFormInput>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.subscription-invite {
  .app-form-input__input {
    padding-right: 130px;
  }

  & &__send {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%) !important;

    @media (min-width: 700px) {
      right: 20px;
    }
  }

  &__icon {
    width: 18px;
    height: 18px;
  }
}
</style>
