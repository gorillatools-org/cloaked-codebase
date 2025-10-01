<script setup>
import BaseText from "@/library/BaseText.vue";
import { useRelativesApi } from "@/composables/useRelativesApi.js";
import { computed, onBeforeMount, ref } from "vue";
import BaseSheet from "@/library/BaseSheet.vue";
import BaseChip from "@/library/BaseChip.vue";
import BaseIcon from "@/library/BaseIcon.vue";

const {
  relatives,
  isFetching,
  updatingRelative,
  fetchRelatives,
  updateRelative,
} = useRelativesApi();

onBeforeMount(fetchRelatives);

const myRelatives = computed(() => {
  return relatives.value.filter((relative) => relative.is_relative);
});

const notMyRelatives = computed(() => {
  return relatives.value.filter((relative) => !relative.is_relative);
});

const relativeStatuses = [
  { id: "relatives", label: "My relatives" },
  { id: "not-relatives", label: "Not my relatives" },
];

const selectedStatus = ref(relativeStatuses[0].id);
</script>

<template>
  <div class="exposure-status-relatives">
    <router-link :to="{ name: 'ExposureStatusBrokers' }">
      <BaseText
        variant="headline-3-bold"
        as="h3"
      >
        <BaseIcon name="chevron-left" />
        Relatives
      </BaseText>
    </router-link>
    <BaseText
      variant="body-small-medium"
      as="p"
      class="exposure-status-relatives__text"
    >
      Identifying people who may or may not be a relative makes it easier to
      find accounts related to you. Tell us who might not be a relative from the
      people below.
    </BaseText>
    <div class="exposure-status-relatives__tabs">
      <BaseChip
        v-for="relativeStatus in relativeStatuses"
        :key="relativeStatus.id"
        :selected="relativeStatus.id === selectedStatus"
        variant="display"
        @click="selectedStatus = relativeStatus.id"
      >
        {{ relativeStatus.label }}
      </BaseChip>
    </div>
    <div
      v-if="isFetching && relatives.length === 0"
      class="exposure-status-relatives__list"
    >
      <div class="exposure-status-relatives__skeleton" />
      <div class="exposure-status-relatives__skeleton" />
      <div class="exposure-status-relatives__skeleton" />
      <div class="exposure-status-relatives__skeleton" />
      <div class="exposure-status-relatives__skeleton" />
    </div>
    <div
      v-else-if="
        (selectedStatus === 'relatives' && myRelatives.length === 0) ||
        (selectedStatus === 'not-relatives' && notMyRelatives.length === 0)
      "
      class="exposure-status-relatives__list"
    >
      There isn't anyone in this list yet.
    </div>
    <template v-else>
      <TransitionGroup
        v-if="selectedStatus === 'relatives'"
        tag="ul"
        class="exposure-status-relatives__list"
        name="list"
      >
        <li
          v-for="relative in myRelatives"
          :key="relative.id"
        >
          <BaseSheet class="exposure-status-relatives__list-item">
            {{ relative.name }}
            <BaseText
              variant="body-small-medium"
              as="button"
              :disabled="updatingRelative === relative.id"
              class="exposure-status-relatives__button"
              @click="updateRelative(relative.id, false)"
            >
              <template v-if="updatingRelative === relative.id">
                Removing relative
                <span class="exposure-status-relatives__loader" />
              </template>
              <template v-else>Not my relative</template>
            </BaseText>
          </BaseSheet>
        </li>
      </TransitionGroup>

      <TransitionGroup
        v-else
        tag="ul"
        name="list"
        class="exposure-status-relatives__list"
      >
        <li
          v-for="relative in notMyRelatives"
          :key="relative.id"
        >
          <BaseSheet class="exposure-status-relatives__list-item">
            {{ relative.name }}
            <BaseText
              variant="body-small-medium"
              as="button"
              :disabled="updatingRelative === relative.id"
              class="exposure-status-relatives__button"
              @click="updateRelative(relative.id, true)"
            >
              <template v-if="updatingRelative === relative.id">
                Adding relative
                <span class="exposure-status-relatives__loader" />
              </template>
              <template v-else>My relative</template>
            </BaseText>
          </BaseSheet>
        </li>
      </TransitionGroup>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.exposure-status-relatives {
  margin-top: 24px;

  &__text {
    color: $color-primary-70;
    margin-top: 8px;
  }

  &__tabs {
    margin-top: 24px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 24px;

    &-item {
      display: flex;
      justify-content: space-between;
      gap: 32px;
    }
  }

  &__button {
    background-color: transparent;
    border: none;
    padding: 0;
    text-decoration: underline;
    cursor: pointer;
    display: inline-flex;
    gap: 4px;
    align-items: center;

    &:hover {
      opacity: 0.8;
    }
  }

  &__loader {
    display: block;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: linear-gradient(currentcolor 40%, transparent 70%);
    mask: radial-gradient(closest-side, transparent 70%, black 70%);
    animation: rotate 0.5s linear infinite;
  }

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  .list-move,
  .list-enter-active,
  .list-leave-active {
    transition: all 0.4s ease;
  }

  .list-enter-from,
  .list-leave-to {
    opacity: 0;
  }

  .list-leave-active {
    position: absolute;
    width: 100%;
  }

  &__skeleton {
    height: 61px;
    border-radius: 20px;

    @at-root .theme-dark & {
      @include base-skeleton($color-primary-10, 0.8, $white, 0.05);
    }

    @at-root .theme-light & {
      @include base-skeleton($color-primary-10, 0.5, $white, 0.4);
    }

    @for $i from 1 through 5 {
      &:nth-child(#{$i}) {
        animation-delay: $i * 0.02s;
      }
    }
  }
}
</style>
