<script setup>
import AddCreditCard from "@/features/modals/Wallet/AddCreditCard.vue";
import { constants } from "@/scripts/constants.js";
import { ref, computed, markRaw, onMounted, onUnmounted, watch } from "vue";
import store from "@/store";
import UiSwitchInput from "@/features/UiSwitchInput.vue";
import CardsServices from "@/api/actions/cards-services.js";
import EditSourceModal from "./EditSourceModal.vue";
import ValueDisplay from "@/features/ui/value-display.vue";
import { useToast } from "@/composables/useToast.js";
import InlineSvg from "@/features/InlineSvg.vue";
import BaseText from "@/library/BaseText.vue";
import BaseTextHiddenDots from "@/library/BaseTextHiddenDots.vue";
import { posthogCapture } from "@/scripts/posthog.js";
import { capitalize, isObject } from "lodash-es";
import status from "http-status";

const toast = useToast();

onMounted(() => {
  window.addEventListener("focus", fundingCheck);
  fundingCheck();
});
onUnmounted(() => {
  window.removeEventListener("focus", fundingCheck);
});
const cards = computed(() => {
  return store.state.cards.fundingSources;
});
const kycValidated = computed(() => {
  return store.state.authentication?.user?.cloaked_card_kyc_configured;
});
const AchDebitEnabled = computed(() => {
  return store.state.authentication?.user?.allow_debit_ach_only;
});
const cardFsVersion = computed(() => {
  return store.state.authentication?.user?.card_fs_version;
});

function toggleAddCreditCardModal(type) {
  store.dispatch("openModal", {
    customTemplate: {
      template: markRaw(AddCreditCard),
      props: {
        isVisible: true,
        cardType: type,
      },
    },
  });
}

function addFundingSource(flow) {
  function openStripePopup(flowUrl) {
    window
      .open(flowUrl, "", "resizable=1,width=500,height=580,top=80,left=50")
      ?.focus();
  }

  const payload = { flow };
  CardsServices.postCreateAPaymentSource(payload).then(({ data }) => {
    posthogCapture("dashboard_pay_wallet_add_funding_source_modal_viewed");

    if (cardFsVersion?.value === constants.CARD_FS_VERSION_OWN_CARD) {
      posthogCapture("dashboard_pay_wallet_add_funding_source_viewed");
      toggleAddCreditCardModal(flow);
    } else if (cardFsVersion?.value === constants.CARD_FS_VERSION_STRIPE) {
      openStripePopup(data.flow_url);
    } else {
      // This behavior can be customized for any other providers
      openStripePopup(data.flow_url);
    }
  });
}

function deleteFundingSource(source) {
  CardsServices.deleteFundingSource(source.id)
    .then(() => {
      fundingCheck();
      toast.success("Funding source removed");
      activeDropdown.value = null;
      posthogCapture(
        "dashboard_pay_wallet_add_funding_source_modal_funding_source_removed"
      );
    })
    .catch(() => {
      fundingCheck();
      toast.error("Failed to remove funding source");
      activeDropdown.value = null;
      posthogCapture(
        "dashboard_pay_wallet_add_funding_source_modal_funding_source_removal_failed"
      );
    });
}

function fundingCheck() {
  CardsServices.getFundingSources();
}

const activeDropdown = ref(null);
function currentDropdown(value) {
  if (activeDropdown.value === value) {
    activeDropdown.value = null;
  } else {
    activeDropdown.value = value;
  }
}

function _combineValidationErrorMessage(errors) {
  let extraErrorMessage = "";

  if (!isObject(errors)) {
    return extraErrorMessage;
  }

  Object.values(errors).map((fieldErrors) => {
    extraErrorMessage += fieldErrors.map((error) => {
      return capitalize(error.endsWith(".") ? error : error + ".");
    });
  });

  return extraErrorMessage;
}

function setDefaultFundingSource(value) {
  const payload = {
    primary: true,
  };

  CardsServices.patchUpdateCardDetails(value, payload)
    .then(() => {
      toast.success("This funding source is now the default one.");
      CardsServices.getFundingSources();
    })
    .catch((error) => {
      const defaultErrorMessage = "Oops! We could not process your request.";

      let extraErrorMessage = "";
      const errors = error.response.data?.errors;
      if (error.response.status === status.BAD_REQUEST) {
        extraErrorMessage = _combineValidationErrorMessage(errors);
      }

      toast.error([defaultErrorMessage, extraErrorMessage].join(" "));
    });
}

function toggleDefaultFundingSource(value) {
  setDefaultFundingSource(value);
  activeDropdown.value = null;
}

function getProviderType(value) {
  const provider = constants.CARD_PROVIDER_TYPE[value];
  return provider || constants.CARD_PROVIDER_TYPE_UNKNOWN;
}

function getLastFour(card) {
  return card?.pan_last_four ? ` ${card?.pan_last_four} ` : " #### ";
}

const activeModal = ref(false);

