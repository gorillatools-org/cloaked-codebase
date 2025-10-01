<script setup>
import { reactive, onMounted, ref, computed } from "vue";
import Spinner from "@/assets/icons/spinner.svg";
import CardsServices from "@/api/actions/cards-services.js";
import Popper from "@/features/Popper.vue";
import Toggle from "@/features/Toggle.vue";
import store from "@/store";
import { useToast } from "@/composables/useToast.js";
import InlineSvg from "@/features/InlineSvg.vue";

const props = defineProps({
  active: Boolean,
  status: Boolean,
});
const ui = reactive({
  step: 0,
});
const sources = computed(() => {
  return store.state.cards.fundingSources;
});
const emits = defineEmits(["close", "next"]);
onMounted(() => {
  checkPaymentSource();
  setTimeout(() => {
    ui.step = props.status ? 1 : -1;
    setTimeout(() => {
      if (ui.step === 1) {
        ui.step = 2;
      }
    }, 2500);
  }, 1500);
});
let timeout = null;
const child = ref(null);
function checkClosed() {
  try {
    if (child.value.closed) {
      clearInterval(timeout);
      checkPaymentSource();
    }
  } catch {
    // do nothing
  }
}
function checkPaymentSource() {
  CardsServices.getPaymentSource();
}
function setSourceAsPrimary(source, status) {
  CardsServices.patchUpdateCardDetails(source.id, { primary: status })
    .then(() => {
      checkPaymentSource();
    })
    .catch(() => {});
}
function deleteFundingSource(source) {
  CardsServices.deleteFundingSource(source.id)
    .then(() => {
      checkPaymentSource();
    })
    .catch(() => {
      const toast = useToast();
      toast.error("Unable to delete funding source");
      checkPaymentSource();
    });
}
function removeFundingSource(source) {
  store.dispatch("openModal", {
    header: `Delete funding source?`,
    subheader:
      "You will not be able to use this funding account to create Virtual Cards",
    button: {
      text: "Yes, Delete",
      onClick: () => deleteFundingSource(source),
      danger: true,
    },
  });
}
function addFundingSource(type) {
  CardsServices.postCreateAPaymentSource({ flow: type }).then(({ data }) => {
    const url = data.flow_url;
    if (url) {
      child.value = window.open(
        url,
        "_blank",
        `toolbar=no,
          location=no,
          status=no,
          menubar=no,
          scrollbars=yes,
          resizable=yes,
          width=400,
          height=600`
      );
      timeout = setInterval(checkClosed, 500);
    }
  });
}
function addCard() {
  emits("close");
}
function get_name(name) {
  switch (name.toUpperCase()) {
    case "AMEX":
      return "American Express";
    default:
      return name
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
  }
}
const hasSources = computed(() => {
  return Object.values(sources.value).length > 0;
});
</script>

