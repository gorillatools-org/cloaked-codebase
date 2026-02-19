import { reactive } from "vue";
export const toastState = reactive({
  message: null,
  type: null,
  show: false,
});

const offsetTime = 3.5 * 1000;
let timeout;
function reset() {
  toastState.show = false;

  clearTimeout(timeout);
  timeout = setTimeout(() => {
    toastState.message = null;
    toastState.type = null;
  }, 1000);
}

function showCloak(type, content) {
  toastState.type = type;
  toastState.message = content;
  toastState.show = true;

  clearTimeout(timeout);
  timeout = setTimeout(reset, offsetTime);
}

export function useToast() {
  function success(message) {
    showCloak("success", message);
  }
  function error(messageOrError) {
    let errorMessage = "An error occurred. Please try again.";

    if (typeof messageOrError === "string") {
      errorMessage = messageOrError;
    } else if (messageOrError?.response?.data) {
      const errorData = messageOrError.response.data;
      let constructedErrors = null;

      // Check for the `errors` field and construct the error string
      if (errorData?.errors) {
        if (typeof errorData.errors === "string") {
          constructedErrors = errorData.errors;
        } else if (Array.isArray(errorData.errors)) {
          constructedErrors = errorData.errors.join(", ");
        } else {
          constructedErrors = JSON.stringify(errorData.errors); // Fallback for unexpected formats
        }
      }

      // Use constructed errors or fallback to other logic
      if (constructedErrors) {
        // If there's a custom message, prepend it
        if (messageOrError?.customMessage) {
          errorMessage = `${messageOrError.customMessage}: ${constructedErrors}`;
        } else {
          errorMessage = constructedErrors;
        }
      } else if (errorData?.message) {
        // General error case
        errorMessage = errorData.message;
      } else if (typeof errorData === "object" && !Array.isArray(errorData)) {
        // Validation error case
        errorMessage = Object.entries(errorData)
          .map(([field, messages]) => `${field}: ${messages?.join("\n")}`)
          .join("\n");
      }
    }

    showCloak("error", errorMessage);
  }
  return {
    success,
    error,
  };
}
