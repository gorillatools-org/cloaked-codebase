<script setup lang="ts">
import { computed, ref } from "vue";
import BaseMedallion from "@/library/BaseMedallion.vue";
import type { BaseMedallionProps } from "@/library/BaseMedallion.vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import type { BaseIconName } from "@/library/baseIconTypes";
import { SUPPORT_EMAIL } from "@/scripts/constants";
import { tools } from "@/scripts/tools";
import { safe_html } from "@/scripts/sanitize";

export type WalletStatusSectionProps = {
  medallion?: BaseMedallionProps;
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonIcon?: BaseIconName;
  secondaryButtonText?: string;
  showCopySupportEmail?: boolean;
  descriptionMaxWidth?: number;
};

const emit = defineEmits<{
  (e: "primaryButtonClick"): void;
  (e: "secondaryButtonClick"): void;
  (e: "supportEmailCopied"): void;
}>();

const props = defineProps<WalletStatusSectionProps>();

const isEmailCopied = ref(false);

// Computed keys that change when content changes to trigger animations
const headerKey = computed(() => JSON.stringify(props.medallion));
const contentKey = computed(() => `${props.title}-${props.description}`);
const footerKey = computed(
  () => `${props.primaryButtonText || ""}-${props.secondaryButtonText || ""}`
);

const sanitizedDescription = computed(() =>
  props.description ? safe_html(props.description) : ""
);

const copyEmail = async () => {
  if (isEmailCopied.value) return;

  try {
    await tools.copyToClipboard(SUPPORT_EMAIL);
    isEmailCopied.value = true;

    emit("supportEmailCopied");

    setTimeout(() => {
      isEmailCopied.value = false;
    }, 2000);
  } catch (error) {
    console.error("Failed to copy email:", error);
  }
};
</script>

<template>
  <div class="wallet-status-section">
    <Transition
      name="wallet-status-fade"
      mode="out-in"
    >
      <slot name="header">
        <header
          v-if="headerKey && medallion"
          :key="headerKey"
          class="wallet-status-section__header"
        >
          <BaseMedallion v-bind="medallion" />
        </header>
      </slot>
    </Transition>
    <Transition
      name="wallet-status-fade"
      mode="out-in"
    >
      <div
        v-if="contentKey"
        :key="contentKey"
        class="wallet-status-section__content"
      >
        <slot name="content">
          <BaseText
            class="wallet-status-section__title"
            as="h1"
            variant="headline-2-semibold"
          >
            {{ title }}
          </BaseText>
          <div class="wallet-status-section__description-container">
            <!-- eslint-disable vue/no-v-html -->
            <p
              class="wallet-status-section__description-text"
              :style="{
                maxWidth: descriptionMaxWidth
                  ? `${descriptionMaxWidth}px`
                  : undefined,
              }"
              v-html="sanitizedDescription"
            ></p>
            <!-- eslint-enable vue/no-v-html -->
          </div>
        </slot>
      </div>
    </Transition>
    <Transition
      name="wallet-status-fade"
      mode="out-in"
    >
      <footer
        v-if="footerKey"
        :key="footerKey"
        class="wallet-status-section__footer"
      >
        <slot name="footer">
          <BaseButton
            v-if="primaryButtonText"
            variant="primary"
            size="md"
            icon="refresh"
            class="wallet-status-section__footer-button btn-primary"
            @click="emit('primaryButtonClick')"
          >
            {{ primaryButtonText }}
          </BaseButton>
          <BaseButton
            v-if="secondaryButtonText"
            variant="outline"
            size="md"
            class="wallet-status-section__footer-button btn-secondary"
            @click="emit('secondaryButtonClick')"
          >
            {{ secondaryButtonText }}
          </BaseButton>
          <div
            v-if="showCopySupportEmail"
            class="wallet-status-section__copy-section"
            @click="copyEmail"
          >
            <BaseText
              variant="body-3-semibold"
              class="wallet-status-section__copy-email"
              :title="isEmailCopied ? 'Copied!' : 'Copy support email'"
            >
              {{ SUPPORT_EMAIL }}
            </BaseText>
            <BaseIcon
              :name="isEmailCopied ? 'check-square' : 'copy'"
              class="wallet-status-section__copy-icon"
            />
          </div>
        </slot>
      </footer>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
$component: "wallet-status-section";

.#{$component} {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
  height: 100%;

  &__content {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  &__title {
    text-align: center;
  }

  &__description {
    &-container {
      display: flex;
      justify-content: center;
    }

    &-text {
      text-align: center;
      font-size: 18px;
      font-weight: 400;
      line-height: 120%;
    }
  }

  &__footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-top: 8px;
    width: 100%;

    &-button {
      width: 100%;
      max-width: 305px;
    }
  }

  &__copy {
    &-section {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;

      &:hover {
        color: $color-primary-90;
      }
    }
  }
}

// Animation styles
.wallet-status-fade-enter-active,
.wallet-status-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.wallet-status-fade-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

.wallet-status-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

.wallet-status-fade-enter-to,
.wallet-status-fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>
