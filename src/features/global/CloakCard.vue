<script setup>
import { ref, computed } from "vue";

import store from "@/store";
import InlineSvg from "@/features/InlineSvg.vue";
import IdentityIcon from "@/features/ui/IdentityIcon.vue";
import { getIdentityNickname, urlDisplay } from "@/scripts/format";
import { phone_format } from "@/scripts/format";
import TOTPToken from "@/features/cloakDetails/TOTP/TOTPToken.vue";
import AppTooltip from "@/features/ui/AppTooltip.vue";
import IdentityService from "@/api/actions/identity-service";
import { tools } from "@/scripts/tools";
import BaseText from "@/library/BaseText.vue";

const props = defineProps({
  identity: { type: Object, default: null },
  idIndex: { type: Number, default: null },
  selected: Boolean,
  isMultiselect: Boolean,
  count: { type: Number, default: null },
  noSelect: Boolean,
  withRightClick: Boolean,
  identifierPriority: { type: String, default: null },
  ignoreDisplay: { type: String, default: null },
});

const emit = defineEmits(["select", "click"]);

const featureFlag = computed(
  () => store.state.authentication?.user?.flags.hibp_dashboard_v1
);

const muted = computed(() => props.identity.muted);
const phone = computed(() => props.identity.phone);
const email = computed(() => props.identity.email);
const username = computed(() => props.identity.username);
const totp = computed(() =>
  props.identity?.customFields?.length > 0
    ? props.identity.customFields.find((field) =>
        ["totp_url", "totp_secret"].includes(field.type)
      )
    : []
);
const showTotp = computed(() => {
  return store.getters.isV2User && totp?.value?.value;
});
const rightPanelCloak = computed(() => store.getters.getCloak);
const nickname = computed(() => getIdentityNickname(props.identity));
const password = computed(
  () => props.identity.password || "NOTE: need to fetch password async"
);
const website = computed(() =>
  urlDisplay((props.identity && props.identity.website_url) || "")
);

function getIdentityDetails() {
  return {
    email: email.value,
    phone: phone.value,
    username: username.value,
    password: password.value,
  };
}

const identifier = computed(() => {
  const { email, phone, username } = getIdentityDetails();
  if (props.identifierPriority) {
    switch (props.identifierPriority) {
      case "has_email":
        {
          if (email) {
            return email;
          }
        }
        break;
      case "has_phone":
        {
          if (phone) {
            return phone_format(phone);
          }
        }
        break;
      case "has_login": {
        if (username) {
          return username;
        }
      }
    }
  }

  if (email) {
    return email;
  } else if (phone) {
    return phone_format(phone);
  } else if (username) {
    return username;
  }
  return null;
});

function toggleSelect($event) {
  $event.stopPropagation();
  emit("select");
}

const totpToken = ref(null);
const copyTotpTooltip = ref(totpToken.value ? "Copy one-time passcode" : "");
const copyTotp = () => {
  /* Will only copy if token is valid, generated in component */
  if (totpToken.value) {
    tools.copyToClipboard(totpToken.value);
    copyTotpTooltip.value = "Copied";
    IdentityService.patchIdentityUpdatedAt(props.identity.id);
  }
};

const resetTotpTooltip = () => {
  setTimeout(() => {
    if (totpToken.value) {
      copyTotpTooltip.value = "Copy one-time passcode";
      return;
    }
    copyTotpTooltip.value = "";
  }, 300);
};
</script>

<template>
  <div>
    <div
      class="card"
      :class="{
        active: selected,
        muted,
        visibleRightPanel:
          identity.temp ||
          identity.id === (rightPanelCloak && rightPanelCloak.id),
      }"
      role="button"
      :aria-label="`Cloak card for ${identity.nickname || identity.app_ref}`"
      tabindex="0"
      @click="$emit('click')"
    >
      <div />
      <BaseText
        v-if="featureFlag && email === 'email@email.com'"
        variant="body-small-medium"
        class="breached"
      >
        Breached!
      </BaseText>
      <button
        v-else-if="!noSelect"
        class="select"
        @click="toggleSelect"
      >
        <svg
          width="11"
          height="8"
          viewBox="0 0 11 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3.5837 6.43252L1.55953 4.40835C1.33203 4.18085 0.964531 4.18085 0.737031 4.40835C0.509531 4.63585 0.509531 5.00335 0.737031 5.23085L3.17536 7.66919C3.40286 7.89669 3.77036 7.89669 3.99786 7.66919L10.1695 1.49752C10.397 1.27002 10.397 0.90252 10.1695 0.67502C9.94203 0.44752 9.57453 0.44752 9.34703 0.67502L3.5837 6.43252Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <div class="content">
        <IdentityIcon
          :identity="identity"
          :override="{ width: '88px', height: '88px', 'align-self': 'center' }"
        />

        <div
          v-if="nickname"
          class="text"
        >
          <div>
            <BaseText
              as="h1"
              variant="body-2-semibold"
              :anchor="`id_anchor_${idIndex}`"
              :class="{ muted }"
            >
              {{ nickname }}
            </BaseText>
            <InlineSvg
              v-if="muted"
              name="muted-bell"
            />
          </div>
          <BaseText
            v-if="identity.app_ref !== 'cloaked' && !showTotp"
            as="div"
            variant="body-small-medium"
            :class="{ muted }"
          >
            {{ website }}
          </BaseText>
          <BaseText
            v-if="identifier"
            as="div"
            variant="body-small-medium"
            :class="{ muted }"
          >
            {{ identifier }}
          </BaseText>
          <AppTooltip
            v-if="!!copyTotpTooltip"
            :offset-away="15"
          >
            <TOTPToken
              v-if="showTotp"
              :url="
                totp?.value.startsWith('otpauth://') ? totp?.value : undefined
              "
              :secret="
                totp?.value.startsWith('otpauth://') ? undefined : totp?.value
              "
              is-hidden
              class="card__totp"
              @click.stop="copyTotp"
              @new-token="totpToken = $event"
              @mouseleave="resetTotpTooltip"
            />
            <template #content>
              {{ copyTotpTooltip }}
            </template>
          </AppTooltip>
          <TOTPToken
            v-else-if="showTotp && !copyTotpTooltip"
            :url="
              totp?.value.startsWith('otpauth://') ? totp?.value : undefined
            "
            :secret="
              totp?.value.startsWith('otpauth://') ? undefined : totp?.value
            "
            is-hidden
            class="card__totp"
            @click.stop="copyTotp"
            @new-token="totpToken = $event"
            @mouseleave="resetTotpTooltip"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.breached {
  position: absolute;
  top: 15px;
  right: 15px;
  color: $color-alert;
  background-color: transparent;
  text-transform: uppercase;
}

