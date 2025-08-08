<script setup>
import inlineSvg from "@/features/InlineSvg.vue";
const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});
</script>
<template>
  <div
    class="list-row-item-wrapper"
    :class="{ 'completed-row': props.completed }"
  >
    <img
      :src="props.icon"
      :alt="`${props.title} icon`"
      height="32px"
      width="32px"
      class="main-img"
    />
    <div class="title-row">
      <h3>{{ props.title }}</h3>
      <p>{{ props.subtitle }}</p>
    </div>
    <inlineSvg
      :key="props.completed ? 'checkmark' : 'arrow-right'"
      :class="{ completed: props.completed }"
      :name="props.completed ? 'checkmark-plain' : 'arrow-right'"
    />
  </div>
</template>
<style lang="scss" scoped>
.list-row-item-wrapper {
  background-color: rgba($color-primary-100-light, 0.3);
  height: 71px;
  width: 100%;
  max-width: 375px;
  display: flex;
  flex-direction: row;
  padding: 16px;
  align-items: center;
  justify-content: space-between;
  color: $color-primary-100;
  border-radius: 8px;
  transition: opacity 0.3s;
  cursor: pointer;

  @at-root .theme-dark & {
    background-color: rgba($color-primary-100-dark, 0.3);
  }

  .main-img {
    border-radius: 50%;
  }

  .title-row {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex-grow: 1;
    padding: 0 12px;

    h3 {
      font-size: 14px;
      font-style: normal;
      font-weight: 500;
      line-height: normal;
    }

    p {
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
      color: $color-primary-70;
    }
  }

  svg {
    height: 19px;
  }

  &:hover {
    opacity: 0.5;
    transition: opacity 0.3s;
  }

  &.completed-row {
    cursor: default;

    &:hover {
      opacity: 1;
    }
  }
}

.completed {
  color: $color-success;
}
</style>
