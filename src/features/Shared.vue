<script setup>
import {
  BASE_WEBSITE_URL,
  DISCORD_URL,
  HELP_CENTER_BASE_URL,
  JOBS_URL,
  MEDIUM_URL,
  TWITTER_URL,
  WEBSITE_TERMS_OF_SERVICE_URL,
  WEBSITE_PRIVACY_POLICY_URL,
  WEBSITE_SHARING_UTMS_URL,
  WEBSITE_BLOG_URL,
} from "@/scripts/constants";
import PreferencesInput from "@/routes/modals/preferences/PreferencesInput.vue";
import Button from "@/features/Button.vue";
import CloakInfoRow from "@/features/cloakDetails/CloakInfoRow.vue";
import CloakedLogoDark from "@/assets/images/cloaked-logo-dark.svg";
import People from "@/assets/icons/people.svg";
import Timer from "@/features/Timer.vue";
import ErrorTriangleFilled from "@/assets/icons/error-triangle-filled.svg";
import Spinner from "@/assets/icons/spinner.svg";
import UiTooltip from "@/features/ui/ui-tooltip";
import { computed, onBeforeMount, onMounted, onBeforeUnmount, ref } from "vue";
import { getCopyValue as getCustomFieldInitialValud } from "@/features/cloakDetails/CustomFields/utils";
import {
  autofillTypesToParms,
  broadcastConstants,
  customFieldTypes,
} from "@/features/cloakDetails/IdentitySharing/utils";
import { phone_format } from "@/scripts/format";
import { encode } from "@/scripts/hash";
import TOTPToken from "@/features/cloakDetails/TOTP/TOTPToken.vue";
import { initiateEncryption } from "@/scripts/actions/encryption";
import IdentityService from "@/api/actions/identity-service";
import Toast from "@/features/global/Toast.vue";
import { useToast } from "@/composables/useToast.js";
import store from "@/store";
import router from "@/routes/router";
import BaseText from "@/library/BaseText.vue";
import { useColorScheme } from "@/composables/useColorScheme";

const { setColorScheme } = useColorScheme();

const password = ref("");
const json = ref({});
const hash = computed(() => window.location.hash.substring(1));
const loading = ref(false);
const authenticated = ref(false);
const toast = useToast();
const jsonUrl = computed(() => {
  return `${import.meta.env.VITE_SHARE_URL}${
    hash.value
  }.json?r=${Math.random()}`;
});

/* Saving shared identities is a v2-only feature */
const isV2User = computed(() => {
  return store?.state?.authentication?.user?.encryption_status === 3;
});

const getCopyValue = (field) => {
  if (field.t.includes("totp")) {
    return totpToken.value;
  }
  if (field.t.includes("phone")) {
    return field.v;
  }
  return "";
};

const getInitialValue = (field) => {
  if (field.t.includes("phone")) {
    return phone_format(field.v);
  }
  return getCustomFieldInitialValud(field.t, field.v);
};

async function getJson() {
  loading.value = true;
  const jsonValue = await fetch(jsonUrl.value)
    .then((response) => response.json())
    .catch((error) => console.error(error));

  json.value = jsonValue;
  loading.value = false;
}

const INITIATE = "initiate";
const SAVE = "save";
const CLOSE = "close";

const broadcastChannelAction = (action) => {
  const bc = new BroadcastChannel("share_channel");
  switch (action) {
    case INITIATE:
      bc.postMessage(broadcastConstants.USER_SHARED_IDENTITY);
      bc.onmessage = async (e) => {
        if (e.data === broadcastConstants.USER_LOGGED_IN) {
          authenticated.value = true;
          await initiateEncryption();
        }
        if (e.data === broadcastConstants.USER_LOGGED_OUT) {
          authenticated.value = false;
        }
      };
      break;
    case SAVE:
      bc.postMessage(broadcastConstants.USER_SAVED_IDENTITY);
      break;
    case CLOSE:
      bc.close();
      break;
    default:
      break;
  }
};

