<script setup>
import Check from "@/assets/icons/check.svg";
import { computed } from "vue";

const props = defineProps({
  password: { type: String, default: "" },
});

const emit = defineEmits(["passwordStrengthVal", "passwordStrengthCheck"]);

const passwordStrength = computed(() => {
  let strengthCount = 0;
  if (passwordHasCorrectLength.value) {
    strengthCount += 1;
  }
  if (passwordHasUpperCase.value && passwordHasLowerCase.value) {
    strengthCount += 1;
  }
  if (passwordHasNumber.value && passwordHasSymbol.value) {
    strengthCount += 1;
  }
  if (strengthCount === 3) {
    emit("passwordStrengthCheck", true);
  } else {
    emit("passwordStrengthCheck", false);
  }
  return ["", "one", "two", "three"][strengthCount];
});
const passwordHasCorrectLength = computed(() => {
  const userPassword = props.password || "";
  return userPassword.length > 11 && userPassword.length <= 256;
});
const passwordHasUpperCase = computed(() => {
  const userPassword = props.password || "";
  return userPassword.match(/[A-Z]+/);
});
const passwordHasLowerCase = computed(() => {
  const userPassword = props.password || "";
  return userPassword.match(/[a-z]/);
});
const passwordHasNumber = computed(() => {
  const userPassword = props.password || "";
  return userPassword.match(/[0-9]/);
});
const passwordHasSymbol = computed(() => {
  const userPassword = props.password || "";
  return userPassword.match(/[ !"#$%&'()^*+,-./:;<=>?@[\]_`{|}~\\]/);
});
const passwordHasValue = computed(() => {
  return props.password;
});
</script>

<template>
  <div
    class="password-check"
    :class="passwordStrength"
  >
    <ul>
      <li
        :class="{
          success: passwordHasCorrectLength,
          error: passwordHasValue && !passwordHasCorrectLength,
        }"
      >
        <Check v-if="passwordHasCorrectLength" />
        <span v-else />

        Between 12 and 256 characters
      </li>
      <li
        :class="{
          success: passwordHasUpperCase,
          error: passwordHasValue && !passwordHasUpperCase,
        }"
      >
        <Check v-if="passwordHasUpperCase" />
        <span v-else />
        1 Uppercase letter
      </li>
      <li
        :class="{
          success: passwordHasLowerCase,
          error: passwordHasValue && !passwordHasLowerCase,
        }"
      >
        <Check v-if="passwordHasLowerCase" />
        <span v-else />
        1 Lowercase letter
      </li>
      <li
        :class="{
          success: passwordHasNumber,
          error: passwordHasValue && !passwordHasNumber,
        }"
      >
        <Check v-if="passwordHasNumber" />
        <span v-else />
        1 Number
      </li>
      <li
        :class="{
          success: passwordHasSymbol,
          error: passwordHasValue && !passwordHasSymbol,
        }"
      >
        <Check v-if="passwordHasSymbol" />
        <span v-else />
        1 Symbol
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
/* stylelint-disable */
.password-check {
  font-size: 13px;
  font-family: $global-font;
}

ul {
  li {
    &.success {
      color: $color-success !important;
    }

    &.error {
      color: $color-alert !important;
    }

    svg {
      margin-right: 4px;
    }

    span {
      display: inline-block;
      height: 4px;
      width: 4px;
      border-radius: 4px;
      background-color: $color-primary-100;
      margin: 3px 6px;
    }
  }
}
</style>
