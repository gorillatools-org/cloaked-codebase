<script setup>
import { ref, onMounted } from "vue";
import { HELP_CENTER_BASE_URL } from "@/scripts/constants";
import CardsServices from "@/api/actions/cards-services";
import moment from "moment";
import router from "@/routes/router";
import inlineSvg from "@/features/InlineSvg";
import store from "@/store";
import { posthogCapture } from "@/scripts/posthog.js";

const props = defineProps({
  form: { type: Object, default: null },
});

const emit = defineEmits(["tryAgain"]);

const loading = ref(true);
const success = ref(null);

const payload = {
  first_name: props.form.first_name,
  last_name: props.form.last_name,
  email: props.form.email,
  phone_number: props.form.phone_number,
  dob: moment(props.form.dob, "MM/DD/YYYY").format("YYYY-MM-DD"),
  government_id: props.form.government_id,
  address: {
    street: props.form.address.street,
    postcode: props.form.address.postcode,
    city: props.form.address.city,
    state_province: props.form.address.state_province,
    country: props.form.address.country,
  },
};

function submitKyc() {
  CardsServices.postActiveKYC(payload)
    .then(() => {
      store.dispatch("authentication/getUser");
      posthogCapture("dashboard_pay_wallet_kyc_flow_kyc_submitted");

      setTimeout(() => {
        loading.value = false;
        success.value = true;

        setTimeout(() => {
          if (store.state.authentication?.user) {
            store.state.authentication.user.cloaked_card_kyc_configured = true;
          }
          router.push("settings/cloaked-cards");
          document.body.classList.remove("overflow-hidden");
        }, 1500);
      }, 2000);
    })
    .catch(() => {
      posthogCapture("dashboard_pay_wallet_kyc_flow_kyc_submission_failed");
      store.dispatch("authentication/getUser");
      setTimeout(() => {
        loading.value = false;
        success.value = false;
      }, 2000);
    });
}

onMounted(() => {
  submitKyc();
});

function toggleSupport() {
  window.open(HELP_CENTER_BASE_URL, "_blank");
}
</script>

<template>
  <div class="content-block">
    <div
      v-if="loading"
      class="text"
    >
      <p>Verifying your information...</p>
    </div>

    <div
      v-if="!loading && success"
      class="text"
    >
      <inlineSvg name="approve" />
    </div>

    <div
      v-if="!loading && !success"
      class="text"
    >
      <h1>Unable to verify your identity</h1>
      <p>
        If you feel this is an error, please feel free to reach out to Cloaked
        customer support or try again.
      </p>

      <div class="buttons">
        <button
          class="primary"
          @click="emit('tryAgain')"
        >
          Try again
        </button>
        <button @click="toggleSupport()">Contact Cloaked support</button>
      </div>
    </div>

    <div
      class="background"
      :class="{ alert: !loading && !success, success: !loading && success }"
    />
  </div>
</template>

<style scoped lang="scss">
.content-block {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  flex: 1;
  opacity: 0;
  animation: fade-in 0.4s forwards;
  animation-delay: 0.4s;

  @keyframes fade-in {
    0% {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }

  .text {
    opacity: 0;
    animation: fade-in 0.5s forwards;
    animation-delay: 0.6s;

    @keyframes fade-in {
      0% {
        opacity: 0;
        transform: translateY(50px);
      }

      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    h1 {
      font-size: 54px;
      font-style: normal;
      font-weight: 700;
      line-height: 63px; /* 116.667% */
      margin-bottom: 27px;
      color: $color-primary-100;
    }

    p {
      color: $color-primary-100;
      font-size: 15px;
      font-style: normal;
      font-weight: 500;
      line-height: normal;
    }

    .buttons {
      margin-top: 34px;

      button {
        padding: 11px 16px;
        border-radius: 40px;
        background-color: transparent;
        border: 0;
        margin-left: 5px;
        color: $color-primary-100;
        font-size: 12px;
        font-style: normal;
        font-weight: 500;
        line-height: normal;

        &:first-child {
          margin-left: 0;
        }

        &.primary {
          background: $color-primary-100;
          color: $color-primary-1;

          &:hover {
            background: $color-primary-70;
          }
        }

        &:hover {
          cursor: pointer;
        }
      }
    }

    svg {
      display: inline-block;
      width: 80px;
      height: 80px;
      border: 3px solid $color-primary-100;
      color: $color-primary-100;
      padding: 10px;
      border-radius: 50%;
    }
  }

  .background {
    position: fixed;
    top: 50%;
    left: 50%;

    @include transform(translate(-50%, -50%) scale(1) translate3d(0, 0, 0));

    width: 488px;
    height: 488px;
    background-color: $color-primary-70;
    z-index: -1;
    border-radius: 50%;
    filter: blur(284px);
    filter: blur(20px);
    filter: blur(20px);
    filter: blur(20px);
    filter: blur(184px);
    opacity: 0.47;

    @include animation(pulse 2s infinite alternate);
    @include transition(all 1.4s ease-in-out);

    @keyframes pulse {
      0% {
        @include transform(
          translate(-50%, -50%) scale(0.8) translate3d(0, 0, 0)
        );
      }

      100% {
        @include transform(translate(-50%, -50%) scale(1) translate3d(0, 0, 0));
      }
    }

    &.success {
      background-color: $color-success;
    }

    &.alert {
      background-color: $color-alert;
    }
  }
}
</style>
