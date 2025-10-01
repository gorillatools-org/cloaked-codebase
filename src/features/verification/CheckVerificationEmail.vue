<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
import BaseButton from "@/library/BaseButton.vue";

import { computed, onMounted, onUnmounted, ref } from "vue";
import router from "@/routes/router";
import { useRoute } from "vue-router";
import { HELP_CENTER_BASE_URL, SUPPORT_EMAIL } from "@/scripts/constants";
import BaseText from "@/library/BaseText.vue";
import EmailService from "@/api/actions/email-service.js";
import { logout } from "@/scripts/actions/auth";
import store from "@/store";
import { useToast } from "@/composables/useToast.js";

const toast = useToast();

const route = useRoute();
const iframe = ref(null);
const iframeLoaded = ref(false);
const isVerified = ref(null);
const verifiedEmail = ref(null);
const verifiedEmailId = ref(null);
const responseMessage = ref(null);

const backendUrl = computed(() => {
  const url = import.meta.env.VITE_API;
  return url.replace(/\/$/, "");
});

const iframeListener = (message) => {
  if (
    message.source === iframe?.value?.contentWindow &&
    message.origin === backendUrl.value &&
    message.data.event === "verify-user-email"
  ) {
    isVerified.value = message.data.data.verified === true;
    responseMessage.value = message.data.data.message;
    verifiedEmail.value = message.data.data.email;
    verifiedEmailId.value = message.data.data.email_id;
    iframeLoaded.value = true;
  }
};

const errorMessages = {
  WRONG_USER: "User ID is required.",
  TOKEN_EXPIRED: "This link has expired.",
  TOKEN_INVALID: "Invalid verification link.", // show generic error state
  EMAIL_NOT_FOUND: "Email not found.", // show generic error state
};

async function onLoad() {
  if (iframe.value.contentDocument?.title?.includes("404")) {
    iframeLoaded.value = true;
  } else {
    iframe.value.contentWindow.postMessage(
      {
        event: "verify-user-email",
        data: {
          token: emailToken.value,
          access_token: accessToken.value,
        },
      },
      import.meta.env.VITE_API
    );
  }
}

onUnmounted(() => {
  window.removeEventListener("message", iframeListener);
});

onMounted(() => {
  window.addEventListener("message", iframeListener);
});

const emailToken = computed(() => {
  return route.query.token;
});

const accessToken = computed(() => {
  return store.state.authentication?.auth?.access_token;
});

const src = computed(() => {
  return `${import.meta.env.VITE_API}verify-user-email`;
});

function navToHome() {
  window.dispatchEvent(new CustomEvent("cloak:refresh-emails"));
  router.push({ name: "Home" });
}

function navToAccountSettings() {
  router.push({ name: "settings.account" });
}

const sendingEmail = ref(false);
const emailResent = ref(false);
function resendEmail() {
  sendingEmail.value = true;
  EmailService.sendVerificationLink(verifiedEmailId.value)
    .then(() => {
      sendingEmail.value = false;
      emailResent.value = true;
      toast.success("New verification link sent. Please check your email.");
    })
    .catch(() => {
      sendingEmail.value = false;
      toast.error("Failed to resend email, please try again.");
    });
}
</script>

