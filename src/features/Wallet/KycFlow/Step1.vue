<script setup>
import { watch, ref, computed } from "vue";
import moment from "moment";
import inlineSvg from "@/features/InlineSvg.vue";
import FormContainer from "./FormContainer.vue";
import SSNModal from "./SsnModal.vue";

const props = defineProps({
  form: { type: Object, default: null },
});

const emit = defineEmits(["validateStep", "invalidateStep"]);

const formData = computed(() => {
  return props.form;
});

const ssnModal = ref(false);

function toggleSSNModal() {
  ssnModal.value = !ssnModal.value;
}

function validDate(date) {
  return moment(date, "MM/DD/YYYY", true).isValid();
}

function validSSN(ssn) {
  return ssn.length === 9;
}

function validEmail(email) {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email);
}

function removeDate() {
  formData.value.dob = "";
}

const passwordVisible = ref(false);
const count = ref(0);

function togglePasswordVisible() {
  passwordVisible.value = !passwordVisible.value;
  count.value++;
}

function formatDate() {
  const date = formData.value.dob;
  const dateLength = date.length;

  if (dateLength === 2 || dateLength === 5) {
    formData.value.dob = date + "/";
  }
}

function validUSPhoneNumber(phone) {
  const usPhonePattern = /^\+1\d{10}$/;
  return usPhonePattern.test(phone);
}

watch(
  props.form,
  (value) => {
    if (
      value.first_name.length > 0 &&
      value.last_name.length > 0 &&
      validDate(value.dob) &&
      validSSN(value.government_id) &&
      value.email.length > 0 &&
      validEmail(value.email) &&
      value.phone_number.length > 0 &&
      validUSPhoneNumber(value.phone_number)
    ) {
      emit("validateStep");
    } else {
      emit("invalidateStep");
    }
  },
  { deep: true }
);

function onlyNumbers(event) {
  const key = event.key;
  if (key === "Backspace") {
    return;
  }
  if (isNaN(key)) {
    event.preventDefault();
  }
}
</script>

<template>
  <div>
    <FormContainer icon="pay/basic-information">
      <div class="input-wrapper">
        <label>Legal first name</label>
        <div class="input">
          <input
            v-model="formData.first_name"
            type="text"
          />
        </div>
      </div>

      <div class="input-wrapper">
        <label>Legal last name</label>
        <div class="input">
          <input
            v-model="formData.last_name"
            type="text"
          />
        </div>
      </div>

      <div class="input-wrapper">
        <label>Date of birth (MM/DD/YYYY)</label>
        <div class="input">
          <input
            v-model="formData.dob"
            type="text"
            maxlength="10"
            @keyup="formatDate()"
            @keydown.delete="removeDate()"
            @keypress="onlyNumbers"
          />
        </div>
      </div>

      <div class="input-wrapper">
        <label>SSN or ITIN</label>
        <div class="input toggle">
          <input
            v-model="formData.government_id"
            :type="passwordVisible ? 'text' : 'password'"
            maxlength="9"
            @keypress="onlyNumbers"
          />
          <div
            class="toggle"
            @click="togglePasswordVisible()"
          >
            <inlineSvg
              :key="count"
              :name="passwordVisible ? 'eye-slash' : 'eye'"
            />
          </div>
        </div>
        <span @click="toggleSSNModal()">
          Why do we need this
          <inlineSvg name="lock-shield" />
        </span>
      </div>

      <div class="input-wrapper">
        <label>Personal phone</label>
        <div class="input">
          <input
            v-model="formData.phone_number"
            type="tel"
            placeholder="+11234567890"
          />
        </div>
      </div>

      <div class="input-wrapper">
        <label>Personal email</label>
        <div class="input">
          <input
            v-model="formData.email"
            type="email"
          />
        </div>
      </div>
    </FormContainer>

    <SSNModal
      :show="ssnModal"
      @close="toggleSSNModal()"
    />
  </div>
</template>

<style scoped lang="scss">
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

        input {
          width: 100%;
          border: 1px solid $color-primary-50;
          background: transparent;
          padding: 18px 24px;
          border-radius: 8px;
          color: $color-primary-100;

          &:focus {
            border: 1px solid $color-primary-100;
          }
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
