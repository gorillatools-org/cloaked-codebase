import { type MaybeRefOrGetter, ref } from "vue";
import { toValue } from "@vueuse/core";
import { debounce } from "lodash-es";
import type { UnwrapRef } from "vue";

export type ValidationOptions = Partial<{
  debounceTimeout: MaybeRefOrGetter<number>;
  isRequired: MaybeRefOrGetter<boolean>;
}>;

type UnwrappedObject<Object> = {
  [Key in keyof Object]: UnwrapRef<Object[Key]>;
};

export const useValidation = <Input, Options>(
  input: MaybeRefOrGetter<Input>,
  options: (ValidationOptions & Options) | undefined,
  validator: (
    input: Input,
    options: UnwrappedObject<Required<ValidationOptions>> &
      UnwrappedObject<Options>
  ) => string | null
) => {
  const error = ref<string | null>(null);

  const { isRequired, debounceTimeout, ...otherOptions } = options ?? {};

  const validate = () => {
    validateDebounced.cancel();

    const unwrappedOptions: UnwrappedObject<Required<ValidationOptions>> &
      UnwrappedObject<Options> = {
      isRequired: toValue(isRequired) ?? true,
      debounceTimeout: toValue(debounceTimeout) ?? 1000,
      ...(Object.fromEntries(
        Object.entries(otherOptions).map(([key, value]) => [
          key,
          toValue(value),
        ])
      ) as UnwrappedObject<Options>), // TODO: get rid of type assertion
    };

    error.value = validator(toValue(input), unwrappedOptions);
  };

  const validateDebounced = debounce(
    validate,
    toValue(options?.debounceTimeout) ?? 1000
  );

  return {
    error,
    validate,
    validateDebounced,
  };
};
