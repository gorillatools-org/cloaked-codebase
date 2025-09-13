<script setup>
import { computed, onMounted } from "vue";
import store from "@/store/index.js";
import BaseText from "@/library/BaseText.vue";
import BaseSheet from "@/library/BaseSheet.vue";
import BaseButton from "@/library/BaseButton.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import EnrollmentOrb from "@/features/enrollment/EnrollmentOrb.vue";
import { useDisplay } from "@/composables/useDisplay.js";
import { posthogCapture } from "@/scripts/posthog.js";

onMounted(() => posthogCapture("user_viewed_enrollment_form_ready"));

defineEmits(["download-app", "go-to-dashboard"]);

const isPasswordless = computed(
  () => store.getters["authentication/user"]?.is_passwordless
);

const username = computed(() => store.getters["authentication/username"]);

const { isMobile } = useDisplay();
</script>

<template>
  <div class="page-enrollment-ready">
    <BaseText
      as="h1"
      :variant="isMobile ? 'headline-3-bold' : 'headline-1-medium'"
      class="page-enrollment-ready__title"
    >
      <template v-if="isMobile">
        You're in! You are on your way to being cloaked.
      </template>
      <template v-else>Cloaked has you covered!</template>
    </BaseText>
    <BaseSheet
      class="page-enrollment-ready__username"
      spacing-x="lg"
      spacing-y="md"
    >
      <BaseText
        variant="body-3-regular"
        as="h2"
      >
        <template v-if="isPasswordless">
          Your username is your phone number
        </template>
        <template v-else>Your username</template>
      </BaseText>
      <BaseText
        variant="headline-3-bold"
        as="p"
      >
        {{ username }}
      </BaseText>
    </BaseSheet>
    <BaseText
      variant="body-3-semibold"
      class="page-enrollment-ready__next-steps"
    >
      Next steps
    </BaseText>
    <BaseSheet
      class="page-enrollment-ready__progress"
      spacing-y="lg"
      spacing-x="lg"
    >
      <section class="page-enrollment-ready__step">
        <BaseIcon
          name="tick-circle-filled"
          class="page-enrollment-ready__step-icon page-enrollment-ready__step-icon--success"
        />
        <BaseText
          as="h2"
          variant="headline-5-bold"
          class="page-enrollment-ready__step-title"
        >
          Keep track of your exposure
        </BaseText>
        <BaseText
          as="p"
          variant="body-3-regular"
          class="page-enrollment-ready__step-text"
        >
          Removing your existing data and monitoring can take up to 30 days, so
          keep track of progress in the app.
        </BaseText>
        <BaseText
          as="a"
          variant="body-2-semibold"
          class="page-enrollment-ready__step-link"
          href="https://help.cloaked.app/hc/en-us/articles/25906131800468-Data-Deletion-How-does-that-work"
          target="_blank"
        >
          Learn how data removal works
          <BaseIcon
            name="arrow-up-right"
            class="page-enrollment-ready__step-link-icon"
          />
        </BaseText>
      </section>
    </BaseSheet>
    <BaseSheet
      class="page-enrollment-ready__progress"
      spacing-y="lg"
      spacing-x="lg"
    >
      <section class="page-enrollment-ready__step">
        <BaseIcon
          name="email-filled"
          class="page-enrollment-ready__step-icon"
        />
        <BaseText
          as="h2"
          variant="headline-5-bold"
          class="page-enrollment-ready__step-title"
        >
          We'll email you with updates
        </BaseText>
        <BaseText
          as="p"
          variant="body-3-regular"
          class="page-enrollment-ready__step-text"
        >
          We'll keep you informed as we successfully remove your data from the
          web.
        </BaseText>
      </section>
    </BaseSheet>
    <BaseText
      v-if="isMobile"
      variant="body-small-medium"
      class="page-enrollment-ready__note"
    >
      Do you want to stay on top of your privacy?
    </BaseText>
    <BaseText
      v-else
      variant="body-small-medium"
      class="page-enrollment-ready__note"
    >
      Get real-time updates on your data removal
    </BaseText>
    <BaseButton
      v-if="isMobile"
      full-width
      size="lg"
      variant="secondary"
      icon="cloaked-logo-knock-out"
      class="page-enrollment-ready__cta"
      @click="$emit('download-app')"
      @keydown.enter="$emit('download-app')"
    >
      Download Cloaked
    </BaseButton>
    <BaseButton
      v-else
      full-width
      size="lg"
      variant="secondary"
      icon="cloaked-logo-knock-out"
      class="page-enrollment-ready__cta"
      @click="$emit('go-to-dashboard')"
      @keydown.enter="$emit('go-to-dashboard')"
    >
      Go to Dashboard
    </BaseButton>
    <Teleport to="#root">
      <div class="page-enrollment-ready__orbs">
        <EnrollmentOrb class="page-enrollment-ready__orbs-top" />
        <EnrollmentOrb class="page-enrollment-ready__orbs-bottom" />
      </div>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
.page-enrollment-ready {
  display: flex;
  flex-direction: column;
  align-items: center;

  &__title {
    margin-top: 16px;
    width: 100vw;
    text-align: center;
    padding: 0 16px;
  }

  &__username {
    align-self: stretch;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    backdrop-filter: blur(13px);
    margin: 16px auto 0;
    width: 100%;
    max-width: 440px;
    background-color: $color-base-white-15;
    border: 1px solid $color-base-black-15;

    @media screen and (min-width: $screen-lg) {
      margin-top: 32px;
    }
  }

  &__next-steps {
    text-align: left;
    width: 100%;
    margin-top: 16px;
    max-width: 440px;
  }

  &__progress {
    backdrop-filter: blur(13px);
    width: 100%;
    max-width: 440px;
    margin-top: 8px;
    background-color: $color-base-white-15;
    border: 1px solid $color-base-black-15;
  }

  &__step {
    position: relative;
    margin-top: 6px;
    padding-bottom: 10px;

    &-icon {
      font-size: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 100px;
      background-color: $color-base-black-10;

      &--success {
        color: $color-safe-zone-green;
        background-color: $color-safe-zone-green-15;
      }
    }

    &-title {
      margin-top: 8px;
    }

    &-text {
      opacity: 0.7;
      margin-top: 4px;
    }

    &-link {
      margin-top: 12px;
      text-decoration: underline;
      cursor: pointer;
      display: block;

      &:hover {
        opacity: 0.8;
      }

      &-icon {
        margin-left: 4px;
        vertical-align: middle;
      }
    }
  }

  &__note {
    margin-top: 34px;
    opacity: 0.6;
  }

  &__cta {
    margin-top: 18px;
    max-width: 440px;

    &:focus {
      outline: 1px solid $color-primary-100;
    }

    &.base-button {
      :deep(.base-button__icon) {
        background-color: $color-base-black-10;
      }
    }
  }

  &__orbs {
    &-top,
    &-bottom {
      position: fixed;
      width: 160vh;
      height: 160vh;
      left: 50%;
      z-index: 999;
      opacity: 0;
    }

    &-top {
      top: 0;
      transform: translate3d(-50%, -65%, 0);
      animation: appear 1.5s 0.2s ease forwards;

      @media all and (min-width: $screen-lg) {
        transform: translate3d(-50%, -60%, 0);
      }
    }

    &-bottom {
      transform: translate3d(-50%, 70%, 0);
      bottom: 0;
      animation: appear 2s 0.4s ease forwards;

      @media all and (min-width: $screen-lg) {
        transform: translate3d(-50%, 70%, 0);
      }
    }
  }
}
</style>
