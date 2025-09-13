<script setup>
import { values } from "lodash-es";
import moment from "moment";
import CardsServices from "@/api/actions/cards-services.js";
import { reactive, computed } from "vue";
import { useToast } from "@/composables/useToast.js";
import InlineSvg from "@/features/InlineSvg.vue";

const props = defineProps({
  active: Boolean,
});
const emits = defineEmits(["close", "next"]);
const saveKycPayload = computed(() => {
  const date = moment(data.kyc.dob, "MM/DD/YYYY").format("YYYY-MM-DD");
  return {
    first_name: data.kyc.firstName,
    last_name: data.kyc.lastName,
    phone_number: data.kyc.phoneNumber,
    email: data.kyc.email,
    dob: date,
    government_id: data.kyc.government_id,
    address: {
      street: data.kyc.address.street,
      postcode: data.kyc.address.postcode,
      city: data.kyc.address.city,
      state_province: data.kyc.address.state_province,
      country: data.kyc.address.country,
    },
  };
});
const enabled = computed(() => {
  const check = saveKycPayload.value;
  const flat = [...values(check), ...values(check.address)];
  if (flat.includes(null) || flat.includes("")) {
    return false;
  }
  return true;
});
function submitKyc() {
  const values = saveKycPayload.value;
  const toast = useToast();
  CardsServices.postActiveKYC(values)
    .then(({ data }) => {
      if (data.success === true) {
        emits("next", { status: true });
      } else {
        emits("next", { status: false });
      }
    })
    .catch(({ response }) => {
      const keys = Object.keys(response.data);
      let errors = "";
      keys.map((i) => {
        const line = response.data[i].join(",");
        if (errors.length > 0) {
          errors = `${errors}, ${line}`;
        } else {
          errors = line;
        }
      }, {});
      toast.error(errors);
    });
}
const data = reactive({
  kyc: {
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    dob: "",
    government_id: "",
    address: {
      street: "",
      postcode: "",
      city: "",
      state_province: "",
      country: "",
    },
  },
});
</script>

