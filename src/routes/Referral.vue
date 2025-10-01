<script setup>
import { reactive, computed, onMounted } from "vue";
import {
  WEBSITE_TERMS_OF_SERVICE_URL,
  WEBSITE_REFERRAL_TERMS_URL,
  HELP_CENTER_REFERRAL_URL,
} from "@/scripts/constants.js";
import BaseButton from "@/library/BaseButton.vue";
import ModalTemplate from "@/features/ModalTemplate.vue";
import ReferralService from "@/api/actions/referral-service.js";
import store from "@/store";
import InlineSvg from "@/features/InlineSvg.vue";
import ReferralHero from "@/features/referrals/ReferralHero.vue";
import { useToast } from "@/composables/useToast.js";

const ACCEPTED = "accepted";
const PENDING = "pending";

const toast = useToast();

const ui = reactive({
  input: "",
  sending: false,
  modal: false,
  details: false,
});

const data = reactive({
  emails: [],
});

const inviteCounts = reactive({
  accepted: 0,
  pending: 0,
});

const emailsToShow = reactive({
  accepted: 3,
  pending: 3,
});

const accepted = computed(() =>
  data.emails.filter((e) => e.status.toLowerCase() === ACCEPTED)
);
const pending = computed(() =>
  data.emails.filter((e) => e.status.toLowerCase() === PENDING)
);
const mainPagePreviewEmails = computed(() => {
  return data.emails.slice(0, 3);
});
const invitesPagePreviewAccepted = computed(() => {
  return accepted.value.slice(0, emailsToShow.accepted);
});
const invitesPagePreviewPending = computed(() => {
  return pending.value.slice(0, emailsToShow.pending);
});
const allowedReferrals = computed(() => {
  return store.state.authentication?.user?.allowed_referrals ?? 20;
});

const remaining = computed(
  () => allowedReferrals.value - (inviteCounts.accepted + inviteCounts.pending)
);
/* This gives us the percent of how many invtes are left
and then multiply by 100 for use in the conic gradient + rotation perimiter */
const remainingInvitesCssNumber = computed(() => {
  if (remaining.value <= 0) {
    return 0;
  }
  return (remaining.value / allowedReferrals.value) * 100;
});

function sent() {
  ui.modal = true;
  refreshAllData();
}

function refreshAllData() {
  const acceptedReferrals = ReferralService.getAcceptedReferrals().then(
    (res) => {
      inviteCounts.accepted = res.data.count;
      return res.data.results;
    }
  );
  const pendingReferrals = ReferralService.getPendingReferrals().then((res) => {
    inviteCounts.pending = res.data.count;
    return res.data.results;
  });
  Promise.all([acceptedReferrals, pendingReferrals]).then((results) => {
    data.emails = [...results[0], ...results[1]];
  });
}

function withdraw(email) {
  ReferralService.revokeReferral(email.url)
    .then(() => {
      refreshAllData();
    })
    .catch((err) => {
      let error = "Could note revolke invite, please try again";
      if (err.data) {
        error = err.data.error;
      }
      toast.error(error);
    });
}

function showMoreToggle(property, numberToShow) {
  switch (property) {
    case PENDING:
      emailsToShow.pending = numberToShow === 3 ? pending.value.length : 3;
      break;
    case ACCEPTED:
      emailsToShow.accepted = numberToShow === 3 ? accepted.value.length : 3;
      break;
    default:
      break;
  }
}

function showButtonText(numberToShow) {
  return numberToShow <= 3 ? "Show more" : "Show less";
}

