<script setup>
import { ref } from "vue";
import { WEBSITE_NUMBER_LOCK_FAQ_URL } from "@/scripts/constants";
import Button from "@/features/Button.vue";
import ModalTemplate from "@/features/ModalTemplate.vue";
import PreferencesCheckParagraph from "@/routes/modals/preferences/PreferencesCheckParagraph";
import store from "@/store";

defineProps({
  mode: {
    type: String,
    default: "",
  },
});
const shouldDismissWarning = ref(false);
const emit = defineEmits(["hide-warning", "continue-number-lock"]);

const onContinue = () => {
  if (shouldDismissWarning.value) {
    emit("hide-warning");
  }
  emit("continue-number-lock");
  store.dispatch("closeModal");
};
const onCancel = () => {
  store.dispatch("closeModal");
};
const TITLE = {
  open: "Locking this number will block new senders",
  pending_expiration: "Locking this number will block new senders",
  pending_lock: "Unlocking this number will allow new senders",
};
const BODY_1 = {
  open: "Locked numbers won’t receive any new requests, texts, or calls from contacts you haven’t already approved.",
  pending_expiration:
    "Locked numbers won’t receive any new requests, texts, or calls from contacts you haven’t already approved.",
  pending_lock:
    "Unocked numbers will receive new requests, texts, or calls from contacts you haven’t already approved. If you receive no texts or calls at this number for 30 days, it will move to the expired section.",
};
const BODY_2 = {
  open: "You'll have 7 days to change your mind before this number becomes permanently locked.",
  pending_expiration:
    "You'll have 7 days to change your mind before this number becomes permanently unlocked.",
  pending_lock:
    "After that you'll have another 30 days to recovery the number before it expires.",
};
</script>
<template>
  <ModalTemplate
    class="num-locking-warning"
    :show="true"
    @close="onCancel"
  >
    <template #header>
      <div class="">
        <div>
          <h1>
            {{ TITLE[mode] }}
          </h1>
        </div>
      </div>
    </template>

    <template #body>
      <div class="num-body">
        <p>
          {{ BODY_1[mode] }}
        </p>
        <p>
          {{ BODY_2[mode] }}
        </p>
        <p>
          <a
            class="learn-more"
            :href="WEBSITE_NUMBER_LOCK_FAQ_URL"
            target="_blank"
          >
            Learn more about number locking
          </a>
        </p>
      </div>
    </template>

    <template #footer>
      <div class="flex-footer">
        <PreferencesCheckParagraph
          class="footer-center"
          :value="shouldDismissWarning"
          @input="(event) => (shouldDismissWarning = event)"
        >
          <span class="dismiss-warn">Don't show this again</span>
        </PreferencesCheckParagraph>
        <div>
          <Button
            type="secondary"
            @click="onCancel"
          >
            Cancel
          </Button>
          <Button @click="onContinue">Continue</Button>
        </div>
      </div>
    </template>
  </ModalTemplate>
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
/* stylelint-disable */
.modal-container.num-locking-warning {
  .content {
    max-width: 512px;

    .modal-header {
      h1 {
        font-size: 24px;
        line-height: normal;
      }
    }

    .modal-body {
      .num-body {
        p {
          font-size: 15px;
          margin-bottom: 24px;
          line-height: normal;
        }
      }
    }
  }

  .modal-footer {
    .footer-center {
      align-items: center;
    }

    .flex-footer {
      display: flex;
      width: 100%;
      justify-content: space-between;

      button {
        margin-right: 8px;
      }
    }
  }
}

.dismiss-warn {
  font-size: 13px;
  font-weight: 500;
  color: $color-primary-100;
}

.learn-more {
  font-weight: 500;
  text-decoration: underline;
}
</style>
