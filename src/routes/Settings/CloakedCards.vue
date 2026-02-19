<script setup>
import { onMounted } from "vue";
import {
  WEBSITE_TERMS_OF_SERVICE_URL,
  WEBSITE_PRIVACY_POLICY_URL,
  WEBSITE_PAY_AGREEMENTS_URL,
} from "@/scripts/constants";
import SettingsChildPage from "./SettingsChildPage.vue";
import CloakedCards from "@/routes/modals/preferences/CloakedCards.vue";
import SettingsTitle from "@/features/Settings/SettingsTitle.vue";
import SettingsParagraph from "@/features/Settings/SettingsParagraph.vue";
import BaseText from "@/library/BaseText.vue";
import { posthogCapture } from "@/scripts/posthog.js";

onMounted(() => {
  posthogCapture("pay_wallet_settings_viewed");
});
</script>

<template>
  <SettingsChildPage>
    <template #aside>
      <SettingsTitle>Cloaked Pay</SettingsTitle>
      <SettingsParagraph>
        Keep your personal cards protected with Cloaked Pay - powered by
        Mastercard.
        <BaseText
          as="a"
          variant="headline-6-medium"
          underline
          :href="WEBSITE_PAY_AGREEMENTS_URL"
          target="_blank"
        >
          Cloaked Pay agreements.
        </BaseText>
      </SettingsParagraph>
      <SettingsParagraph>
        For more information, please take a look at the
        <BaseText
          as="a"
          variant="headline-6-medium"
          underline
          :href="WEBSITE_TERMS_OF_SERVICE_URL"
          target="_blank"
        >
          {{ "Terms of Service" }}
        </BaseText>
        {{ " and " }}
        <BaseText
          as="a"
          variant="headline-6-medium"
          underline
          :href="WEBSITE_PRIVACY_POLICY_URL"
          target="_blank"
        >
          Privacy Policy.
        </BaseText>
      </SettingsParagraph>
    </template>

    <CloakedCards />
  </SettingsChildPage>
</template>
