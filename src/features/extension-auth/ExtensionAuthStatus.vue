<template>
  <div class="extension-auth-status">
    <BaseSheet
      v-if="statusMessage"
      rounding="lg"
      elevation="lg"
      spacing-x="xl"
      spacing-y="xl"
      variant="primary"
      :class="isSuccess ? 'status-card success' : 'status-card error'"
    >
      <BaseText
        variant="headline-3-bold"
        as="h2"
        class="status-title"
      >
        {{
          isSuccess
            ? "Extension Authentication Successful"
            : "Extension Authentication Failed"
        }}
      </BaseText>
      <BaseText
        variant="body-3-regular"
        as="p"
        class="status-message"
      >
        {{ statusMessage }}
      </BaseText>
      <BaseText
        v-if="isSuccess"
        variant="body-small-medium"
        as="p"
        class="subtitle"
      >
        You can now close this page and continue using the extension.
      </BaseText>
      <div
        v-if="isSuccess && countdown >= 0"
        class="countdown-wrapper"
      >
        <BaseText
          variant="body-small-medium"
          as="p"
        >
          <span v-if="countdown > 0">
            This page will close automatically in {{ countdown }} second{{
              countdown !== 1 ? "s" : ""
            }}.
          </span>
          <span v-else>You can close this page now...</span>
        </BaseText>
      </div>
      <BaseText
        v-if="!isSuccess"
        variant="body-small-medium"
        as="p"
        class="subtitle"
      >
        Please try initiating the authentication from the extension again. If
        the problem persists, contact support.
      </BaseText>
      <div
        v-if="!isSuccess && !isErrorFromOAuth && !query.error && countdown >= 0"
        class="countdown-wrapper"
      >
        <BaseText
          variant="body-small-semibold"
          as="p"
        >
          <span v-if="countdown > 0">
            Redirecting to home in {{ countdown }} second{{
              countdown !== 1 ? "s" : ""
            }}...
          </span>
          <span v-else>Redirecting to home...</span>
        </BaseText>
      </div>
      <BaseButton
        v-if="!isSuccess"
        variant="primary"
        size="md"
        class="action-button"
        icon="email-open"
        @click="contactSupport"
      >
        Contact Support
      </BaseButton>
    </BaseSheet>
    <BaseSheet
      v-else
      rounding="lg"
      elevation="md"
      spacing-x="xl"
      spacing-y="xl"
      variant="primary"
      class="loading-card"
    >
      <BaseText
        variant="body-2-semibold"
        as="p"
      >
        Loading status...
      </BaseText>
    </BaseSheet>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import BaseSheet from "@/library/BaseSheet.vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";

const route = useRoute();
const router = useRouter();
const statusMessage = ref<string>("");
const isSuccess = ref<boolean>(false);
const isErrorFromOAuth = ref<boolean>(false);
const countdown = ref<number>(0);
const query = route.query;
const INITIAL_COUNTDOWN = 3;

let countdownInterval: number | null = null;

const startCountdown = (initialSeconds: number, callback: () => void): void => {
  countdown.value = initialSeconds;

  // Clear any existing interval before starting a new one
  if (countdownInterval !== null) {
    clearInterval(countdownInterval);
  }

  countdownInterval = window.setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      if (countdownInterval !== null) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }
      callback();
    }
  }, 1000);
};

onMounted(() => {
  const allowNavigation = sessionStorage.getItem(
    "allow_extension_auth_status_navigation"
  );
  if (allowNavigation !== "true") {
    router.replace({ name: "Home" });
    return;
  }

  if (query.success === "true") {
    isSuccess.value = true;
    statusMessage.value =
      "Your browser extension has been successfully authenticated.";

    startCountdown(INITIAL_COUNTDOWN, () => {
      sessionStorage.removeItem("allow_extension_auth_status_navigation");
      closePage();
    });
  } else if (query.error) {
    isSuccess.value = false;
    statusMessage.value =
      "Something went wrong with the authentication process.";
    if (
      typeof query.error === "string" &&
      query.error.toLowerCase().includes("oauth error")
    ) {
      isErrorFromOAuth.value = true;
    }
  } else {
    statusMessage.value = "Authentication could not be completed.";
    sessionStorage.removeItem("allow_extension_auth_status_navigation");

    startCountdown(2, () => {
      if (!query.success && !query.error) {
        router.replace({ name: "Home" });
      }
    });
  }
});

const closePage = (): void => {
  window.close();
  if (!window.closed) {
    console.warn("Browser prevented automatic closing of the window.");
  }
};

const contactSupport = (): void => {
  // Open support in a new tab/window
  window.open(
    "mailto:support@cloaked.app?subject=Extension Authentication Issue",
    "_blank"
  );
};

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
});
</script>

<style lang="scss" scoped>
.extension-auth-status {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background-color: $color-primary-5;
  border-radius: 20px;
}

.status-card,
.loading-card {
  max-width: 450px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  &.success {
    border-top: 5px solid $color-status-success;
  }

  &.error {
    border-top: 5px solid $color-status-error;
  }
}

.icon {
  font-size: 3.5rem;
}

.success-icon {
  color: $color-status-success;
}

.error-icon {
  color: $color-status-error;
}

.status-title {
  margin: 0;
  color: $color-primary-100;
}

.status-message {
  color: $color-primary-70;
  margin: 0;
  line-height: 1.6;
}

.subtitle {
  color: $color-primary-50;
  margin: 0;
}

.countdown-wrapper {
  background-color: $color-base-black-5;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid $color-base-black-10;
  margin: 0;
}

.action-button {
  margin-top: 1rem;
}
</style>