watch(
  cards,
  (oldValue, newValue) => {
    if (
      newValue.count !== oldValue.count &&
      newValue.count > 0 &&
      !activeDropdown.value &&
      newValue.results[0].provider !== "stripe_flow_credit"
    ) {
      activeModal.value = true;
    }

    if (newValue.count === 1 && !newValue.results[0]?.primary) {
      setDefaultFundingSource(newValue.results[0].id);
    }
  },
  { deep: true }
);

watch(
  activeModal,
  (oldValue, newValue) => {
    if (newValue === false) {
      CardsServices.getFundingSources();
    }
  },
  { deep: true }
);
</script>

<template>
  <div
    v-if="kycValidated"
    class="funding-source"
  >
    <div
      id="funding"
      class="title"
    >
      <BaseText
        as="h1"
        variant="headline-3-bold"
      >
        Funding sources
      </BaseText>
      <BaseText
        as="p"
        variant="body-2-semibold"
      >
        Add a payment method to begin using Cloaked Cards. We use Stripe to
        securely connect your account. This will launch a new window.
      </BaseText>
    </div>

    <div class="content">
      <div
        v-if="cards"
        class="cards"
      >
        <div
          v-for="card in cards.results"
          :key="card.id"
          class="card"
          :class="`${card.card_brand}`"
        >
          <div class="icon" />

          <div class="content">
            <BaseText
              as="p"
              variant="body-2-semibold"
            >
              <span v-if="card.card_brand === 'mastercard'">
                Mastercard ({{ getProviderType(card.provider) }})
                <i v-if="card.primary">Default</i>
              </span>
              <span v-if="card.card_brand === 'visa'">
                Visa ({{ getProviderType(card.provider) }})
                <i v-if="card.primary">Default</i>
              </span>
              <span v-if="card.card_brand === 'unionpay'">
                UnionPay ({{ getProviderType(card.provider) }})
                <i v-if="card.primary">Default</i>
              </span>
              <span v-if="card.card_brand === 'discover'">
                Discover ({{ getProviderType(card.provider) }})
                <i v-if="card.primary">Default</i>
              </span>
            </BaseText>
            <div class="card-number">
              <BaseTextHiddenDots
                :count="4"
                variant="body-2-semibold"
              />
              <BaseText variant="body-2-semibold">
                {{ getLastFour(card) }}
              </BaseText>
              <BaseTextHiddenDots
                v-if="card?.nickname"
                :count="1"
                variant="body-2-semibold"
              />
              <BaseText
                v-if="card?.nickname"
                variant="body-2-semibold"
              >
                {{ " " + card.nickname }}
              </BaseText>
            </div>
            <BaseText
              v-if="card.auto_debit"
              as="p"
              variant="headline-6-medium"
              class="auto-debit"
            >
              Auto-debit enabled
            </BaseText>

            <div
              v-if="cards?.results?.length > 1 && !card?.primary"
              class="card-dropdown"
              :class="{ active: activeDropdown === card.id }"
            >
              <div
                class="dropdown-icon"
                @click="currentDropdown(card.id)"
              >
                <InlineSvg name="kabob" />
              </div>

              <div class="dropdown">
                <div class="content">
                  <div
                    v-if="card.auto_debit"
                    class="button"
                  >
                    <div class="text">
                      <BaseText
                        variant="body-small-medium"
                        as="p"
                      >
                        Auto-debit
                      </BaseText>
                      <BaseText
                        variant="body-small-medium"
                        as="p"
                      >
                        Transactions debit as you spend
                      </BaseText>
                    </div>

                    <UiSwitchInput :value="card.auto_debit" />
                  </div>

                  <div
                    v-if="!card.primary"
                    class="button"
                  >
                    <div class="text">
                      <BaseText
                        variant="body-small-medium"
                        as="p"
                      >
                        Set as default funding source
                      </BaseText>

                      <BaseText
                        v-if="!card.is_auto_debit"
                        variant="body-small-medium"
                        as="small"
                      >
                        Auto-debit will be automatically enabled
                      </BaseText>
                    </div>

                    <UiSwitchInput
                      :value="card.primary"
                      @change="toggleDefaultFundingSource(card.id)"
                    />
                  </div>

                  <div
                    class="button delete"
                    @click="deleteFundingSource(card)"
                  >
                    <div class="text">
                      <BaseText
                        variant="body-small-medium"
                        as="p"
                      >
                        Remove funding source
                      </BaseText>
                    </div>
                  </div>
                </div>

                <div
                  class="background"
                  @click="currentDropdown(null)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="buttons">
        <BaseText
          v-if="cards"
          as="h1"
          variant="body-3-semibold"
        >
          Connect another
        </BaseText>

        <ValueDisplay
          v-if="AchDebitEnabled"
          label="Bank account"
          :value="''"
          name="bank"
          arrow
          @click="addFundingSource('ach')"
        />

        <ValueDisplay
          label="Debit card"
          :value="''"
          name="card"
          arrow
          @click="addFundingSource(constants.CARD_TYPE.DEBIT_CARD)"
        />

        <ValueDisplay
          label="Credit card"
          :value="''"
          name="card"
          arrow
          @click="addFundingSource(constants.CARD_TYPE.CREDIT_CARD)"
        />
      </div>
    </div>

    <EditSourceModal
      v-if="cards.results"
      :show="activeModal"
      :source="cards.results[0]"
      @close="activeModal = false"
    />
  </div>