<template>
  <div
    class="kyc"
    :class="{ active: props.active }"
  >
    <div
      class="blur"
      :class="{
        orange: ui.step === 0,
        green: ui.step === 1,
        red: ui.step === -1,
      }"
    />
    <div
      class="back"
      @click="emits('close')"
    >
      <InlineSvg name="chevron-left" />
    </div>
    <div class="content-body">
      <h1>
        <span v-if="ui.step === 0">Verifying your information...</span>
        <span v-if="ui.step === 1">Approved for Cloaked Pay!</span>
        <span v-if="ui.step === 2">Funding source</span>
        <span v-if="ui.step === -1">Unable to verify your identity...</span>
      </h1>
      <div
        v-if="ui.step === 0 || ui.step === 1"
        class="cards"
      >
        <span>
          <div
            v-if="ui.step === 0"
            class="spinning"
          >
            <Spinner />
          </div>
          <InlineSvg
            v-else
            name="cloaked-icon"
          />
          <div class="mastercard" />
        </span>
      </div>
      <div
        v-else-if="ui.step === -1"
        class="rejected"
      >
        <p>
          If you feel this is an error, please feel free to reach out to Cloaked
          customer support for manual identity verification.
        </p>
        <div class="actions">
          <button @click="emits('close')">Back to Dashboard</button>
          <a href="#">Email Cloak</a>
        </div>
      </div>
      <div
        v-else
        class="add-accounts"
      >
        <div class="account-actions">
          <div
            v-if="hasSources"
            class="card-list"
          >
            <h1>Connected account</h1>
            <ul>
              <li
                v-for="source in sources"
                :key="source.id"
                class="card-item"
              >
                <div>
                  <div class="name">
                    {{ get_name(source.card_brand) }}
                  </div>
                  <div
                    v-if="source.pan_last_four"
                    class="numbers"
                  >
                    <span>•••• •••• ••••</span>
                    {{ source.pan_last_four }}
                  </div>
                  <div class="note">Auto debit enabled</div>
                </div>
                <div>
                  <Popper>
                    <button>
                      <InlineSvg name="ellipses" />
                    </button>
                    <template #content>
                      <div class="popover-menu">
                        <ul>
                          <li>
                            <div>
                              <strong>Auto-debit</strong>
                              <span>Transactions debit as you spend</span>
                            </div>
                            <button>
                              <Toggle :status="false" />
                            </button>
                          </li>
                          <li>
                            <div>
                              <strong>Set as default funding source</strong>
                            </div>
                            <button
                              @click="
                                setSourceAsPrimary(source, !source.primary)
                              "
                            >
                              <Toggle :status="source.primary" />
                            </button>
                          </li>
                          <li>
                            <div>Remove account connection</div>
                            <button @click="removeFundingSource(source)">
                              <InlineSvg name="delete-trash" />
                            </button>
                          </li>
                        </ul>
                      </div>
                    </template>
                  </Popper>
                </div>
              </li>
            </ul>
            <button
              class="add-card"
              @click="addCard"
            >
              Create your first Cloaked Virtual Card
            </button>
          </div>
          <h1>
            <span v-if="sources.length === 0">Connect</span>
            <span v-else>Connect another</span>
          </h1>
          <button @click="addFundingSource('ach')">
            <div>
              <span><InlineSvg name="bank" /></span>
              <span>Bank account (ACH)</span>
            </div>
            <div>
              <InlineSvg name="chevron-right" />
            </div>
          </button>
          <button @click="addFundingSource('debit_card')">
            <div>
              <span><InlineSvg name="card-outline" /></span>
              <span>Debit card</span>
            </div>
            <div>
              <InlineSvg name="chevron-right" />
            </div>
          </button>
          <button @click="addFundingSource('credit_card')">
            <div>
              <span><InlineSvg name="card-outline" /></span>
              <span>Credit card</span>
            </div>
            <div>
              <InlineSvg name="chevron-right" />
            </div>
          </button>
        </div>
        <p>
          Connecting your accounts does not perform a transaction. Connected
          accounts can be added or removed at any time.
        </p>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
