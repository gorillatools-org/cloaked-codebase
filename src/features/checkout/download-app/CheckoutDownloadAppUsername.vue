<script setup lang="ts">
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import { copyToClipboard } from "@/scripts/tools";
import { computed, inject, ref } from "vue";
import { parsePhoneNumber } from "awesome-phonenumber";
import { accountRecoveryInjectionKey } from "@/features/checkout/injectionKeys.ts";
import { posthogCapture } from "@/scripts/posthog";
import store from "@/store/index";

type CheckoutDownloadAppUsernameProps = {
  buttonText: string;
};

defineProps<CheckoutDownloadAppUsernameProps>();

const accountRecovery = inject(accountRecoveryInjectionKey, null);

const isCopied = ref(false);

const recoveryUsername = computed(() => {
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

const storeUsername = computed(() => {
  const username = store.getters["authentication/getUsername"];

  const phoneNumber = parsePhoneNumber(username ?? "", {
    regionCode: "US",
  });

  return phoneNumber?.number?.significant ?? username;
});

const username = computed(
  () => recoveryUsername.value ?? storeUsername.value ?? null
);

const onCopy = () => {
  copyToClipboard(username.value);
  isCopied.value = true;

  posthogCapture("user_clicked_post_checkout_download_app_copy_username");
};
</script>

<template>
  <BaseText
    variant="body-3-regular"
    as="div"
    class="checkout-download-app-username"
  >
    <span
      class="checkout-download-app-username__text"
      :class="{ 'checkout-download-app-username__text--copied': isCopied }"
    >
      {{ username }}
    </span>
    <BaseButton
      variant="text"
      class="checkout-download-app-username__button"
      @click="onCopy"
    >
      {{ buttonText }}
    </BaseButton>
  </BaseText>
</template>

<style lang="scss" scoped>
.checkout-download-app-username {
  background-color: $color-base-black-10;
  border-radius: 16px;
  padding: 4px 0 4px 20px;
  display: inline-flex;
  align-items: center;

  &__text {
    color: $color-brand-300;
    word-break: break-word;
    text-align: left;

    &--copied {
      color: $color-green-200;
    }
  }

  &__button {
    flex-shrink: 0;

    &:active {
      transform: scale(0.97);
    }
  }

  :deep(.base-button--text:not(:disabled):hover) {
    background-color: unset;
  }
}
</style>
