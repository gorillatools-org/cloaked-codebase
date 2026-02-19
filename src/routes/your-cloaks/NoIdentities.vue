<script setup>
import { computed } from "vue";
import InlineSvg from "@/features/InlineSvg.vue";
import BaseButton from "@/library/BaseButton.vue";
import store from "@/store";
import BaseText from "@/library/BaseText.vue";

const props = defineProps({
  identityType: {
    type: String,
    default: "favorite",
    validator: (value) =>
      ["favorite", "ignored", "category", "all"].includes(value),
  },
  callback: {
    type: Function,
    default: () => {},
  },
});

const identitySearch = computed(() => {
  return store.getters.getIdentitySearch;
});

const iconName = computed(() => {
  if (props.identityType === "favorite") {
    return "favorite-outline-thin";
  } else if (props.identityType === "ignored") {
    return "ignored-outline-thin";
  } else if (props.identityType === "category") {
    return "stacked-blocks";
  } else {
    return "blocks";
  }
});
</script>

<template>
  <div class="no-identities">
    <div class="no-identities__content">
      <template v-if="identitySearch.length">
        <InlineSvg
          :name="iconName"
          class="no-identities__icon"
        />
        <BaseText
          as="h2"
          variant="headline-3-bold"
          class="no-identities__title"
        >
          No results matching "{{ identitySearch }}"
        </BaseText>
        <BaseText
          as="p"
          variant="headline-6-medium"
          class="no-identities__text"
        >
          Try adjusting your search
        </BaseText>
      </template>
      <template v-else-if="props.identityType === 'favorite'">
        <InlineSvg
          name="favorite-outline-thin"
          class="no-identities__icon"
        />
        <BaseText
          as="h2"
          variant="headline-3-bold"
          class="no-identities__title"
        >
          No favorites
        </BaseText>
        <BaseText
          as="p"
          variant="headline-6-medium"
          class="no-identities__text"
        >
          To add an identity to your favorites, tap on an identity in your "All
          identities" view and click the
          <InlineSvg
            name="favorite-outline-thin"
            class="no-identities__text-icon"
          />
          icon on the details sidebar.
        </BaseText>
      </template>
      <template v-else-if="props.identityType === 'ignored'">
        <InlineSvg
          name="ignored-outline-thin"
          class="no-identities__icon"
        />
        <BaseText
          as="h2"
          variant="headline-3-bold"
          class="no-identities__title"
        >
          No ignored identities
        </BaseText>
        <BaseText
          as="p"
          variant="headline-6-medium"
          class="no-identities__text"
        >
          You can ignore identities you no longer want to hear from by clicking
          on a Cloaked identity from the "All identities" view and clicking the
          <InlineSvg
            name="bell"
            class="no-identities__text-icon"
          />
          icon in the details sidebar.
        </BaseText>
      </template>
      <template v-else-if="props.identityType === 'category'">
        <InlineSvg
          name="stacked-blocks"
          class="no-identities__icon"
        />
        <BaseText
          as="h2"
          variant="headline-3-bold"
          class="no-identities__title"
        >
          No identities in this category
        </BaseText>
        <BaseText
          as="p"
          variant="headline-6-medium"
          class="no-identities__text"
        >
          You can add identities to this category by clicking the button below
          or go to "All identities" view and select the category you want from
          the details sidebar.
        </BaseText>
        <BaseButton
          class="no-identities__button"
          @click="props.callback"
        >
          Add identities
        </BaseButton>
      </template>
      <template v-else-if="props.identityType === 'all'">
        <InlineSvg
          name="blocks"
          class="no-identities__icon"
        />
        <BaseText
          as="h2"
          variant="headline-3-bold"
          class="no-identities__title"
        >
          You have no identities
        </BaseText>
        <BaseText
          as="p"
          variant="headline-6-medium"
          class="no-identities__text"
        >
          You can create a new identity by clicking the button below.
        </BaseText>
        <BaseButton
          class="no-identities__button"
          icon="plus"
          @click="props.callback"
        >
          New identity
        </BaseButton>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.no-identities {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  &__content {
    margin: auto;
    max-width: 550px;
    padding: 0 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  &__icon {
    margin: auto;
    display: flex;
    align-items: center;
    height: 100px;
    width: 100%;
    color: $color-primary-100;
  }

  &__title {
    text-align: center;
    margin: 24px auto 0;
  }

  &__text {
    color: $color-primary-70;
    text-align: center;
    margin: 12px auto 0;

    &-icon {
      height: 20px;
      width: 24px;
      vertical-align: middle;
    }
  }

  &__button {
    margin-top: 24px;
  }
}
</style>
