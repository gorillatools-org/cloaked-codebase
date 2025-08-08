<script setup>
import { ref, onMounted } from "vue";
import { useAutoPasswordChange } from "../composables/useAutoPasswordChange";
import { useColorScheme } from "@/composables/useColorScheme";

defineProps({
  height: {
    type: String,
    default: "100%",
  },
});

const { autoPasswordChangeUrl, requestAutoPasswordChangeUrl } =
  useAutoPasswordChange();
const iframeRef = ref(null);
const { colorScheme } = useColorScheme();

onMounted(() => {
  requestAutoPasswordChangeUrl();
});
</script>

<template>
  <div class="auto-password-change-iframe-container">
    <iframe
      ref="iframeRef"
      :src="`${autoPasswordChangeUrl}${autoPasswordChangeUrl?.includes('?') ? '&' : '?'}theme=${colorScheme}`"
      :style="`height: ${height}; width: 100%;`"
      class="auto-password-change-iframe"
      frameborder="0"
      sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"
    />
  </div>
</template>

<style lang="scss" scoped>
.auto-password-change-iframe-container {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auto-password-change-iframe {
  border-radius: 12px;
  background: $color-base-white-100;
  border: 1px solid $color-primary-10;
}
</style>