<template>
  <div class="check-verification-email">
    <InlineSvg
      name="cloaked-logo-full"
      class="check-verification-email__logo"
    />

    <div
      v-if="!iframeLoaded"
      class="check-verification-email__content"
    >
      <BaseText
        variant="headline-3-bold"
        as="h1"
        class="check-verification-email__title"
      >
        Verifying your email
      </BaseText>
      <InlineSvg
        name="spinner"
        class="check-verification-email__spinner"
      />
      <BaseText
        variant="headline-5-bold"
        as="p"
        class="check-verification-email__description"
      >
        Please wait while we verify your email.
      </BaseText>
    </div>
    <div
      v-else-if="isVerified && verifiedEmail"
      class="check-verification-email__content"
    >
      <img
        src="@/assets/images/subscription/logo-accept.webp"
        alt="Cloaked Identity"
        width="268"
        height="155"
        class="accept-invitation__icon"
      />
      <BaseText
        variant="headline-3-bold"
        as="h1"
        class="check-verification-email__title"
      >
        Your email has been verified.
      </BaseText>
      <BaseText
        variant="headline-5-bold"
        as="p"
        class="check-verification-email__description"
      >
        Thank you for verifying your email address {{ verifiedEmail }}
      </BaseText>
      <BaseButton
        class="check-verification-email__button"
        variant="cloaked-gradient"
        @click="navToHome"
      >
        Continue to Cloaked
      </BaseButton>
    </div>

    <div
      v-else-if="errorMessages.WRONG_USER === responseMessage"
      class="check-verification-email__content"
    >
      <BaseText
        variant="headline-3-bold"
        as="h1"
        class="check-verification-email__title"
      >
        You don't appear to be logged in to the right account. Please decide how
        to proceed.
      </BaseText>
      <BaseText
        variant="headline-5-bold"
        as="p"
        class="check-verification-email__description"
      >
        To access support, email us at
        <a
          :href="`mailto:${SUPPORT_EMAIL}`"
          target="_blank"
        >
          <BaseText
            variant="headline-5-bold"
            class="check-verification-email__link"
            underline
          >
            support@cloaked.com
          </BaseText>
        </a>
        or click
        <a
          :href="HELP_CENTER_BASE_URL"
          target="_blank"
        >
          <BaseText
            variant="headline-5-bold"
            class="check-verification-email__link"
            underline
          >
            here.
          </BaseText>
        </a>
      </BaseText>
      <BaseButton
        class="check-verification-email__button"
        variant="cloaked-gradient"
        @click="navToAccountSettings"
      >
        Verify Another Email
      </BaseButton>
      <BaseText
        variant="headline-5-bold"
        as="p"
        underline
        class="check-verification-email__link check-verification-email__description"
        @click="logout"
      >
        Logout of this account
      </BaseText>
    </div>

    <div
      v-else-if="
        errorMessages.TOKEN_EXPIRED === responseMessage && verifiedEmailId
      "
      class="check-verification-email__content"
    >
      <img
        src="@/assets/images/subscription/logo-accept.webp"
        alt="Cloaked Identity"
        width="268"
        height="155"
        class="accept-invitation__icon"
      />
      <BaseText
        variant="headline-3-bold"
        as="h1"
        class="check-verification-email__title"
      >
        This link has expired.
      </BaseText>
      <BaseText
        variant="headline-5-bold"
        as="p"
        class="check-verification-email__description"
      >
        Click below to request a new link.
      </BaseText>
      <BaseText
        v-if="sendingEmail"
        variant="body-3-semibold"
        as="p"
      >
        Sending...
      </BaseText>
      <BaseText
        v-else-if="emailResent"
        variant="body-3-semibold"
        as="p"
      >
        New link sent. Please check your email.
      </BaseText>
      <BaseButton
        class="check-verification-email__button"
        variant="cloaked-gradient"
        :disabled="sendingEmail"
        :loading="sendingEmail"
        @click="resendEmail"
      >
        Resend Link
      </BaseButton>
    </div>

    <div
      v-else
      class="check-verification-email__content"
    >
      <BaseText
        variant="headline-3-bold"
        as="h1"
        class="check-verification-email__title"
      >
        Something went wrong.
      </BaseText>
      <BaseText
        variant="headline-5-bold"
        as="p"
        class="check-verification-email__description"
      >
        You may need to log out and back in, or verify another email. Having
        issues? To access support, email us at
        <a
          :href="`mailto:${SUPPORT_EMAIL}`"
          target="_blank"
        >
          <BaseText
            variant="headline-5-bold"
            underline
            class="check-verification-email__link"
          >
            support@cloaked.com
          </BaseText>
        </a>
        or click
        <a
          :href="HELP_CENTER_BASE_URL"
          target="_blank"
          @click="contactSupport"
        >
          <BaseText
            variant="headline-5-bold"
            underline
            class="check-verification-email__link"
          >
            here.
          </BaseText>
        </a>
      </BaseText>
      <BaseButton
        class="check-verification-email__button"
        variant="cloaked-gradient"
        @click="navToAccountSettings"
      >
        Verify Another Email
      </BaseButton>
      <BaseText
        variant="headline-5-bold"
        as="p"
        underline
        class="check-verification-email__link check-verification-email__description"
        @click="logout"
      >
        Logout of this account
      </BaseText>
    </div>
  </div>

  <iframe
    ref="iframe"
    :src="src"
    allow="clipboard-read; clipboard-write"
    frameborder="0"
    @load="onLoad"
  />
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.check-verification-email {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  background-color: $color-primary-1;
  color: $color-primary-100;
  &__logo {
    width: 100px;
    position: fixed;
    left: 18px;
    top: 18px;
  }

  &::before {
    position: fixed;
    content: "";
    left: 0;
    top: 0;
    height: 100vw;
    width: 100vw;
    background: $background-rainbow;
    filter: $background-rainbow-filter;
    mix-blend-mode: screen;
    opacity: 0.45;
    border-radius: 59.159px;
    transform: rotate(280deg) skew(20deg, 10deg);
    z-index: 998;
  }

  &__content {
    max-width: 440px;
    margin: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    padding: 20px 32px 60px 32px;
    width: 100%;
    z-index: 999;
  }

  &__title {
    margin-top: 18px;
    text-align: center;

    @media all and (min-width: $screen-sm) {
      font-size: 32px;
      font-style: normal;
      margin-top: 24px;
    }
  }

  &__description {
    margin-top: 32px;
    text-align: center;
  }

  &__button {
    margin-top: 20px;
  }

  &__link {
    cursor: pointer;
    &:hover {
      color: $color-primary-70;
    }
  }

  &__spinner {
    margin-top: 32px;
  }
}
</style>
