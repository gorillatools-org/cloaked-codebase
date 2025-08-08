<script setup>
import BottomBorderInputText from "@/features/BottomBorderInputText.vue";
import BaseButton from "@/library/BaseButton.vue";
import DataDeleteSticky from "@/features/data-delete/atoms/DataDeleteSticky.vue";
import { PH_EVENT_USER_VIEWED_DATA_DELETION_SEARCH_AGE_FORM } from "@/scripts/posthogEvents";
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

const emit = defineEmits(["input", "submit"]);

const ageInput = ref("ageInput");
onMounted(() => ageInput.value?.$refs?.input?.focus());

onMounted(() => {
  posthogCapture(PH_EVENT_USER_VIEWED_DATA_DELETION_SEARCH_AGE_FORM, {
    isForcingNewSearch: props.isForcingNewSearch,
  });
});

const errors = ref([]);

const isFormValid = computed(() => props.value.age && !errors.value?.length);

const validateAge = () => {
  const parsedAge = parseInt(props.value.age);

  if (props.value.age && !Number.isInteger(parsedAge)) {
    errors.value = ["Please enter a valid age"];
  } else if (props.value.age && parsedAge < 18) {
    errors.value = [
      "We're sorry, but you must be at least 18 years old to proceed",
    ];
  } else {
    errors.value = [];
  }
};

const onSubmit = () => {
  validateAge();

  if (isFormValid.value) {
    emit("submit");
  }
};

function onInputChange(newAge) {
  errors.value = [];
  emit("input", { ...props.value, age: newAge });
}

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
      Confirm your age
    </BaseText>
    <div class="data-delete-additional-search__body">
      <fieldset class="delete-additional-search__body__fieldset">
        <BottomBorderInputText
          ref="ageInput"
          placeholder="Age"
          :value="value.age"
          :maxlength="2"
          inputmode="numeric"
          :errors="errors"
          @input="onInputChange"
          @keydown.enter="onSubmit"
        />
      </fieldset>
      <DataDeleteSticky class="data-delete-additional-search__cta">
        <BaseButton
          variant="primary"
          size="lg"
          :disabled="!value.age"
          icon="arrow-right"
          class="data-delete-additional-search__cta-button"
          @click="onSubmit"
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
