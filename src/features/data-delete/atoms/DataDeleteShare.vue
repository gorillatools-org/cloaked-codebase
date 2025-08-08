<script setup>
import { DD_SHARE_URL } from "@/scripts/constants";
import InlineSvg from "@/features/InlineSvg.vue";
import AppModal from "@/features/ui/AppModal.vue";
import AppModalContent from "@/features/ui/AppModalContent.vue";
import AppModalTitle from "@/features/ui/AppModalTitle.vue";
import AppModalParagraph from "@/features/ui/AppModalParagraph.vue";
import BaseButton from "@/library/BaseButton.vue";
import { computed, ref } from "vue";
import { useToast } from "@/composables/useToast.js";
import { PH_EVENT_REFERRAL_SENT } from "@/scripts/posthogEvents";
import { posthogCapture } from "@/scripts/posthog.js";
import { tools } from "@/scripts/tools";

const shareData = computed(() => ({
  url: DD_SHARE_URL,
  text: `Hey, I tried out this app that showed me all my leaked personal data floating around online, and it found your info linked to mine. Your personal data is exposed too, so I thought you should know. It's really easy to use, they identify what's been leaked and then remove it for you. Check it out: ${DD_SHARE_URL}`,
  title: "Scan for leaked personal data",
}));

const captureShare = (isNativeShare = false) => {
  posthogCapture(PH_EVENT_REFERRAL_SENT, {
    type: "dd_referral",
    isNativeShare,
  });
};

const toast = useToast();

const onCopyLink = () => {
  captureShare();
  tools.copyToClipboard(shareData.value.url);
  toast.success(`"${shareData.value.url}" copied to clipboard.`);
};

// it seems like meta doesn't allow pre-filled messages
const onOpenMessenger = () => {
  captureShare();
  tools.copyToClipboard(shareData.value.text);
  toast.success(`Message copied to clipboard. Opening Facebook Messenger.`);
  setTimeout(() => {
    window.open("https://www.messenger.com/t", "_blank")?.focus();
  }, 2000);
};

const isFallbackShareModalOpen = ref(false);

const onShare = async () => {
  const canUseNativeShare = !!navigator.canShare?.(shareData.value);

  if (canUseNativeShare) {
    try {
      await navigator.share(shareData.value);
      captureShare(true);
    } catch {
      // do nothing
    }
  } else {
    isFallbackShareModalOpen.value = true;
  }
};
</script>

<template>
  <div
    class="data-delete-share"
    @click="onShare"
  >
    <slot>
      Notify family members
      <InlineSvg name="share" />
    </slot>
    <AppModal
      :value="isFallbackShareModalOpen"
      :has-outside-click-close="true"
      @input="isFallbackShareModalOpen = $event"
    >
      <AppModalContent class="data-delete-share__modal">
        <button
          class="data-delete-share__modal-close"
          @click="isFallbackShareModalOpen = false"
        >
          <InlineSvg name="close" />
        </button>
        <AppModalTitle class="data-delete-share__modal-title">
          Notify family members
        </AppModalTitle>
        <AppModalParagraph>
          Copy the link below or share to notify friends and family members that
          their data is exposed online.
        </AppModalParagraph>
        <div class="data-delete-share__modal-sharing">
          <BaseButton
            variant="primary"
            size="lg"
            class="data-delete-share__modal-sharing-copy"
            @click="onCopyLink"
          >
            Copy link
          </BaseButton>
          or
          <ul class="data-delete-share__modal-sharing-social">
            <li>
              <a
                target="_blank"
                @click="onOpenMessenger"
              >
                <InlineSvg
                  name="sharing/facebook"
                  class="data-delete-share__modal-sharing-social-button"
                />
              </a>
            </li>
            <li>
              <a
                target="_blank"
                :href="
                  encodeURI(
                    `https://x.com/messages/compose?text=${shareData.text}`
                  )
                "
                @click="captureShare"
              >
                <InlineSvg
                  name="sharing/x"
                  class="data-delete-share__modal-sharing-social-button"
                />
              </a>
            </li>
            <li>
              <a
                target="_blank"
                :href="encodeURI(`https://wa.me/?text=${shareData.text}`)"
                @click="captureShare"
              >
                <InlineSvg
                  name="sharing/whatsapp"
                  class="data-delete-share__modal-sharing-social-button"
                />
              </a>
            </li>
            <li>
              <a
                target="_blank"
                :href="
                  encodeURI(
                    `https://telegram.me/share/url?url=${shareData.url}&text=${shareData.text}`
                  )
                "
                @click="captureShare"
              >
                <InlineSvg
                  name="sharing/telegram"
                  class="data-delete-share__modal-sharing-social-button"
                />
              </a>
            </li>
            <li>
              <a
                target="_blank"
                :href="
                  encodeURI(
                    `mailto:?subject=${shareData.title}&body=${shareData.text}`
                  )
                "
                @click="captureShare"
              >
                <InlineSvg
                  name="sharing/email"
                  class="data-delete-share__modal-sharing-social-button"
                />
              </a>
            </li>
          </ul>
        </div>
      </AppModalContent>
    </AppModal>
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.data-delete-share {
  display: inline-flex;
  padding: 8px 12px;
  align-items: center;
  gap: 6px;
  border-radius: 100px;
  background-color: $color-primary-100;
  color: $color-primary-1;
  font-size: 10px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  cursor: pointer;

  @media all and (min-width: $screen-xl) {
    font-size: 12px;
  }

  &:hover {
    opacity: 0.9;
  }

  &__modal {
    position: relative;

    &-close {
      position: absolute;
      width: 18px;
      height: 18px;
      right: 32px;
      top: 32px;
      cursor: pointer;
      padding: 0;
      background-color: transparent;
      border: none;
      color: $color-primary-100;

      &:hover {
        opacity: 0.9;
      }

      & > * {
        width: 100%;
        height: 100%;
      }
    }

    &-title {
      padding-right: 64px;
    }

    &-sharing {
      padding: 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      font-size: 14px;
      font-style: normal;
      font-weight: 500;
      line-height: normal;

      &-copy {
        align-self: stretch;
      }

      &-social {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        flex-wrap: wrap;

        &-button {
          cursor: pointer;

          &:hover {
            opacity: 0.8;
          }
        }
      }
    }
  }
}
</style>
