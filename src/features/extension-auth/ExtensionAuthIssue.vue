<template>
  <div class="extension-auth-issue">
    <BaseSheet
      v-if="loading"
      rounding="lg"
      elevation="md"
      spacing-x="xl"
      spacing-y="xl"
      variant="primary"
      class="loading-state"
    >
      <div class="spinner"></div>
      <BaseText
        variant="body-2-semibold"
        as="p"
      >
        {{ loadingMessage }}
      </BaseText>
    </BaseSheet>
    <BaseSheet
      v-else-if="error"
      rounding="lg"
      elevation="md"
      spacing-x="xl"
      spacing-y="xl"
      variant="primary"
      class="error-state"
    >
      <BaseText
        variant="headline-4-bold"
        as="h2"
        class="error-title"
      >
        Failed to initiate extension authentication
      </BaseText>
      <BaseText
        variant="body-3-regular"
        as="p"
        class="error-subtitle"
      >
        {{ error }}
      </BaseText>
      <BaseButton
        variant="primary"
        size="md"
        class="retry-button"
        @click="retry"
      >
        Try Again
      </BaseButton>
    </BaseSheet>
    <!-- Success state will be handled by a different route -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useStore } from "vuex";
import { HAS_ACTIVATED_PLUGIN } from "@/scripts/userFlags";
import { useExtensionAuthCallback } from "@/composables/useExtensionAuthCallback";
import BaseSheet from "@/library/BaseSheet.vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";

const loading = ref<boolean>(true);
const error = ref<string | null>(null);
const loadingMessage = ref<string>("Authenticating your browser extension...");
const authAttempt = ref<number>(0);

const store = useStore();

const extensionInstalled = computed(() => {
  return (
    store.getters.getFlag(HAS_ACTIVATED_PLUGIN) ||
    store.getters["browser/pluginDetected"]
  );
});

const { startExtensionAuth } = useExtensionAuthCallback();

const updateLoadingMessage = (attempt: number): void => {
  switch (attempt) {
    case 0:
      loadingMessage.value = "Authenticating your browser extension...";
      break;
    case 1:
    case 2:
      loadingMessage.value = "Retrying authentication...";
      break;
    default:
      loadingMessage.value = "Processing authentication...";
  }
};

const retry = async (): Promise<void> => {
  error.value = null;
  loading.value = true;
  authAttempt.value++;
  updateLoadingMessage(authAttempt.value);

  try {
    await startExtensionAuth({
      silent: false,
      debug: import.meta.env.DEV,
    });
  } catch (err: any) {
    error.value =
      err?.message || "Extension authentication failed. Please try again.";
  } finally {
    loading.value = false;
  }
};

const initiateAuth = async (): Promise<void> => {
  if (!extensionInstalled.value) {
    error.value = "Browser extension is not installed or detected.";
    loading.value = false;
    return;
  }

  authAttempt.value = 0;
  updateLoadingMessage(authAttempt.value);

  try {
    await startExtensionAuth({
      silent: false,
    });
  } catch (err: any) {
    error.value =
      err?.message || "Extension authentication failed. Please try again.";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  initiateAuth();
});
</script>

<style lang="scss" scoped>
.extension-auth-issue {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.loading-state,
.error-state {
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid $color-primary-20;
  border-top: 3px solid $color-primary-100;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.error-icon {
  font-size: 3rem;
  color: $color-status-error;
}

.error-title {
  margin: 0;
}

.error-subtitle {
  color: $color-primary-50;
  margin: 0;
}

.retry-button {
  margin-top: 1rem;
}
</style>
