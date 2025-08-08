<script setup>
import { computed } from "vue";
import FormContainer from "./FormContainer.vue";
import { StateList } from "@/scripts/countries/states";
import inlineSvg from "@/features/InlineSvg";

const props = defineProps({
  form: { type: Object, default: null },
});

const formData = computed(() => {
  return props.form;
});
</script>

<template>
  <FormContainer icon="pay/address">
    <div class="input-wrapper">
      <label>Street address</label>
      <div class="input">
        <input
          v-model="formData.address.street"
          type="text"
        />
      </div>
    </div>

    <div class="input-wrapper">
      <label>Zip</label>
      <div class="input">
        <input
          v-model="formData.address.postcode"
          type="text"
        />
      </div>
    </div>

    <div class="input-wrapper">
      <label>City</label>
      <div class="input">
        <input
          v-model="formData.address.city"
          type="text"
        />
      </div>
    </div>

    <div class="input-wrapper">
      <label>State</label>
      <div class="input select">
        <select v-model="formData.address.state_province">
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
  </FormContainer>
</template>

<style lang="scss" scoped>
.form {
  margin-top: 48px;
  margin-bottom: 32px;

  .icon {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 68px;
    color: $color-primary-100;

    svg {
      width: 73px;
      height: auto;
    }
  }

  .inputs {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .input-wrapper {
      width: calc(50% - 5px);
      margin-top: 24px;

      &:nth-of-type(-n + 2) {
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
          border: 1px solid $color-primary-50;
          background: transparent;
          padding: 18px 24px;
          border-radius: 8px;
          color: $color-primary-100;
          font-size: 15px;
          font-style: normal;
          font-weight: 500;
          line-height: normal;

          &:focus {
            border: 1px solid $color-primary-100;
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
}
</style>
