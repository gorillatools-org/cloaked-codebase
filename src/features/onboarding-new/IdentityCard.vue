<script setup>
import { useToast } from "@/composables/useToast.js";
import { phone_format } from "@/scripts/format";
import { NO_URL_IDENTITY_DOMAIN } from "@/scripts/constants";
import IdentityIcon from "@/features/ui/IdentityIcon.vue";
import InlineSvg from "@/features/InlineSvg.vue";
import { computed, reactive } from "vue";
import { tools } from "@/scripts/tools";
import BaseTextHiddenDots from "@/library/BaseTextHiddenDots.vue";

const toast = useToast();
const props = defineProps({
  country: {
    type: String,
    required: true,
  },
  identity: {
    type: Object,
    /* This is so we can fake the identity not being
    ready yet on step 2 of onboardig at time of writing */
    required: false,
    default: null,
  },
  /* For ease of display in generation > display generated */
  fields: {
    type: Array,
    required: true,
  },
  isLoading: {
    type: Boolean,
    required: true,
  },
});

const state = reactive({
  passwordVisible: true,
});

const website = computed(() => {
  if (
    props.identity?.website_url?.length &&
    !props.identity?.website_url?.includes(NO_URL_IDENTITY_DOMAIN)
  ) {
    return props.identity?.website_url;
  } else if (
    props.identity?.website?.base_domain?.length &&
    !props.identity?.website?.base_domain?.includes(NO_URL_IDENTITY_DOMAIN)
  ) {
    return props.identity?.website?.base_domain;
  }
  return null;
});

const handleCopyClick = (value, method) => {
  /* Using for posthog */
  if (method) {
    method();
  }
  tools.copyToClipboard(value);
  toast.success("Copied to clipboard");
};

function openWebsite() {
  window.open(website.value, "_blank");
}
</script>
<template>
  <div class="identity-card">
    <div class="identity-card__content">
      <div
        v-if="identity?.nickname"
        class="identity-card__id-icon"
      >
        <IdentityIcon
          :identity="{
            logo_url: null,
            cloak_brand_color: identity.cloak_brand_color,
          }"
          :override="{
            width: '55px',
            height: '55px',
          }"
        />
      </div>
      <div
        v-if="props.identity?.nickname"
        class="identity-card__identity-name"
      >
        <span>{{ props.identity.nickname }}</span>
      </div>
      <div
        v-if="!!website?.length"
        class="identity-card__identity-website"
        @click="openWebsite"
      >
        <span>
          {{
            props.identity?.website_url || props.identity?.website?.base_domain
          }}
        </span>
        <InlineSvg name="arrow-ne" />
      </div>
    </div>

    <div class="identity-card-fields__status">
      <div
        v-for="field in props.fields"
        :key="field.id"
        class="widget"
      >
        <div class="widget__wrap">
          <div class="widget__icon-btn">
            <InlineSvg
              v-if="field.type === 'phone'"
              class="phone-color"
              name="onboarding-new/phone-icon"
            />
            <InlineSvg
              v-if="field.type === 'email'"
              class="email-color"
              name="onboarding-new/email-icon"
            />
            <InlineSvg
              v-if="field.type === 'password'"
              class="password-color"
              name="key-filled"
            />
          </div>
          <div
            v-if="!isLoading && field.type === 'phone'"
            class="widget__field-value"
          >
            {{ phone_format(field.value, props.country) }}
          </div>
          <template v-else-if="!isLoading">
            <BaseTextHiddenDots
              v-if="field.type === 'password' && !state.passwordVisible"
              :count="16"
              variant="body-small-medium"
              class="widget__field-value"
            />

            <div
              v-else
              class="widget__field-value"
            >
              {{ field.value }}
            </div>
          </template>

          <div
            v-else
            class="widget__field-value"
          >
            Generating...
          </div>
        </div>
        <div class="icon-row">
          <InlineSvg
            v-if="!isLoading && field.type === 'password'"
            :key="state.passwordVisible ? 'eye-slash' : 'eye'"
            :name="state.passwordVisible ? 'eye-slash' : 'eye'"
            @click="state.passwordVisible = !state.passwordVisible"
          />
          <InlineSvg
            v-if="!isLoading"
            name="copy"
            @click="handleCopyClick(field.value, field?.method)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.identity-card {
  border-radius: 16px;
  background-blend-mode: screen;
  padding: 8px 16px 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  cursor: pointer;
  gap: 13px;
  flex-direction: column;
  width: 100%;
  margin-top: 26px;
  background: rgba($color-primary-100-light, 0.1);
  box-shadow: 0 10px 10px 0 rgba($color-primary-1-light, 0.1);

  @at-root .theme-dark & {
    background: rgba($color-primary-100-dark, 0.1);
    box-shadow: 0 10px 10px 0 rgba($color-primary-1-dark, 0.1);
  }

  &__content {
    display: flex;
    flex-direction: column;
    width: 100%;
    text-align: center;
    margin: 0 auto;
  }

  &__id-icon {
    margin: 0 auto;
    padding: 12px 8px;
  }

  &__status {
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;

    &--info-required {
      color: $color-info;
    }

    &--review-required {
      color: $color-info;
    }

    &--submitting,
    &--submitted {
      color: $color-success;
    }
  }

  &__identity-name {
    font-size: 20px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
    color: $color-primary-100;
    width: 100%;
    text-align: center;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 9px;
  }

  &__identity-website {
    font-size: 13px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    color: $color-primary-70;
    gap: 8px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    transition: opacity 0.3s;

    svg {
      height: 12px;
      width: auto;
    }

    &:hover {
      opacity: 0.5;
      transition: opacity 0.3s;
    }
  }
}

