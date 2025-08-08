<script setup>
import OnboardingPage from "@/features/onboarding/page/OnboardingPage.vue";
import { onMounted, ref, watch, computed } from "vue";
import UserService from "@/api/actions/user-service.js";
import {
  HAS_ONBOARDED_V4,
  ONBOARD_SELECTED_VALUE,
} from "@/scripts/userFlags.js";
import EmailService from "@/api/actions/email-service.js";
import PhoneService from "@/api/actions/phone-service.js";
import store from "@/store";
import router from "@/routes/router";

const form = ref({
  forwardEmail: "Not now",
  email: "",
  emailVerificationCodeRequested: false,
  emailVerificationCode: "",
  isEmailVerified: false,
  forwardPhone: "Yes",
  phone: "",
  phone2fa: null,
  phoneVerificationCodeRequested: false,
  phoneVerificationCode: "",
  isPhoneVerified: false,
  firstSteps: "Data deletion",
});

const ddInAppSearchEnabled = computed(() => {
  return store.getters["dataDelete/getDdInAppSearchEnabled"];
});

watch(
  () => ddInAppSearchEnabled.value,
  (value) => {
    if (value) {
      form.value.firstSteps = "Data deletion";
    }
  }
);

onMounted(() => {
  if (!form.value.email) {
    EmailService.getUserEmails().then((response) => {
      let find = response?.data?.results?.filter(
        (f) => f.verified && f.primary
      );
      let current;
      if (find.length > 0) {
        current = find[0].email;
      } else if (!current) {
        current = response?.data?.results[0]?.email;
      }
      if (current) {
        form.value.email = current;
      }
    });
  }
});

onMounted(() => {
  if (!form.value.phone) {
    PhoneService.getUserPhoneNumbers().then((response) => {
      let find = response?.data?.results.filter((f) => f.verified && f.primary);
      let current;
      if (find.length > 0) {
        current = find[0].phone_number;
      } else if (!current) {
        current = response?.data.results[0]?.phone_number;
      }
      if (current) {
        form.value.phone = current;
      }
    });
  }
});

const onFinished = () => {
  UserService.setFlag({
    name: HAS_ONBOARDED_V4,
    value: true,
  });
  UserService.setFlag({
    name: ONBOARD_SELECTED_VALUE,
    value: form.value.firstSteps,
  });
  router.push({ name: "Home" });
};
</script>

<template>
  <div class="page-wrapper">
    <OnboardingPage
      :value="form"
      @input="form = $event"
      @finished="onFinished"
    />
  </div>
</template>

<style scoped lang="scss">
.page-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  overflow: auto;
  background-color: $color-base-white-100;
}
</style>
