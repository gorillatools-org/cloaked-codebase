<script setup>
import { phoneCountries, getUserCountry } from "@/scripts/countries/countries";
import { computed, reactive, onMounted, ref } from "vue";
import store from "@/store";

const telRef = ref(null);

const emit = defineEmits(["input"]);

const props = defineProps({
  value: {
    type: String,
    default: "",
  },
});

const state = reactive({
  country: getUserCountry(store.state.authentication?.user),
  tel: props.value || "",
});

function setCountry({ iso2 }) {
  state.country = iso2;
}

onMounted(() => {
  telRef.value?.focus();
});

const tel = computed({
  get() {
    return state.tel;
  },
  set(value) {
    state.tel = value;
    if (value !== props.value) {
      emit("input", { value, country: state.country });
    }
  },
});
</script>

<template>
  <vue-tel-input
    ref="telRef"
    v-model="tel"
    autofocus
    :default-country="state.country"
    :only-countries="phoneCountries"
    :valid-characters-only="true"
    class="onboarding-input-phone"
    @country-changed="setCountry"
  />
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.onboarding-input-phone {
  padding: 8px 12px;
  height: 60px;
  background: $color-primary-5;
  border-radius: 10px !important;
  border: none !important;
  margin: 32px auto 0;
  width: calc(100% - 128px);
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  color: $color-primary-100;

  .vue-tel-input {
    box-shadow: none;
    border: none;
    width: 100%;

    .vti__input {
      background: none;
      color: $color-primary-100;
    }

    .vti__dropdown {
      position: unset;
      background: $color-primary-5;
    }

    .vti__dropdown-list {
      left: 0;
      top: 100%;
      transform: translateY(6px);
      width: 100%;
      z-index: 100;
      box-shadow:
        -22.9px -8.90123px 26.7037px rgb(1 2 24 / 5%),
        13.3518px 12.35px 26.7037px rgb(1 2 24 / 16%);
      border-radius: 8px;
      border: 1px solid $color-primary-5;
      background: $color-background;

      .vti__dropdown-item {
        color: $color-primary-100 !important;
      }
    }

    .vti__dropdown-item {
      display: flex;
      align-items: center;
      gap: 4px;
      color: $color-primary-100;
      font-size: 12px;
      line-height: 18px;

      strong {
        font-weight: 600;
      }
    }
  }

  &.settings {
    .vti__dropdown {
      .vti__dropdown-list {
        margin-left: 32px !important;
        margin-top: 0 !important;
        width: calc(100% - 64px) !important;
      }
    }
  }

  input {
    background-color: transparent;
  }

  &:focus {
    outline: 1px solid $color-primary-100;
  }

  li.vti__dropdown-item.highlighted {
    background-color: $color-primary-5;
  }

  div.vti__flag-wrapper {
    span.vti__flag.ca {
      height: 12px;
      background-image: url("@/assets/images/all_flags/rectangle/CA.png");
      background-position: center;
      background-size: contain;
      background-color: transparent;
    }
  }
}
</style>
