<script setup>
import DeleteFlowHeader from "@/features/data-delete/atoms/DeleteFlowHeader.vue";
import DeleteFlowSubheader from "@/features/data-delete/atoms/DeleteFlowSubheader.vue";
import AtomGradientBoxWrapper from "@/library/AtomGradientBoxWrapper.vue";
import { formatPhone } from "@/scripts/format.js";
import { computed } from "vue";
import Button from "@/features/Button.vue";
import InlineSvg from "@/features/InlineSvg.vue";
import { emailCheck } from "@/scripts/regex.js"; // Import emailCheck
import { phone as phoneCheck } from "@/scripts/validation.js";

const props = defineProps({
  request: {
    type: Object,
    required: true,
  },
  hasAcceptedTerms: {
    type: Boolean,
    required: true,
  },
  changesSaved: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["handleScrollTo", "edit"]);

const fullName = computed(() => {
  const nameParts = [];
  if (props.request?.name?.first) {
    nameParts.push(props.request.name.first);
  }
  if (props?.request?.name?.middle) {
    nameParts.push(props.request.name.middle);
  }
  if (props?.request?.name?.last) {
    nameParts.push(props.request.name.last);
  }
  return nameParts.join(" ").toLowerCase();
});

const combinedAddress = computed(() => {
  const combinedAddress = [];
  if (
    props.request?.addresses?.[0]?.address1 &&
    !props.request?.addresses?.[0]?.address1
      ?.toLowerCase()
      .includes("undefined")
  ) {
    combinedAddress.push(props.request.addresses[0].address1?.toLowerCase());
  }
  if (props.request?.addresses?.[0]?.address2) {
    combinedAddress.push(props.request.addresses[0].address2?.toLowerCase());
  }
  if (props.request?.addresses?.[0]?.city) {
    combinedAddress.push(props.request.addresses[0].city?.toLowerCase());
  }
  if (props.request?.addresses?.[0]?.state) {
    if (props.request.addresses[0]?.state.length === 2) {
      combinedAddress.push(props.request.addresses[0].state?.toUpperCase());
    } else {
      combinedAddress.push(props.request.addresses[0].state?.toLowerCase());
    }
  }
  if (props.request?.addresses?.[0]?.postal_code) {
    combinedAddress.push(props.request.addresses[0].postal_code?.toUpperCase());
  }

  return combinedAddress.join(", ");
});

const isEmailValid = computed(() => {
  return props.request?.email_addresses?.some((email) => emailCheck(email));
});

const isPhoneValid = computed(() => {
  return props.request?.phone_numbers?.some((phone) => phoneCheck(phone));
});
</script>
<template>
  <div
    :key="`has-accepted-terms-${props.hasAcceptedTerms}`"
    class="delete-flow-confirmation-wrapper"
    :class="{ animate: props.hasAcceptedTerms }"
  >
    <div class="content-wrapper">
      <DeleteFlowHeader v-if="props.changesSaved && !props.hasAcceptedTerms">
        Confirm the data you want removed
      </DeleteFlowHeader>
      <DeleteFlowHeader
        v-else-if="props.changesSaved && props.hasAcceptedTerms"
      >
        You're ready to remove your info
      </DeleteFlowHeader>
      <DeleteFlowHeader v-else>Setup your data for removal</DeleteFlowHeader>

      <DeleteFlowSubheader
        v-if="props.changesSaved && props.hasAcceptedTerms"
        center
      >
        Remember the more info you remove about yourself the safer you are
        online.
      </DeleteFlowSubheader>
      <DeleteFlowSubheader
        v-else-if="!props.changesSaved"
        center
      >
        Check your info below for any missing information or edits you'd like to
        make.
      </DeleteFlowSubheader>

      <AtomGradientBoxWrapper class="form-box-wrapper">
        <h1 class="info-text full-name capitalize">
          {{ fullName }}
          <Button
            v-if="props.changesSaved && !props.hasAcceptedTerms"
            type="transparent"
            @click="emit('edit')"
          >
            <InlineSvg name="edit-pencil" />
            Edit
          </Button>
          <div
            v-if="props.changesSaved && props.hasAcceptedTerms"
            class="bubble success"
          >
            <InlineSvg name="checkmark" />
            Approved
          </div>
        </h1>

        <h2
          v-if="props.request?.birth_year"
          class="info-text"
        >
          Born in {{ props.request?.birth_year }}
        </h2>
        <h2 class="info-text capitalize">
          {{ combinedAddress }}
        </h2>
        <h2
          v-if="props.request?.phone_numbers?.length"
          class="info-text"
        >
          {{ formatPhone(props.request.phone_numbers[0]) }}
        </h2>
        <h2
          v-if="props.request?.email_addresses?.length"
          class="info-text"
        >
          {{ props.request.email_addresses[0]?.toLowerCase() }}
        </h2>

        <h2
          v-if="!fullName"
          class="missing-info-text"
          @click="emit('handleScrollTo', 'name')"
        >
          *Name required below
        </h2>

        <h2
          v-if="!props.request?.birth_year"
          class="missing-info-text"
          @click="emit('handleScrollTo', 'birth_year')"
        >
          *Birth year required below
        </h2>

        <h2
          v-if="!props.request?.addresses?.length"
          class="missing-info-text"
          @click="emit('handleScrollTo', 'addresses')"
        >
          *Address required below
        </h2>
        <h2
          v-if="!isEmailValid"
          class="missing-info-text"
          @click="emit('handleScrollTo', 'email_addresses')"
        >
          *Email required below
        </h2>
        <h2
          v-if="!isPhoneValid"
          class="missing-info-text"
          @click="emit('handleScrollTo', 'phone_numbers')"
        >
          *Phone required below
        </h2>
      </AtomGradientBoxWrapper>
    </div>
  </div>
</template>
<style scoped lang="scss">
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

.animate {
  margin-top: 20px;
  opacity: 0.5;
  animation:
    fade-in 0.5s ease-in-out forwards,
    slide-up 0.5s ease-in-out forwards;
}

.delete-flow-confirmation-wrapper {
  animation:
    fade-in 0.5s ease-in-out forwards,
    slide-up 0.5s ease-in-out forwards;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  .content-wrapper {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    padding: 0 24px;

    .bubble {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      padding: 6px 12px;
      gap: 4px;
      border-radius: 115.91px;
      border: 0.739px solid rgba($white, 0.1);
      background: transparent;
      color: $white;
      font-size: 12px;
      font-style: normal;
      font-weight: 600;
      line-height: normal;

      &.success {
        background: $color-success;
      }

      svg {
        width: 17px;
      }
    }

    .form-box-wrapper {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: flex-start;
      justify-content: flex-start;
      width: 100%;
      padding: 24px;

      .info-text {
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
        color: rgba($color-primary-100-dark, 0.7);
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: 10px;

        @at-root .theme-light & {
          color: rgba($color-primary-100-light, 0.7);
        }

        &.no-opacity {
          z-index: 1;
          color: $color-primary-100;

          @at-root .theme-light & {
            color: rgba($color-primary-100-light, 0.7);
          }
        }

        &.capitalize {
          text-transform: capitalize;
        }

        &.full-name {
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
      }

      .missing-info-text {
        font-size: 14px;
        font-style: normal;
        font-weight: 600;
        line-height: normal;
        text-decoration-line: underline;
        color: $color-primary-100;
        cursor: pointer;
      }

      .edit-button {
        font-size: 14px;
        font-style: normal;
        font-weight: 600;
        line-height: normal;
        color: $color-primary-100;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 2px;
        padding: 10px 32px;
        cursor: pointer;
        transition: all 0.3s;
        opacity: 0.9;
        transform: scale(1);
        width: 100%;

        svg {
          height: 32px;
          width: auto;
        }

        &:hover {
          transform: scale(1.02);
          opacity: 1;
          transition: all 0.3s;
        }
      }

      .add-more-wrapper {
        border-top: 1px solid rgba($white, 0.1);
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        gap: 16px;
        padding-top: 16px;
        width: 100%;

        @at-root .theme-light & {
          border-top: 1px solid rgba($black, 0.1);
        }

        .header {
          font-size: 15px;
          font-style: normal;
          font-weight: 600;
          line-height: normal;
          color: $color-primary-100;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: flex-start;
          gap: 6px;

          svg {
            height: 19px;
          }
        }

        .subheader {
          font-size: 12px;
          font-style: normal;
          font-weight: 400;
          line-height: normal;
        }

        .add-more-button {
          background: linear-gradient(46deg, #0085ff 1.19%, #67dbfc 100%);
          color: $color-primary-100-light;
        }
      }
    }
  }
}

.bubble-count {
  border-radius: 20px;
  background: linear-gradient(
    46deg,
    rgb(202 202 202 / 49%) 31.04%,
    rgb(255 255 255 / 49%) 100%
  );
  color: $color-primary-100-dark;
  font-size: 10px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  padding: 2px 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-button {
  width: calc(100% - 48px);
  max-width: calc(400px - 48px);
  margin-bottom: 40px;
}
</style>