<template>
  <div
    class="kyc"
    :class="{ active: props.active }"
  >
    <div
      class="back"
      @click="emits('close')"
    >
      <InlineSvg name="chevron-left" />
    </div>

    <div class="content">
      <div class="title">
        <h1>Get your Virtual Card</h1>
      </div>

      <div class="form">
        <div class="input-group">
          <div class="group-title">
            <h1>Personal info</h1>
          </div>

          <div class="inputs">
            <div class="input">
              <label>Legal first name</label>
              <input
                :value="data.kyc.firstName"
                @input="(event) => (data.kyc.firstName = event)"
              />
            </div>

            <div class="input">
              <label>Legal last name</label>
              <input
                :value="data.kyc.lastName"
                @input="(event) => (data.kyc.lastName = event)"
              />
            </div>
          </div>

          <div class="inputs">
            <div class="input">
              <label>Date of birth (MM/DD/YYYY)</label>
              <input
                :value="data.kyc.dob"
                @input="(event) => (data.kyc.dob = event)"
              />
            </div>

            <div class="input">
              <label>SSN or ITIN</label>
              <input
                :value="data.kyc.government_id"
                @input="(event) => (data.kyc.government_id = event)"
              />
            </div>
          </div>
        </div>

        <div class="input-group">
          <div class="group-title">
            <h1>Contact info</h1>
          </div>

          <div class="inputs">
            <div class="input">
              <label>Phone number</label>
              <input
                :value="data.kyc.phoneNumber"
                @input="(event) => (data.kyc.phoneNumber = event)"
              />
            </div>

            <div class="input">
              <label>Email address</label>
              <input
                :value="data.kyc.email"
                @input="(event) => (data.kyc.email = event)"
              />
            </div>
          </div>
        </div>

        <div class="input-group">
          <div class="group-title">
            <h1>Permanent address</h1>
          </div>

          <div class="inputs">
            <div class="input">
              <label>Street address</label>
              <input
                :value="data.kyc.address.street"
                @input="(event) => (data.kyc.address.street = event)"
              />
            </div>

            <div class="input">
              <label>City</label>
              <input
                :value="data.kyc.address.city"
                @input="(event) => (data.kyc.address.city = event)"
              />
            </div>
          </div>
          <div class="inputs">
            <div class="input">
              <label>State</label>
              <input
                :value="data.kyc.address.state_province"
                @input="(event) => (data.kyc.address.state_province = event)"
              />
            </div>

            <div class="input">
              <label>Zip</label>
              <input
                :value="data.kyc.address.postcode"
                @input="(event) => (data.kyc.address.postcode = event)"
              />
            </div>
          </div>
          <div class="inputs">
            <div class="input">
              <label>Country</label>
              <input
                :value="data.kyc.address.country"
                @input="(event) => (data.kyc.address.country = event)"
              />
            </div>
          </div>
          <div class="terms">
            <p>
              Cloaked will never store your personally identifiable information
              (PI) and these are passed along to our banking partner using bank
              grade security (insert security standard we use, e.g. 256 bit SSL
              transport layer security encryption). For more information, please
              review our Privacy Policy,
            </p>
            <p>
              By submitting this application you agree to our
              <a href="">Cardholder Agreement</a>
              ,
              <a href="">Terms of Service</a>
              ,
              <a href="">Rates & Fees</a>
              ,
              <a href="">Privacy Policy</a>
              and
              <a href="">E-Sign</a>
              Agreement
            </p>
            <button
              :class="{ enabled }"
              :disabled="!enabled"
              @click="submitKyc"
            >
              <span>Submit Application</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="cards">
      <span
        v-for="index in 2"
        :key="index"
      >
        <InlineSvg name="cloaked-icon" />
        <div class="mastercard" />
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.kyc {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 317;
  opacity: 0;
  visibility: hidden;
  @include transition(all 0.2s ease);
  background-color: $color-primary-100;
  overflow-y: auto;
  overflow-x: hidden;
  &.active {
    opacity: 1;
    visibility: visible;
    transition-delay: 0.5s;
    .content {
      opacity: 1;
      visibility: visible;
      transition-delay: 0.7s;
      transform: translateY(0px);
    }
    .cards {
      opacity: 1;
      visibility: visible;
      span {
        &:nth-of-type(1) {
          opacity: 1;
          left: -500px;
          transition-delay: 0.5s;
        }
        &:nth-of-type(2) {
          opacity: 1;
          right: -500px;
          transition-delay: 0.65s;
        }
      }
    }
  }
  .back {
    position: fixed;
    top: 10px;
    left: 10px;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-primary-1;
    background-color: $color-primary-100;
    border-radius: 50%;
    z-index: 4;
    svg {
      width: 8px;
      height: auto;
      position: relative;
      z-index: 2;
    }
    &:after {
      content: "";
      position: absolute;
      width: 0;
      height: 0;
      background: $color-primary-90;
      border-radius: 50%;
      top: 50%;
      left: 50%;
      @include transform(translate(-50%, -50%));
      z-index: 1;
      @include transition(all 0.45s cubic-bezier(0.68, -0.55, 0.27, 1.55));
    }
    &:hover {
      cursor: pointer;
      &:after {
        width: 44px;
        height: 44px;
      }
    }
  }
  .content {
    position: relative;
    z-index: 19;
    max-width: 500px;
    width: 100%;
    margin: 0 auto;
    padding: 90px 20px;
    opacity: 0;
    visibility: hidden;
    transition: all 0.4s ease;
    transform: translateY(40px);
    transition-delay: 0.7s;
    .title {
      margin-bottom: 43px;
      h1 {
        color: $color-primary-1;
        font-weight: 700;
        font-size: 54px;
        line-height: 63px;
      }
    }
    .form {
      .terms {
        margin: 24px 0;
        p {
          margin: 10px 0;
          &:first-of-type {
            color: $color-primary-70;
            font-size: 12px;
            font-style: normal;
            font-weight: 400;
          }
          &:last-of-type {
            color: $color-primary-1;
            font-size: 15px;
            font-style: normal;
            font-weight: 400;
            line-height: normal;
          }
        }
        button {
          margin-top: 20px;
          width: 100%;
          border: none;
          padding: 11px 16px;
          border-radius: 999px;
          background-color: $color-primary-1;
          color: $color-primary-100;
          opacity: 0.4;
          cursor: pointer;
          &.enabled {
            opacity: 1;
          }
        }
      }
      .input-group {
        margin-top: 48px;
        &:first-of-type {
          margin-top: 0;
        }
        .group-title {
          h1 {
            font-weight: 600;
            font-size: 18px;
            line-height: 27px;
            color: $color-primary-1;
          }
        }
        .inputs {
          display: flex;
          margin-top: 23px;
          .input {
            width: calc(50% - 5px);
            margin-left: 10px;
            &:first-of-type {
              margin-left: 0;
            }
            label {
              display: block;
              font-weight: 500;
              font-size: 12px;
              line-height: 18px;
              color: $color-primary-10;
              margin-bottom: 4px;
            }
            input {
              width: 100%;
              padding: 18px 24px;
              background-color: $color-primary-90;
              color: $color-primary-1;
              font-weight: 500;
              font-size: 15px;
              line-height: 22px;
              border: 0;
              border-radius: 8px;
            }
          }
        }
      }
    }
  }
  .cards {
    position: absolute;
    left: 50%;
    top: 124px;
    @include transform(translateX(-50%));
    width: 642px;
    height: 400px;
    z-index: 2;
    opacity: 0;
    visibility: hidden;
    @include transition(all 0.4s ease);
    span {
      display: inline-block;
      width: 432px;
      height: 250px;
      background: radial-gradient(
          74.33% 139.2% at 54.96% 48%,
          #656565 0%,
          #38393a 100%
        )
        /* warning: gradient uses a rotation that is not supported by CSS and may not behave as expected */;
      box-shadow:
        0px 27.290000915527344px 47.290000915527344px 0px rgba(0, 0, 0, 0.25),
        0px 1px 1px 0px rgba(255, 255, 255, 0.75);
      border-radius: 36.4516px;
      position: absolute;
      opacity: 0;
      @keyframes floating1 {
        from {
          transform: translate(0, 0px) rotate(-15deg);
        }
        50% {
          transform: translate(0, 20px) rotate(-16deg);
        }
        to {
          transform: translate(0, -0px) rotate(-15deg);
        }
      }
      @keyframes floating2 {
        from {
          transform: translate(0, 0px) rotate(15deg);
        }
        50% {
          transform: translate(0, 20px) rotate(14deg);
        }
        to {
          transform: translate(0, -0px) rotate(15deg);
        }
      }
      &:nth-of-type(1) {
        top: 120px;
        left: -622px;
        animation: floating1 5s ease infinite;
        transition: all 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        opacity: 0;
      }
      &:nth-of-type(2) {
        top: 0;
        right: -622px;
        transition: all 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        animation: floating2 5s ease infinite;
        opacity: 0;
        animation-delay: 0.6s;
      }
      svg {
        position: absolute;
        top: 50%;
        left: 50%;
        @include transform(translate(-50%, -50%));
        width: 114px;
        height: auto;
        .background {
          fill: $color-primary-1;
        }
        .foreground {
          fill: $color-primary-90;
        }
      }
      .mastercard {
        position: absolute;
        right: 20px;
        bottom: 35px;
        &:before,
        &::after {
          content: "";
          position: absolute;
          right: 50%;
          top: 50%;
          @include transform(translate(-50%, -50%));
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid $color-primary-10;
        }
        &:before {
          right: calc(50% - 12px);
        }
        &:after {
          right: calc(50% + 12px);
        }
      }
    }
  }
}
.how-it-works {
  margin-top: 43px;
  .title {
    margin-bottom: 18px;
    h1 {
      font-weight: 600;
      font-size: 32px;
      line-height: 40px;
      color: $color-primary-100;
    }
  }
  .items {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    .item {
      width: 100%;
      max-width: 352px;
      .image {
        width: 100%;
        height: 352px;
        background-color: $color-primary-5;
        border-radius: 24px;
      }
      .content {
        margin-top: 16px;
        h1 {
          color: $color-primary-100;
          font-weight: 600;
          font-size: 18px;
          line-height: 27px;
        }
      }
    }
  }
}
</style>