onMounted(() => {
  store.commit("setCloseRightPanel");
  refreshAllData();
});
</script>
<template>
  <div class="referral-container">
    <ModalTemplate
      :show="ui.modal"
      @close="ui.modal = false"
    >
      <template #header>
        <div class="invite-icon">
          <div>
            <InlineSvg name="invite-sent" />
          </div>
        </div>
      </template>
      <template #body>
        <div class="invite-modal-body">
          <h1>Invite sent!</h1>
          <p>
            Be sure to let the person you've invited to Cloaked know to check
            their inbox.
          </p>
        </div>
      </template>
      <template #footer>
        <BaseButton @click="ui.modal = false">Done</BaseButton>
      </template>
    </ModalTemplate>
    <transition name="fade-500">
      <div
        v-if="!ui.details"
        class="referral-general"
      >
        <ReferralHero
          :show-invite-input="true"
          @sent="sent"
        />
        <div class="referral-content">
          <div class="referral-content-left">
            <h1>How referral invites work</h1>
            <ul>
              <li>
                <div>1</div>
                <div>
                  <h2>Send an invite</h2>
                  <p>
                    Use the button above to invite friends or family via email.
                  </p>
                </div>
              </li>
              <li>
                <div>2</div>
                <div>
                  <h2>Your friends sign up with your code</h2>
                  <p>You'll be notified when your friends join Cloaked.</p>
                </div>
              </li>
              <li>
                <div>3</div>
                <div>
                  <h2>Get your Amazon gift card</h2>
                  <p>
                    Earn a $10 Amazon gift card when your friend subscribes to
                    Cloaked with a monthly plan. Earn a $25 Amazon gift card if
                    they subscribe with an annual plan. Your friend receives the
                    same referral reward!
                  </p>
                </div>
              </li>
            </ul>
          </div>
          <div class="referral-content-right">
            <h1>Sent invitations</h1>
            <div
              v-for="(email, index) in mainPagePreviewEmails"
              v-show="mainPagePreviewEmails.length > 0"
              :key="index"
              class="email-list"
            >
              <div
                v-if="email.status.toLowerCase() === 'pending'"
                class="email-item"
              >
                <InlineSvg name="yellow-clock" />
                <div class="email-content">
                  <div>{{ email.sent_to_email }}</div>
                  <div class="subtitle">
                    Your friend hasn't performed a qualifying action yet
                  </div>
                </div>
              </div>
              <div
                v-else-if="email.status.toLowerCase() === 'accepted'"
                class="email-item"
              >
                <InlineSvg
                  name="checkmark"
                  class="status-icon"
                />
                <div class="email-content">
                  <div>{{ email.sent_to_email }}</div>
                  <div class="subtitle">
                    Done! Your friend has performed a qualifying action
                  </div>
                </div>
              </div>
            </div>
            <div>
              <BaseButton
                v-show="data.emails.length > 0"
                variant="secondary"
                @click="ui.details = true"
              >
                Review Invites
              </BaseButton>
            </div>
            <div
              v-show="data.emails.length === 0"
              class="invites-empty"
            >
              <InlineSvg name="invite-sent" />
              <h3>No invitations sent</h3>
              <p>Your sent invitations will appear here.</p>
            </div>
          </div>
        </div>
        <div class="term-links">
          <a
            :href="WEBSITE_REFERRAL_TERMS_URL"
            target="_blank"
          >
            Referral Terms
          </a>
          <a
            :href="WEBSITE_TERMS_OF_SERVICE_URL"
            target="_blank"
          >
            Terms and conditions
          </a>
          <a
            :href="HELP_CENTER_REFERRAL_URL"
            target="_blank"
          >
            FAQ
          </a>
        </div>
      </div>
    </transition>
    <transition name="fade-500">
      <div
        v-if="ui.details"
        class="referral-details"
      >
        <button @click="ui.details = false">
          <InlineSvg name="chevron-left-600" />
          Back
        </button>
        <div class="referral-details-container">
          <div class="referral-details-main">
            <div class="referral-detail-left">
              <div class="referral-detail-hero">
                <h1>Review Invites</h1>
                <p>
                  Below are the statuses of the individuals you've invited to
                  Cloaked:
                </p>
              </div>
              <div class="review-list">
                <h1>{{ inviteCounts.pending }} Pending invites</h1>
                <div
                  v-show="inviteCounts.pending > 0"
                  class="email-list"
                >
                  <div
                    v-for="(email, index) in invitesPagePreviewPending"
                    :key="index"
                    class="email-item email-details"
                  >
                    <div>
                      <InlineSvg name="yellow-clock" />
                      <div class="email-content">
                        <div>{{ email.sent_to_email }}</div>
                      </div>
                    </div>
                    <BaseButton
                      variant="secondary"
                      @click="withdraw(email)"
                    >
                      Withdraw
                    </BaseButton>
                  </div>
                </div>
                <BaseButton
                  v-if="inviteCounts.pending > 3"
                  variant="secondary"
                  class="see-toggle"
                  @click="showMoreToggle(PENDING, emailsToShow.pending)"
                >
                  {{ showButtonText(emailsToShow.pending) }}
                </BaseButton>
              </div>
              <div
                v-if="invitesPagePreviewAccepted.length > 0"
                class="review-list"
              >
                <h1>Accepted invites</h1>
                <div
                  v-show="inviteCounts.accepted > 0"
                  class="email-list"
                >
                  <div
                    v-for="(email, index) in invitesPagePreviewAccepted"
                    :key="index"
                    class="email-item"
                  >
                    <InlineSvg
                      name="checkmark"
                      class="status-icon"
                    />
                    <div class="email-content">
                      <div>{{ email.sent_to_email }}</div>
                    </div>
                  </div>
                </div>
                <BaseButton
                  v-if="inviteCounts.accepted > 3"
                  variant="secondary"
                  class="see-toggle"
                  @click="showMoreToggle(ACCEPTED, emailsToShow.accepted)"
                >
                  {{ showButtonText(emailsToShow.accepted) }}
                </BaseButton>
              </div>
            </div>
            <div class="referral-detail-right">
              <div
                class="referral-progress-container"
                :class="{
                  'referral-progress-container__none-sent': ui.details,
                }"
              >
                <div class="referral-progress">
                  <div
                    class="pie animate progress-bar"
                    :style="`--p:${remainingInvitesCssNumber};`"
                  >
                    <div>
                      <h1>
                        <strong>{{ remaining > 0 ? remaining : 0 }}</strong>
                        /{{ allowedReferrals }}
                      </h1>
                      <span>
                        available
                        <br />
                        invites
                      </span>
                    </div>
                  </div>
                  <div class="referral-progress-text">
                    <InlineSvg name="hourglass" />
                    <span>
                      <strong>{{ inviteCounts.pending }}</strong>
                      pending invites
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="term-links progress-page">
            <a
              :href="WEBSITE_REFERRAL_TERMS_URL"
              target="_blank"
            >
              Referral Terms
            </a>
            <a
              :href="WEBSITE_TERMS_OF_SERVICE_URL"
              target="_blank"
            >
              Terms and conditions
            </a>
            <a
              :href="HELP_CENTER_REFERRAL_URL"
              target="_blank"
            >
              FAQ
            </a>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
