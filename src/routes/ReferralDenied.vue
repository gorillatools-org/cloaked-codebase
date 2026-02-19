<script setup>
import { computed, onMounted } from "vue";
import { TYPEFORM_WAITLIST_URL } from "@/scripts/constants.js";
import CloakedLogo from "@/assets/icons/cloaked-logo-full.svg";
import store from "@/store";
import router from "@/routes/router";
import InlineSvg from "@/features/InlineSvg.vue";

const isAuthenticated = computed(() => {
  return store.getters["authentication/isAuthenticated"];
});
onMounted(() => {
  /* If the user is authenticated, redirect
  them to their Referrals page */
  if (isAuthenticated?.value) {
    store.commit("setCloseRightPanel");
    return router.push({ name: "Referrals" });
  }
});
</script>
<template>
  <div class="referral-container">
    <header>
      <router-link
        to="/"
        class="logo"
      >
        <CloakedLogo />
      </router-link>
    </header>
    <div>
      <div>
        <div class="referral-hero">
          <h1 class="big">
            At this time, invites are only
            <br />
            available in the US
          </h1>
          <h1 class="small">
            At this time, invites are only available in the US
          </h1>
          <p>Your redeem code is still valid and will not be removed.</p>
          <div class="links">
            <a href="/auth/referral">Try again</a>
            <a :href="TYPEFORM_WAITLIST_URL">Join Waitlist</a>
          </div>
        </div>
        <div class="actions">
          <ul>
            <li>
              <span>
                <InlineSvg name="referral_30day" />
              </span>
              <h3>30 days free</h3>
              <p>
                Your referral code includes a 30 day free trial to Cloaked
                Private Beta with no account limits
              </p>
            </li>
            <li>
              <span>
                <InlineSvg name="referral_privacy" />
              </span>
              <h3>Privacy by design</h3>
              <p>
                Access to a fully encrypted, unique database where only you have
                access to use and view your data.
              </p>
            </li>
            <li>
              <span>
                <InlineSvg name="referral_card" />
              </span>
              <h3>Cancel anytime</h3>
              <p>
                A credit card is required to sign up for a Cloaked subscription,
                you can choose to cancel anytime.
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
/* stylelint-disable */
.referral-container {
  color: $color-primary-100;
  background-color: $color-background;
  min-height: 100%;
  @media (min-width: 666px) {
    .small {
      display: none;
    }
  }
  @media (max-width: 666px) {
    .big,
    .referral-graphic {
      display: none;
    }
  }
  .links {
    display: inline-flex;
    gap: 20px;

    a {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 11px 24px;
      gap: 10px;
      border: 1px solid $color-primary-100;
      border-radius: 999px;
      font-size: 15px;
      line-height: 22px;
      color: $color-primary-100;

      &:hover {
        background-color: $color-primary-10;
      }

      &:last-child {
        background-color: $color-primary-100;
        color: $color-primary-1;

        &:hover {
          background-color: $color-primary-90;
        }
      }
    }
  }
  .logo {
    display: flex;
    justify-content: flex-start;
    padding: 20px 50px;
    opacity: 0;
    @include transform(translateY(40px));
    @include animation(
      fade-in 0.6s forwards cubic-bezier(0.25, 0.75, 0.5, 1.25)
    );
    svg {
      width: 129px;
      height: auto;
      display: inline-block;
    }
  }
  text-align: center;
  .referral-hero {
    margin: 0 auto;
    display: inline-block;
    @media (max-width: 666px) {
      padding: 0 40px;
    }
    > * {
      @include animation(
        fade-in 0.6s forwards cubic-bezier(0.25, 0.75, 0.5, 1.25)
      );

      @for $i from 1 through 5 {
        &:nth-child(#{$i}) {
          opacity: 0;
          @include transform(translateY(40px));
          @include animation-delay($i * 0.1s);
        }
      }
    }
    > p {
      font-weight: 400;
      font-size: 13px;
      line-height: 20px;
      margin: 20px 0;
    }
    .input-group {
      text-align: left;
      .small {
        padding: 10px 0;
      }
      > div {
        display: flex;

        align-items: center;
        padding-right: 20.5px;
        border-radius: 10px;
        background-color: $color-primary-5;
        @media (max-width: 666px) {
          flex-direction: column;
          background-color: transparent;
        }
        label {
          font-weight: 500;
          font-size: 12px;
          line-height: 18px;
        }
        input {
          padding: 16px;
          color: $color-primary-100;
          background-color: transparent;
          @media (max-width: 666px) {
            background-color: $color-primary-5;
          }
          border-radius: 10px;
          align-self: stretch;
          flex-grow: 0;
          border: none;
          display: block;
          margin: 10px 0;
          width: 100%;
          @media (min-width: 666px) {
            width: calc(100% - 155px);
          }
        }
        button {
          padding: 11px 24px;
          width: 149px;
          height: 48px;
          background-color: $color-primary-100;
          color: $color-primary-1;
          border: none;
          border-radius: 7px;
          @media (max-width: 666px) {
            border-radius: 99px;
            width: 100%;
          }
          cursor: pointer;
          &:disabled {
            cursor: default;
            background-color: $color-primary-10;
            color: $color-primary-100;
          }
        }
      }
    }
    h1 {
      font-weight: 600;
      font-size: 56px;
      @media (max-width: 666px) {
        font-size: 24px;
      }
      line-height: 90px;
      margin: 32px 0 21px 0;
    }
    p {
      font-size: 13px;
      line-height: 20px;
      a {
        cursor: pointer;
        font-size: 14px;
        line-height: 21px;
      }
    }
  }

  .actions {
    text-align: center;
    width: 100%;
    ul {
      margin: 40px auto;
      padding: 0 30px 0 20px;
      display: inline-flex;
      @media (max-width: 666px) {
        flex-direction: column;
        align-items: center;
      }
      gap: 32px;
      list-style: none;
      li {
        text-align: left;
        @media (min-width: 666px) {
          max-width: 350px;
        }
        border-radius: 20px;
        padding: 30px 36px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        color: $color-primary-90-light;
        opacity: 0;
        @include transform(translateY(40px));
        @include animation(
          fade-in 0.6s forwards cubic-bezier(0.25, 0.75, 0.5, 1.25)
        );

        &:nth-child(1) {
          background-color: $color-brand-5-100;
          @include animation-delay(0.2s);
        }
        &:nth-child(2) {
          background-color: $color-brand-2-100;
          @include animation-delay(0.3s);
        }
        &:nth-child(3) {
          background-color: $color-brand-3-100-light;
          @include animation-delay(0.4s);
        }
        h3 {
          font-weight: 600;
          font-size: 18px;
          line-height: 27px;
        }
        p {
          font-weight: 500;
          font-size: 14px;
          line-height: 21px;
        }
        > span {
          background-color: $color-base-white-100-dark;
          border-radius: 100px;
          width: 50px;
          height: 50px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
    }
  }
}

@include keyframes(fade-in) {
  0% {
    opacity: 0;
    @include transform(translateY(40px));
  }
  100% {
    opacity: 1;
    @include transform(translateY(0));
  }
}
</style>