.card {
  width: 100%;
  height: 248px;
  background: $color-primary-5;
  border: 1px solid $color-primary-5;

  @include transition(all 0.2s ease);

  position: relative;
  border-radius: 28px;
  padding: 16px 20px 20px;
  margin: 4px;
  cursor: pointer;

  &:hover {
    background: $color-primary-10;

    .select {
      cursor: pointer;
      display: block;
    }
  }

  &:active {
    transform: scale(1) translate3d(0, 0, 0);
    transition: all 0.1s cubic-bezier(0.17, 0.67, 0.83, 0.67);
  }

  > div:first-child {
    height: 18px;
  }

  &.muted {
    .icon {
      opacity: 0.5;
    }
  }

  @media (width >= 568px) {
    margin-bottom: 0;
  }

  .hint-wrapper {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    width: 100%;

    > div {
      position: relative;
      width: 1px;
      right: 0;
    }
  }

  .select {
    display: none;
    position: absolute;
    top: 15px;
    left: 15px;
    height: 20px;
    width: 20px;
    border-radius: 32px;
    border: 1px solid $color-primary-100;
    background-color: transparent;
    transition: all 0.1s cubic-bezier(0.17, 0.67, 0.83, 0.67);
    cursor: pointer;

    svg {
      position: absolute;
      visibility: hidden;
      height: 10px;
      width: 14px;
      margin-left: -1px;
      color: $color-primary-1;
    }
  }

  &.active {
    border-color: $color-primary-100;
    background-color: $color-base-white-100;

    .select {
      display: flex;
      background-color: $color-primary-100;
      justify-content: center;
      align-items: center;
      transition: all 0.1s cubic-bezier(0.17, 0.67, 0.83, 0.67);

      svg {
        visibility: visible;
      }
    }
  }

  &:hover,
  &.active {
    @include transition(background-color 0.5s ease);

    transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
  }

  .content {
    width: 100%;
    height: 182px;
    display: flex;
    flex-direction: column;
    place-content: center flex-start;
    margin-top: 8px;
    padding-top: 10.5px;
  }

  .notification {
    background: rgb(247 93 54 / 90%);
    border-radius: 4px;
    padding: 1px 4px;
    color: $color-primary-1;
    font-size: 11px;
    line-height: 16px;
    display: inline-block;
    position: absolute;
    right: -10px;
    top: -6px;
    min-width: 24px;
    text-align: center;
  }

  .icon {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    align-self: center;
    margin-bottom: 12px;
    position: relative;
    background-color: $color-primary-1;

    > img {
      border-radius: 50%;
    }

    &.contain {
      background-size: auto 42px;
    }

    .emoji {
      font-size: 25px;
      line-height: 2;
    }
  }

  .opacity50 {
    opacity: 0.5;
  }

  h1 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
    font-size: 14px;
    text-align: center;
    color: $color-primary-100;
    margin-bottom: auto;

    @include transition(all 0.2 ease);

    &.muted {
      color: $color-primary-50;
      max-width: calc(100% - 16px);
    }
  }

  .text {
    margin-top: 10px;
    width: 100%;
    color: $color-primary-100;

    > div:first-child {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;

      > svg {
        margin-left: 5px;
      }

      &.muted {
        color: $color-primary-50;
      }
    }

    > div:not(:first-child) {
      position: relative;
      // font-family: $global-font;
      // font-weight: 400;
      // font-size: 12px;
      text-align: center;
      color: $color-primary-50;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;

      @include transition(all 0.2 ease);

      &.muted {
        color: $color-primary-30;
      }
    }

    > div:last-child {
      margin-top: 2px;
    }
  }

  .information {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 0;
    background-blend-mode: soft-light, normal;
    opacity: 0;
    transition:
      opacity 0.2s ease,
      height 0s ease 1500ms;
    border-radius: 20px;
    padding: 21px 12px;
  }

  &__totp {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 21px;
  }
}

.visibleRightPanel {
  background-color: $color-base-white-100;
  border-radius: 32px;
  border: 1px solid $color-primary-100;
}
</style>
