<script setup>
import { ref, computed } from "vue";
import store from "@/store";
import Button from "@/features/Button.vue";
import CardsServices from "@/api/actions/cards-services";
import inlineSvg from "@/features/InlineSvg.vue";
import { useToast } from "@/composables/useToast.js";
import ModalTemplate from "@/features/ModalTemplate.vue";

const toast = useToast();

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  currentSource: {
    type: Object,
    default: () => {},
  },
  sources: {
    type: Array,
    default: () => [],
  },
  currentCardID: {
    type: Number,
    default: null,
  },
});

function closeModal() {
  store.dispatch("closeModal");
}

const currentFundingSource = ref(props.currentSource.id);

const disabled = ref(true);

const isButtonDisabled = computed(() => {
  if (
    currentFundingSource.value === props.currentSource.id ||
    !currentFundingSource.value ||
    loading.value
  ) {
    return true;
  } else {
    return false;
  }
});

function selectSource(source) {
  currentFundingSource.value = source.id;
}

const selectedSource = computed(() => {
  return currentFundingSource.value;
});

function updateSource(source) {
  loading.value = true;
  disabled.value = true;
  CardsServices.patchUpdateCloakedCardDetails(props.currentCardID, {
    funding_source: source,
  })
    .then(() => {
      return CardsServices.getFundingSources();
    })
    .then(() => {
      loading.value = false;
      closeModal();
      store.commit("closeRightPanel");
    })
    .then(() => {
      return CardsServices.getCardList();
    })
    .catch((error) => {
      loading.value = false;
      disabled.value = false;
      toast.error(error.message);
    });
}

const loading = ref(false);
</script>

<template>
  <ModalTemplate
    :show="props.isVisible"
    @close="closeModal"
  >
    <template #header>
      <h1>Edit funding source</h1>
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
            <h1>{{ source.card_brand }}</h1>
            <p>
              <span>**** {{ source.pan_last_four }}</span>
              <span v-if="source.nickname">• {{ source.nickname }}</span>
            </p>
          </div>

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
        :loading="loading"
        @click="updateSource(selectedSource)"
      >
        Save changes
      </Button>
    </template>
  </ModalTemplate>
</template>

<style lang="scss" scoped>
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
