<script setup>
import ImportSourceOption from "@/features/import/ImportSourceOption";
import {
  IMPORT_OPTION_ONE_PASSWORD,
  IMPORT_OPTION_DASHLANE,
  IMPORT_OPTION_LASTPASS,
  IMPORT_OPTION_BITWARDEN,
  IMPORT_OPTION_KEEPER,
  IMPORT_OPTION_KEYCHAIN,
  IMPORT_OPTION_OTHER_MANAGER,
  IMPORT_OPTION_CHROME,
  IMPORT_OPTION_BRAVE,
  IMPORT_OPTION_SAFARI,
  IMPORT_OPTION_FIREFOX,
  IMPORT_OPTION_EDGE,
  IMPORT_OPTION_OPERA,
  IMPORT_OPTION_OTHER_BROWSER,
  IMPORT_OPTION_CSV,
} from "@/store/modules/accounts-importer/shared.js";
import { computed } from "vue";
const importOptions = computed(() => [
  {
    title: "Password managers",
    options: [
      { key: IMPORT_OPTION_ONE_PASSWORD, title: "1Password" },
      { key: IMPORT_OPTION_DASHLANE, title: "Dashlane" },
      { key: IMPORT_OPTION_LASTPASS, title: "LastPass" },
      { key: IMPORT_OPTION_BITWARDEN, title: "Bitwarden" },
      { key: IMPORT_OPTION_KEEPER, title: "Keeper" },
      { key: IMPORT_OPTION_KEYCHAIN, title: "Keychain" },
      { key: IMPORT_OPTION_OTHER_MANAGER, title: "Other" },
    ],
  },
  {
    title: "Browsers",
    options: [
      { key: IMPORT_OPTION_CHROME, title: "Chrome" },
      { key: IMPORT_OPTION_BRAVE, title: "Brave" },
      { key: IMPORT_OPTION_SAFARI, title: "Safari" },
      { key: IMPORT_OPTION_FIREFOX, title: "Firefox" },
      { key: IMPORT_OPTION_EDGE, title: "Microsoft Edge" },
      { key: IMPORT_OPTION_OPERA, title: "Opera" },
      { key: IMPORT_OPTION_OTHER_BROWSER, title: "Other" },
    ],
  },
  {
    title: "My computer",
    options: [{ key: IMPORT_OPTION_CSV, title: "Upload CSV file" }],
  },
]);
</script>

<template>
  <div class="import-source">
    <h1 class="import__step-title">Where are you importing from?</h1>
    <ul class="import-source__categories">
      <li
        v-for="category in importOptions"
        :key="category.title"
        class="import-source__category"
      >
        <h2 class="import-source__category-title">
          {{ category.title }}
        </h2>
        <ul>
          <li
            v-for="option in category.options"
            :key="option.key"
          >
            <ImportSourceOption :option="option" />
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
.import-source {
  &__categories {
    display: flex;
    margin-top: 16px;
  }

  &__category {
    flex: 1;
    margin-left: 24px;

    &:first-child {
      margin-left: 0;
    }

    &-title {
      font-weight: 400;
      font-size: 14px;
      line-height: 21px;
      color: $color-primary-50;
    }
  }
}
</style>