/* stylelint-disable */
.spinning {
  color: white;
  svg {
    width: 30px !important;
    height: 30px !important;
  }
}
.kyc {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 317;
  opacity: 0;
  visibility: hidden;
  text-align: center;
  .blur {
    width: 488px;
    height: 488px;
    border-radius: 488px;
    opacity: 0.67;
    filter: blur(252px);
    position: absolute;
    left: 50%;
    margin-left: -244px;
    top: 244px;
    z-index: 0;
    background: var(--brand-colors-hero-colors-fiery-orange, #fff);
    &.orange {
      background: var(--brand-colors-hero-colors-fiery-orange, #ff550c);
    }
    &.green {
      background: var(--brand-colors-hero-colors-fiery-orange, #00c47d);
    }
    &.red {
      background: var(--brand-colors-hero-colors-fiery-orange, #f24141);
    }
  }
  .content-body {
    padding: 100px;
    text-align: center;
    z-index: 10;
    position: absolute;
    width: 100%;
    h1 {
      color: $color-primary-1;
      font-family: $global-font;
      font-size: 54px;
      font-style: normal;
      font-weight: 700;
      line-height: 63px; /* 116.667% */
      margin: 0 auto;
      max-width: 500px;
    }
    .rejected {
      margin: 50px auto;
      max-width: 500px;
      color: $color-primary-1;
      font-family: $global-font;
      font-size: 18px;
      font-style: normal;
      font-weight: 500;
      line-height: normal;
      .actions {
        display: inline-flex;
        gap: 20px;
        align-items: center;
        margin: 50px auto;
        button {
          cursor: pointer;
          background-color: $color-primary-1;
          color: $color-primary-100;
          padding: 11px 16px;
          border: none;
          border-radius: 999px;
        }
      }
    }
    .add-accounts {
      margin: 100px auto;
      width: 500px;
      > p {
        padding-top: 20px;
        color: $color-primary-1;
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
      }
      .account-actions {
        display: flex;
        padding: 24px;
        flex-direction: column;
        align-items: flex-start;
        gap: 24px;
        align-self: stretch;
        border-radius: 12px;
        background: $color-primary-1;
        h1 {
          font-size: 18px;
          font-style: normal;
          font-weight: 600;
          line-height: normal;
          color: $color-primary-100;
          text-align: left;
          margin: 0;
        }
        .card-list {
          width: 100%;
          color: $color-primary-1;
          .add-card {
            border-radius: 999px;
            background-color: $color-primary-100;
            color: $color-primary-1;
            padding: 11px 16px;
            text-align: center;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .card-item {
            margin-bottom: 24px;
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
            color: $color-primary-100;
            > div {
              &:first-child {
                font-size: 10px;
                width: 100%;
                display: block;
                text-align: left;
                .name {
                  font-size: 14px;
                  font-style: normal;
                  font-weight: 600;
                  line-height: normal;
                }
                .numbers {
                  font-size: 14px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                  span {
                    display: inline-block;
                    position: relative;
                    top: 3px;
                  }
                }
                .notes {
                  font-size: 10px;
                  font-style: normal;
                  font-weight: 400;
                  line-height: normal;
                }
              }
              &:last-child {
                display: inline-block;
                width: 40px;
                .popover-menu {
                  border-radius: 15px;
                  border: 1px solid $color-primary-1;
                  background-color: $color-primary-1;
                  box-shadow: 0px 14px 24px 0px rgba(0, 0, 0, 0.25);
                  display: flex;
                  width: 360px;
                  padding: 20px;
                  flex-direction: column;
                  justify-content: center;
                  align-items: flex-start;
                  gap: 24px;
                  ul {
                    display: block;
                    width: 100%;
                    li {
                      margin: 15px 0;
                      &:last-child {
                        margin-bottom: 0;
                      }
                      width: 100%;
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      font-size: 12px;
                      font-style: normal;
                      font-weight: 600;
                      line-height: normal;
                      > div {
                        width: 100%;
                        text-align: left;
                        display: block;
                        strong,
                        span {
                          display: block;
                        }
                      }
                      button {
                        height: 32px;
                        width: 65px;
                      }
                      &.delete {
                        color: $color-alert;
                        button {
                          color: $color-alert;
                          svg {
                            transform: scale(1.5);
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        button {
          cursor: pointer;
          background-color: transparent;
          color: $color-primary-100;
          width: 100%;
          border: none;
          display: inline-flex;
          justify-content: space-between;
          align-items: center;
          &:first-of-type {
            span {
              &:first-child {
                background-color: #8e83ea;
              }
            }
          }
          &:nth-of-type(2) {
            span {
              &:first-child {
                background-color: #29bee8;
              }
            }
          }
          &:nth-of-type(3) {
            span {
              &:first-child {
                background-color: #f0536b;
              }
            }
          }
          > div {
            display: inline-flex;
            justify-content: flex-start;
            align-items: center;
            gap: 10px;
            span {
              &:first-child {
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 48px;
                height: 48px;
              }
            }
          }
        }
      }
    }
  }
  @include transition(all 0.2s ease);
  background-color: $color-primary-100;
  color: $color-primary-1;
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
      margin: 0 auto;
      opacity: 1;
      visibility: visible;
      padding-top: 100px;
      span {
        opacity: 1;
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
    z-index: 100;
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
    z-index: 2;
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
      position: relative;
      opacity: 0;
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