const createSharedCloak = async (payload) => {
  const params = {};
  const autofillParams = {};

  try {
    const nickname = payload.find((item) => item.t === "std_name")?.v;
    const website_url = payload.find((item) => item.t === "std_website")?.v;
    const autofillFields = payload.filter((item) =>
      Object.keys(autofillTypesToParms).includes(item.t)
    );

    const customFields = payload.filter((item) =>
      customFieldTypes.includes(item.t)
    );

    if (nickname) {
      params.nickname = nickname;
    }

    if (website_url) {
      params.website_url = website_url;
      params.category = "website";
    } else {
      params.category = "personal";
    }

    if (autofillFields.length > 0) {
      autofillFields.forEach(async (field) => {
        const fieldName = autofillTypesToParms[field.t];
        autofillParams[fieldName] = field.v;
      });

      params.autofill = autofillParams;
    }

    if (customFields.length > 0) {
      const customFieldParams = {};
      customFields.forEach((field) => {
        customFieldParams[field.i] = JSON.stringify({
          t: field.t,
          l: field.l,
          v: field.v,
          s: field.s,
        });
      });
      autofillParams.custom_field = customFieldParams;
    }

    if (Object.keys(autofillParams).length > 0) {
      params.autofill = autofillParams;
    }

    const newIdentityResponse = await IdentityService.createIdentity(
      params,
      true
    );
    toast.success("Identity saved");
    router.push({
      name: "All",
      query: { id: encode(newIdentityResponse?.data?.id) },
    });
  } catch (e) {
    const errorMessage =
      e?.response?.data?.errors || "Something went wrong, try again later";
    toast.error(errorMessage);
  }
};

const handleSaveBtnClick = () => {
  broadcastChannelAction(SAVE);
  createSharedCloak(identity.value);
};

onBeforeMount(async () => {
  await getJson();
  if (store.getters["authentication/isAuthenticated"]) {
    authenticated.value = true;
    await initiateEncryption();
  }
});

onMounted(() => {
  broadcastChannelAction(INITIATE);
  /* Hack to fake dark mode, otherwise if authenticated user is using light mode the buttons will be hard to see */
  window.document.addEventListener("DOMContentLoaded", () => {
    setColorScheme("light");
  });
});

onBeforeUnmount(() => {
  broadcastChannelAction(CLOSE);
  setColorScheme("light");
});

const startDate = computed(() => {
  return json?.value?.shared_at;
});

const endDate = computed(() => {
  return json?.value?.expires_at;
});

const isSharedIdentityAvailable = computed(() => {
  return json?.value?.data && Date.now() < new Date(endDate.value);
});

const identity = ref([]);

const shouldShowIdentityForm = computed(() => {
  return identity.value.length === 0 && isSharedIdentityAvailable.value;
});

const isOneTimeView = computed(() => {
  return json?.value?.onetimeview;
});

const isPasswordIncorrect = ref(false);

const totpToken = ref("");

const decryptJSON = async () => {
  try {
    const cloakedEncryption = await window.CloakedEncryption.build();
    const passwordSecretBoxKey =
      await cloakedEncryption.generatePasswordSecretBoxKey(
        password.value,
        json?.value?.salt
      );
    const privateKey = await cloakedEncryption.decryptPrivateKey(
      passwordSecretBoxKey,
      json?.value?.private_key
    );

    const decryptedData = await cloakedEncryption.decryptWithPrivateKeyPair(
      json?.value?.data,
      json?.value?.public_key,
      privateKey
    );
    identity.value = JSON.parse(decryptedData);
    isPasswordIncorrect.value = false;
  } catch {
    isPasswordIncorrect.value = true;
  }
};

const getFieldType = (fieldType) => {
  return fieldType.includes("std_") ? fieldType.substring(4) : fieldType;
};

