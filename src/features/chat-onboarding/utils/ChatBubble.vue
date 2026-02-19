<script setup lang="ts">
type ChatOnboardingBubbleProps = {
  type?: "received" | "sent" | "cta";
};

withDefaults(defineProps<ChatOnboardingBubbleProps>(), {
  type: "received",
});
</script>

<template>
  <div
    class="chat-bubble"
    :class="`chat-bubble--${type}`"
  >
    <slot />
  </div>
</template>

<style scoped lang="scss">
.chat-bubble {
  display: inline-block;
  padding: 16px;
  border-radius: 16px;
  background-color: $color-base-black-5;

  &--sent {
    margin-left: auto;
    background-color: $color-base-black-15;
  }

  &--cta {
    background-color: $color-base-black-5;
  }
}
</style>
