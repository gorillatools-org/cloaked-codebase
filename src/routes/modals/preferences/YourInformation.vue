<script setup>
import { capitalize } from "lodash-es";
import moment from "moment";

import CreditCard from "@/routes/modals/preferences/CreditCard";

import Name from "@/routes/modals/preferences/YourInformation/Name";
import Gender from "@/routes/modals/preferences/YourInformation/Gender";
import Address from "@/routes/modals/preferences/YourInformation/Address";
import Payment from "@/routes/modals/preferences/YourInformation/Payment";
import Birthday from "@/routes/modals/preferences/YourInformation/Birthday";
import PreferencesTitle from "@/routes/modals/preferences/PreferencesTitle";
import PreferencesPanel from "@/routes/modals/preferences/PreferencesPanel";
import ValueDisplay from "@/features/ui/value-display";
import PersonalInfoService from "@/api/settings/personal-services";
import store from "@/store";
import { useToast } from "@/composables/useToast.js";
import { onBeforeMount, onMounted, reactive, computed, nextTick } from "vue";
import SettingsParagraph from "@/features/Settings/SettingsParagraph.vue";

const toast = useToast();

const state = reactive({
  infoId: null,
  firstName: null,
  lastName: null,
  birthday: null,
  gender: null,
  autofill_street_address: null,
  autofill_unit: null,
  autofill_country: null,
  autofill_address_level1: null,
  autofill_address_level2: null,
  autofill_postal_code: null,
  creditCards: [],
  selectedCard: null,
});

const isV2User = computed(() => {
  return store?.state?.authentication?.user?.encryption_status === 3;
});

const showCCSection = computed(() => {
  return isV2User.value;
});

const birthdayFormatted = computed(() => {
  if (state.birthday) {
    return moment(state.birthday, "").format("MM/DD/YYYY");
  }
  return null;
});

const address = computed(() => {
  return {
    autofill_street_address: state.autofill_street_address,
    autofill_unit: state.autofill_unit,
    autofill_country: state.autofill_country,
    autofill_address_level1: state.autofill_address_level1,
    autofill_address_level2: state.autofill_address_level2,
    autofill_postal_code: state.autofill_postal_code,
  };
});

const addressFormatted = computed(() => {
  // UI shows: Street, Apt, City (level2), State/Province (level1), Country, Postal Code
  const {
    autofill_street_address,
    autofill_unit,
    autofill_address_level1,
    autofill_address_level2,
    autofill_country,
    autofill_postal_code,
  } = address.value;

  const existingParts = [
    autofill_street_address,
    autofill_unit,
    autofill_address_level2, // city
    autofill_address_level1, // state/province
    autofill_country,
    autofill_postal_code,
  ].filter((part) => part);

  return existingParts.length > 0 ? existingParts.join(", ") : "";
});

const rightSideDisplay = computed(() => {
  return store?.state?.ui?.preference?.right;
});

const nameFormatted = computed(() => {
  const name = `${state.firstName || ""} ${state.lastName || ""}`
    .replaceAll(/\s+/g, " ")
    .trim();
  if (name.length > 0) {
    return name;
  }
  return null;
});

onMounted(() => {
  refreshCards();
});

onBeforeMount(() => {
  const isAutofillEmpty =
    store.state.autofill && !Object.keys(store.state.autofill).length;
  if (isAutofillEmpty) {
    PersonalInfoService.getInfo().then(() => {
      setAutofillData();
    });
  } else {
    setAutofillData();
  }
});

function selectCard(selectedCard) {
  state.selectedCard = selectedCard;
  nextTick(() => navRight("payment"));
}

function refreshCards() {
  return PersonalInfoService.getAutofillCards().then(({ data }) => {
    state.creditCards = data.results;
  });
}

function back(message) {
  if (message) {
    toast.success(message);
  }
  navRight("");
}

function handleUpdateValue({ name, value }) {
  state[name] = value;
}