<style lang="scss" scoped>
/* stylelint-disable */
.term-links {
  color: $color-primary-100;
  font-size: 13px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  display: inline-flex;
  gap: 16px;
  flex-grow: 0;
  padding-bottom: 16px;
  margin-bottom: 16px;
  margin-left: 98px;

  a {
    transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
    text-decoration-line: underline;
    &:hover {
      opacity: 0.7;
      transform: scale(1.01);
      transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
    }
  }
  &.progress-page {
    margin-left: 0;
  }
}
.referral-container {
  padding-bottom: 20px;
  min-width: 770px;
  background-color: $color-base-white-100;
  .invite-icon {
    > div {
      background-color: $color-success;
      color: $color-primary-1;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      display: flex;
      justify-content: center;
      align-items: center;
      svg {
        position: relative;
        left: -2px;
      }
    }
  }
  .invite-modal-body {
    h1 {
      font-weight: 500;
      font-size: 20px;
      line-height: 30px;
      margin: 12px 0;
    }
  }
  .referral-content {
    gap: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .referral-content {
    color: $color-primary-100;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-top: 32px;
    .referral-content-left {
      width: 48%;

      h1 {
        font-weight: 500;
        font-size: 24px;
        line-height: 36px;
        margin-left: 48px;
      }
      h2 {
        font-weight: 500;
        font-size: 15px;
        line-height: normal;
      }
      ul {
        margin-left: 48px;

        li {
          margin: 24px 0;
          display: flex;
          flex-direction: row;
          gap: 10px;
          justify-content: flex-start;
          align-items: flex-start;

          div:nth-child(1) {
            background-color: $color-primary-10;
            width: 32px;
            height: 32px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            font-weight: 400;
            font-size: 13px;
            line-height: 20px;
          }
          p {
            color: $color-primary-70;
            font-weight: 400;
            font-size: 13px;
          }
          div:nth-child(2) {
            margin-left: 10px;
            width: calc(100% - 32px);
          }
        }
      }
    }

    .referral-content-right {
      width: 48%;

      h1 {
        font-weight: 500;
        font-size: 24px;
        line-height: 36px;
      }
      .community-link {
        cursor: pointer;
        margin-top: 20px;
        border-radius: 999px;
        border: 1px solid $color-primary-100;
        padding: 11px 16px;
        background-color: transparent;
        color: $color-primary-100;
      }
      .invites-empty {
        text-align: center;
        padding: 50px 30px;
        svg {
          margin-bottom: 17px;
          color: $color-primary-50;
        }
        h3 {
          font-style: normal;
          font-weight: 500;
          font-size: 14px;
          line-height: 21px;
        }
        p {
          color: $color-primary-70;
          font-weight: 400;
          font-size: 12px;
          line-height: 18px;
        }
      }
    }
  }
  .referral-progress-container {
    display: flex;
    justify-content: flex-start;
    cursor: pointer;
    > svg {
      border-radius: 13.207px;
    }
    .referral-progress {
      width: 247px;
      height: 282px;
      padding: 24px;
      border-radius: 18px;
      background-color: $color-primary-1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      button.progress-bar {
        cursor: pointer;
      }
      .progress-bar {
        border-radius: 50%;
        border: none;
        background: conic-gradient($color-info 0, $color-primary-10 0%);
        margin: 0 auto;
        width: 150px;
        height: 150px;
        display: flex;
        align-items: center;
        justify-content: center;
        > div {
          width: 120px;
          height: 120px;
          border-radius: 999px;
          background-color: $color-primary-1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          h1 {
            margin: 0;
            font-style: normal;
            font-weight: 400;
            font-size: 12px;
            line-height: 18px;
            color: $color-primary-50;
            strong {
              color: $color-primary-100;
              font-weight: 600;
              font-size: 44px;
              line-height: 40px;
            }
          }
          span {
            color: $color-primary-100;
            font-weight: 400;
            font-size: 10px;
            line-height: 15px;
            text-align: center;
          }
        }
      }
      @property --p {
        syntax: "<number>";
        inherits: true;
        initial-value: 0;
      }
      .pie {
        --p: 20;
        --b: 16px;
        --w: 150px;
        width: var(--w);
        aspect-ratio: 1;
        position: relative;
        display: inline-grid;
        margin: 5px;
        place-content: center;
      }
      .pie:before,
      .pie:after {
        content: "";
        position: absolute;
        border-radius: 50%;
      }
      .pie:before {
        inset: 0;
        background:
          radial-gradient(farthest-side, $color-info 98%, #0000) top/var(--b)
            var(--b) no-repeat,
          conic-gradient($color-info calc(var(--p) * 1%), #0000 0);
        -webkit-mask: radial-gradient(
          farthest-side,
          #0000 calc(99% - var(--b)),
          #000 calc(100% - var(--b))
        );
        mask: radial-gradient(
          farthest-side,
          #0000 calc(99% - var(--b)),
          #000 calc(100% - var(--b))
        );
      }
      .pie:after {
        inset: calc(50% - var(--b) / 2);
        background: $color-info;
        transform: rotate(calc(var(--p) * 3.6deg))
          translateY(calc(50% - var(--w) / 2));
      }
      .animate {
        animation: p 1s 0.5s both;
      }
      @keyframes p {
        from {
          --p: 0;
        }
      }
    }
    .referral-progress-text {
      gap: 12px;
      display: flex;
      font-size: 14px;
      font-weight: 600;
      margin-top: 16px;
      line-height: 21px;
      align-items: center;
      justify-content: center;
      color: $color-primary-70;
    }
    &__none-sent {
      cursor: default;
    }
  }
  .email-list {
    > div.email-item {
      display: flex;
      gap: 10px;
      border-top: 1px solid $color-primary-10;
      &:first-child {
        border-top: none;
      }
      padding: 10px 0;
      align-items: center;
      &.email-details {
        display: flex;
        justify-content: space-between;
        > div {
          display: flex;
          gap: 10px;
          align-items: center;
        }
      }
      .email-content {
        display: flex;
        flex-direction: column;
        gap: 2px;
        div {
          font-weight: 500;
          font-size: 14px;
          line-height: 21px;
          &.subtitle {
            font-style: normal;
            font-weight: 400;
            font-size: 12px;
            line-height: 18px;
            color: $color-primary-50;
          }
        }
      }
    }
    .status-icon {
      width: 32px;
      height: 32px;
    }
  }
  .referral-details {
    color: $color-primary-100;
    height: 100%;
    padding: 32px;

    > button {
      cursor: pointer;
      background-color: transparent;
      border: none;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      color: $color-primary-100;
      svg {
        position: relative;
        top: -1px;
      }
    }
    .see-toggle {
      cursor: pointer;
      margin-top: 20px;
      border-radius: 999px;
      border: 1px solid $color-primary-100;
      padding: 11px 16px;
      background-color: transparent;
      color: $color-primary-100;
    }
    .referral-details-container {
      display: flex;
      justify-content: space-between;
      flex-direction: column;
      height: 100%;
      width: 100%;
    }
    .referral-details-main {
      display: flex;
      flex-grow: 1;
      width: 100%;
      justify-content: space-between;
    }
    .referral-detail-right {
      padding-top: 23px;
      .referral-progress {
        background-color: $color-primary-5;
      }
      .progress-bar {
        div {
          background-color: $color-primary-5;
        }
      }
    }
    .referral-detail-left {
      padding-right: 16px;
    }
    .referral-detail-hero {
      margin: 20px 0;
      h1 {
        font-style: normal;
        font-weight: 500;
        font-size: 24px;
        line-height: 36px;
        padding-bottom: 20px;
      }
      p {
        font-weight: 400;
        font-size: 14px;
        line-height: 21px;
        color: $color-primary-50;
      }
    }
    .review-list {
      margin: 40px 0;
      h1 {
        font-style: normal;
        font-weight: 500;
        font-size: 18px;
        line-height: 27px;
      }
    }
  }
}
</style>
