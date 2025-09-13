<script setup>
import { computed, ref, watch } from "vue";
import store from "@/store";
import Button from "@/features/Button.vue";
import { StateList } from "@/scripts/countries/states";
import inlineSvg from "@/features/InlineSvg.vue";
import CardsServices from "@/api/actions/cards-services";
import { useToast } from "@/composables/useToast.js";
import ModalTemplate from "@/features/ModalTemplate.vue";

const toast = useToast();

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
});

const formData = computed(() => {
  return store.state.cards?.cardInformation;
});

const formDataCopy = ref(null);

function closeModal() {
  store.dispatch("closeModal");
}

function updateKYC() {
  const payload = {
    street: formDataCopy.value.address.street,
    city: formDataCopy.value.address.city,
    state_province: formDataCopy.value.address.state_province,
    postcode: formDataCopy.value.address.postcode,
    country: "USA",
  };

  CardsServices.kycUpdate(payload)
    .then(() => {
      CardsServices.kycRetreive().then(() => {
        closeModal();
        toast.success("Billing address updated successfully");
      });
    })
    .catch((error) => {
      toast.error(error.response.data.message);
    });
}

function isValidUSZip(sZip) {
  return /^\d{5}(-\d{4})?$/.test(sZip);
}

const isButtonDisabled = computed(() => {
  if (
    JSON.stringify(formData.value) === JSON.stringify(formDataCopy.value) ||
    !isValidUSZip(formDataCopy.value.address.postcode)
  ) {
    return true;
  } else {
    return false;
  }
});

watch(
  () => props.isVisible,
  (isVisible) => {
    if (isVisible) {
      formDataCopy.value = JSON.parse(JSON.stringify(formData.value));
    }
  },
  { immediate: true }
);
</script>

<template>
  <ModalTemplate
    :show="props.isVisible"
    @close="closeModal"
  >
    <template #header>
      <h1>Update billing address</h1>
    </template>
    <template #body>
      <div class="inputs">
        <div class="input-wrapper full-width">
          <label>Street address</label>
          <div class="input">
            <input
              v-model="formDataCopy.address.street"
              type="text"
            />
          </div>
        </div>

        <div class="input-wrapper">
          <label>Zip</label>
          <div class="input">
            <input
              v-model="formDataCopy.address.postcode"
              type="text"
            />
          </div>
        </div>

        <div class="input-wrapper">
          <label>City</label>
          <div class="input">
            <input
              v-model="formDataCopy.address.city"
              type="text"
            />
          </div>
        </div>

        <div class="input-wrapper full-width">
          <label>State</label>
          <div class="input select">
            <select v-model="formDataCopy.address.state_province">
              <option value="">Select state</option>
              <option
                v-for="state in StateList"
                :key="state.value"
                :value="state.value"
              >
                {{ state.label }}
              </option>
            </select>

            <inlineSvg name="chevron-down" />
          </div>
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
        @click="updateKYC()"
      >
        Save changes
      </Button>
    </template>
  </ModalTemplate>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.inputs {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 24px;

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
</style>
