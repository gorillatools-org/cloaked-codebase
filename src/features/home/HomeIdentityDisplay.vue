<script setup>
import InlineSvg from "@/features/InlineSvg.vue";
import UiTooltip from "@/features/ui/ui-tooltip.vue";
import { posthogCapture } from "@/scripts/posthog.js";
import { assetUrl } from "@/scripts/assets";
import BaseText from "@/library/BaseText.vue";

const emit = defineEmits(["clickWrapper", "clickCreate"]);
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  website: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  article: {
    type: String,
    required: false,
    default: null,
  },
});

function openBreachArticle(externalUrl) {
  posthogCapture("user_clicked_breachednews", {
    website: externalUrl,
  });
  window.open(externalUrl, "_blank");
}
</script>
<template>
  <div class="home-cloak-wrapper">
    <div class="logo-name-wrapper">
      <img
        :key="`home-icon-${props.icon}`"
        :src="assetUrl(`@/assets/icons/brandLogos/${props.icon}.png`)"
        class="icon"
      />
      <BaseText
        as="div"
        variant="body-2-semibold"
      >
        {{ props.name }}
      </BaseText>
    </div>
    <div class="icon-row">
      <UiTooltip
        v-if="props.article"
        align-x="center"
        title="View article"
        position="bottom"
        class="icon-wrapper"
        @click="openBreachArticle(props.article)"
      >
        <InlineSvg
          name="news-article"
          class="add"
        />
      </UiTooltip>
      <UiTooltip
        align-x="center"
        title="Create new identity"
        position="bottom"
        class="icon-wrapper"
        @click="emit('clickCreate')"
      >
        <InlineSvg
          name="add-currentColor"
          class="add"
        />
      </UiTooltip>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.home-cloak-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0 7px;
  height: 60px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);

  .add {
    transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
    color: $color-primary-100;
    visibility: hidden;
  }

  &:hover {
    transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
    opacity: 0.7;
    transform: scale(1.01);
    background-color: $color-primary-5;

    .add {
      transition: all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
      visibility: visible;
    }
  }

  > svg {
    color: $color-primary-100;
  }

  .logo-name-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 10px;

    .icon {
      flex-shrink: 0;
      height: 30px;
      width: 30px;
    }
  }

  .icon-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 10px;

    .icon-wrapper {
      cursor: pointer;
      height: 30px;
      width: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background-color: $color-primary-10;
      }
    }
  }
}
</style>
