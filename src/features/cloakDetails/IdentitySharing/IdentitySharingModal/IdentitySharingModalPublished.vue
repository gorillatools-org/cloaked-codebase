<script setup>
import AppModal from "@/features/ui/AppModal.vue";
import AppModalContent from "@/features/ui/AppModalContent.vue";
import AppModalTitle from "@/features/ui/AppModalTitle.vue";
import Button from "@/features/Button.vue";
import AppModalFooter from "@/features/ui/AppModalFooter.vue";
import { ref, watch, onBeforeMount, onBeforeUnmount, computed } from "vue";
import IdentitySharingTerms from "@/features/cloakDetails/IdentitySharing/IdentitySharingModal/IdentitySharingTerms.vue";
import BorderInputText from "@/features/BorderInputText.vue";
import BorderInputSelect from "@/features/BorderInputSelect.vue";
import AppModalCustomWrapper from "@/features/ui/AppModalCustomWrapper.vue";
import IdentityIcon from "@/features/ui/IdentityIcon.vue";
import Timer from "@/features/Timer.vue";
import IconCopy from "@/assets/icons/copy.svg";
import IconReload from "@/assets/icons/reload.svg";
import IconSpinner from "@/assets/icons/spinner.svg";
import CheckMark from "@/assets/icons/check-mark.svg";
import Spinner from "@/assets/icons/spinner.svg";
import { useToast } from "@/composables/useToast.js";
import inlineSvg from "@/features/InlineSvg.vue";
import { tools } from "@/scripts/tools";
const toast = useToast();

