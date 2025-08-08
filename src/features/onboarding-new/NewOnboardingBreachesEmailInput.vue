<script setup>
import UiPageWrapper from "@/features/onboarding-new/UiPageWrapper.vue";
import UiHeader from "@/features/onboarding-new/UiHeader.vue";
import UiInput from "@/features/onboarding-new/UiInput.vue";
import UiInputCode from "@/features/onboarding-new/UiInputCode.vue";
import UiButton from "@/features/onboarding-new/UiButton.vue";
import { emailCheck, codeCheck } from "@/scripts/regex";
import EmailService from "@/api/actions/email-service";
import { reactive, computed, watch, nextTick, ref, onMounted } from "vue";
import { useToast } from "@/composables/useToast.js";
import store from "@/store";
import { posthogCapture } from "@/scripts/posthog.js";
import {
  PH_EVENT_ONBOARDING_FLOW_BREACHES_1ST_SCREEN,
  PH_EVENT_ONBOARDING_FLOW_BREACHES_2ND_SCREEN,
  PH_EVENT_ONBOARDING_BREACHES_USER_CLICKED_SUBMIT_EMAIL,
  PH_EVENT_ONBOARDING_FLOW_BREACHES_VERIFY_CODE_CLICKED,
} from "@/scripts/posthogEvents";

const toast = useToast();

const emit = defineEmits(["next"]);

const verifyRef = ref(null);

const username = computed(() => {
  return store.state.authentication?.username;
});

const state = reactive({
  email: emailCheck(username.value) ? username.value : "",
  emailObject: null,
  code: "",
  loading: false,
  token: "",
});

onMounted(() => {
  posthogCapture(PH_EVENT_ONBOARDING_FLOW_BREACHES_1ST_SCREEN);
});

const emailIsValid = computed(() => {
  return emailCheck(state.email);
});

const codeIsValid = computed(() => {
  return codeCheck(state.code);
});

const showVerificationCode = computed(() => {
  return state.emailObject !== null;
});

function sendEmailCode() {
  if (emailIsValid.value) {
    posthogCapture(PH_EVENT_ONBOARDING_BREACHES_USER_CLICKED_SUBMIT_EMAIL);
    state.loading = true;
    const payload = {
      email: state.email.toLowerCase(),
      primary: true,
      collection_name: "email",
      collection: store.getters["authentication/collection"]("email"),
      user: store.state.authentication?.user?.url,
    };

    EmailService.addEmail(payload)
      .then((response) => {
        state.emailObject = response.data;
        posthogCapture(PH_EVENT_ONBOARDING_FLOW_BREACHES_2ND_SCREEN);
        if (!state.emailObject?.verified) {
          nextTick(sendCode);
        } else {
          posthogCapture(PH_EVENT_ONBOARDING_FLOW_BREACHES_VERIFY_CODE_CLICKED);
        }
        return;
      })
      .catch((error) => {
        state.loading = false;
        toast.error(error?.response?.data[0] || "Error creating email.");
      });
  }
}

function verifyCode() {
  if (codeIsValid.value && !state.loading) {
    state.loading = true;
    posthogCapture(PH_EVENT_ONBOARDING_FLOW_BREACHES_VERIFY_CODE_CLICKED);
    EmailService.verifyVerificationCode(state.emailObject.id, {
      security_code: state.code,
      email: state.emailObject.email,
      session_token: state.token,
    })
      .then(() => {
        emit("next");
      })
      .catch(() => {
        state.loading = false;
        toast.error("Error verifying code.");
      });
  }
}

function sendCode() {
  state.code = "";
  toast.success("Sending verification code...");
  EmailService.sendVerificationCode(state.emailObject.id)
    .then((verify_response) => {
      state.loading = false;
      toast.success("Code sent!");
      if (!verify_response.data.verified) {
        state.token = verify_response.data.session_token;
      }
      setTimeout(() => {
        verifyRef?.value?.$el?.focus();
      }, 100);
    })
    .catch(() => {
      state.loading = false;
      toast.error("Error sending verification code.");
    });
}

watch(
  () => state.emailObject,
  (value) => {
    if (value?.verified) {
      emit("next");
    }
  },
  { deep: true }
);

watch(
  () => codeIsValid.value,
  (newValue) => {
    if (newValue) {
      verifyCode();
    }
  }
);
</script>
<template>
  <UiPageWrapper
    v-if="!showVerificationCode"
    :screenEvent="PH_EVENT_ONBOARDING_FLOW_BREACHES_1ST_SCREEN"
  >
    <UiHeader>
      <h2>Let's check your email for exposures</h2>
      <p>
        If your email was uncovered in any public data leaks, we can find it and
        replace it with secure Cloaked information.
      </p>
    </UiHeader>
    <div class="body-section-wrapper">
      <div class="body-section">
        <img
          src="@/assets/images/onboarding-new/email.png"
          alt="Email icon"
          width="160"
          height="92"
        />
        <UiInput
          focused
          placeholder="Enter your email address"
          :value="state.email"
          @input="($event) => (state.email = $event.target.value)"
          @submit="sendEmailCode"
        />

        <UiButton
          width="100%"
          imgName="arrow-right"
          :disabled="!emailIsValid"
          @click="sendEmailCode"
        >
          Continue
        </UiButton>
      </div>
    </div>
  </UiPageWrapper>
  <UiPageWrapper
    v-else
    :screenEvent="PH_EVENT_ONBOARDING_FLOW_BREACHES_2ND_SCREEN"
  >
    <UiHeader>
      <h2>Enter verification code</h2>
      <p>
        Didn't receive a code?
        <span
          class="clickable-text"
          @click="sendCode"
        >
          Resend
        </span>
      </p>
    </UiHeader>
    <div class="body-section-wrapper">
      <div class="body-section">
        <img
          src="@/assets/images/onboarding-new/email.png"
          alt="Email icon"
          width="160"
          height="92"
        />
        <div class="pre-input-text">Code sent to {{ state.email }}</div>
        <UiInputCode
          ref="verifyRef"
          :value="state.code"
          @input="state.code = $event.target.value"
          @keydown.enter="verifyCode"
        />

        <UiButton
          width="100%"
          imgName="arrow-right"
          :disabled="!codeIsValid"
          @click="verifyCode"
        >
          Continue
        </UiButton>
      </div>
    </div>
  </UiPageWrapper>
</template>
<style lang="scss" scoped>
.body-section-wrapper {
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: $color-primary-100;

  .body-section {
    margin-top: 32px;
    display: flex;
    width: 375px;
    padding: 24px 16px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 16px;
    background-blend-mode: soft-light;
    background: rgba($color-primary-1-light, 0.1);
    border-radius: 16px;

    @at-root .theme-dark & {
      background: rgba($color-primary-1-dark, 0.1);
    }

    .pre-input-text {
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
    }
  }
}

.clickable-text {
  color: $color-primary-100;
  cursor: pointer;
  text-decoration: underline;
  opacity: 100;
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.7;
    transition: opacity 0.3s;
  }
}
</style>
