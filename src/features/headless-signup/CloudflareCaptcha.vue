<script setup>
import { ref } from "vue";
import { fetchFeatureFlag } from "@/composables/usePostHogFeatureFlag";
import { PH_FEATURE_FLAG_KILLSWITCH_TURNSTILE_CAPTCHA } from "@/scripts/posthogEvents";
import { useToast } from "@/composables/useToast";

const toast = useToast();
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

const verify = async () => {
  const { value: killswitchTurnstileCaptcha } = await fetchFeatureFlag(
    PH_FEATURE_FLAG_KILLSWITCH_TURNSTILE_CAPTCHA
  );

  if (killswitchTurnstileCaptcha === true) {
    // special token for kill switch implementation
    return "-";
  }

  return new Promise((resolve, reject) => {
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
          console.error("Cloudflare captcha verification failed");
          toast.error(
            "Security check failed. Please refresh the page to try again."
          );
          isInteractive.value = false;
          reject();
          window.turnstile.remove();
        },
        "timeout-callback": () => {
          console.error("Cloudflare captcha verification timeout");
          toast.error(
            "Security check failed. Please refresh the page to try again."
          );
          isInteractive.value = false;
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
};

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
