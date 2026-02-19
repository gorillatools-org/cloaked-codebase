<script setup>
import { computed } from "vue";
import store from "@/store";
import router from "@/routes/router";
import BaseIcon from "@/library/BaseIcon.vue";
import BaseAvatar from "@/library/BaseAvatar.vue";
import BaseText from "@/library/BaseText.vue";

const emit = defineEmits(["toggle-dropdown"]);

const username = computed(() => {
  return store.getters["authentication/getUsername"];
});

function settingsLink() {
  emit("toggle-dropdown");
  router.push("/settings");
}
</script>

<template>
  <div
    class="navigation-dropdown-header"
    @click="settingsLink"
  >
    <BaseAvatar
      size="large"
      :username="username"
    />
    <div class="navigation-dropdown-header__info">
      <BaseText
        as="div"
        variant="caption-semibold"
        class="navigation-dropdown-header__username"
      >
        {{ username }}
      </BaseText>
      <BaseText
        as="div"
        variant="caption-semibold"
        class="navigation-dropdown-header__subtext"
      >
        View profile
      </BaseText>
    </div>

    <BaseIcon
      name="chevron-right"
      class="navigation-dropdown-header__icon"
    />
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.navigation-dropdown-header {
  padding: 8px 4px;
  margin: 8px;
  border-radius: 14px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  position: relative;

  &:hover {
    cursor: pointer;
    background-color: $color-primary-10;
  }

  &__info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    margin-left: 8px;
    width: calc(100% - 41px);
    padding-right: 24px;
  }

  &__username {
    font-weight: 700;
    color: $color-primary-100;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }

  &__subtext {
    color: $color-primary-100;
  }

  &__icon {
    position: absolute;
    top: 50%;
    @include transform(translateY(-50%));
    right: 16px;
    color: $color-primary-100;
    font-size: 15px;
    font-weight: 500;
  }
}
</style>
