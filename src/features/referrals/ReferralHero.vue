<script setup>
import { computed, reactive } from "vue";
import { useToast } from "@/composables/useToast.js";
import ReferralService from "@/api/actions/referral-service";
import { validation } from "@/scripts/validation";
import BaseButton from "@/library/BaseButton.vue";

const toast = useToast();
const emit = defineEmits(["sent"]);

const props = defineProps({
  showInviteInput: {
    type: Boolean,
    default: false,
  },
});

const state = reactive({
  sending: false,
  input: "",
});

const emailIsValid = computed(() => {
  if (state.input) {
    return validation.email(state.input);
  }
  return false;
});

const canSend = computed(() => {
  return emailIsValid.value;
});

function send() {
  if (emailIsValid.value) {
    state.sending = true;
    ReferralService.createReferrals(state.input)
      .then(() => {
        state.input = "";
        emit("sent");
      })
      .catch(({ response }) => {
        let error = "Could not add your invite, please try again";
        if (response.data) {
          error = response.data.message;
        }
        toast.error(error);
      })
      .finally(() => {
        state.sending = false;
      });
  }
}
</script>
<template>
  <div
    class="referral-hero"
    :class="{ large: props.showInviteInput }"
  >
    <div class="referral-hero-overlay" />
    <div
      class="referral-hero-content"
      :class="{ large: props.showInviteInput }"
    >
      <div>
        <div class="referral-hero-wrap">
          <h1>Give $25, get $25</h1>
        </div>
        <h3>
          Refer a friend to Cloaked and each of you will receive a gift card of
          up to $25 when they subscribe.
        </h3>

        <div class="hero-actions">
          <input
            v-show="props.showInviteInput"
            type="text"
            :value="state.input"
            placeholder="Invite email address"
            @input="(event) => (state.input = event.target.value)"
            @keyup.enter="send"
          />
          <div class="hero-actions-buttons">
            <BaseButton
              v-show="props.showInviteInput"
              icon="send"
              :disabled="!canSend || state.sending"
              variant="primary"
              class="hero-actions__send"
              @click="send"
            >
              <span>{{ state.sending ? "Sending..." : "Send invite" }}</span>
            </BaseButton>

            <BaseButton
              v-show="!props.showInviteInput"
              variant="primary"
            >
              <router-link :to="{ name: 'Referrals' }">
                <span>Learn more</span>
              </router-link>
            </BaseButton>
          </div>
        </div>
      </div>
      <img
        src="@/assets/images/girl-and-computerhead.png"
        alt="sharing photo"
        :class="{ large: props.showInviteInput }"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.referral-hero {
  height: 300px;
  width: 100%;
  background-color: black;
  position: sticky;

  &.large {
    height: 420px;
  }

  .referral-hero-overlay {
    color: $color-primary-100-dark;
    height: 100%;
    width: 100%;
    background: linear-gradient(
      86deg,
      rgb(0 255 252 / 25%) 11.59%,
      rgb(40 154 255 / 25%) 27.15%,
      rgb(181 66 255 / 25%) 46.52%,
      rgb(255 64 96 / 25%) 67.39%,
      rgb(255 225 18 / 25%) 87.51%
    );
    filter: $background-rainbow-filter;
  }

  .referral-hero-content {
    color: $color-primary-100-dark;
    width: 100%;
    height: 300px;
    position: relative;
    top: -300px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0 64px;
    overflow: hidden;
    gap: 60px;

    &.large {
      height: 420px;
      top: -420px;
    }

    > img {
      margin-top: 300px;
      height: 500px;
      width: auto;

      &.large {
        margin-top: 150px;
      }
    }

    h1 {
      font-size: 48px;
      font-style: normal;
      font-weight: 700;
      line-height: 63px; /* 131.25% */
    }

    h3 {
      font-size: 18px;
      font-style: normal;
      font-weight: 500;
      line-height: normal;
      max-width: 400px;
    }

    .referral-hero-wrap {
      max-width: 500px;
      margin-bottom: 16px;
    }

    .hero-actions {
      margin-top: 32px;
      display: flex;
      flex-direction: column;
      gap: 24px;

      &.disabled {
        opacity: 0.5;
        transform: none;
        transition: none;
      }

      input {
        border-radius: 12px;
        background-color: $color-base-white-100-light;
        color: $color-primary-100-light;
        border: 1px solid $color-primary-1-light;
        padding: 12px 16px;
        min-width: 330px;
        max-width: 400px;
        outline: none;

        &:focus {
          outline: none;
          border: 1px solid $color-primary-100-light;
        }
      }

      .hero-actions-buttons {
        display: flex;
        flex-direction: row;
        gap: 4px;
      }

      &__send {
        background-color: $color-primary-100-dark;
        color: $color-primary-1-dark;

        :deep(.base-button__icon) {
          background-color: $color-primary-90-dark;
        }
      }
    }
  }

  @media (width >= 1400px) {
    .referral-hero-content {
      padding-right: 150px;

      > img {
        height: 600px;
        margin-top: 350px;

        &.large {
          margin-top: 150px;
          height: 500px;
          width: auto;
        }
      }
    }
  }

  @media (width <= 1200px) {
    .referral-hero-content {
      gap: 20px;

      > img {
        margin-top: 300px;
        height: 400px;
        width: auto;
      }

      h1 {
        font-size: 38px;
        overflow: visible;
        white-space: nowrap;
      }

      h3 {
        font-size: 15px;
      }
    }
  }
}
</style>
