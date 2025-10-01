<script setup>
import BaseSheet from "@/library/BaseSheet.vue";
import BaseText from "@/library/BaseText.vue";
import BaseProgressTag from "@/library/BaseProgressTag.vue";
import BaseButton from "@/library/BaseButton.vue";
import { confirm_contact } from "@/api/actions/feedback";
import { computed, markRaw } from "vue";
import store from "@/store";
import EmailService from "@/api/actions/email-service";
import { useToast } from "@/composables/useToast.js";
import AddVerifyEmail from "@/features/modals/AddVerifyEmail.vue";

const toast = useToast();

function openEmailVerification() {
  if (firstUnverifiedEmail.value) {
    confirm_contact({
      type: "email",
      contact: firstUnverifiedEmail.value.email,
      id: firstUnverifiedEmail.value.id,
      callback: () => {
        const email = { ...firstUnverifiedEmail.value };
        EmailService.makePrimary(email.id);
        toast.success("Email verified");
      },
    });
  } else {
    store.dispatch("openModal", {
      customTemplate: {
        template: markRaw(AddVerifyEmail),
        props: {
          setPrimary: true,
        },
        events: {
          "email-verified": () => {
            toast.success("Email verified");
          },
        },
      },
    });
  }
}

const hasVerifiedEmail = computed(() => {
  const verifiedEmails = store.getters["settings/getVerifiedEmails"];
  return verifiedEmails.length > 0;
});

const firstUnverifiedEmail = computed(() => {
  const allEmails = store.getters["settings/getPersonalEmails"];
  return allEmails.find((e) => !e.verified);
});
</script>

<template>
  <BaseSheet
    v-if="!hasVerifiedEmail"
    class="email-verification-block"
  >
    <div class="email-verification-block__title">
      <BaseText
        variant="headline-4-bold"
        as="h4"
        class="email-verification-block__title-text"
      >
        Verify your email
      </BaseText>
      <BaseProgressTag>Setting up</BaseProgressTag>
      <BaseText
        variant="body-small-medium"
        as="p"
        class="email-verification-block__title-description"
      >
        Check the link in your email or verify here to ensure that you can
        always access your account.
      </BaseText>
    </div>
    <BaseButton
      variant="secondary"
      size="md"
      full-width
      @click="openEmailVerification"
    >
      Verify now
    </BaseButton>
  </BaseSheet>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.email-verification-block {
  &__title {
    padding: 8px 0;
    display: flex;
    gap: 8px;
    flex-direction: row;
    justify-content: space-between;
    flex-wrap: wrap;
    align-items: center;

    &-description {
      margin-top: 8px;
    }
  }

  &__contact {
    margin-top: 16px;
  }
}
</style>
