import { computed, watch } from "vue";
import { phone as formatPhone } from "phone";
import { useUserPhoneVerification } from "@/features/data-delete/composables/useUserPhoneVerification";
import { useRoute } from "vue-router";
import { useUserPhoneNumbers } from "@/features/data-delete/composables/useUserPhoneNumbers";
import { toValue } from "@vueuse/core/index";

export const useSignupVerification = ({ form, user }) => {
  const route = useRoute();

  const { fetch } = useUserPhoneNumbers();

  const searchPhone = computed(
    () => formatPhone(route?.query?.phone)?.phoneNumber ?? null
  );

  const { isPhoneVerified: isSearchPhoneVerified } = useUserPhoneVerification(
    searchPhone,
    { context: "data-deletion" }
  );

  const verifiedSearchPhone = computed(() =>
    toValue(isSearchPhoneVerified) ? toValue(searchPhone) : null
  );

  const signupPhone = computed(
    () => formatPhone(toValue(form).phone)?.phoneNumber ?? null
  );

  const { isPhoneVerified: isSignupPhoneVerified } = useUserPhoneVerification(
    signupPhone,
    { context: "data-deletion" }
  );

  const verifiedSignupPhone = computed(() =>
    toValue(isSignupPhoneVerified) ? toValue(signupPhone) : null
  );

  watch(
    user,
    async (user) => {
      if (user) {
        try {
          await fetch();
        } catch (error) {
          // Silently fail - phone numbers are optional for checkout receipt
          console.error(
            "Failed to fetch phone numbers in signup verification",
            error
          );
        }
      }
    },
    { immediate: true }
  );

  return {
    searchPhone,
    isSearchPhoneVerified,
    verifiedSearchPhone,
    signupPhone,
    isSignupPhoneVerified,
    verifiedSignupPhone,
  };
};
