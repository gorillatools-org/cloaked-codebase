<script setup>
import { ref } from "vue";
import ModalTemplate from "@/features/ModalTemplate";
import UiSwitchInput from "@/features/UiSwitchInput";
import CardsServices from "@/api/actions/cards-services";
import BaseText from "@/library/BaseText.vue";

const props = defineProps({
  source: {
    type: Object,
    default: () => ({}),
  },
  show: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const emit = defineEmits(["close"]);

function submitForm() {
  const payload = {
    auto_debit: autopay.value,
  };
  CardsServices.patchUpdateCardDetails(props.source.id, payload).then(() => {
    emit("close");
  });
}

const autopay = ref(true);

function changeToggle() {
  autopay.value = !autopay.value;
}
</script>

<template>
  <ModalTemplate
    :show="props.show"
    no-close
    width="375px"
  >
    <template #body>
      <div class="modal-content">
        <div class="header">
          <BaseText
            as="div"
            variant="headline-3-bold"
          >
            AutoPay enrollment
          </BaseText>
          <BaseText
            as="div"
            variant="headline-6-medium"
            class="subtitle"
          >
            Automatically process Cloaked Pay transactions from this selected
            funding source by enrolling in AutoPay.
          </BaseText>
        </div>

        <div class="detail-section">
          <BaseText variant="body-2-semibold">AutoPay</BaseText>
          <UiSwitchInput
            :value="autopay"
            @change="changeToggle()"
          />
        </div>

        <BaseText
          v-if="autopay === false"
          as="p"
          variant="headline-6-medium"
          class="terms"
        >
          By electing not to AutoPay, all amounts owed must be paid for
          continued use of Cloaked Pay. Outstanding virtual card balances must
          be settled by the end of your payment cycle.
        </BaseText>

        <div class="footer">
          <button @click="submitForm()">Save</button>
          <BaseText
            as="a"
            variant="body-small-medium"
            href="https://assets.website-files.com/63ec0f977f0357126ec38bcd/65739549713435a950a7520d_AutoPay%20Authorization%20Terms.pdf"
            target="_blank"
          >
            AutoPay Terms &amp; Conditions
          </BaseText>
        </div>
      </div>
    </template>
  </ModalTemplate>
</template>

<style lang="scss" scoped>
.modal-content {
  padding: 38px 0px;
  color: $color-primary-100;

  .header {
    margin-bottom: 24px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 24px;

    .subtitle {
      color: $color-primary-70;
    }
  }

  .detail-section {
    border: 1px solid $color-primary-10;
    border-radius: 12px;
    padding: 24px 16px;
    position: relative;

    span {
      color: $color-primary-100;
    }

    .ui-switch-input {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
    }
  }

  .terms {
    color: $color-primary-70;
    text-align: center;
    margin-top: 8px;
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: column;
    flex-wrap: wrap;
    margin-top: 24px;
    width: 100%;

    button {
      width: 100%;
      background-color: $color-primary-100;
      color: $color-primary-1;
      padding: 11px;
      border: 0;
      border-radius: 40px;

      &:hover {
        background-color: $color-primary-90;
        cursor: pointer;
      }
    }

    a {
      text-decoration-line: underline;
      display: inline-block;
      margin-top: 16px;
    }
  }
}
</style>
