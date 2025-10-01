<script setup>
import { ref } from "vue";

const captchaElement = ref(null);
const isInteractive = ref(false);

const loadScript = () =>
  new Promise((resolve) => {
    const script = document.createElement("script");
    script.type = "application/javascript";
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback";
    script.defer = true;
    script.onload = resolve;

    document.head.appendChild(script);
  });

const verify = () =>
  new Promise((resolve, reject) => {
    window.onloadTurnstileCallback = () => {
      // https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/#configurations
      window.turnstile.render(captchaElement?.value, {
        sitekey: import.meta.env.VITE_CAPTCHA_KEY,
        appearance: "interaction-only",
        theme: "light",
        tabindex: -1,
        callback: (token) => {
          isInteractive.value = false;

          resolve(token);
          window.turnstile.remove();
        },
        "error-callback": () => {
          reject();
          window.turnstile.remove();
        },
        "timeout-callback": () => {
          reject();
          window.turnstile.remove();
        },
        "before-interactive-callback": () => {
          isInteractive.value = true;
        },
      });
    };

    loadScript();
  });

defineExpose({ verify });
</script>

<template>
  <div
    class="cloudflare-captcha"
    :class="{ 'cloudflare-captcha--interactive': isInteractive }"
  >
    <div ref="captchaElement" />
  </div>
</template>

<style lang="scss" scoped>
.cloudflare-captcha {
  display: none;

  &--interactive {
    position: fixed;
    z-index: 1000;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba($black, 0.3);
    backdrop-filter: blur(15px);
  }
}
</style>
