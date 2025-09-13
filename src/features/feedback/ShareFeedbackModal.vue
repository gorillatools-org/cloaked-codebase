<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import * as Sentry from "@sentry/vue";
import ModalTemplate from "@/features/ModalTemplate.vue";
import BaseMedallion from "@/library/BaseMedallion.vue";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import BaseTextarea from "@/library/BaseTextarea.vue";
import BaseToggle from "@/library/BaseToggle.vue";
import BaseSelect from "@/library/BaseSelect.vue";
import store from "@/store";
import { useToast } from "@/composables/useToast.js";

const toast = useToast();

const emit = defineEmits(["close"]);

type FeedbackCategory =
  | "Other"
  | "Data Deletion"
  | "Call Guard"
  | "Identity Monitoring"
  | "Cloaked Phone";

type Props = {
  show: boolean;
  isReportMode?: boolean;
  categoryOptions?: Array<{ value: FeedbackCategory; label: FeedbackCategory }>;
  source?: string;
  includeCategoryInSource?: boolean;
  defaultCategory?: FeedbackCategory | "";
};

const props = withDefaults(defineProps<Props>(), {
  isReportMode: false,
  categoryOptions: () => [
    { value: "Other", label: "Other" },
    { value: "Data Deletion", label: "Data Deletion" },
    { value: "Call Guard", label: "Call Guard" },
    { value: "Identity Monitoring", label: "Identity Monitoring" },
    { value: "Cloaked Phone", label: "Cloaked Phone" },
  ],
  source: "ShareFeedbackModal",
  includeCategoryInSource: false,
  defaultCategory: "",
});

// Dynamic props based on isReportMode
const dynamicIcon = computed((): "text" | "exclamation-mark-triangle" =>
  props.isReportMode ? "exclamation-mark-triangle" : "text"
);

const dynamicColor = computed((): "cloaked" | "spirit-rose" =>
  props.isReportMode ? "spirit-rose" : "cloaked"
);

const dynamicTitle = computed((): string =>
  props.isReportMode ? "Report an issue" : "Share feedback"
);

const dynamicTextareaTitle = computed((): string =>
  props.isReportMode ? "Issue description" : "Feedback"
);

const dynamicTextareaPlaceholder = computed((): string =>
  props.isReportMode
    ? "Describe the issue you're experiencing. Include any relevant details that might help us understand and resolve the problem."
    : "Tell us about your experience, suggestions, or any issues you've encountered..."
);

const dynamicButtonText = computed((): string =>
  props.isReportMode ? "Report issue" : "Share feedback"
);

const dynamicSource = computed((): string =>
  props.isReportMode ? `${props.source}-Report` : `${props.source}-Feedback`
);

const formData = reactive({
  description: "",
  category: props.defaultCategory,
});

const isSubmitting = ref(false);
const error = ref("");

const isFormValid = computed(() => {
  const hasDescription = formData.description.trim().length > 0;
  const hasCategory = formData.category.trim().length > 0;
  return hasDescription && hasCategory;
});

const isButtonDisabled = computed(() => {
  return isSubmitting.value || !isFormValid.value;
});

const handleClose = () => {
  emit("close");
};

const user = computed(() => {
  return store.getters["authentication/user"];
});

const handleSubmit = async () => {
  if (!formData.description.trim()) {
    error.value = props.isReportMode
      ? "Please provide a description of the issue."
      : "Please provide a description of your feedback.";
    return;
  }

  if (!formData.category.trim()) {
    error.value = "Please select a category.";
    return;
  }

  error.value = "";
  isSubmitting.value = true;

  const userIdentifier = isAnonymous.value
    ? "Anonymous User"
    : user.value?.posthog_uuid;

  // Build message based on props
  const message = `[Origin: ${dynamicSource.value}][Category: ${formData.category}]: ${formData.description}`;

  try {
    Sentry.captureFeedback({
      message: message,
      name: userIdentifier,
      url: window.location.href,
      source: props.includeCategoryInSource
        ? `${dynamicSource.value}-${formData.category.replace(/ /g, "")}`
        : dynamicSource.value,
      tags: { issueCategory: formData.category },
    });

    const successMessage = props.isReportMode
      ? "Issue reported successfully"
      : "Feedback submitted successfully";
    toast.success(successMessage);
    handleClose();
  } catch {
    const errorMessage = props.isReportMode
      ? "Failed to report issue. Please try again."
      : "Failed to submit feedback. Please try again.";
    toast.error(errorMessage);
  } finally {
    isSubmitting.value = false;
  }
};

