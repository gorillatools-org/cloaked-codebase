<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
import { ref } from "vue";
import BaseText from "@/library/BaseText.vue";
import BaseTextHiddenDots from "@/library/BaseTextHiddenDots.vue";

defineProps({
  hadDownloadedKey: {
    type: Boolean,
    default: false,
  },
  recoveryKey: {
    type: String,
    default: null,
  },
  username: {
    type: String,
    default: null,
  },
  password: {
    type: String,
    default: null,
  },
});

const isPasswordVisible = ref(false);
</script>

<template>
  <div class="recovery-key-card">
    <div
      v-if="hadDownloadedKey"
      class="recovery-key-card__success"
    >
      <InlineSvg
        name="checkmark"
        class="recovery-key-card__success-icon"
      />
    </div>
    <div class="recovery-key-card__key">
      <BaseText
        variant="body-3-semibold"
        class="recovery-key-card__label"
      >
        Recovery Key
      </BaseText>
      <BaseText
        v-if="recoveryKey"
        legible
        variant="headline-6-medium"
        class="recovery-key-card__value legible-text"
      >
        {{ recoveryKey }}
      </BaseText>
    </div>
    <div class="recovery-key-card__divider" />
    <div>
      <BaseText
        variant="body-3-semibold"
        class="recovery-key-card__label"
      >
        Cloaked Username
      </BaseText>
      <BaseText
        v-if="username"
        variant="headline-6-medium"
        class="recovery-key-card__value"
      >
        {{ username }}
      </BaseText>
    </div>
    <div>
      <BaseText
        variant="body-3-semibold"
        class="recovery-key-card__label"
      >
        Password
      </BaseText>
      <div class="recovery-key-card__value recovery-key-card__value-password">
        <BaseText
          v-if="password && isPasswordVisible"
          variant="headline-6-medium"
        >
          {{ password }}
        </BaseText>
        <BaseTextHiddenDots
          v-if="password && !isPasswordVisible"
          variant="headline-6-medium"
          :count="16"
        />

        <InlineSvg
          v-show="isPasswordVisible"
          name="eye-slash"
          class="recovery-key-card__eye"
          @click="isPasswordVisible = !isPasswordVisible"
        />
        <InlineSvg
          v-show="!isPasswordVisible"
          name="eye"
          class="recovery-key-card__eye"
          @click="isPasswordVisible = !isPasswordVisible"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.recovery-key-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  border-radius: 20px;
  backdrop-filter: blur(22px);
  padding: 24px;
  position: relative;
  height: auto;
  background: rgba($color-primary-100-dark, 0.07);
  box-shadow: 0 4px 16px 0 rgb(0 0 0 / 15%);

  &__label {
    opacity: 0.7;
  }

  &__value {
    word-break: break-all;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: 4px;
    height: auto;
    &-password {
      height: 24px;
    }
  }

  &__key {
    grid-column: 1/3;

    .recovery-key-card__value {
      padding-right: 100px;
    }
  }

  &__eye {
    cursor: pointer;
    flex-shrink: 0;

    &:hover {
      opacity: 0.8;
    }
  }

  &__divider {
    grid-column: 1/3;

    @at-root .theme-dark & {
      border-top: 1px solid rgba($color-primary-100-dark, 0.2);
    }

    @at-root .theme-light & {
      border-top: 1px solid rgba($color-primary-100-light, 0.2);
    }
  }

  @keyframes appear {
    0% {
      transform: scale(0);
    }

    100% {
      transform: scale(1);
    }
  }

  &__success {
    position: absolute;
    right: 24px;
    top: 24px;
    width: 50px;
    height: 50px;
    background: linear-gradient(
        $color-primary-100-dark 0%,
        $color-primary-100-dark 100%
      )
      center/50% 50% no-repeat;
    animation: appear 0.2s cubic-bezier(0.4, 0, 0.5, 1.5);

    &-icon {
      width: 50px;
      height: 50px;
      color: $color-success;
    }
  }
}
</style>
