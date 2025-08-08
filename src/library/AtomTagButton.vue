<script setup>
// eslint-disable-next-line import/no-restricted-paths
import InlineSvg from "@/features/InlineSvg.vue";
import BaseText from "@/library/BaseText.vue";

const props = defineProps({
  icon: {
    type: String,
    required: false,
    default: null,
  },
  textTransform: {
    type: String,
    required: false,
    default: "capitalize",
  },
  type: {
    type: String,
    required: false,
    validator: (value) => {
      if (value) {
        return ["frosted"].includes(value);
      } else {
        return true;
      }
    },
    default: null,
  },
});
</script>
<template>
  <BaseText
    as="div"
    :variant="
      props.type === 'frosted' ? 'body-small-medium' : 'headline-6-medium'
    "
    class="atom-tag-button"
    :class="[
      `atom-tag-button--${props.type}`,
      {
        'atom-tag-button--uppercase': props.textTransform === 'uppercase',
        'atom-tag-button--lowercase': props.textTransform === 'lowercase',
        'atom-tag-button--capitalize': props.textTransform === 'capitalize',
      },
    ]"
  >
    <slot />
    <InlineSvg
      v-if="props.icon"
      :name="props.icon"
      class="atom-tag-button-icon"
    />
  </BaseText>
</template>
<style scoped lang="scss">
.atom-tag-button {
  padding: 8px;
  color: $color-primary-100;
  background: $color-primary-10;
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  border: 1px solid $color-primary-10;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
  word-break: break-word;

  &--uppercase {
    text-transform: uppercase;
  }

  &--lowercase {
    text-transform: lowercase;
  }

  &--capitalize {
    text-transform: capitalize;
  }

  &--frosted {
    background: rgba($white, 0.1);
    border: none;
    opacity: 0.8;
  }

  &:hover {
    transform: scale(1.02);
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .atom-tag-button-icon {
    height: 18px;
    width: auto;
    flex-shrink: 0;
  }
}
</style>