const resetForm = () => {
  formData.description = "";
  formData.category = props.defaultCategory;
  error.value = "";
};

const handleModalClose = () => {
  resetForm();
  handleClose();
};

const isAnonymous = ref(false);

function handleAnonymousToggleChange() {
  isAnonymous.value = !isAnonymous.value;
}
</script>

<template>
  <ModalTemplate
    size="medium"
    :show="show"
    class="share-feedback-modal"
    @close="handleModalClose"
  >
    <template #body>
      <div class="share-feedback-modal__form-container">
        <div class="share-feedback-modal__title">
          <BaseMedallion
            class="share-feedback-modal__medallion"
            :icon="dynamicIcon"
            :color="dynamicColor"
          />

          <BaseText
            variant="headline-2-semibold"
            as="h2"
            class="share-feedback-modal__title-text"
          >
            {{ dynamicTitle }}
          </BaseText>
        </div>

        <form
          class="share-feedback-modal__form"
          role="form"
          aria-label="Feedback form"
          @submit.prevent="handleSubmit"
        >
          <div
            v-if="error"
            class="share-feedback-modal__error"
          >
            <BaseText
              class="share-feedback-modal__error-text"
              variant="body-3-regular"
            >
              {{ error }}
            </BaseText>
          </div>

          <BaseSelect
            v-model="formData.category"
            title="Issue category"
            placeholder="Select category"
            :options="props.categoryOptions"
            aria-required="true"
          />

          <BaseTextarea
            v-model="formData.description"
            :title="dynamicTextareaTitle"
            :placeholder="dynamicTextareaPlaceholder"
            :rows="6"
            aria-required="true"
            required
          />
          <div class="share-feedback-modal__actions">
            <BaseButton
              type="submit"
              variant="primary"
              :loading="isSubmitting"
              :disabled="isButtonDisabled"
              full-width
            >
              {{ isSubmitting ? "Submitting..." : dynamicButtonText }}
            </BaseButton>
          </div>
        </form>

        <div class="share-feedback-modal__toggle">
          <BaseToggle
            :active="!isAnonymous"
            @click="handleAnonymousToggleChange"
          />
          <BaseText
            as="div"
            variant="body-3-regular"
            class="share-feedback-modal__toggle-text"
            @click="handleAnonymousToggleChange"
          >
            Share my error data to help improve Cloaked
          </BaseText>
        </div>
      </div>
    </template>
  </ModalTemplate>
</template>

<style lang="scss" scoped>
/* stylelint-disable */
.share-feedback-modal {
  &__title {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 24px;
  }
  &__toggle {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 16px;
    margin: 24px 0;

    &-text {
      cursor: pointer;
      user-select: none;

      &:hover {
        opacity: 0.8;
      }
    }
  }

  &__medallion {
    margin-bottom: 8px;
  }

  &__title-text {
    text-align: center;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__error {
    padding: 8px 12px;
    background-color: rgba($color-alert, 0.1);
    border: 1px solid $color-alert;
    border-radius: 8px;
  }

  &__error-text {
    color: $color-alert;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__success {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 40px 20px;
    text-align: center;
  }

  &__success-text {
    color: $color-status-success;
  }

  &__success-description {
    color: $color-primary-70;
  }

  &__actions {
    margin-top: 8px;
  }
}
</style>
