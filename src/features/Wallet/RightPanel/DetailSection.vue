<script setup>
import inlineSvg from "@/features/InlineSvg.vue";
import Toggle from "@/features/Toggle.vue";
import { useToast } from "@/composables/useToast.js";
import { tools } from "@/scripts/tools";

const toast = useToast();

const props = defineProps({
  title: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    default: null,
  },
  icon: {
    type: String,
    default: "bell",
  },
  multiLine: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  toggle: {
    type: Boolean,
    default: false,
  },
  toggleStatus: {
    type: Boolean,
    default: false,
  },
  link: {
    type: Boolean,
    default: false,
  },
  download: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  notClickable: {
    type: Boolean,
    default: false,
  },
  copyToClipboard: {
    type: Boolean,
    default: false,
  },
  hoverEffect: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["toggleClicked"]);

const copyToClipboard = () => {
  tools.copyToClipboard(props.description);
  toast.success("Copied to clipboard");
};
</script>

<template>
  <div
    v-if="props.title && props.icon"
    class="detail-section"
    :class="{
      'multi-line': props.multiLine,
      disabled: props.disabled,
      'not-clickable': props.notClickable,
      'hover-effect': props.hoverEffect,
    }"
    @click="$emit('toggleClicked')"
  >
    <div class="icon">
      <inlineSvg :name="props.icon" />
    </div>

    <div class="content">
      <div class="title">
        <h1>{{ props.title }}</h1>
      </div>

      <div
        v-if="props.description"
        class="content"
      >
        <p>{{ props.description }}</p>
      </div>
    </div>

    <Toggle
      v-if="props.toggle"
      :status="toggleStatus"
      class="toggle"
    />

    <div
      v-if="props.link"
      class="link"
    >
      <inlineSvg name="chevron-right" />
    </div>

    <div
      v-if="props.download"
      class="download"
    >
      <inlineSvg name="download" />
    </div>

    <div
      v-if="props.loading"
      class="loading"
    >
      <inlineSvg name="spinner" />
    </div>

    <div
      v-if="props.copyToClipboard"
      class="copy-clipboard"
      @click.stop="copyToClipboard()"
    >
      <inlineSvg name="copy" />
    </div>

    <div
      v-if="props.link"
      class="content"
      @click="createNewIdentity()"
    />
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.detail-section {
  padding: 24px 76px 24px 56px;
  border-radius: 20px;
  border: 1px solid $color-primary-10;
  position: relative;

  &:hover {
    cursor: pointer;
  }

  &.hover-effect:not(.not-clickable):not(.disabled) {
    transition: border 0.15s ease-out;
    &:hover {
      border: 1px solid $color-primary-100;
    }
  }

  &.not-clickable {
    &:hover {
      background-color: transparent;
      cursor: default;
    }
  }

  .icon {
    position: absolute;
    top: 50%;
    left: 16px;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    color: $color-primary-100;

    svg {
      width: 100%;
      height: 100%;
      display: block;
      padding: 3px;
    }
  }

  .content {
    .title {
      h1 {
        font-size: 15px;
        font-style: normal;
        font-weight: 500;
        line-height: normal;
        color: $color-primary-100;
      }
    }

    .content {
      p {
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
        color: $color-primary-90;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
    }
  }

  .toggle {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
  }

  .link {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 14px;
    color: $color-primary-100;

    svg {
      width: 100%;
      height: 100%;
      display: block;
    }
  }

  .download {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    color: $color-primary-100;
    text-align: center;

    svg {
      width: 100%;
      height: 100%;
      display: block;
    }
  }

  .loading {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    color: $color-primary-100;
    text-align: center;

    svg {
      width: 100%;
      height: 100%;
      display: block;
    }
  }

  .copy-clipboard {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    width: 28px;
    height: 28px;
    color: $color-primary-100;
    text-align: center;
    border-radius: 28px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background-color: $color-primary-10;
    }

    svg {
      width: 14px;
      height: 14px;
      display: inline-block;
    }

    &:hover {
      cursor: pointer;
    }
  }

  &.multi-line {
    .content {
      .content {
        p {
          white-space: pre-line;
        }
      }
    }
  }

  &.disabled {
    opacity: 0.4;
    pointer-events: none;
    background-color: $color-primary-5;
  }
}
</style>
