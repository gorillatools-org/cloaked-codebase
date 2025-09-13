<script setup>
import { computed } from "vue";

import DefaultIdentityIcon from "@/assets/icons//new-cloak-icons/DefaultIdentityIcon.vue";
import { convertHexToRgba } from "@/scripts/format";

const BRAND_COLOR_DICTIONARY = {
  spirit_rose: { color: "#E75D72", secondaryColor: "#ED0061" },

  crest_blue: { color: "#0094C6", secondaryColor: "#3673AE" },

  arctic_lime: { color: "#E0FF4F", secondaryColor: "#DBDF00" },

  violet_reflection: { color: "#9C95DC", secondaryColor: "#8D4FBD" },

  caribbean_green: { color: "#00C49A", secondaryColor: "#2AC1AF" },

  foam_blue: { color: "#5ADBFF", secondaryColor: "#2AB5DC" },
};

const props = defineProps({
  identity: { type: Object, default: null },
  onClick: { type: Function, default: null },
  override: { type: Object, default: null },
  noGradient: { type: Boolean, default: false },
});

const height = computed(
  () => (props.override && props.override.height) || "30px"
);

const width = computed(
  () => (props.override && props.override.width) || "30px"
);

const bkgdWrapperStyle = computed(() => {
  return {
    ...props.override,
    height: height.value,
    width: width.value,
  };
});

const getLogo = computed(() => {
  if (props.identity) {
    // this is the old dog cloaked logo > dont use it
    if (
      props.identity.logo_url &&
      props.identity.logo_url !==
        "https://asset.brandfetch.io/idUnnKamDB/idjTo0cGxS.png"
    ) {
      return props.identity.logo_url;
    }
  }
  return null;
});

const getBrandColorHexes = (brandColorName) => {
  return {
    color: BRAND_COLOR_DICTIONARY[brandColorName].color,
    secondaryColor: BRAND_COLOR_DICTIONARY[brandColorName].secondaryColor,
  };
};

const getColors = computed(() => {
  if (props.identity) {
    if (
      props.identity?.cloak_brand_color &&
      BRAND_COLOR_DICTIONARY[props.identity?.cloak_brand_color]
    ) {
      if (props.identity?.muted) {
        return getMutedColors(props.identity.cloak_brand_color);
      }
      /* If we have the new field, look up the hex codes in our color dictionary */
      return getBrandColorHexes(props.identity?.cloak_brand_color);
    }
    /* If we have the new field but the value isn't in our dictionary, default to Crest Blue */
    return getBrandColorHexes("crest_blue");
  }
  /* Default to foam_blue when no identity is present */
  return getBrandColorHexes("foam_blue");
});

const handleClick = (e) => {
  if (props.onClick) {
    return props.onClick(e);
  }
};

const getBkgdLogoStyle = computed(() => {
  const finalStyle = {
    height: "100%",
    width: "100%",
  };
  if (getLogo.value) {
    finalStyle.backgroundImage = "url(" + getLogo.value + ")";
  }
  return finalStyle;
});

const getMutedColors = (brandColorName) => {
  const brandColors = getBrandColorHexes(brandColorName);
  const primaryColor = convertHexToRgba(brandColors.color, 0.5);
  const secondaryColor = convertHexToRgba(brandColors.secondaryColor, 0.5);
  return {
    color: primaryColor,
    secondaryColor: secondaryColor,
  };
};
</script>
<template>
  <div
    v-if="!!props.identity && !!getLogo"
    class="identity-icon"
    :style="bkgdWrapperStyle"
    :class="{ muted: props.identity?.muted }"
    @click="handleClick"
  >
    <div
      :style="getBkgdLogoStyle"
      class="logo"
    />
  </div>
  <DefaultIdentityIcon
    v-else
    :key="`${getColors?.color}${props.identity?.nickname || 'default'}`"
    :color="getColors?.color"
    :secondary-color="getColors?.secondaryColor"
    :height="props.override?.height"
    :width="props.override?.width"
    :style="bkgdWrapperStyle"
    :no-gradient="props.noGradient"
  />
</template>

<style lang="scss" scoped>
.identity-icon {
  flex-shrink: 0;
  background-color: $color-background;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border: 1px solid $color-primary-10;

  .logo {
    width: 30px;
    height: 30px;
    border-radius: 15px;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
  }
}

.muted {
  opacity: 0.5;
}
</style>
