<script setup>
import AtomGradientBoxWrapper from "@/library/AtomGradientBoxWrapper.vue";
import AtomTagButton from "@/library/AtomTagButton.vue";
import BaseButton from "@/library/BaseButton.vue";
import { computed } from "vue";
import {
  formatAddressFromObject,
  formatNameFromObject,
  formatPhone,
} from "@/scripts/format.js";

const props = defineProps({
  request: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["addMoreInfo"]);

const otherNames = computed(() => {
  return props.request?.other_names ?? [];
});
const pastAddresses = computed(() => {
  return props.request?.addresses?.length
    ? [...props.request.addresses].slice(1)
    : [];
});
const phoneNumbers = computed(() => {
  return props.request?.phone_numbers?.length
    ? [...props.request.phone_numbers].slice(1)
    : [];
});
const emails = computed(() => {
  return props.request?.email_addresses?.length
    ? [...props.request.email_addresses].slice(1)
    : [];
});

const noSecondaryInfo = computed(() => {
  return (
    !otherNames.value.length &&
    !pastAddresses.value.length &&
    !phoneNumbers.value.length &&
    !emails.value.length
  );
});
</script>

<template>
  <div class="delete-flow-secondary-form-wrapper">
    <AtomGradientBoxWrapper class="form-box-wrapper">
      <h1 class="header-text">
        Secondary Info
        <BaseButton
          variant="primary"
          size="sm"
          icon="add-circle"
          @click="emit('addMoreInfo')"
        >
          Add
        </BaseButton>
      </h1>
      <h3
        v-if="noSecondaryInfo"
        class="subheader-text"
      >
        Improve exposure removal results by adding details like old addresses,
        other emails, and more.
      </h3>
      <h3
        v-else
        class="subheader-text"
      >
        We've added additional information we found from your scan below for
        removal.
      </h3>
      <h2
        v-if="otherNames.length"
        class="header-secondary"
      >
        Other Names
      </h2>
      <div
        v-if="otherNames.length"
        class="tag-row-wrapper"
      >
        <AtomTagButton
          v-for="name in otherNames"
          :key="`name-${name}`"
          icon="x-circle-outline"
          type="frosted"
        >
          {{ formatNameFromObject(name) }}
        </AtomTagButton>
      </div>

      <h2
        v-if="pastAddresses.length"
        class="header-secondary"
      >
        Past Addresses
      </h2>
      <div
        v-if="pastAddresses.length"
        class="tag-row-wrapper"
      >
        <AtomTagButton
          v-for="address in pastAddresses"
          :key="`address-${address}`"
          icon="x-circle-outline"
          type="frosted"
        >
          {{ formatAddressFromObject(address) }}
        </AtomTagButton>
      </div>

      <h2
        v-if="phoneNumbers.length"
        class="header-secondary"
      >
        Phone Numbers
      </h2>
      <div
        v-if="phoneNumbers.length"
        class="tag-row-wrapper"
      >
        <AtomTagButton
          v-for="phone in phoneNumbers"
          :key="`phone-${phone}`"
          icon="x-circle-outline"
          type="frosted"
        >
          {{ formatPhone(phone) }}
        </AtomTagButton>
      </div>

      <h2
        v-if="emails.length"
        class="header-secondary"
      >
        Email Addresses
      </h2>
      <div
        v-if="emails.length"
        class="tag-row-wrapper"
      >
        <AtomTagButton
          v-for="email in emails"
          :key="`email-${email}`"
          icon="x-circle-outline"
          type="frosted"
          textTransform="lowercase"
        >
          {{ email }}
        </AtomTagButton>
      </div>
    </AtomGradientBoxWrapper>
  </div>
</template>

<style scoped lang="scss">
.tag-row-wrapper {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  width: 100%;
}

.delete-flow-secondary-form-wrapper {
  @keyframes fade-in {
    0% {
      opacity: 0.5;
    }

    100% {
      opacity: 1;
    }
  }

  @keyframes slide-up {
    0% {
      margin-top: 20px;
    }

    100% {
      margin-top: 0;
    }
  }

  animation:
    fade-in 0.5s ease-in-out forwards,
    slide-up 0.5s ease-in-out forwards;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  padding: 0 24px;

  .form-box-wrapper {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-direction: column;
    gap: 16px;
    margin: 0 20px;

    .header-text {
      font-size: 18px;
      font-style: normal;
      font-weight: 600;
      line-height: normal;
      text-transform: capitalize;
      color: $color-primary-100;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .subheader-text {
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
      color: $color-primary-100;
    }

    .header-secondary {
      font-size: 14px;
      font-style: normal;
      font-weight: 600;
      line-height: normal;
      color: $color-primary-100;
      align-self: flex-start;
    }
  }
}
</style>
