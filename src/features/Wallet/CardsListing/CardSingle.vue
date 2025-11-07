<script setup>
import { ref, computed, watch } from "vue";
import store from "@/store";
import InlineSvg from "@/features/InlineSvg";
import { useRoute } from "vue-router";
import { useToast } from "@/composables/useToast.js";
import IdentityIcon from "@/features/ui/IdentityIcon.vue";
import { tools } from "@/scripts/tools";
import useOutstandingBalance from "@/features/VirtualCards/composables/useOutstandingBalance";

const route = useRoute();
const toast = useToast();
const { hasCollectionStatus } = useOutstandingBalance();

function identity(id) {
  const identity = store.state.localdb.db_cloaks.find((item) => item.id === id);
  return identity;
}

const props = defineProps({
  status: {
    type: Boolean,
    default: false,
  },
  card: {
    type: Object,
    default: null,
  },
  sent: {
    type: Boolean,
    default: false,
  },
});

const card = computed(() => props.card);

const realCardNumbers = computed(() => {
  return store.state.cards.currentCard;
});

const available = computed(() => {
  return card.value.transaction_period_limit - card.value.spent_period;
});

function convertToDollar(amount) {
  return (amount / 100)
    .toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })
    .replace(/\.0+$/, "");
}

function lastFourDigits(number) {
  return number.slice(-4);
}

const hiddenPan = (pan) => {
  return "••••••••••••" + lastFourDigits(pan);
};

const splitPan = (pan) => {
  return pan.match(/.{1,4}/g)?.join("  ") || pan;
};

const formatExpiryDate = (apiDate) => {
  const date = new Date(apiDate);
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Ensure two digits
  const year = String(date.getUTCFullYear()).slice(-2); // Get last two digits of the year
  return `${month}/${year}`;
};

function copyToClipboard(text, data) {
  if (!canToggle()) return;

  tools.copyToClipboard(data);
  toast.success(text + " copied to clipboard");
}

const cardNumberVisibility = ref(false);
const cardExpiryVisibility = ref(false);
const cardCvvVisibility = ref(false);

function toggleCardNumberVisibility() {
  if (!canToggle()) return;
  cardNumberVisibility.value = !cardNumberVisibility.value;
}

function toggleCardCvvVisibility() {
  if (!canToggle()) return;
  cardCvvVisibility.value = !cardCvvVisibility.value;
}

function toggleCardExpiryVisibility() {
  if (!canToggle()) return;
  cardExpiryVisibility.value = !cardExpiryVisibility.value;
}

function canToggle() {
  if (hasCollectionStatus.value) {
    toast.error("Pay your outstanding balance to resume access to Cloaked Pay");
    return false;
  }

  return true;
}

watch(route, () => {
  if (route.params.id) {
    cardNumberVisibility.value = false;
    cardExpiryVisibility.value = false;
    cardCvvVisibility.value = false;
  }
});
</script>

