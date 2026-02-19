<script setup lang="ts">
import { ref } from "vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import { SUPPORT_EMAIL } from "@/scripts/constants";
import { tools } from "@/scripts/tools";

const emit = defineEmits<{
  (e: "copied"): void;
}>();

const isCopied = ref(false);

const handleCopy = async () => {
  if (isCopied.value) return;

  try {
    await tools.copyToClipboard(SUPPORT_EMAIL);
    isCopied.value = true;
    emit("copied");
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch (error) {
    console.error("Failed to copy email:", error);
  }
};
</script>

<template>
  <div
    class="vc-base-copy-support-email"
    @click="handleCopy"
  >
    <BaseText
      variant="body-3-semibold"
      class="vc-base-copy-support-email__email"
      :title="isCopied ? 'Copied!' : 'Copy support email'"
    >
      {{ SUPPORT_EMAIL }}
    </BaseText>
    <BaseIcon
      :name="isCopied ? 'check-square' : 'copy'"
      class="vc-base-copy-support-email__icon"
    />
  </div>
</template>

<style scoped lang="scss">
.vc-base-copy-support-email {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  &:hover {
    color: $color-primary-90;
  }
}
</style>
