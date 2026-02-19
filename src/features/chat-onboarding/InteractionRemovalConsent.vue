<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import type { RemovalConsent } from "@/features/chat-onboarding/types.ts";
import BaseText from "@/library/BaseText.vue";
import ChatBubble from "@/features/chat-onboarding/utils/ChatBubble.vue";
import BaseButton from "@/library/BaseButton.vue";
import ChatBubbleFooter from "@/features/chat-onboarding/utils/ChatBubbleFooter.vue";
import EnrollmentAgreement from "@/features/enrollment/EnrollmentAgreement.vue";

type InteractionRemovalConsentProps = {
  interaction: RemovalConsent;
};

const props = defineProps<InteractionRemovalConsentProps>();

const emit = defineEmits(["complete", "resize"]);

const agreesWithTerms = ref(true);

const isComplete = ref(false);

onBeforeMount(() => emit("resize"));

const onConsent = () => {
  emit("complete", props.interaction);
  isComplete.value = true;
};
</script>

<template>
  <ChatBubble class="interaction-removal-consent">
    <BaseText
      variant="body-3-regular"
      as="p"
    >
      {{ interaction.text }}
    </BaseText>
    <ChatBubbleFooter v-if="!isComplete">
      <EnrollmentAgreement v-model="agreesWithTerms" />
      <BaseButton
        :disabled="!agreesWithTerms"
        variant="primary"
        size="lg"
        @click="onConsent"
      >
        {{ interaction.consentText }}
      </BaseButton>
    </ChatBubbleFooter>
  </ChatBubble>
  <ChatBubble
    v-if="isComplete"
    type="sent"
  >
    <BaseText
      variant="body-3-regular"
      class="interaction-removal-consent__sent"
      as="pre"
    >
      {{ interaction.consentText }}
    </BaseText>
  </ChatBubble>
</template>

<style lang="scss" scoped>
@import "@/assets/scss/recursive/library";

.interaction-removal-consent {
  width: 100%;

  &__sent {
    margin: 0;
  }

  :deep(.enrollment-agreement__label) {
    @include font-style-by-type("subhead-regular");

    margin-bottom: 2px;
  }

  :deep(.enrollment-agreement__unchecked) {
    margin-bottom: 0;
    margin-right: 4px;
  }

  :deep(.enrollment-agreement__checked) {
    margin-bottom: 0;
    margin-right: 4px;
  }
}
</style>