<template>
  <router-link
    v-if="props.card"
    :to="'/virtual-cards/wallet/card/' + card.id"
    class="card"
    :class="{
      active: route.params.id === card.id,
      'show-gift': card.gift && !card.canceled,
      canceled: card.canceled,
    }"
  >
    <div class="title">
      <IdentityIcon
        class="icon"
        :identity="identity(JSON.parse(card?.identity_id || '{}'))"
        :override="{ height: '60px', width: '60px' }"
      />
      <div class="info">
        <h1 v-if="card?.identity_id">
          {{ card.gift ? "Gift Card" : card.identity_name || "(Unnamed)" }}

          <InlineSvg
            v-if="
              card.state === 'locked_by_user' ||
              card.state === 'locked_by_system'
            "
            name="lock-filled"
          />

          <InlineSvg
            v-if="
              card.gift &&
              card.state === 'unlocked' &&
              !card.canceled &&
              !props.sent
            "
            name="gift"
          />

          <InlineSvg
            v-if="
              card.gift &&
              card.state === 'unlocked' &&
              !card.canceled &&
              props.sent
            "
            name="invite-sent"
          />

          <InlineSvg
            v-if="card.canceled"
            name="credit-warning"
          />
        </h1>
        <h1 v-else>Physical card</h1>
        <p v-if="card.state === 'unlocked' && !card.canceled">
          {{ convertToDollar(available) }} available
        </p>
      </div>
    </div>

    <div class="card-details">
      <div class="card-number">
        <p
          v-if="route.params.id === card.id"
          class="hover"
        >
          <span
            v-if="!cardNumberVisibility && !card.canceled"
            @click="
              copyToClipboard(
                'Virtual Card number',
                realCardNumbers.pan_unmasked
              )
            "
          >
            {{ splitPan(hiddenPan(card.pan)) }}
          </span>
          <span
            v-else
            @click="
              copyToClipboard(
                'Virtual Card number',
                realCardNumbers.pan_unmasked
              )
            "
          >
            {{ splitPan(realCardNumbers.pan_unmasked) }}
          </span>
          <span
            v-if="!card.canceled"
            class="icon"
            @click="toggleCardNumberVisibility()"
          >
            <InlineSvg
              :key="`${card.identity_id}-${cardNumberVisibility}`"
              :name="cardNumberVisibility ? 'eye-slash' : 'eye'"
            />
          </span>
        </p>
        <p v-else>
          <span>{{ splitPan(hiddenPan(card.pan)) }}</span>
        </p>
      </div>

      <div
        v-if="!card.canceled"
        class="valid"
      >
        <p>Exp. Date</p>
        <p
          v-if="route.params.id === card.id"
          class="hover"
        >
          <span
            v-if="!cardExpiryVisibility"
            @click="
              copyToClipboard('Exp. Date', formatExpiryDate(card.expires_at))
            "
          >
            ••/••
          </span>
          <span
            v-else
            @click="
              copyToClipboard('Exp. Date', formatExpiryDate(card.expires_at))
            "
          >
            {{ formatExpiryDate(card.expires_at) }}
          </span>

          <span
            class="icon"
            @click="toggleCardExpiryVisibility()"
          >
            <InlineSvg
              :key="`${card.identity_id}-${cardExpiryVisibility}`"
              :name="cardExpiryVisibility ? 'eye-slash' : 'eye'"
            />
          </span>
        </p>
        <p v-else>••/••</p>
      </div>

      <div
        v-if="!card.canceled"
        class="cvv"
      >
        <p>CVV2</p>
        <p
          v-if="realCardNumbers.security_code && route.params.id === card.id"
          class="hover"
        >
          <span
            v-if="!cardCvvVisibility"
            @click="
              copyToClipboard('CVV2', realCardNumbers.security_code_unmasked)
            "
          >
            •••
          </span>
          <span
            v-else
            @click="
              copyToClipboard('CVV2', realCardNumbers.security_code_unmasked)
            "
          >
            {{ realCardNumbers.security_code_unmasked }}
          </span>

          <span
            class="icon"
            @click="toggleCardCvvVisibility()"
          >
            <InlineSvg
              :key="`${card.identity_id}-${cardCvvVisibility}`"
              :name="cardCvvVisibility ? 'eye-slash' : 'eye'"
            />
          </span>
        </p>
        <p v-else>•••</p>
      </div>

      <div
        v-if="card.canceled"
        class="canceled-message"
      >
        <p>Card is canceled</p>
      </div>
    </div>

    <InlineSvg
      class="card-icon"
      name="mastercard"
    />
  </router-link>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.card {
  --distance: calc(222px - 95px);

  width: 100%;
  height: 222px;
  border-radius: 12px;
  border: 1.009px solid $color-primary-10;
  background: radial-gradient(
    157.8% 94.4% at 54.96% 48%,
    $color-base-white-100 34.38%,
    $color-primary-20 100%
  );
  box-shadow: 0 -3px 5px 0 rgb(0 0 0 / 10%);
  transition: all 0.3s ease-in-out;
  padding: 22px 17px;
  overflow: hidden;
  position: relative;
  display: block;

  &:not(:first-child) {
    margin-top: calc(var(--distance) * -1);
  }

  &:hover {
    cursor: pointer;
  }

  &.active ~ .card {
    transform: translateY(calc(var(--distance) + 10px));
  }

  &.active {
    background: radial-gradient(
      157.8% 94.4% at 54.96% 48%,
      $color-primary-100 34.38%,
      $color-primary-90 100%
    );

    &.show-gift {
      background: gold;
    }

    .canceled-message {
      color: $color-primary-20;
    }

    .title {
      .icon {
        pointer-events: unset;
        cursor: pointer;
      }

      h1 {
        color: $color-primary-1;
      }

      p {
        color: $color-primary-1;
      }
    }

    .card-details {
      color: $color-primary-1;
    }

    .card-icon {
      color: $color-primary-1;
    }
  }

  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    text-align: right;

    .icon {
      pointer-events: none;
    }

    h1 {
      font-size: 18.974px;
      font-style: normal;
      font-weight: 600;
      line-height: normal;
      color: $color-primary-100;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      svg {
        width: auto;
        height: 16px;
        margin-left: 4px;
      }
    }

    p {
      font-size: 12.65px;
      font-style: normal;
      font-weight: 500;
      margin-top: 1px;
      color: $color-primary-100;
    }
  }

  .card-details {
    position: relative;
    margin-top: 32px;
    display: flex;
    flex-wrap: wrap;
    color: $color-primary-100;

    .card-number {
      width: 100%;
      margin-bottom: 13px;

      p {
        font-size: 20.171px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
        display: inline-flex;
        font-family: monospace;
        padding-right: 32px;
        position: relative;

        span {
          display: inline-block;
          border-radius: 4px;

          &.icon {
            width: 27px;
            height: 27px;
            margin-left: 5px;
            padding: 5px;
            position: absolute;
            right: 0;
            border-radius: 50px;
            visibility: hidden;
            opacity: 0;

            svg {
              width: 20px;
              height: 20px;
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
            }
          }
        }

        &.hover {
          span {
            &:hover {
              background-color: $color-primary-90;
              cursor: pointer;
            }
          }

          &:hover {
            span {
              &.icon {
                visibility: visible;
                opacity: 1;
              }
            }
          }
        }
      }
    }

    .valid {
      margin-right: 57px;
    }

    .valid,
    .cvv {
      text-align: center;
      display: flex;
      flex-flow: column wrap;

      p {
        &:first-child {
          font-size: 12.103px;
          font-style: normal;
          font-weight: 400;
          line-height: normal;
          margin-bottom: 4px;
          font-family: inherit;
          padding: 0;
        }

        font-size: 16.866px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
        display: inline-flex;
        font-family: monospace;
        padding-right: 32px;
        position: relative;

        span {
          display: inline-block;
          border-radius: 4px;

          &.icon {
            width: 27px;
            height: 27px;
            margin-left: 5px;
            padding: 5px;
            position: absolute;
            top: 50%;
            right: 0;
            transform: translateY(-50%);
            border-radius: 50px;
            visibility: hidden;
            opacity: 0;

            svg {
              width: 20px;
              height: 20px;
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
            }
          }
        }

        &.hover {
          span {
            &:hover {
              background-color: $color-primary-90;
              cursor: pointer;
            }
          }

          &:hover {
            span {
              &.icon {
                visibility: visible;
                opacity: 1;
              }
            }
          }
        }
      }
    }

    .canceled-message {
      position: absolute;
      bottom: -46px;
      left: 0;
      color: $color-primary-20;
      opacity: 0.6;
      font-size: 12px;
      font-weight: 400;
    }
  }

  .card-icon {
    position: absolute;
    bottom: 22px;
    right: 17px;
    width: 64px;
    height: auto;
    color: $color-primary-100;
    opacity: 0.2;
  }

  &.show-gift {
    background: lighten($color-gift, 20%);
    border-color: $color-gift;
    color: $black;

    .title {
      h1 {
        color: $black;
      }

      p {
        color: $black;
      }
    }

    .card-details {
      color: $black;
    }

    &.active {
      background: lighten($color-gift, 2%);
      color: $white;

      .title {
        h1 {
          color: $white;
        }

        p {
          color: $white;
        }
      }

      .card-details {
        color: $white;
      }
    }
  }

  &.canceled {
    background: $color-primary-20;
    border-color: $color-primary-20;
    color: $color-primary-100;

    .title {
      h1 {
        color: $color-primary-100;
      }

      p {
        color: $color-primary-100;
      }
    }

    .card-details {
      color: $color-primary-100;
    }

    &.active {
      background: $color-primary-50;
      color: $color-primary-1;

      .title {
        h1 {
          color: $color-primary-1;
        }

        p {
          color: $color-primary-1;
        }
      }

      .card-details {
        color: $color-primary-1;
      }
    }
  }
}
</style>