.identity-card-fields__status {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
  width: 100%;

  .widget {
    display: flex;
    justify-content: space-between;
    width: 100%;
    border-radius: 16px;
    flex-direction: row;
    align-items: center;
    font-size: 12px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    color: $color-primary-100;
    height: 64px;
    padding: 16px;
    background-color: red;
    background: rgba($color-primary-100-light, 0.1);

    @at-root .theme-dark & {
      background: rgba($color-primary-100-dark, 0.1);
    }

    .icon-row {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 12px;
      transition: opacity 0.3s;

      svg {
        &:hover {
          opacity: 0.5;
          transition: opacity 0.3s;
        }
      }
    }

    &__wrap {
      display: flex;
    }

    &__icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 33px;
      width: 33px;
      margin-right: 10px;
      border-radius: 8px;
      background: rgba($color-primary-100-light, 0.1);
      box-shadow: 0 10px 10px 0 rgba($color-primary-1-light, 0.1);

      @at-root .theme-dark & {
        background: rgba($color-primary-100-dark, 0.1);
        box-shadow: 0 10px 10px 0 rgba($color-primary-1-dark, 0.1);
      }

      > svg {
        width: 20px;
        height: auto;

        &.password-color {
          height: 20px !important;
          width: auto !important;
        }
      }

      .phone-color {
        color: $color-brand-2-100-light;
      }

      .email-color {
        color: $color-brand-3-100;
      }

      .password-color {
        color: $color-warning;

        > svg {
          height: 20px !important;
          width: auto !important;
        }
      }
    }

    &__field-value {
      display: flex;
      margin: auto 0;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      max-width: 90%;
      &.pasword-dots {
        font-size: $font-size-hidden-dots;
      }
    }

    .in-progress {
      color: $color-in-progress;
      font-size: 24px;
      font-style: normal;
      font-weight: 600;
      line-height: normal;
    }

    .completed {
      color: $color-success;
      font-size: 24px;
      font-style: normal;
      font-weight: 600;
      line-height: normal;

      span {
        svg {
          height: 17px;
          width: auto;
          margin-left: 5px;
        }
      }
    }
  }
}
</style>
