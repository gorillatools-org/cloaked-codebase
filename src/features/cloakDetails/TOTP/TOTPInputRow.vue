<script setup>
import { useAttrs } from "vue";
import TOTPToken from "@/features/cloakDetails/TOTP/TOTPToken.vue";
import AppTooltipIntro from "@/features/ui/AppTooltipIntro.vue";
import CloakInfoRow from "@/features/cloakDetails/CloakInfoRow.vue";
defineEmits(["set-totp-token", "set-is-totp-intro-displayed"]);
const attrs = useAttrs();
</script>

<template>
  <AppTooltipIntro
    :value="attrs['is-totp-intro-displayed']"
    :has-click-open="false"
    :has-click-close="false"
    :has-outside-click-close="true"
    class="totp-identifier"
    @input.self="$emit('set-is-totp-intro-displayed', $event)"
  >
    <CloakInfoRow
      v-bind="attrs"
      field="one-time passcode"
      placeholder="Add one-time passcode"
      :field-type="'totp'"
      :initial-value="attrs.totp?.value"
      :copy-value="attrs['totp-token']"
      :loading="attrs.loading"
      :error="!!attrs.errors"
      :identity-id="attrs['identity-id']"
    >
      <template #input="{ isEditable }">
        <TOTPToken
          v-if="attrs.totp?.value && !isEditable"
          :url="
            attrs.totp?.value.startsWith('otpauth://')
              ? attrs.totp?.value
              : undefined
          "
          :secret="
            attrs.totp?.value.startsWith('otpauth://')
              ? undefined
              : attrs.totp?.value
          "
          @new-token="$emit('set-totp-token', $event)"
        />
      </template>

      <template
        v-if="!attrs.totp?.value"
        #tooltip
      >
        Type a secret key or otpauth link
      </template>
    </CloakInfoRow>
    <template #content>
      Type or paste in your one-time passcode secret key or otpauth link.
      <br />
      <button @click="$emit('set-is-totp-intro-displayed', false)">
        Got it
      </button>
    </template>
  </AppTooltipIntro>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.totp-identifier {
  .app-tooltip-intro__chevron {
    top: 32px;
  }
}
</style>
