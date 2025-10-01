<script setup>
import BottomBorderInputText from "@/features/BottomBorderInputText.vue";
import BaseButton from "@/library/BaseButton.vue";
import DataDeleteSticky from "@/features/data-delete/atoms/DataDeleteSticky.vue";
import { PH_EVENT_USER_VIEWED_DATA_DELETION_SEARCH_NAME_FORM } from "@/scripts/posthogEvents";
import { computed, onMounted, ref } from "vue";
import { posthogCapture } from "@/scripts/posthog.js";
import BaseText from "@/library/BaseText.vue";
import { useDisplay } from "@/composables/useDisplay.js";

const props = defineProps({
  value: {
    type: Object,
    required: true,
  },
  isForcingNewSearch: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["input", "submit"]);

const firstNameInput = ref("firstNameInput");
onMounted(() => firstNameInput.value?.$refs?.input?.focus());

onMounted(() => {
  posthogCapture(PH_EVENT_USER_VIEWED_DATA_DELETION_SEARCH_NAME_FORM, {
    isForcingNewSearch: props.isForcingNewSearch,
  });
});

const isFormValid = computed(
  () => props.value.firstName && props.value.lastName
);

const { isMobile } = useDisplay();
</script>

<template>
  <div class="data-delete-additional-search">
    <BaseText
      as="p"
      variant="headline-6-medium"
      class="data-delete__text"
    >
      Let's verify some info before we display results
    </BaseText>
    <BaseText
      as="h1"
      :variant="isMobile ? 'headline-2-semibold' : 'headline-1-medium'"
      class="data-delete__title"
    >
      What is your name?
    </BaseText>
    <div class="data-delete-additional-search__body">
      <fieldset class="delete-additional-search__body__fieldset">
        <BottomBorderInputText
          ref="firstNameInput"
          placeholder="First name"
          :value="value.firstName"
          autocomplete="given-name"
          @input="$emit('input', { ...value, firstName: $event })"
          @keydown.enter="isFormValid && $emit('submit')"
        />
        <BottomBorderInputText
          placeholder="Last name"
          :value="value.lastName"
          autocomplete="family-name"
          @input="$emit('input', { ...value, lastName: $event })"
          @keydown.enter="isFormValid && $emit('submit')"
        />
      </fieldset>
      <DataDeleteSticky class="data-delete-additional-search__cta">
        <BaseButton
          variant="primary"
          size="lg"
          :disabled="!isFormValid"
          icon="arrow-right"
          class="data-delete-additional-search__cta-button"
          @click="$emit('submit')"
        >
          Continue
        </BaseButton>
      </DataDeleteSticky>
    </div>
    <BaseText
      variant="body-small-medium"
      class="data-delete-additional-search__footer"
    >
      Cloaked securely searches your phone number across the dark web and 100+
      data brokers. Cloaked will not store or sell your information to these
      parties.
    </BaseText>
  </div>
</template>
