<script setup>
import Email from "@/assets/icons/email-outline.svg";
import Password from "@/assets/icons/key.svg";
import Phone from "@/assets/icons/phone-outline.svg";
import Username from "@/assets/icons/user-icon.svg";
import Website from "@/assets/icons/link-chain.svg";
import Notes from "@/assets/icons/lock-shield.svg";
import Cloaked from "@/assets/icons/lock.svg";
import Name from "@/assets/icons/people.svg";
import Totp from "@/assets/icons/totp.svg";

defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) =>
      [
        "name",
        "email",
        "password",
        "phone",
        "username",
        "website",
        "notes",
        "cloaked",
        "totp",
      ].includes(value),
  },
});

const iconByType = {
  name: Name,
  email: Email,
  password: Password,
  phone: Phone,
  username: Username,
  website: Website,
  notes: Notes,
  cloaked: Cloaked,
  totp: Totp,
};
</script>

<template>
  <Component
    :is="iconByType[type]"
    class="identity-field-icon"
  />
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.identity-field-icon {
  color: $color-primary-100;
  width: 20px;
  height: 20px;
}
</style>
