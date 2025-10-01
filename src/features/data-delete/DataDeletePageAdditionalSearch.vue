<script setup>
import DataDeletePageSearchSkeleton from "@/features/data-delete/DataDeletePageSearchSkeleton.vue";
import DataDeletePageSearchAge from "@/features/data-delete/DataDeletePageSearchAge.vue";
import DataDeletePageSearchName from "@/features/data-delete/DataDeletePageSearchName.vue";
import DataDeletePageSearchState from "@/features/data-delete/DataDeletePageSearchState.vue";
import { additionalSearchSteps } from "@/features/data-delete/utils.js";

import {
  PH_EVENT_USER_SUBMITTED_DATA_DELETION_SEARCH_AGE_FORM,
  PH_EVENT_USER_SUBMITTED_DATA_DELETION_SEARCH_NAME_FORM,
  PH_EVENT_USER_SUBMITTED_DATA_DELETION_SEARCH_STATE_FORM,
} from "@/scripts/posthogEvents";
import { posthogCapture } from "@/scripts/posthog.js";

const props = defineProps({
  searchStep: {
    type: String,
    required: true,
    validator: (value) => {
      return additionalSearchSteps.includes(value);
    },
  },
  isFetching: {
    type: Boolean,
    default: false,
  },
  value: {
    type: Object,
    required: true,
  },
  isForcingNewSearch: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["input", "searchPublicRecords", "setSearchStep"]);

const searchToComponent = {
  name: DataDeletePageSearchName,
  age: DataDeletePageSearchAge,
  state: DataDeletePageSearchState,
};

async function searchRecords() {
  if (props.searchStep === "name") {
    posthogCapture(PH_EVENT_USER_SUBMITTED_DATA_DELETION_SEARCH_NAME_FORM);
    emit("setSearchStep", "age");
  } else if (props.searchStep === "age") {
    posthogCapture(PH_EVENT_USER_SUBMITTED_DATA_DELETION_SEARCH_AGE_FORM);
    emit("searchPublicRecords", {
      firstName: props.value.firstName,
      lastName: props.value.lastName,
      age: props.value.age,
    });
  } else if (props.searchStep === "state") {
    posthogCapture(PH_EVENT_USER_SUBMITTED_DATA_DELETION_SEARCH_STATE_FORM);
    emit("searchPublicRecords", {
      firstName: props.value.firstName,
      lastName: props.value.lastName,
      age: props.value.age,
      state: props.value.state,
    });
  }
}
</script>

<template>
  <Transition
    name="fade-100"
    mode="out-in"
    appear
  >
    <DataDeletePageSearchSkeleton v-if="isFetching" />
    <Component
      :is="searchToComponent[searchStep]"
      v-else
      :value="value"
      :is-forcing-new-search="isForcingNewSearch"
      @input="$emit('input', $event)"
      @submit="searchRecords"
    />
  </Transition>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.data-delete-additional-search {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
  margin-top: clamp(40px, 5vh, 150px);
  gap: 16px;
  max-width: 450px;
  z-index: 1;

  .data-delete {
    &__text {
      animation: appear-bottom-5 0.3s forwards ease-out;
      opacity: 0;
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
      margin: 0;

      @media all and (min-width: $screen-xl) {
        font-size: 16px;
      }
    }

    &__title {
      animation: appear-bottom-5 0.3s forwards ease-out;
      opacity: 0;
      animation-delay: 0.05s;
      font-size: 32px;
      font-style: normal;
      font-weight: 600;
      line-height: 40px;
      color: $color-primary-100;
      margin: 0;
      text-align: center;
    }
  }

  &__body {
    width: 100%;

    fieldset {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 0;
      border: 0;
      margin-top: 8px;

      & > * {
        animation: appear-bottom-5 0.3s forwards ease-out;
        opacity: 0;

        @for $i from 1 through 2 {
          &:nth-child(#{$i}) {
            animation-delay: calc(0.1s + #{$i * 0.05s});
          }
        }
      }
    }
  }

  &__select {
    height: 60px;
    background-color: transparent;
    border: none;
    color: $color-primary-100;
    cursor: pointer;
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    border-bottom: 1px solid $color-primary-100;

    &:focus {
      outline: none;
    }
  }

  &__cta {
    margin-top: 24px;
    opacity: 0;
    animation: appear-bottom-5 0.5s forwards ease-out;
    animation-delay: 0.2s;

    @media all and (min-width: $screen-xl) {
      animation-delay: 0.15s;
    }

    & > * {
      width: 100%;
    }
  }

  &__footer {
    opacity: 0;
    animation: appear-bottom-5 0.3s forwards ease-out;
    animation-delay: 0.15s;
    // font-size: 12px;
    color: $color-primary-50;
    text-align: center;
    margin-top: 8px;

    @media all and (min-width: $screen-xl) {
      animation: appear-bottom-5 0.4s forwards ease-out;
      animation-delay: 0.35s;
    }
  }
}
</style>