const openLoginPage = () => {
  const url = (import.meta.env.VITE_REDIRECT_URI +=
    import.meta.env.VITE_REDIRECT_URI.endsWith("/") ? "" : "/");
  window.open(`${url}auth/login/`, "_blank");
};

const openTrialPage = () => {
  window.open(WEBSITE_SHARING_UTMS_URL, "_blank");
};

const openHomePage = () => {
  window.open(BASE_WEBSITE_URL, "_blank");
};
</script>

<template>
  <div class="shared">
    <Toast />
    <div class="shared__background-blur" />
    <div class="shared__header">
      <CloakedLogoDark
        class="shared__header__cloaked-logo"
        @click="openHomePage"
      />
      <div class="shared__header__right">
        <div class="shared__header__right__action-btns">
          <UiTooltip
            v-if="authenticated"
            :title="
              isV2User
                ? ''
                : 'Migrate your account to encryption v2 to save this identity to your account'
            "
            align-x="center"
          >
            <Button
              type="secondary"
              :disabled="
                !isSharedIdentityAvailable || !isV2User || !identity.length > 0
              "
              @click="handleSaveBtnClick"
            >
              Save identity
              <People />
            </Button>
          </UiTooltip>
          <span
            v-else
            class="shared__header__actions"
          >
            <Button
              type="secondary"
              @click="openLoginPage"
            >
              Login
            </Button>
            <Button @click="openTrialPage">Join Cloaked</Button>
          </span>
        </div>
        <Timer
          v-show="isSharedIdentityAvailable"
          :start-date="startDate"
          :end-date="endDate"
          class="shared__header__timer-container"
          :is-on-shared-page="true"
          :is-one-time-view="isOneTimeView"
        />
      </div>
    </div>

    <div
      v-if="loading"
      class="shared__loading-container"
    >
      <Spinner />
    </div>

    <div v-else>
      <div
        v-if="shouldShowIdentityForm"
        class="shared__identity-container"
      >
        <div class="shared__identity-container__description">
          <BaseText
            variant="headline-3-bold"
            class="shared__identity-container__description__text"
          >
            Someone shared an identity with you
          </BaseText>
          <BaseText
            variant="body-2-semibold"
            class="shared__identity-container__description__text shared__identity-container__description__subtext"
          >
            This page is password protected.
          </BaseText>
        </div>
        <PreferencesInput
          :value="password"
          label="Password"
          type="password"
          placeholder=""
          @input="(event) => (password = event)"
        />

        <div
          v-if="isPasswordIncorrect"
          class="shared__identity-container__error-container"
        >
          <ErrorTriangleFilled />
          <BaseText
            variant="body-small-medium"
            class="shared__identity-container__error-container__text"
          >
            Incorrect password
          </BaseText>
        </div>

        <Button
          class="shared__identity-container__button"
          :primary="true"
          @click="decryptJSON"
        >
          View identity
        </Button>
      </div>
      <div
        v-else-if="identity.length > 0"
        class="shared__identity-container shared__with-identity"
      >
        <BaseText
          variant="headline-4-bold"
          class="shared__identity-container__identity-details"
        >
          Identity details
        </BaseText>
        <div class="shared__identity-container__identity-fields">
          <div
            v-for="identityProperty in identity"
            :key="identityProperty.i"
          >
            <CloakInfoRow
              :field-label="identityProperty.l"
              :field="getFieldType(identityProperty.t)"
              :initial-value="getInitialValue(identityProperty)"
              :is-on-shared-page="true"
              :is-sensitive="identityProperty.s"
              :copy-value="getCopyValue(identityProperty)"
            >
              <template
                v-if="identityProperty.t.includes('totp') && identityProperty.v"
                #input
              >
                <TOTPToken
                  :url="
                    identityProperty.v?.startsWith('otpauth://')
                      ? identityProperty.v
                      : undefined
                  "
                  :secret="
                    identityProperty.v?.startsWith('otpauth://')
                      ? undefined
                      : identityProperty.v
                  "
                  @new-token="totpToken = $event"
                />
              </template>
            </CloakInfoRow>
          </div>
          <div class="shared__identity-container__info">
            <BaseText
              variant="body-small-medium"
              as="p"
            >
              Shared identities do not share inboxes. Only the sender will have
              access to the messages for Cloaked email addresses and Cloaked
              phone numbers.
            </BaseText>
          </div>
        </div>
      </div>

      <div
        v-else
        class="shared__no-identity-container"
      >
        <div class="shared__no-identity-container__description">
          <BaseText
            variant="headline-3-bold"
            class="shared__no-identity-container__description__text"
          >
            The share link is no longer valid.
          </BaseText>
          <BaseText
            variant="body-2-semibold"
            class="shared__no-identity-container__description__text shared__no-identity-container__description__subtext"
          >
            If you still need access, please reach out to the sender.
          </BaseText>
        </div>
      </div>
    </div>
    <div class="shared__footer">
      <div class="shared__footer__links">
        <BaseText
          as="a"
          variant="body-2-semibold"
          class="shared__footer__links__link"
          :href="WEBSITE_BLOG_URL"
          target="_blank"
        >
          Blog
        </BaseText>
        <BaseText
          as="a"
          variant="body-2-semibold"
          class="shared__footer__links__link"
          :href="TWITTER_URL"
          target="_blank"
        >
          Twitter
        </BaseText>
        <BaseText
          as="a"
          variant="body-2-semibold"
          class="shared__footer__links__link"
          :href="DISCORD_URL"
          target="_blank"
        >
          Discord
        </BaseText>
        <BaseText
          as="a"
          variant="body-2-semibold"
          class="shared__footer__links__link"
          :href="MEDIUM_URL"
          target="_blank"
        >
          Medium
        </BaseText>
        <BaseText
          as="a"
          variant="body-2-semibold"
          class="shared__footer__links__link"
          :href="JOBS_URL"
          target="_blank"
        >
          Join our Team
        </BaseText>
        <BaseText
          as="a"
          variant="body-2-semibold"
          class="shared__footer__links__link"
          :href="HELP_CENTER_BASE_URL"
          target="_blank"
        >
          Help
        </BaseText>
      </div>

      <div class="shared__footer__divider" />
      <div class="shared__footer__legal">
        <CloakedLogoDark
          class="shared__footer__legal__cloaked-logo"
          @click="openHomePage"
        />
        <div class="shared__footer__legal__links">
          <BaseText
            as="a"
            variant="body-2-semibold"
            class="shared__footer__legal__links__link"
            :href="WEBSITE_PRIVACY_POLICY_URL"
            target="_blank"
          >
            Privacy Policy
          </BaseText>
          <BaseText
            as="a"
            variant="body-2-semibold"
            class="shared__footer__legal__links__link"
            :href="WEBSITE_TERMS_OF_SERVICE_URL"
            target="_blank"
          >
            Terms of Service
          </BaseText>
        </div>
      </div>
    </div>

    <div class="shared__mobile-footer">
      <div class="shared__mobile-footer__links">
        <BaseText
          as="a"
          variant="body-2-semibold"
          class="shared__mobile-footer__links__link"
          :href="WEBSITE_BLOG_URL"
          target="_blank"
        >
          Blog
        </BaseText>
        <BaseText
          as="a"
          variant="body-2-semibold"
          class="shared__mobile-footer__links__link"
          :href="TWITTER_URL"
          target="_blank"
        >
          Twitter
        </BaseText>
        <BaseText
          as="a"
          variant="body-2-semibold"
          class="shared__mobile-footer__links__link"
          :href="DISCORD_URL"
          target="_blank"
        >
          Discord
        </BaseText>
        <BaseText
          as="a"
          variant="body-2-semibold"
          class="shared__mobile-footer__links__link"
          :href="MEDIUM_URL"
          target="_blank"
        >
          Medium
        </BaseText>
        <BaseText
          as="a"
          variant="body-2-semibold"
          class="shared__mobile-footer__links__link"
          :href="JOBS_URL"
          target="_blank"
        >
          Join our Team
        </BaseText>
      </div>

      <div class="shared__mobile-footer__links">
        <BaseText
          as="a"
          variant="body-2-semibold"
          class="shared__mobile-footer__links__link"
          :href="HELP_CENTER_BASE_URL"
          target="_blank"
        >
          Help
        </BaseText>
        <BaseText
          as="a"
          variant="body-2-semibold"
          class="shared__mobile-footer__links__link"
          :href="WEBSITE_PRIVACY_POLICY_URL"
          target="_blank"
        >
          Privacy Policy
        </BaseText>
        <BaseText
          as="a"
          variant="body-2-semibold"
          class="shared__mobile-footer__links__link"
          :href="WEBSITE_TERMS_OF_SERVICE_URL"
          target="_blank"
        >
          Terms of Service
        </BaseText>
      </div>
    </div>
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.shared {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  position: relative;
  width: 100%;
  align-items: center;
  background: $color-primary-100-light;
  z-index: 1;
  height: 100dvh;

  .toast-wrapper {
    .toast-item {
      background-color: $color-primary-100-light;
      color: $color-primary-1-light;
      border: 1px solid $color-primary-1-light;
    }
  }

  &__loading-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: $color-primary-1-light;

    svg {
      width: 40px;
      height: 40px;
    }
  }

  &__background-blur {
    position: absolute;
    z-index: -1;
    width: 40vw;
    height: 488px;
    border-radius: 488px;
    opacity: 0.4;
    background: $color-background-light;
    filter: blur(252px);
  }

  &__no-identity-container {
    width: 580px;
    height: 108px;
    border-radius: 16px;
    padding: 24px 32px;
    background: $color-background-light;
    box-shadow: 0 27px 40px -22px rgb(0 0 0 / 6%);
    margin: 16px 0;

    &__description {
      gap: 12px;
      display: flex;
      flex-direction: column;

      &__text {
        color: $color-primary-100-light;
      }

      &__subtext {
        color: $color-primary-100-light;
      }
    }

    @media (width <= 768px) {
      width: 335px;
      height: auto;
      padding: 32px 24px;
    }
  }

  &__identity-container {
    width: 580px;
    display: flex;
    padding: 64px;
    flex-direction: column;
    gap: 24px;
    border-radius: 16px;
    background: $color-background-light;
    box-shadow: 0 27px 40px -22px rgb(0 0 0 / 6%);
    margin: 16px 0 34px;

    .preferences-input {
      input {
        background: $color-primary-5-light;
        color: $color-primary-100-light;
        border: none;
      }

      svg path {
        fill: $color-primary-100-light;
      }

      label {
        color: $color-primary-100-light;
      }
    }

    &__description {
      display: flex;
      flex-direction: column;
      gap: 12px;

      &__text {
        color: $color-primary-100-light;
      }

      &__subtext {
        color: $color-primary-100-light;
      }
    }

    &__error-container {
      display: flex;
      flex-direction: row;
      gap: 8px;
      align-items: center;
      margin-top: -20px;

      &__text {
        color: $color-alert;
      }
    }

    &__button {
      justify-content: center;
      background-color: $color-primary-100-light !important;
      color: $color-background-light !important;

      &:hover {
        background-color: $color-primary-90-light !important;
      }
    }

    &__identity-details {
      color: $color-primary-100-light;
    }

    &__identity-fields {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .cloak-info-row-button & {
        &:hover {
          svg {
            color: $color-primary-1-light;
          }
        }

        svg {
          color: $color-primary-100-light;
        }
      }

      .cloak-details-input-row & {
        .cloak-details-input-row__label {
          color: $color-primary-100-light;
          -webkit-text-fill-color: $color-primary-100-light;
          -webkit-opacity: 1;
          word-break: break-word;

          @include line-clamp(2);
        }

        .cloak-details-input-row__input-wrapper
          > .cloak-details-input-row__icon
          > svg {
          width: 16px;
          height: 16px;
        }

        .cloak-details-input-row__input {
          .totp-token__token {
            // font-size: 12px;
            // line-height: 18px;
            color: $color-primary-100-light;
            // font-weight: 500;
          }

          input,
          textarea {
            color: $color-primary-100-light;
            -webkit-text-fill-color: $color-primary-100-light;
            -webkit-opacity: 1;
            // font-style: normal;
            // font-weight: 500;
            // line-height: normal;
          }
        }

        .cloak-details-input-row__icon {
          color: $color-primary-100-light;

          svg {
            color: $color-primary-100-light;
          }
        }
      }
    }

    &__info {
      border-radius: 8px;
      border: 1px solid $color-primary-20-light;
      background: $color-primary-5-light;
      padding: 16px;
    }

    @media (width <= 768px) {
      width: 335px;
      height: auto;
      padding: 32px 24px;
    }
  }

  &__with-identity {
    padding: 24px 32px;
  }

  &__cloaked-trial-container {
    display: flex;
    flex-direction: row;
    width: 580px;
    height: 126px;
    border-radius: 16px;
    background: $color-brand-5-100-light;
    box-shadow: 0 27px 40px -22px rgb(0 0 0 / 6%);
    padding: 24px 32px;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 48px;

    @media (width <= 768px) {
      flex-direction: column;
      height: 200px;
      width: 335px;
      justify-content: space-evenly;
      text-align: center;
    }

    &__button {
      align-self: center;
      background-color: $color-background-light !important;
      color: $color-primary-100-light !important;
      border-color: $color-background-light !important;

      &:hover {
        background-color: $color-primary-10-light !important;
      }
    }
  }

  &__header {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 20px;

    &__cloaked-logo {
      align-self: center;
      width: 130px;
      height: 40px;
      cursor: pointer;

      @media (width <= 768px) {
        margin-left: 32px;
      }
    }

    &__right {
      display: flex;
      align-items: center;

      & > * {
        margin: 0 10px;
      }

      &__action-btns {
        @media (hover: none) {
          display: none;
        }

        @media (width <= 530px) {
          display: none;
        }
      }
    }

    &__actions {
      & > * {
        margin: 0 8px;
      }
    }

    @media (width <= 768px) {
      width: 100%;

      &__timer-container {
        margin-right: 32px;
      }
    }
  }

  &__mobile-footer {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 32px;
    margin-bottom: 80px;
    gap: 40px;

    @media (width >= 768px) {
      display: none;
    }

    &__links {
      display: flex;
      flex-direction: column;
      gap: 12px;

      &__link {
        color: $color-background-light;
        font-size: 14px;
        font-style: normal;
        font-weight: 500;
        line-height: 18px;
      }
    }
  }

  &__footer {
    display: flex;
    flex-direction: column;
    color: white;
    width: 100%;
    margin-top: auto;
    margin-bottom: 80px;
    gap: 40px;
    padding: 0 64px;

    @media (width <= 768px) {
      display: none;
    }

    a {
      color: $color-background-light;
    }

    &__links {
      display: flex;
      flex-direction: row;
      justify-content: space-between;

      &__link {
        color: $color-background-light;
      }
    }

    &__divider {
      height: 1px;
      opacity: 0.2;
      background: $color-primary-1-light;
    }

    &__legal {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;

      &__links {
        display: flex;
        flex-direction: row;
        gap: 16px;

        &__link {
          color: $color-background-light;
        }
      }

      &__cloaked-logo {
        width: 120px;
        height: 26px;
        margin-left: -5px;
        cursor: pointer;
      }
    }
  }
}
</style>
