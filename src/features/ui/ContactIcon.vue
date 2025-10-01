<script setup>
import IdentityIcon from "@/features/ui/IdentityIcon.vue";
import { computed } from "vue";
import store from "@/store";
import InlineSvg from "@/features/InlineSvg.vue";

const props = defineProps({
  initials: { type: String, default: null },
  override: {
    height: Number,
    width: Number,
    type: Object,
    default: null,
  },
  associatedIdentityId: { type: Number, default: null },
  showBlockIcon: Boolean,
  styleOverride: { type: Object, default: null },
});
defineEmits(["mouseenter", "mouseleave"]);
const getBkgdWrapperStyle = () => {
  return {
    ...props.override,
    height: height.value,
    width: width.value,
  };
};
const getDefaultIconStyle = () => {
  return {
    height: `${0.3889 * parseFloat(height.value.replace("px", ""))}px`,
    width: `${0.3889 * parseFloat(width.value.replace("px", ""))}px`,
  };
};
const getInitialsFontSize = () => {
  return {
    "font-size": `${
      props.override ? 0.444 * parseFloat(height.value.replace("px", "")) : "18"
    }px`,
  };
};
const getMiniIconBorderStyle = () => {
  return {
    "outline-width": `${
      0.083 * 0.3333 * parseFloat(width.value.replace("px", ""))
    }px`,
  };
};
const getMiniIconStyle = () => {
  return {
    height: `${0.3333 * parseFloat(height.value.replace("px", ""))}px`,
    width: `${0.3333 * parseFloat(width.value.replace("px", ""))}px`,
  };
};
const associatedIdentity = computed(() =>
  store.state.localdb.db_cloaks.find(
    (cloak) => cloak.id === props.associatedIdentityId
  )
);

const height = computed(
  () => (props.override && props.override.height) || "40px"
);
const width = computed(
  () => (props.override && props.override.width) || "40px"
);
</script>
<template>
  <div
    class="icon"
    :class="{ blocked: props.showBlockIcon }"
    :style="getBkgdWrapperStyle()"
    @mouseenter="$emit('mouseenter')"
    @mouseleave="$emit('mouseleave')"
  >
    <InlineSvg
      v-if="props.showBlockIcon"
      name="block-contact"
    />
    <span
      v-else-if="props.initials"
      :style="getInitialsFontSize()"
    >
      {{ props.initials.toUpperCase() }}
    </span>
    <div
      v-else
      :style="getDefaultIconStyle()"
      class="default-icon-wrapper"
    >
      <InlineSvg
        name="user-icon-filled"
        class="default-icon"
      />
    </div>
    <div
      v-if="props.associatedIdentityId && associatedIdentity"
      class="mini-icon"
      :style="getMiniIconBorderStyle()"
    >
      <IdentityIcon
        :identity="associatedIdentity"
        :override="getMiniIconStyle()"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.icon {
  background-color: $color-primary-100;
  color: $color-primary-1;
  font-family: $global-font;
  font-weight: 600;
  font-size: 18px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  flex-grow: 0;
  flex-shrink: 0;

  .default-icon-wrapper {
    display: flex;

    .default-icon {
      height: 100%;
      width: 100%;
      align-self: center;
    }
  }

  .mini-icon {
    height: 24px;
    width: 24px;
    border-radius: 50%;
    background-color: $color-primary-20;
    outline: 2px solid $color-primary-5;
    position: absolute;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    right: -2%;
    bottom: -4%;
  }

  &.blocked {
    background-color: $color-primary-10-light;
  }
}
</style>