const props = defineProps({
  identity: {
    type: Object,
    default: () => ({}),
  },
  sharing: {
    type: Object,
    default: () => ({}),
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  isGeneratingLink: {
    type: Boolean,
    default: false,
  },
  isGeneratingPassword: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "update-sharing",
  "expired",
  "generate-new-link",
  "generate-new-password",
  "open-create",
  "open-delete",
  "input",
  "update",
  "discard-changes",
]);
const expiresIn = ref(null);

const sharedUrl = computed(() => {
  const originalUrl =
    props.sharing?.shared_url || props.identity.sharing?.shared_url;

  if (!originalUrl) return "";

  const replaceYour = originalUrl.replace("your", "my");
  const replaceApp = replaceYour.replace("app", "com");
  return replaceApp;
});

const previousExpiresIn = computed(() => {
  if (props.sharing?.onetimeview || props.identity?.sharing?.onetimeview) {
    return "One-time view";
  }

  const sharedDate = new Date(
    props.sharing.shared_at || props.identity.sharing?.shared_at
  );
  const expiresDate = new Date(
    props.sharing.expires_at || props.identity.sharing?.expires_at
  );

  const dateDifferenceInHours =
    (expiresDate.getTime() - sharedDate.getTime()) / (1000 * 60 * 60);

  if (dateDifferenceInHours > 7 * 24) {
    return "30 days";
  }

  if (dateDifferenceInHours > 24) {
    return "7 days";
  }

  if (dateDifferenceInHours > 1) {
    return "24 hours";
  }

  return "1 hour";
});

let intervalCheckExpired = null;

onBeforeMount(() => {
  checkExpiration();
  intervalCheckExpired = setInterval(checkExpiration, 5000);
});

onBeforeUnmount(() => {
  clearInterval(intervalCheckExpired);
});

watch(
  () => props.isLoading,
  (newValue, oldValue) => {
    if (!newValue && oldValue) {
      expiresIn.value = null;
    }
  },
  { deep: true }
);

function checkExpiration() {
  const dateExpired = new Date(props.sharing.expires_at);
  const dateNow = new Date();

  if (dateNow.getTime() >= dateExpired.getTime()) {
    emit("expired");
    clearInterval(intervalCheckExpired);
  }
}

const onExpiresInChanged = (value) => {
  expiresIn.value = value;

  const sharedDate = new Date();
  const expirationDate = new Date();

  if (value === "One-time view") {
    expirationDate.setDate(expirationDate.getDate() + 30);

    const updateData = {
      ...props.sharing,
      onetimeview: true,
      shared_at: sharedDate.toISOString(),
      expires_at: expirationDate.toISOString(),
    };

    emit("update-sharing", updateData);
  } else {
    switch (value) {
      case "1 hour":
        expirationDate.setHours(expirationDate.getHours() + 1);
        break;
      case "24 hours":
        expirationDate.setHours(expirationDate.getHours() + 24);
        break;
      case "7 days":
        expirationDate.setDate(expirationDate.getDate() + 7);
        break;
      case "30 days":
        expirationDate.setDate(expirationDate.getDate() + 30);
        break;
    }

    const updateData = {
      ...props.sharing,
      shared_at: sharedDate.toISOString(),
      expires_at: expirationDate.toISOString(),
      onetimeview: false,
    };

    emit("update-sharing", updateData);
  }

  toast?.success("Link expiration changed. Click publish changes.");
};

function copyAll() {
  const url = props.sharing?.shared_url || "";
  const password = props.sharing?.decryptedPassword || "";

  if (!url || !password) {
    toast?.error("Link or password not available yet");
    return;
  }

  const copyString = `${url}\nPassword: ${password}`;
  tools.copyToClipboard(copyString, false);
  toast?.success("Copied all");
}
</script>

<template>
  <AppModal
    :value="props.value"
    @input="emit('input', $event)"
  >
    <AppModalContent
      class="sharing-modal-published"
      :class="{ 'sharing-modal-published--loading': isLoading }"
    >
      <AppModalCustomWrapper class="sharing-modal-published__head">
        <IdentityIcon
          :identity="identity"
          :override="{ width: '72px', height: '72px' }"
          class="sharing-modal-published__identity-icon"
        />
        <AppModalTitle class="sharing-modal-published__title-top">
          Publishing your changes...
        </AppModalTitle>
        <Timer
          :start-date="props.sharing?.shared_at || identity.sharing?.shared_at"
          :end-date="props.sharing?.expires_at || identity.sharing?.expires_at"
          :is-one-time-view="
            props.sharing?.onetimeview || identity.sharing?.onetimeview
          "
          class="sharing-modal-published__timer"
        />
        <div class="sharing-modal-published__spinner">
          <Spinner />
        </div>
      </AppModalCustomWrapper>
      <div class="sharing-modal-published__content">
        <AppModalTitle class="sharing-modal-published__title">
          Your share link is published
        </AppModalTitle>
        <IdentitySharingTerms />
        <AppModalCustomWrapper>
          <BorderInputText
            label="Link"
            :value="sharedUrl"
            disabled
            class="sharing-modal-published__input"
            @click="
              tools.copyToClipboard(sharedUrl);
              toast?.success('Link copied.');
            "
          >
            <template #after>
              <button
                class="sharing-modal-published__icon-action"
                @click="$emit('open-delete')"
              >
                <inlineSvg name="trash-outline" />
              </button>
              <button
                :disabled="props.isGeneratingLink"
                class="sharing-modal-published__icon-action"
              >
                <IconCopy />
              </button>
              <button
                class="sharing-modal-published__icon-action"
                :disabled="expiresIn !== null"
                @click.stop="
                  !props.isGeneratingLink && $emit('generate-new-link')
                "
              >
                <IconSpinner v-if="props.isGeneratingLink" />
                <IconReload v-else />
              </button>
            </template>
          </BorderInputText>
          <div class="sharing-modal-published__input-row">
            <BorderInputText
              label="Link password"
              :value="
                props.sharing?.decryptedPassword ||
                identity.sharing?.decryptedPassword ||
                ''
              "
              disabled
              class="sharing-modal-published__input"
              @click="
                (props.sharing?.decryptedPassword ||
                  identity.sharing?.decryptedPassword) &&
                  tools.copyToClipboard(
                    props.sharing?.decryptedPassword ||
                      identity.sharing?.decryptedPassword
                  );
                (props.sharing?.decryptedPassword ||
                  identity.sharing?.decryptedPassword) &&
                  toast?.success('Link password copied.');
              "
            >
              <template #after>
                <button
                  :disabled="props.isGeneratingLink"
                  class="sharing-modal-published__icon-action"
                >
                  <IconCopy />
                </button>
                <button
                  class="sharing-modal-published__icon-action"
                  :disabled="expiresIn !== null"
                  @click.stop="
                    !props.isGeneratingPassword &&
                    $emit('generate-new-password')
                  "
                >
                  <IconSpinner v-if="props.isGeneratingPassword" />
                  <IconReload v-else />
                </button>
              </template>
            </BorderInputText>
            <BorderInputSelect
              class="sharing-modal-published__expiration"
              label="Link expires in..."
              :value="expiresIn ?? previousExpiresIn"
              :options="[
                'One-time view',
                '1 hour',
                '24 hours',
                '7 days',
                '30 days',
              ]"
              disabled
              @input="onExpiresInChanged"
            >
              <template #option="{ option }">
                <span
                  class="sharing-modal-published__expiration-option"
                  :class="{
                    'sharing-modal-published__expiration-option--selected':
                      option === expiresIn ||
                      (option === previousExpiresIn && !expiresIn),
                  }"
                >
                  {{ option }}
                  <CheckMark
                    v-if="
                      option === expiresIn ||
                      (option === previousExpiresIn && !expiresIn)
                    "
                  />
                </span>
              </template>
            </BorderInputSelect>
          </div>
        </AppModalCustomWrapper>
      </div>
      <AppModalFooter
        with-border
        class="sharing-modal-published__footer"
      >
        <button
          class="sharing-modal-published__change-permission"
          @click="$emit('open-create')"
        >
          Change permissions
        </button>
        <template v-if="expiresIn !== null">
          <Button
            type="danger-secondary"
            @click="
              $emit('discard-changes');
              expiresIn = null;
            "
          >
            Discard changes
          </Button>
          <Button @click="$emit('update')">Publish changes</Button>
        </template>
        <template v-else>
          <Button
            type="secondary"
            @click="$emit('input', false)"
          >
            Close
          </Button>
          <Button @click="copyAll">Copy all</Button>
        </template>
      </AppModalFooter>
    </AppModalContent>
  </AppModal>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.sharing-modal-published {
  max-height: 535px;
  transition: max-height 0.25s ease-in-out;

  &--loading {
    max-height: 108px;
  }

  &__identity-icon {
    transform: scale(1);
    transition: transform 0.25s ease-in-out;
    transform-origin: 0 0;

    @at-root .sharing-modal-published--loading & {
      transform: scale(0.61);
    }
  }

  &__spinner {
    position: absolute;
    right: 32px;
    top: calc(50% - 24px);
    transition: all 0.25s ease-in-out;
    opacity: 0;
    transform: translateY(50px);

    @at-root .sharing-modal-published--loading & {
      transform: translateY(0);
      opacity: 1;
    }
  }

  &__timer {
    position: absolute;
    right: 32px;
    top: 0;
    transition: all 0.25s ease-in-out;
    transform: translateY(0);

    @at-root .sharing-modal-published--loading & {
      opacity: 0;
      transform: translateY(50px);
    }
  }

  &__title-top {
    margin: 0;
    opacity: 0;
    transform: translate3d(-16px, 77px, 0);
    transition: all 0.25s ease-in-out;
    padding: 0;

    @at-root .sharing-modal-published--loading & {
      opacity: 1;
      transform: translate3d(-16px, 7px, 0);
    }
  }

  &__head {
    margin-top: 32px;
    position: relative;
    display: flex;
    align-items: flex-start;
  }

  &__content {
    transition: all 0.3s ease-out;
    opacity: 1;

    @at-root .sharing-modal-published--loading & {
      transform: translateY(20px);
      opacity: 0;
    }
  }

  &__footer {
    transition: all 0.25s 0.1s ease-out;
    opacity: 1;

    @at-root .sharing-modal-published--loading & {
      transform: translateY(20px);
      opacity: 0;
    }
  }

  & &__title {
    margin-top: 16px;
  }

  .border-input-text,
  .border-input-select {
    margin-top: 16px;
  }

  &__input-row {
    display: grid;
    gap: 24px;
    grid-template-columns: 3fr 2fr;
  }

  &__input {
    .border-input-text__input {
      padding-right: 100px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      cursor: pointer;
    }
  }

  &__change-permission {
    color: $color-primary-100;
    font-size: 12px;
    font-weight: 500;
    line-height: normal;
    text-decoration-line: underline;
    margin-right: auto;
    background: none;
    padding: 0;
    border: none;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }

  &__icon-action {
    width: 30px;
    height: 44px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: 0;
    cursor: pointer;
    transition: transform 0.05s ease-out;
    color: $color-primary-100;

    svg {
      height: 16px;
      width: auto;
    }

    &:hover {
      opacity: 0.8;
    }

    &:active {
      transform: scale(0.92);
    }

    &:disabled {
      transform: scale(1);
      opacity: 0.3;
      cursor: not-allowed;
    }
  }

  .border-input-select__button {
    background-color: $color-primary-5;
  }

  &__expiration {
    .popper__content {
      padding: 0;
    }

    .border-input-select__options-item {
      height: 36px;
    }

    &-option {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;

      path {
        fill: $color-primary-100;
      }

      &--selected {
        font-weight: 600;
      }
    }
  }
}
</style>
