import { ref } from "vue";
import { toValue } from "@vueuse/core/index";
import { debounce } from "lodash-es";

export const useValidation = (
  input,
  { debounceTimeout = 1000, isRequired = true, ...validatorArgs } = {},
  validator
) => {
  const error = ref(null);

  const validate = () => {
    validateDebounced.cancel();

    error.value = validator(toValue(input), {
      isRequired: toValue(isRequired),
      ...Object.keys(validatorArgs).reduce(
        (result, key) => ({
          ...result,
          [key]: toValue(validatorArgs[key]),
        }),
        {}
      ),
    });
  };

  const validateDebounced = debounce(validate, debounceTimeout);

  return {
    error,
    validate,
    validateDebounced,
  };
};
