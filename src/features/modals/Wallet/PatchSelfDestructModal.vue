<script setup>
import { ref, computed, onMounted, reactive, watch } from "vue";
import store from "@/store";
import Button from "@/features/Button.vue";
import CardsServices from "@/api/actions/cards-services";
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
  currentCard: {
    type: Object,
    default: () => {},
  },
});

const state = reactive({
  value: JSON.parse(JSON.stringify(props.currentCard.expires_at)).split("T")[0],
  error: false,
  errorMessage: "Invalid date",
  loading: false,
});

function closeModal() {
  store.dispatch("closeModal");
}

const destructOptions = ref([
  "24 hours",
  "90 days",
  "1 year",
  "When card expires",
]);

const currentOption = ref(null);

const selectedOption = computed(() => {
  return currentOption.value;
});

function selectOption(option) {
  currentOption.value = option;
}

const disabled = ref(false);

const buttonDisabled = computed(() => {
  let isDisabled = false;
  if (currentOption.value === "When card expires") {
    isDisabled = true;
  } else if (currentOption.value === "custom" && !state.value) {
    isDisabled = true;
  }
  return isDisabled;
});

function updateSelfDestruct() {
  loading.value = true;
  disabled.value = true;

  let new_destuct_date = new Date();

  if (currentOption.value == "24 hours") {
    new_destuct_date.setDate(new_destuct_date.getDate() + 1);
  } else if (currentOption.value == "90 days") {
    new_destuct_date.setDate(new_destuct_date.getDate() + 90);
  } else if (currentOption.value == "1 year") {
    new_destuct_date.setDate(new_destuct_date.getDate() + 365);
  } else if (currentOption.value == "custom") {
    new_destuct_date = new Date(state.value);
  } else if (currentOption.value == "When card expires") {
    new_destuct_date = new Date(props.currentSource.expires_at);
  }

  CardsServices.patchUpdateCloakedCardDetails(props.currentCardID, {
    expires_at: new_destuct_date.toISOString(),
  })
    .then(() => {
      toast.success("Date updated");
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

onMounted(() => {
  selectOption("When card expires");
});

watch(
  () => state.value,
  (newValue, oldValue) => {
    const cardInitialDate = props.currentCard.expires_at.split("T")[0];

    const regex = /^\d{4}-\d{2}-\d{2}$/;

    const [year, month, day] = newValue.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    if (month < 1 || month > 12) {
      state.error = true;
      disabled.value = true;
    } else if (day < 1 || day > daysInMonth) {
      state.error = true;
      disabled.value = true;
    } else if (newValue < cardInitialDate) {
      state.error = true;
      disabled.value = true;
    } else if (regex.test(newValue)) {
      state.error = false;
      if (!regex.test(oldValue)) {
        disabled.value = false;
      }
    } else {
      state.error = true;
      disabled.value = true;
    }
  }
);
</script>

<template>
  <ModalTemplate
    :show="props.isVisible"
    @close="closeModal"
  >
    <template #header>
      <h1>Self-Destruct</h1>
    </template>
    <template #body>
      <p>
        This card will automatically deactivate regardless of the expiration
        date.
      </p>
      <div
        v-if="destructOptions"
        class="destruct-options"
      >
        <div
          v-for="option in destructOptions"
          :key="option"
          class="destruct-option"
          :class="{ selected: option === selectedOption }"
          @click="selectOption(option)"
        >
          <div class="information">
            <h1>{{ option }}</h1>
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
        :disabled="disabled || buttonDisabled"
        :loading="loading"
        @click="updateSelfDestruct(selectOption)"
      >
        Save changes
      </Button>
    </template>
  </ModalTemplate>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.date-input {
  width: 100%;
  margin-top: 20px;
}

.destruct-options {
  padding-top: 20px;

  .destruct-option {
    border: 1px solid $color-primary-10;
    border-radius: 16px;
    padding: 16px;
    margin-top: 10px;
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
