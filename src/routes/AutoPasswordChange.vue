<script setup>
import { onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import { useAutoPasswordChange } from "./AutoPasswordChange/composables/useAutoPasswordChange";
import AutoPasswordChangeIframe from "./AutoPasswordChange/components/AutoPasswordChangeIframe.vue";
import { usePostHogFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";
import { PH_FEATURE_FLAG_AUTO_CLOAKING } from "@/scripts/posthogEvents";

const router = useRouter();

const { featureFlag: isAutoCloakingEnabled, hasLoadedFeatureFlag } =
  usePostHogFeatureFlag(PH_FEATURE_FLAG_AUTO_CLOAKING);

const {
  extensionInstalled,
  openExtensionInstallPage,
  requestAutoPasswordChangeUrl,
  autoPasswordChangeUrl,
} = useAutoPasswordChange();

onMounted(() => {
  // Add initialization logic here
  requestAutoPasswordChangeUrl();
});

watch(hasLoadedFeatureFlag, (value) => {
  if (value) {
    if (!isAutoCloakingEnabled.value) {
      router.push({ name: "Home" });
    }
  }
});
</script>

<template>
  <div class="auto-password-change">
    <div class="auto-password-change__content">
      <div
        v-if="extensionInstalled && autoPasswordChangeUrl"
        class="auto-password-change__card"
      >
        <AutoPasswordChangeIframe />
      </div>
      <div
        v-else
        class="auto-password-change__card"
      >
        <div class="operator-modal__content">
          <BaseText
            variant="headline-2-semibold"
            as="h1"
            class="operator-modal__title"
          >
            Automatic Password Change
          </BaseText>

          <div class="operator-modal__description">
            <BaseText
              variant="headline-6-medium"
              as="p"
            >
              Keep your accounts secure by automatically updating passwords
              right in your browser.
            </BaseText>
            <BaseText
              variant="headline-6-medium"
              as="p"
            >
              If you have the Cloaked extension installed, you may need to
              restart your browser to update.
            </BaseText>
          </div>

          <div class="operator-modal__actions">
            <BaseButton
              variant="cloaked-gradient-secondary"
              size="lg"
              class="operator-modal__primary-button"
              icon="download"
              @click="openExtensionInstallPage"
            >
              Install Cloaked Extension
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.auto-password-change {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-right: 8px;
    margin-bottom: 48px;
  }

  &__card {
    flex: 1;
    overflow-y: auto;
    background-color: $color-primary-5;
    border-radius: 20px;
    padding: 16px 16px;
    transition: all 0.4s ease;
    position: relative;
    z-index: 1;
  }

  &__title {
    margin-bottom: 8px;
  }

  &__description {
    color: $color-primary-70;
  }
}

.operator-modal {
  width: 90%;
  max-width: 1200px;
  border-radius: 18px;
  background-color: $color-background;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba($black, 0.1);
  margin: 0 auto;

  &__content {
    display: flex;
    flex-direction: column;
    padding: 36px;
    text-align: center;
  }

  &__title {
    margin-bottom: 12px;
  }

  &__description {
    margin-bottom: 32px;

    p {
      color: $color-primary-70;
      margin: 0;
      line-height: 1.5;
    }
  }

  &__actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  &__primary-button {
    width: 100%;
    max-width: 280px;
    justify-content: center;
  }

  &__text-button {
    color: $color-primary-70;
    transition: color 0.2s ease;

    &:hover {
      color: $color-primary-90;
    }
  }
}
</style>