</template>

<style lang="scss" scoped>
.funding-source {
  padding-bottom: 80px;
  margin-top: 48px;
  .title {
    h1 {
      color: $color-primary-100;
    }
    p {
      margin-top: 16px;
      color: $color-primary-70;
    }
  }
  .content {
    margin-top: 24px;
    .cards {
      width: 100%;
      .card {
        color: $color-primary-100;
        border-bottom: 1px solid $color-primary-10;
        padding: 16px 8px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        &:last-of-type {
          border-bottom-width: 0;
        }
        .icon {
          width: 40px;
          height: 40px;
          border: 1px solid $color-primary-10;
          background: $white;
          border-radius: 45px;
          margin-right: 16px;
          background-repeat: no-repeat;
          background-size: contain;
          background-position: center;
          margin-top: 8px;
        }
        .content {
          width: calc(100% - 68px);
          margin-top: 6px;
          position: relative;
          .card-number {
            color: $color-primary-50;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
            gap: 4px;
          }
          p {
            i {
              font-weight: 600;
              font-size: 10px;
              line-height: 15px;
              font-style: normal;
              color: $color-primary-1;
              background-color: $color-primary-100;
              padding: 0 10px;
              border-radius: 20px;
              display: inline-block;
              margin-left: 4px;
            }

            &.auto-debit {
              color: $color-primary-100;
              &.disabled {
                opacity: 0.4;
              }
            }
          }
          .card-dropdown {
            &.active {
              .dropdown-icon {
                &:before {
                  width: 36px;
                  height: 36px;
                }
              }
              .dropdown {
                opacity: 1;
                visibility: visible;
                top: 32px;
              }
            }
            .dropdown-icon {
              position: absolute;
              top: 50%;
              @include transform(translateY(-50%));
              right: -8px;
              z-index: 1;
              width: 36px;
              height: 36px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: $color-primary-100;
              &:hover {
                cursor: pointer;
                &:before {
                  width: 36px;
                  height: 36px;
                }
              }
              &:before {
                content: "";
                position: absolute;
                top: 50%;
                left: 50%;
                @include transform(translate(-50%, -50%));
                @include transition(all 0.4s ease);
                background-color: $color-primary-10;
                z-index: -1;
                border-radius: 50%;
                width: 0px;
                height: 0px;
              }
            }
            .dropdown {
              position: absolute;
              top: 30px;
              right: -34px;
              width: 360px;
              z-index: 2;
              opacity: 0;
              visibility: hidden;
              @include transition(all 0.4s ease);
              .content {
                width: 100%;
                border: 1px solid rgba(25, 30, 35, 0.1);
                box-shadow: 0px 14px 24px rgba(0, 0, 0, 0.25);
                border-radius: 15px;
                padding: 20px 16px;
                background-color: $color-background;
                position: relative;
                z-index: 2;
                .button {
                  color: $color-primary-100;
                  margin-top: 24px;
                  position: relative;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  &:first-of-type {
                    margin-top: 0;
                  }
                  &.disabled {
                    opacity: 0.2;
                    pointer-events: none;
                  }
                  p {
                    color: $color-primary-50;
                    &:first-of-type {
                      color: $color-primary-100;
                    }
                  }
                  &.delete {
                    p {
                      color: $color-alert;
                    }
                    svg {
                      width: 36px;
                      height: 36px;
                      display: inline-block;
                      padding: 6px;
                      color: $color-alert;
                    }
                    &:hover {
                      cursor: pointer;
                    }
                  }
                  small {
                    color: $color-primary-30-dark;
                    font-size: 0.65rem;
                  }
                }
              }
              .background {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
              }
            }
          }
        }
        &.mastercard {
          .icon {
            background-image: url("https://asset.brandfetch.io/idFw8DodCr/idKRU3EJKM.jpeg?updated=1667560171163");
          }
        }
        &.visa {
          .icon {
            background-image: url("https://asset.brandfetch.io/idhem73aId/idoOleMCqQ.png?updated=1679062241241");
          }
        }
        &.unionpay {
          .icon {
            background-image: url("https://asset.brandfetch.io/idmUZnnx1B/id0gZkqbXl.png");
          }
        }
        &.discover {
          .icon {
            background-image: url("https://asset.brandfetch.io/idyXDiKxGF/id0t2Nwffx.jpeg?updated=1667576052215");
          }
        }

        &.amex {
          .icon {
            background-image: url("https://asset.brandfetch.io/idaYeBHZgd/idCi8OKryB.png?updated=1700420925086");
          }
        }
      }
    }
    .buttons {
      width: 100%;
      h1 {
        margin: 16px 0;
        color: $color-primary-100;
      }
    }
  }
}
</style>
