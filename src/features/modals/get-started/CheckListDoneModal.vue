<script setup>
import { onBeforeUnmount, ref } from "vue";
import ModalTemplate from "@/features/ModalTemplate.vue";
import UiTooltip from "@/features/ui/ui-tooltip";
import AllDoneImg from "@/assets/icons/all-done.png";
import SecurityImg from "@/assets/icons/security.png";
import PowerUpImg from "@/assets/icons/power-up.png";
import StrongImg from "@/assets/icons/strong.png";
import { copyToClipboard } from "@/scripts/tools";
import inlineSvg from "@/features/InlineSvg.vue";
import Button from "@/features/Button.vue";

defineProps({
  freeShirtUrl: {
    default: "",
    type: String,
  },
  modalData: {
    required: true,
    type: Object,
    default: () => ({
      title: "",
      description: "",
      type: "",
    }),
  },
  open: {
    default: false,
    type: Boolean,
  },
});
defineEmits(["close", "showModal"]);
const typeToImg = {
  "all-done": AllDoneImg,
  security: SecurityImg,
  "power-up": PowerUpImg,
  strong: StrongImg,
};
const promoCode = "8WGVVFAEZVJ7";
const toolTipVisibility = ref(false);
let timeOut = ref(null);
function onCopyClick() {
  toolTipVisibility.value = true;
  copyToClipboard(promoCode);
  timeOut.value = setTimeout(() => {
    toolTipVisibility.value = false;
  }, 1000);
}
onBeforeUnmount(() => {
  clearTimeout(timeOut.value);
});
</script>
<template>
  <ModalTemplate
    :show="open"
    class="get-started-done"
    width="512px"
    @close="$emit('close')"
  >
    <template #header>
      <img
        v-if="modalData.type"
        :key="modalData.type"
        :src="typeToImg[modalData.type]"
        :alt="modalData.type"
      />
    </template>
    <template #body>
      <div class="body-content">
        <h1 class="title">
          {{ modalData.title }}
        </h1>
        <p class="description">
          {{ modalData.description }}
        </p>
        <div
          v-if="modalData.type === 'all-done'"
          class="promo-code"
        >
          <p>{{ promoCode }}</p>
          <UiTooltip
            :key="toolTipVisibility"
            title="Copied!"
            align-x="center"
            :can-show="toolTipVisibility"
          >
            <inlineSvg
              class="copy"
              name="copy"
              @click="onCopyClick"
            />
          </UiTooltip>
        </div>
      </div>
    </template>
    <template #footer>
      <div
        v-if="modalData.type === 'all-done'"
        class="footer"
      >
        <Button
          size="lg"
          type="secondary"
          @click="$emit('close')"
        >
          Maybe later
        </Button>
        <Button
          size="lg"
          class="claim"
          as="a"
          target="_blank"
          :href="freeShirtUrl"
          rel="noopener noreferrer"
          type="primary"
          @click="$emit('showModal')"
        >
          Claim my free T-shirt
          <inlineSvg name="arrow-ne" />
        </Button>
      </div>
      <div
        v-else
        class="footer"
      >
        <Button
          size="lg"
          type="primary"
          @click="$emit('close')"
        >
          Got it
        </Button>
      </div>
    </template>
  </ModalTemplate>
</template>
<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.get-started-done {
  .modal-header {
    padding: 0 !important;
    min-height: 372px;

    svg {
      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
    }

    img {
      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
    }
  }

  .body-content {
    .title {
      font-size: 24px;
      font-weight: 500;
    }

    .description {
      font-size: 15px;
      color: $color-primary-70;
      margin: 18px 0;
    }

    .promo-code {
      border-radius: 10px;
      border: 2px solid $color-primary-10;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 60px;
      padding: 0 16px;

      .copy {
        margin-top: 10px;
        cursor: pointer;
      }
    }
  }

  .footer {
    display: flex;
    justify-content: flex-end;
    column-gap: 12px;

    svg {
      fill: $color-primary-1;
    }
  }
}
</style>
