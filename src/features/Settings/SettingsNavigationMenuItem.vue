<script setup>
import BaseIcon from "@/library/BaseIcon.vue";
import store from "@/store";
import BaseText from "@/library/BaseText.vue";

const props = defineProps({
  link: {
    type: [String, Object],
    default: null,
  },
  nested: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    default: null,
  },
  button: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
    default: null,
  },
  iconType: {
    type: String,
    default: "svg",
  },
  count: {
    type: Number,
    default: 0,
  },
});

function maxCount(count) {
  if (count > 99) {
    return "99+";
  }
  return count;
}

function handleClick(e) {
  e.stopPropagation();
  if (props.name !== "Get Started") {
    store.dispatch("getStarted/openGetStarted", false);
  }
}
</script>

<template>
  <div
    class="menu-item"
    :class="{ nested: nested }"
    tabindex="0"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space="handleClick"
  >
    <router-link
      v-if="props.link"
      :to="props.link"
      active-class="active"
      exact-path
      tabindex="-1"
    >
      <div class="name-row">
        <BaseIcon
          v-if="props.icon"
          :key="`icon-${props.icon}`"
          class="icon"
          :type="props.iconType"
          :name="props.icon"
        />
        <BaseText variant="body-small-medium">{{ props.name }}</BaseText>
      </div>

      <BaseText
        v-if="props.count !== 0"
        as="div"
        variant="body-small-medium"
        class="count"
      >
        {{ maxCount(props.count) }}
      </BaseText>
    </router-link>
    <a
      v-if="props.button"
      class="button"
    >
      <BaseIcon
        v-if="props.icon"
        :key="props.icon"
        :type="props.iconType"
        :name="props.icon"
      />
      <BaseText variant="body-small-medium">{{ props.name }}</BaseText>
    </a>
    <slot v-if="!props.link && !props.button" />
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.menu-item {
  margin-top: 4px;
  width: 100%;
  cursor: pointer;
  z-index: 3;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-top: 0.5px solid $color-base-white-100;
  border-bottom: 0.5px solid $color-base-white-100;
  transition: transform 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
  overflow: hidden;
  border-radius: 8px;

  &:has(> a.active) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  &.nested {
    margin-left: 12px;
    width: calc(100% - 12px);
  }

  a {
    padding: 6px 12px;
    border-radius: 0 4px 4px 0;
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    gap: 10px;
    color: $color-primary-100;
    width: 100%;
    overflow: hidden;
    outline: none;
    position: relative;

    &:hover {
      background: $color-primary-5;
    }

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 0;
      background: transparent;

      @include transition(all 0.3s ease);
    }

    &:focus-visible {
      &.button > span {
        outline: 1px solid $color-primary-90;
        border-radius: 4px;
        padding: 0 4px;
      }

      .name-row {
        outline: 1px solid $color-primary-90;
        border-radius: 4px;
        padding: 0 4px;
      }
    }

    &.button {
      justify-content: flex-start;
    }

    .name-row {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      gap: 10px;
      overflow: hidden;
    }

    &.active {
      background: $color-primary-5;
      overflow: hidden;

      &::before {
        width: 3px;
        border-radius: 0 4px 4px 0;
        background: $color-primary-100;
      }

      svg {
        color: $color-primary-100;
      }

      span {
        color: $color-primary-100;
      }
    }

    .icon {
      width: 14px;
      height: 14px;
      color: $color-primary-50;
      font-size: 15px;
    }

    span {
      color: $color-primary-70;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    .count {
      color: $white !important;
      padding: 0 6.5px;
      background: $color-info;
      border-radius: 999px;
    }
  }
}
</style>
