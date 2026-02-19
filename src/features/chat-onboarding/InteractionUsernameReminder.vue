<script setup lang="ts">
import type { UsernameReminder } from "@/features/chat-onboarding/types.ts";
import { computed, inject, onBeforeMount, ref } from "vue";
import BaseText from "@/library/BaseText.vue";
import ChatBubble from "@/features/chat-onboarding/utils/ChatBubble.vue";
import { accountRecoveryInjectionKey } from "@/features/checkout/injectionKeys.ts";
import BaseButton from "@/library/BaseButton.vue";
import { copyToClipboard } from "@/scripts/tools";
import { parsePhoneNumber } from "awesome-phonenumber";
import { posthogCapture } from "@/scripts/posthog";

type InteractionUsernameReminderProps = {
  interaction: UsernameReminder;
};

const props = defineProps<InteractionUsernameReminderProps>();

const emit = defineEmits(["complete", "resize"]);

onBeforeMount(() => emit("resize"));

const accountRecovery = inject(accountRecoveryInjectionKey);

const isCopied = ref(false);

const username = computed(() => {
  if (!accountRecovery) {
    return null;
  }

  if (accountRecovery.value.password) {
    return accountRecovery.value.username;
  }

  const phoneNumber = parsePhoneNumber(accountRecovery.value.username ?? "", {
    regionCode: "US",
  });

  return phoneNumber?.number?.significant ?? accountRecovery.value.username;
});

const onCopy = () => {
  if (!accountRecovery) {
    return;
  }

  copyToClipboard(username.value);
  isCopied.value = true;

  posthogCapture("user_clicked_chat_onboarding_copy_username");
  emit("complete", props.interaction);
};
</script>

<template>
  <ChatBubble class="interaction-username-reminder">
    <BaseText
      variant="body-3-regular"
      as="p"
    >
      {{
        accountRecovery?.password
          ? interaction.passwordText
          : interaction.passwordlessText
      }}
    </BaseText>
    <template v-if="username">
      <BaseText
        variant="headline-4-medium"
        as="p"
        class="interaction-username-reminder__username"
        :class="{ 'interaction-username-reminder__username--copied': isCopied }"
      >
        {{ username }}
      </BaseText>
      <BaseButton
        v-if="!isCopied"
        variant="primary"
        size="lg"
        full-width
        class="interaction-username-reminder__button"
        @click="onCopy"
      >
        {{ interaction.buttonText }}
      </BaseButton>
    </template>
  </ChatBubble>
</template>

<style lang="scss" scoped>
.interaction-username-reminder {
  width: 100%;
  text-align: center;

  &__username {
    margin-top: 10px;
    color: $color-brand-300;

    &--copied {
      color: $color-green-200;
    }
  }

  &__button {
    margin-top: 10px;
  }

  :deep(.base-button__icon) {
    display: none;
  }
}
</style>
