<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import ChatBubble from "@/features/chat-onboarding/utils/ChatBubble.vue";
import type { MultiSelect } from "@/features/chat-onboarding/types.ts";
import BaseText from "@/library/BaseText.vue";
import ChatBubbleFooter from "@/features/chat-onboarding/utils/ChatBubbleFooter.vue";
import BaseButton from "@/library/BaseButton.vue";
import { posthogCapture } from "@/scripts/posthog";

type InteractionSingleSelectProps = {
  interaction: MultiSelect;
};

const props = defineProps<InteractionSingleSelectProps>();

const emit = defineEmits(["complete", "resize"]);

onBeforeMount(() => emit("resize"));

const isComplete = ref(false);

const recordAnswer = () => {
  posthogCapture(`user_answered_chat_${props.interaction.id}`, {
    answer: model.value,
  });
};

const onSubmit = () => {
  emit("complete", props.interaction);
  isComplete.value = true;
  recordAnswer();
};

const model = ref<string[]>([]);
</script>

<template>
  <ChatBubble class="interaction-multi-select">
    <BaseText
      variant="headline-6-bold"
      as="h3"
    >
      {{ interaction.text }}
    </BaseText>
    <form
      v-if="!isComplete"
      class="interaction-multi-select__options"
    >
      <BaseText
        v-for="(option, key) in interaction.options"
        :key="key"
        as="label"
        variant="body-3-regular"
        class="interaction-multi-select__label"
      >
        <input
          v-model="model"
          :value="option"
          type="checkbox"
          class="interaction-multi-select__input"
        />
        {{ option }}
      </BaseText>
    </form>
    <ChatBubbleFooter v-if="!isComplete">
      <BaseButton
        variant="primary"
        size="lg"
        :disabled="!model.length"
        @click="onSubmit"
      >
        Submit
      </BaseButton>
    </ChatBubbleFooter>
  </ChatBubble>
  <ChatBubble
    v-if="isComplete"
    type="sent"
  >
    <BaseText
      variant="body-3-regular"
      as="p"
      class="interaction-multi-select__submitted"
    >
      {{ model.join(", ") }}
    </BaseText>
  </ChatBubble>
</template>

<style lang="scss" scoped>
.interaction-multi-select {
  align-self: stretch;

  &__options {
    display: flex;
    flex-direction: column;
    margin-top: 8px;
  }

  &__label {
    display: flex;
    align-items: center;
    gap: 10px;
    opacity: 0.8;
    cursor: pointer;
    padding: 6px 4px;

    &:has(.interaction-multi-select__input:checked) {
      opacity: 1;
    }
  }

  &__input {
    width: 18px;
    height: 18px;
    position: relative;
    flex-shrink: 0;
    margin: 0;

    &::before {
      content: "";
      position: absolute;
      inset: 0;
      border: 1px solid $color-primary-100;
    }

    &::after {
      content: "";
      position: absolute;
      inset: 3px;
      background-color: $color-primary-100;
      display: none;

      @at-root .interaction-multi-select__input:checked::after {
        display: block;
      }
    }
  }

  &__submitted {
    margin: 0;
  }
}
</style>
