<script setup lang="ts">
import CheckoutDownloadApp from "@/features/checkout/download-app/CheckoutDownloadApp.vue";
import DataDeletePageBackground from "@/features/data-delete/DataDeletePageBackground.vue";
import { useRouter } from "vue-router";
import { posthogCapture } from "@/scripts/posthog";
import { useDisplay } from "@/composables/useDisplay";
import { computed, inject, onBeforeMount, ref } from "vue";
import { accountRecoveryInjectionKey } from "@/features/checkout/injectionKeys.ts";
import { fetchFeatureFlag } from "@/composables/usePostHogFeatureFlag";
import type {
  DownloadAppBlock,
  DownloadAppFeatureFlag,
} from "@/features/checkout/downloadAppTypes.ts";
import { initiateEncryption } from "@/scripts/actions/encryption";
import { useDeepLink } from "@/composables/useDeeplink.ts";
import store from "@/store/index";

onBeforeMount(() => initiateEncryption());

const { isMobile } = useDisplay();

const router = useRouter();

const { openDownloadAppDeepLink } = useDeepLink();
const username = computed(() => store.getters["authentication/getUsername"]);

const onDownloadApp = async () => {
  posthogCapture("user_clicked_post_checkout_download_app_button");
  await router.push({ name: "Home" });

  if (isMobile.value) {
    await openDownloadAppDeepLink(username.value);
  }
};

const blocks = ref<DownloadAppBlock[]>([]);

const accountRecovery = inject(accountRecoveryInjectionKey);

onBeforeMount(() => posthogCapture("user_viewed_post_checkout_download_app"));

onBeforeMount(async () => {
  const { payload }: DownloadAppFeatureFlag = await fetchFeatureFlag(
    "post_checkout_download_app"
  );

  blocks.value = (payload ?? []).filter((block) => {
    if (block.type === "username" && !accountRecovery?.value.username) {
      return false;
    }

    return true;
  });
});
</script>

<template>
  <div class="page-checkout-download-app">
    <CheckoutDownloadApp
      v-if="blocks.length > 0"
      :blocks="blocks"
      class="page-checkout-download-app__download"
      @download="onDownloadApp"
    />
    <DataDeletePageBackground />
  </div>
</template>

<style lang="scss" scoped>
.page-checkout-download-app {
  height: 100dvh;

  &__download {
    position: relative;
    z-index: 2;
  }
}
</style>
