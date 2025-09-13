<script setup>
import { capitalize } from "lodash-es";
import ImportUploadFile from "@/features/import/ImportUploadFile";
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
import { ref, computed, onMounted, defineAsyncComponent } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const isGuideScrolled = ref(false);
const guide = ref(null);
const source = computed(() => {
  const source = route.params.source || IMPORT_OPTION_CSV;
  return [IMPORT_OPTION_OTHER_BROWSER, IMPORT_OPTION_OTHER_MANAGER].includes(
    source
  )
    ? IMPORT_OPTION_CSV
    : source;
});
const title = computed(() => {
  const sourceTitleMap = {
    [IMPORT_OPTION_ONE_PASSWORD]: "1Password",
    [IMPORT_OPTION_DASHLANE]: "Dashlane",
    [IMPORT_OPTION_LASTPASS]: "LastPass",
    [IMPORT_OPTION_BITWARDEN]: "Bitwarden",
    [IMPORT_OPTION_KEEPER]: "Keeper",
    [IMPORT_OPTION_KEYCHAIN]: "Keychain",
    [IMPORT_OPTION_OTHER_MANAGER]: "other password manager",
    [IMPORT_OPTION_CHROME]: "Chrome",
    [IMPORT_OPTION_BRAVE]: "Brave",
    [IMPORT_OPTION_SAFARI]: "Safari",
    [IMPORT_OPTION_FIREFOX]: "Firefox",
    [IMPORT_OPTION_EDGE]: "Microsoft Edge",
    [IMPORT_OPTION_OPERA]: "Opera",
    [IMPORT_OPTION_OTHER_BROWSER]: "other browser",
    [IMPORT_OPTION_CSV]: "my computer",
  };

  return sourceTitleMap[source.value];
});
const comp = computed(() =>
  defineAsyncComponent(() =>
    source.value === "1-password"
      ? import(`@/features/import/Guide1Password.vue`)
      : import(`@/features/import/Guide${capitalize(source.value)}.vue`)
  )
);
function updateIsGuideScrolled() {
  isGuideScrolled.value = guide.value.scrollTop > 0;
}
onMounted(() => {
  guide.value.addEventListener("scroll", updateIsGuideScrolled);
});
</script>

<template>
  <div class="import-upload">
    <h1 class="import__step-title">Upload file from {{ title }}</h1>
    <div class="import-upload__instructions">
      <div class="import-upload__column">
        <div class="import-upload__step-header">
          <span class="import-upload__step-number">1</span>
          <h2 class="import-upload__step-title">
            Download CSV file from {{ title }}
          </h2>
        </div>
        <hr
          class="import-upload__divider"
          :class="{
            'import-upload__divider--with-shadow': isGuideScrolled,
          }"
        />
        <div
          ref="guide"
          class="import-upload__guide"
        >
          <Component :is="comp" />
        </div>
      </div>
      <div class="import-upload__column">
        <div class="import-upload__step-header">
          <span class="import-upload__step-number">2</span>
          <h2 class="import-upload__step-title">Upload CSV file</h2>
        </div>
        <ImportUploadFile class="import-upload__upload-file" />
      </div>
    </div>
  </div>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.import-upload {
  max-height: 100%;
  display: flex;
  flex-direction: column;

  &__divider {
    border: 1px solid $color-primary-20;
    position: relative;
    z-index: 1;
    margin: 0;
    transition: all 0.1s ease;

    &--with-shadow {
      box-shadow:
        0 0 12px rgba(0, 0, 0, 0.04),
        0 1px 4px rgba(1, 2, 24, 0.08);
    }
  }

  &__instructions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 24px;
    margin-top: 16px;
    overflow: hidden;
    margin-bottom: -24px;
  }

  &__step {
    &-header {
      display: flex;
      margin: 16px 0;
    }

    &-number {
      width: 32px;
      height: 32px;
      border-radius: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
      line-height: 21px;
      text-align: center;
      flex-shrink: 0;
      background: $color-primary-10;
      color: $color-primary-100;
    }

    &-title {
      margin-left: 12px;
      margin-top: 6px;
      font-size: 14px;
      line-height: 21px;
      color: $color-primary-100;
      font-weight: 500;
    }
  }

  &__column {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__guide {
    overflow: auto;
    padding: 4px 0 16px;
    @include custom-scroll-bar;
  }
}

.import-guide {
  &__screenshot {
    display: block;
    margin-top: 24px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 8px;

    &:last-child {
      margin-bottom: 14px;
    }
  }

  li {
    margin-top: 12px;
    padding: 24px 24px 24px 72px;
    background: $color-primary-5;
    border: 1px solid $color-primary-20;
    color: $color-primary-100;
    border-radius: 16px;
    position: relative;
    font-size: 14px;
    line-height: 21px;

    strong,
    a {
      font-weight: 500;
      color: inherit;
    }

    a {
      text-decoration: underline;
    }

    .tip {
      margin-top: 24px;
    }

    em {
      font-weight: 400;
    }

    &::before {
      position: absolute;
      left: 36px;
      transform: translate3d(-50%, -6px, 0);
      width: 32px;
      height: 32px;
      border-radius: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
      line-height: 21px;
      text-align: center;
      flex-shrink: 0;
      background: $color-primary-1;
      border: 1px solid $color-primary-5;
      box-shadow:
        0 0 12px rgba(0, 0, 0, 0.04),
        0 1px 4px rgba(1, 2, 24, 0.08);
      color: $color-primary-100;
    }

    @for $i from 1 to 5 {
      &:nth-child(#{$i}) {
        &::before {
          content: "#{$i}";
        }
      }
    }
  }
}
</style>
