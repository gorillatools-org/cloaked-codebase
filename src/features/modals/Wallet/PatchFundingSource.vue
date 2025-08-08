<script setup>
import { ref, watch, computed } from "vue";
import store from "@/store";
import Button from "@/features/Button.vue";
import CardsServices from "@/api/actions/cards-services";
import Toggle from "@/features/Toggle.vue";
import { useToast } from "@/composables/useToast.js";
import ModalTemplate from "@/features/ModalTemplate.vue";

const toast = useToast();

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  source: {
    type: Object,
    default: () => {},
  },
});

function closeModal() {
  store.dispatch("closeModal");
}

const nickname = ref(props.source.nickname);

const disabled = ref(true);

watch(nickname, (value) => {
  if (value !== props.source.nickname) {
    disabled.value = false;
  } else {
    disabled.value = true;
  }
});

watch(
  () => props.source,
  (newSource) => {
    toggleStatus.value = newSource.is_auto_debit || false;
  }
);

function toggleAutopay() {
  const payload = {
    is_auto_debit: toggleStatus.value,
  };
  CardsServices.patchUpdateCardDetails(props.source.id, payload).then(() => {
    toast.success("Autopay updated");
  });
  toggleStatus.value = !toggleStatus.value;
}

function updateSource() {
  loading.value = true;
  disabled.value = true;
  CardsServices.patchUpdateCardDetails(props.source.id, {
    nickname: nickname.value,
    autopay: toggleStatus.value,
  }).then(() => {
    CardsServices.getFundingSources().then(() => {
      closeModal();
      loading.value = false;
    });
  });
}

const toggleVisible = computed(() => {
  return !props.source.provider === "stripe_flow_credit";
});

const toggleStatus = ref(props.source.is_auto_debit || false);

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
      <div class="inputs">
        <div class="input-wrapper full-width">
          <label>Nickname</label>
          <div class="input">
            <input
              v-model="nickname"
              type="text"
            />
          </div>
        </div>
      </div>
      <div
        v-if="toggleVisible"
        class="autopay-toggle"
        @click="toggleAutopay()"
      >
        <span>Autopay</span>
        <Toggle :status="toggleStatus" />
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
        type="primary"
        :disabled="disabled"
        :loading="loading"
        @click="updateSource()"
      >
        Save
      </Button>
    </template>
  </ModalTemplate>
</template>

<style lang="scss" scoped>
.inputs {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 10px;

  .input-wrapper {
    width: calc(50% - 10px);

    &:first-child {
      margin-top: 0;
    }

    &.full-width {
      width: 100%;
    }

    label {
      display: block;
      font-size: 12px;
      font-style: normal;
      font-weight: 500;
      line-height: normal;
      color: $color-primary-100;
      margin-bottom: 4px;
    }

    .input {
      position: relative;

      input,
      select {
        width: 100%;
        border: 1px solid $color-primary-10;
        background: transparent;
        padding: 18px 24px;
        border-radius: 8px;
        color: $color-primary-100;
        font-size: 15px;
        font-style: normal;
        font-weight: 500;
        line-height: normal;
        text-overflow: ellipsis;

        &:focus {
          border: 1px solid $color-primary-50;
          outline: none;
        }
      }

      select {
        height: 61px;
        appearance: none;
        appearance: none;
        appearance: none;
        text-indent: 1px;
        text-overflow: "";
      }

      &.toggle {
        input {
          padding-right: 58px;
        }

        .toggle {
          position: absolute;
          top: 50%;
          right: 18px;
          transform: translateY(-50%);
          cursor: pointer;
          color: $color-primary-100;
          width: 24px;
          height: 24px;
        }
      }

      &.select {
        select {
          padding-right: 58px;
          position: relative;
          font-family: inherit;
          text-overflow: ellipsis;
          cursor: pointer;
        }

        svg {
          position: absolute;
          top: 50%;
          right: 18px;
          transform: translateY(-50%);
          pointer-events: none;
          color: $color-primary-100;
          width: 24px;
          height: 24px;
        }
      }
    }

    span {
      display: flex;
      align-items: center;
      color: $color-primary-100;
      font-size: 12px;
      font-style: normal;
      font-weight: 500;
      line-height: normal;
      margin-top: 5px;
      cursor: pointer;

      svg {
        width: 14px;
        height: 14px;
        margin-left: 4px;
        display: inline-block;
      }
    }
  }
}

.autopay-toggle {
  display: flex;
  cursor: pointer;
  padding-top: 20px;
  justify-content: space-between;
}
</style>
