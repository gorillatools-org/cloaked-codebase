<script setup>
import { computed, ref } from "vue";
import store from "@/store";
import Button from "@/features/Button.vue";
import inlineSvg from "@/features/InlineSvg.vue";
import CardsServices from "@/api/actions/cards-services";
import ModalTemplate from "@/features/ModalTemplate.vue";
import { getBankCardProviderType } from "@/scripts/cards.js";

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
});

const sources = computed(() => {
  return store.state.cards?.fundingSources.results;
});

const primarySource = computed(() => {
  return sources?.value.find((source) => source.primary).id;
});

const fundingSource = ref(null);

const selectedSource = computed(() => {
  return fundingSource.value || primarySource.value;
});

function selectSource(source) {
  fundingSource.value = source.id;
}

function closeModal() {
  store.dispatch("closeModal");
}

const isButtonDisabled = computed(() => {
  if (fundingSource.value === primarySource.value || !fundingSource.value) {
    return true;
  } else {
    return false;
  }
});

function setDefaultFundingSource(value) {
  const payload = {
    primary: true,
  };
  CardsServices.patchUpdateCardDetails(value, payload).then(() => {
    CardsServices.getFundingSources().then(() => {
      closeModal();
    });
  });
}
</script>

<template>
  <ModalTemplate
    :show="props.isVisible"
    @close="closeModal"
  >
    <template #header>
      <h1 v-if="primarySource.value === null">Change default funding source</h1>
      <h1 v-else>Choose default funding source</h1>
    </template>

    <template #body>
      <div
        v-if="sources"
        class="funding-sources"
      >
        <div
          v-for="source in sources"
          :key="source.id"
          class="funding-source"
          :class="{ selected: source.id === selectedSource }"
          @click="selectSource(source)"
        >
          <inlineSvg name="bank" />
          <div class="information">
            <h1>
              {{ source.card_brand }} ({{
                getBankCardProviderType(source.provider)
              }})
            </h1>
            <p>
              <span>**** {{ source.pan_last_four }}</span>
              <span v-if="source.nickname">• {{ source.nickname }}</span>
            </p>
          </div>

          <span
            v-if="source.primary"
            class="default-pill"
          >
            Default
          </span>

          <div class="selected-icon" />
        </div>
      </div>
    </template>

    <template #footer>
      <Button
        type="secondary"
        @click="closeModal"
      >
        Cancel
      </Button>
      <Button
        :disabled="isButtonDisabled"
        @click="setDefaultFundingSource(selectedSource)"
      >
        Save changes
      </Button>
    </template>
  </ModalTemplate>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.funding-sources {
  .funding-source {
    border: 1px solid $color-primary-10;
    border-radius: 16px;
    padding: 16px;
    margin-top: 4px;
    position: relative;
    color: $color-primary-100;

    &:hover {
      background-color: $color-primary-5;
      cursor: pointer;
    }

    &.selected {
      .selected-icon {
        &::after {
          content: "";
          display: block;
          width: 8px;
          height: 8px;
          background-color: $color-primary-100;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
    }

    &:first-child {
      margin-top: 0;
    }

    svg {
      width: 24px;
      height: 24px;
      margin-right: 16px;
      position: absolute;
      top: 50%;
      left: 16px;
      transform: translateY(-50%);
    }

    .information {
      padding-left: 40px;
      padding-right: 40px;

      h1 {
        font-size: 15px;
        font-style: normal;
        font-weight: 500;
        line-height: normal;
        color: $color-primary-100;
        text-transform: capitalize;
      }

      p {
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
        margin-top: 4px;

        span {
          display: inline-block;

          &:nth-of-type(2) {
            margin-left: 4px;
          }
        }
      }
    }

    .default-pill {
      position: absolute;
      top: 50%;
      right: 56px;
      transform: translateY(-50%);
      background-color: $color-success;
      color: $white;
      font-size: 10px;
      font-style: normal;
      font-weight: 600;
      line-height: normal;
      padding: 4px 10px;
      border-radius: 19px;
    }

    .selected-icon {
      position: absolute;
      top: 50%;
      right: 24px;
      transform: translateY(-50%);
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid $color-primary-100;
    }
  }
}
</style>
