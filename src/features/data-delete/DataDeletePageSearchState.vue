<script setup>
import BaseButton from "@/library/BaseButton.vue";
import DataDeleteSticky from "@/features/data-delete/atoms/DataDeleteSticky.vue";
import { StateList } from "@/scripts/countries/states";
import { PH_EVENT_USER_VIEWED_DATA_DELETION_SEARCH_STATE_FORM } from "@/scripts/posthogEvents";
import { computed, onMounted } from "vue";
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

onMounted(() => {
  posthogCapture(PH_EVENT_USER_VIEWED_DATA_DELETION_SEARCH_STATE_FORM, {
    isForcingNewSearch: props.isForcingNewSearch,
  });
});

const isFormValid = computed(() => props.value.state);

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
      What state are you from?
    </BaseText>
    <div class="data-delete-additional-search__body">
      <fieldset class="delete-additional-search__body__fieldset">
        <select
          :value="props.value.state"
          class="data-delete-additional-search__select"
          @input="$emit('input', { ...value, state: $event.target.value })"
          @keydown.enter="isFormValid && $emit('submit')"
        >
          <option value="">Select state</option>
          <option
            v-for="state in StateList"
            :key="state.value"
            :value="state.value"
          >
            {{ state.label }}
          </option>
        </select>
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
