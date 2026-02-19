<script setup lang="ts">
import { computed, onBeforeMount, onMounted, ref, useTemplateRef } from "vue";
import type {
  FieldPrompt,
  FieldType,
  Profile,
} from "@/features/chat-onboarding/types.ts";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseButton from "@/library/BaseButton.vue";
import BaseText from "@/library/BaseText.vue";
import ChatBubble from "@/features/chat-onboarding/utils/ChatBubble.vue";
import ChatInput from "@/features/chat-onboarding/utils/ChatInput.vue";
import {
  getFormattedAddressValue,
  getFormattedPhoneNumberValue,
} from "@/features/enrollment/utils";
import type { BaseIconName } from "@/library/baseIconTypes.ts";
import ChatBubbleFooter from "@/features/chat-onboarding/utils/ChatBubbleFooter.vue";

type InteractionFieldPromptProps = {
  interaction: FieldPrompt;
};

const props = defineProps<InteractionFieldPromptProps>();
const emit = defineEmits(["complete", "resize"]);

const profile = defineModel<Profile>("profile", { required: true });

const isComplete = ref(false);
const isEditing = ref(false);

const fieldText = computed(() => {
  let fields = [...props.interaction.fields];

  let formatted = [];

  if (
    fields.includes("firstName") &&
    fields.includes("lastName") &&
    profile.value["firstName"] &&
    profile.value["lastName"]
  ) {
    formatted.push(
      [profile.value["firstName"], profile.value["lastName"]].join(" ")
    );

    fields = fields.filter(
      (field) => field !== "firstName" && field !== "lastName"
    );
  }

  fields.forEach((field) => {
    const value = profile.value[field];

    if (!value) {
      return;
    }

    if (field === "phone") {
      formatted.push(getFormattedPhoneNumberValue(value));
      return;
    }

    if (field === "address") {
      formatted.push(getFormattedAddressValue(value));
      return;
    }

    formatted.push(value);
  });

  return formatted.join("\n");
});

const initialFieldText = ref(fieldText.value);

const inputs = useTemplateRef("inputs");

const validate = () => {
  if (!inputs.value) {
    return false;
  }

  const validationResults = inputs.value.map((input) => input?.validate());

  return validationResults.every(Boolean);
};

const hasValidAutofill = ref(false);

onBeforeMount(() => emit("resize"));

onMounted(() => {
  if (!inputs.value) {
    return false;
  }

  const validationResults: boolean[] = [];

  inputs.value.forEach((input) => {
    if (!input) {
      return;
    }

    const isValid = input.prevalidate();
    validationResults.push(isValid);

    if (!isValid) {
      profile.value[input.field] = null;
    }
  });

  hasValidAutofill.value = validationResults.every(Boolean);
});

const onEdit = () => {
  isEditing.value = true;

  if (props.interaction.fields.length <= 3) {
    emit("resize");
  }
};

const onConfirm = () => {
  emit("complete", props.interaction);
  isComplete.value = true;
};

const onUpdate = () => {
  if (!validate()) {
    return;
  }

  emit("complete", props.interaction);
  isComplete.value = true;
};

const icon = computed<BaseIconName>(() => {
  if (props.interaction.fields.length > 1) {
    return "user";
  }

  const fieldToIcon: Record<FieldType, BaseIconName> = {
    firstName: "user",
    lastName: "user",
    email: "email",
    phone: "phone",
    address: "home",
    dateOfBirth: "calendar",
    ssn: "user",
  };

  return fieldToIcon[props.interaction.fields[0]] ?? "user";
});

const submitButton = computed(() => {
  const { fields } = props.interaction;

  if (fields.includes("ssn") && fields.length === 1) {
    return "Continue";
  }

  return hasValidAutofill.value ? "Update information" : "Submit information";
});
</script>

<template>
  <ChatBubble class="interaction-field-prompt">
    <BaseIcon
      :name="icon"
      class="interaction-field-prompt__icon"
    />
    <BaseText
      v-if="hasValidAutofill"
      variant="headline-6-bold"
      as="h3"
    >
      {{ interaction.confirmText }}
    </BaseText>
    <BaseText
      v-else
      as="h3"
      variant="headline-6-bold"
    >
      {{ interaction.provideText }}
    </BaseText>
    <BaseText
      v-if="hasValidAutofill"
      variant="body-3-regular"
      as="pre"
      class="interaction-field-prompt__autofilled"
    >
      {{ initialFieldText }}
    </BaseText>

    <ChatBubbleFooter v-if="!isComplete && (isEditing || !hasValidAutofill)">
      <ChatInput
        v-for="field in interaction.fields"
        :key="field"
        ref="inputs"
        v-model="profile[field]"
        :field="field"
        @keydown.enter="onUpdate"
      />
      <BaseButton
        variant="primary"
        size="lg"
        class="interaction-field-prompt__submit"
        @click="onUpdate"
      >
        {{ submitButton }}
      </BaseButton>
    </ChatBubbleFooter>
    <ChatBubbleFooter v-else-if="!isComplete">
      <BaseButton
        variant="primary"
        size="lg"
        @click="onConfirm"
      >
        This is correct
      </BaseButton>
      <BaseButton
        variant="secondary"
        size="lg"
        @click="onEdit"
      >
        Update
      </BaseButton>
    </ChatBubbleFooter>
  </ChatBubble>
  <ChatBubble
    v-if="isComplete"
    type="sent"
  >
    <BaseText
      variant="body-3-regular"
      as="pre"
      class="interaction-field-prompt__sent"
    >
      {{ fieldText || "Skip" }}
    </BaseText>
  </ChatBubble>
</template>

<style lang="scss" scoped>
.interaction-field-prompt {
  align-self: stretch;

  &__icon {
    margin-bottom: 10px;
    font-size: 20px;
  }

  &__autofilled {
    margin: 4px 0 0;
  }

  &__submit {
    margin-top: 6px;
  }

  &__sent {
    margin: 0;
  }
}
</style>
