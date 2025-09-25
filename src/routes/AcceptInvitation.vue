<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
import BaseButton from "@/library/BaseButton.vue";
import { computed, onMounted, onUnmounted, ref } from "vue";
import router from "@/routes/router";
import store from "@/store";
import { useRoute } from "vue-router";
import { logout } from "@/scripts/actions/auth";

const username = computed(() => {
  return store.state.authentication?.username;
});

const route = useRoute();
const iframe = ref(null);
const invitationState = ref(null);
const isInvitationValid = computed(
  () => invitationState.value?.state === "pending"
);
const planType = computed(() =>
  parseInt(invitationState.value?.max_members ?? 0) > 2 ? "Family" : "Couple"
);

const onAcceptInvite = () => {
  if (username.value) {
    store.dispatch("authentication/handleAcceptInvite", route.params.id);
    router.push({ name: "settings.subscription" });
  } else {
    router.push({ name: "signup", query: { invite_code: route.params.id } });
  }
};

const iframeListener = (message) => {
  if (
    message.source === iframe?.value?.contentWindow &&
    message.data.event === "user-invitation"
  ) {
    invitationState.value = message.data.data;
  }
};

const onLoad = () => {
  if (iframe.value.contentDocument?.title.contains("404")) {
    invitationState.value = { state: "invalid" };
  }
};

onUnmounted(() => {
  window.removeEventListener("message", iframeListener);
});

onMounted(() => {
  window.addEventListener("message", iframeListener);
});

const src = computed(() => {
  return `${import.meta.env.VITE_API}invitation/${route.params.id}/`;
});
</script>

<template>
  <div class="accept-invitation">
    <InlineSvg
      name="cloaked-logo-full"
      class="accept-invitation__logo"
    />
    <div
      v-if="invitationState"
      class="accept-invitation__content"
    >
      <template v-if="isInvitationValid">
        <img
          src="@/assets/images/subscription/logo-accept.webp"
          alt="Cloaked Identity"
          width="268"
          height="155"
          class="accept-invitation__icon"
        />
        <h1 class="accept-invitation__title">
          You have been invited to join a Cloaked {{ planType }} plan!
        </h1>
        <p class="accept-invitation__start">Start your Privacy Journey today</p>
        <BaseButton
          class="accept-invitation__cta"
          size="lg"
          variant="cloaked-gradient"
          icon="arrow-right"
          @click="onAcceptInvite"
        >
          Accept invite
        </BaseButton>
        <p
          v-if="username"
          class="accept-invitation__auth-status"
        >
          You are signed in as
          <span class="accept-invitation__username">{{ username }}</span>
          <br />
          <button
            class="accept-invitation__sign-out"
            @click="logout"
          >
            Sign out
          </button>
        </p>
      </template>
      <template v-else>
        <img
          src="@/assets/images/subscription/logo-resubscribe.webp"
          alt="Cloaked Identity"
          width="290"
          height="167"
          class="accept-invitation__icon"
        />
        <h1 class="accept-invitation__title">
          We are sorry, this invitation has already expired!
        </h1>
        <BaseButton
          class="accept-invitation__cta"
          size="lg"
          variant="primary"
          icon="arrow-right"
          @click="$router.push({ name: 'Home' })"
        >
          Go to dashboard
        </BaseButton>
      </template>
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

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.accept-invitation {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  background-color: $color-primary-1;

  &__logo {
    color: $color-primary-100;
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

  &__icon {
    width: clamp(50px, 50vw, 267px);
    filter: drop-shadow(0 9px 34px rgba(0, 0, 0, 0.1));
  }

  &__title {
    font-size: 26px;
    font-style: normal;
    font-weight: 600;
    line-height: 1.25;
    color: $color-primary-100;
    margin-top: 18px;
    text-align: center;

    @media all and (min-width: $screen-sm) {
      font-size: 32px;
      font-style: normal;
      margin-top: 24px;
    }
  }

  &__start {
    color: $color-primary-100;
    margin-top: 24px;
  }

  &__auth-status {
    color: $color-primary-100;
    margin-top: 32px;
    font-size: 14px;
    font-weight: 500;
    text-align: center;
  }

  &__username {
    font-weight: 600;
    word-break: break-all;
  }

  &__sign-out {
    display: block;
    margin: 8px auto 0;
    border: 0;
    background: 0;
    color: $color-primary-100;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    opacity: 0.5;

    &:hover {
      opacity: 0.6;
    }
  }

  &__cta {
    margin-top: 32px;
    width: 90%;

    @media all and (min-width: $screen-sm) {
      margin-top: 42px;
    }
  }
}
</style>