function navRight(panel) {
  if (panel) {
    store.commit("openPreference", {
      selected: "your_information",
      right: panel,
    });
  } else {
    store.commit("openPreference", { selected: "your_information" });
  }
}

function toggleBack(data) {
  if (data) {
    Object.keys(data).map((key) => {
      state[key] = data[key];
    });
  }
  store.commit("openPreference", { selected: "your_information" });
  setAutofillData();
}

function setAutofillData() {
  const result = store.state.autofill;
  if (result) {
    state.infoId = result.id;
    state.firstName = result.first_name;
    state.lastName = result.last_name;
    state.birthday = result.dob ? result.dob : "";
    state.gender = result.sex;
    state.autofill_street_address = result.street_address;
    state.autofill_unit = result.unit;
    state.autofill_country = result.country;
    // Backend stores address_level1/2 opposite of our UI: level1=city, level2=state.
    // Normalize here so UI uses level1=state, level2=city.
    state.autofill_address_level1 = result.address_level2; // state/province
    state.autofill_address_level2 = result.address_level1; // city
    state.autofill_postal_code = result.postal_code;
  }
}
</script>

<template>
  <PreferencesPanel class="preference-dual-panel">
    <div
      v-if="!rightSideDisplay"
      class="your-pref-top"
    >
      <PreferencesTitle>Basic information</PreferencesTitle>

      <ValueDisplay
        label="Name"
        :value="nameFormatted"
        name="infoName"
        @click="navRight('infoName')"
      />

      <ValueDisplay
        label="Birthday"
        :value="birthdayFormatted"
        name="birthday"
        @click="navRight('birthday')"
      />
      <ValueDisplay
        label="Gender"
        :value="capitalize(state.gender)"
        name="gender"
        @click="navRight('gender')"
      />
      <ValueDisplay
        label="Address"
        :value="addressFormatted"
        name="address"
        @click="navRight('address')"
      />
      <PreferencesTitle v-if="showCCSection">Payment methods</PreferencesTitle>

      <SettingsParagraph v-if="showCCSection">
        Cloaked can securely store your stored payment information to
        automatically fill out forms via the extension or autofill on your
        mobile device.
      </SettingsParagraph>
      <div
        v-if="showCCSection"
        style="margin-top: 20px"
      >
        <CreditCard
          v-for="(card, index) in state.creditCards"
          :key="index"
          :card="card"
          @refresh="refreshCards"
          @click="selectCard(card)"
        />
        <ValueDisplay
          label="Add a credit or debit card"
          :value="''"
          name="infoName"
          @click="selectCard(null)"
        />
      </div>
    </div>

    <Name
      v-if="rightSideDisplay === 'infoName'"
      :id="state.infoId"
      :first-name="state.firstName"
      :last-name="state.lastName"
      @toggle-back="toggleBack"
    />

    <Birthday
      v-if="rightSideDisplay === 'birthday'"
      :id="state.infoId"
      :birthday="state.birthday"
      @toggle-back="toggleBack"
    />

    <Gender
      v-if="rightSideDisplay === 'gender'"
      :id="state.infoId"
      :gender="state.gender"
      @toggle-back="toggleBack"
    />

    <Address
      v-if="rightSideDisplay === 'address'"
      :id="state.infoId"
      :current="address"
      @toggle-back="toggleBack"
      @update="handleUpdateValue"
    />

    <div
      v-if="showCCSection"
      class="payment-section"
    >
      <Payment
        v-if="rightSideDisplay === 'payment'"
        :id="state.infoId"
        :current="address"
        :selected-card="state.selectedCard"
        :credit-cards="state.creditCards"
        @toggle-back="toggleBack"
        @update="handleUpdateValue"
        @refresh="refreshCards"
        @back="back"
      />
    </div>
  </PreferencesPanel>
</template>

<style lang="scss" scoped>
.your-pref-top {
  &__rows {
    margin-top: 24px;
  }
}

.payment-section {
  margin-bottom: 40px;
}
</style>
