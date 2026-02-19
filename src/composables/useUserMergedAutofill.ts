import { ref } from "vue";
import personalServices from "@/api/settings/personal-services";
import dataDeleteServices from "@/api/actions/data-delete-service";
import type { AutofillData } from "@/types/autofill";
import type { DataDeletionEnrollmentProfile } from "@/types/data-deletion";

export interface MergedUserInfos {
  fullName: {
    first: string | null;
    last: string | null;
    middle: string | null;
    prefix: string | null;
    suffix: string | null;
  };
  dob: string | null;
  birthYear: number | null;
  addresses: Array<{
    address1: string | null;
    address2: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    country: string | null;
    fullAddress: string | null;
  }>;
  phoneNumbers: string[];
  emailAddresses: string[];
  ssnSubmitted: boolean | null;
}

export const useUserMergedAutofill = () => {
  const isFetching = ref(false);
  const autofill = ref<AutofillData | null>(null);
  const dataDeletionProfile = ref<DataDeletionEnrollmentProfile | null>(null);
  const userMergedAutofill = ref<MergedUserInfos | null>(null);

  const getUserInfos = async () => {
    isFetching.value = true;
    userMergedAutofill.value = null;
    autofill.value = null;
    dataDeletionProfile.value = null;

    try {
      const [autofillResult, dataDeletionResult] = (await Promise.allSettled([
        personalServices.getInfo(),
        dataDeleteServices.getEnrollmentProfile(),
      ])) as [
        PromiseSettledResult<{ data: AutofillData | undefined }>,
        PromiseSettledResult<{
          data: DataDeletionEnrollmentProfile | undefined;
        }>,
      ];

      // Handle autofill result
      if (autofillResult.status === "fulfilled") {
        autofill.value = autofillResult.value?.data ?? null;
      } else {
        console.error("Failed to fetch autofill data:", autofillResult.reason);
        autofill.value = null;
      }

      // Handle data deletion profile result
      if (dataDeletionResult.status === "fulfilled") {
        dataDeletionProfile.value = dataDeletionResult.value?.data ?? null;
      } else {
        console.error(
          "Failed to fetch data deletion profile:",
          dataDeletionResult.reason
        );
        dataDeletionProfile.value = null;
      }

      // Only merge data if at least one source has data
      if (autofill.value || dataDeletionProfile.value) {
        userMergedAutofill.value = mergeData(
          autofill.value,
          dataDeletionProfile.value
        );
      } else {
        userMergedAutofill.value = null;
      }
    } catch (error) {
      console.error("Error in getUserInfos:", error);
      throw error;
    } finally {
      isFetching.value = false;
    }
  };

  const mergeData = (
    autofillData?: AutofillData | null,
    dataDeletionProfileData?: DataDeletionEnrollmentProfile | null
  ): MergedUserInfos => {
    // Name
    const first =
      autofillData?.first_name ?? dataDeletionProfileData?.name?.first ?? null;
    const last =
      autofillData?.last_name ?? dataDeletionProfileData?.name?.last ?? null;

    const fullName: MergedUserInfos["fullName"] = {
      first,
      last,
      middle: dataDeletionProfileData?.name?.middle ?? null,
      prefix: dataDeletionProfileData?.name?.prefix ?? null,
      suffix: dataDeletionProfileData?.name?.suffix ?? null,
    };

    // Date of birth
    const profileDob = dataDeletionProfileData?.dob;
    const autofillDob = autofillData?.dob;
    const birthYear = dataDeletionProfileData?.birth_year ?? null;

    const isFullIsoDate = (value?: string | null) =>
      !!value && /^\d{4}-\d{2}-\d{2}$/.test(value);

    const preferredDobFull = isFullIsoDate(profileDob)
      ? profileDob
      : isFullIsoDate(autofillDob)
        ? autofillDob
        : null;

    const preferredDob =
      preferredDobFull ??
      autofillDob ??
      profileDob ??
      (birthYear != null ? String(birthYear) : null);

    // Addresses
    const addressesFromDataDeletion = (
      dataDeletionProfileData?.addresses ?? []
    ).map((address) => ({
      ...address,
      fullAddress: null,
    }));

    const addressFromAutofill = autofillData
      ? [
          {
            address1: autofillData.street_address,
            address2: null,
            city: autofillData.address_level1,
            state: autofillData.address_level2,
            postal_code: autofillData.postal_code,
            country: autofillData.country,
            fullAddress: null,
          },
        ]
      : [];

    const allAddresses = [...addressesFromDataDeletion, ...addressFromAutofill];

    const addressKeys = new Set<string>();
    const dedupedAddressesBase = allAddresses.filter((address) => {
      const key = [
        address.address1?.toLowerCase(),
        address.address2?.toLowerCase(),
        address.city?.toLowerCase(),
        address.state?.toLowerCase(),
        address.postal_code?.toLowerCase(),
        address.country?.toLowerCase(),
      ].join("|");
      if (addressKeys.has(key)) return false;
      addressKeys.add(key);
      return true;
    });

    // Create full address
    const dedupedAddresses = dedupedAddressesBase.map((address) => {
      const leading = [address.address1, address.address2, address.city].filter(
        Boolean
      ) as string[];
      const tail = [address.state, address.postal_code]
        .filter(Boolean)
        .join(" ");
      const full = tail
        ? [...leading, tail].join(", ")
        : leading.length
          ? leading.join(", ")
          : null;

      return { ...address, fullAddress: full };
    });

    // Others
    const phoneNumbers = Array.from(
      new Set(dataDeletionProfileData?.phone_numbers ?? [])
    );
    const emailAddresses = Array.from(
      new Set(dataDeletionProfileData?.email_addresses ?? [])
    );
    const ssnSubmitted = dataDeletionProfileData?.ssn_submitted ?? null;

    return {
      fullName,
      dob: preferredDob,
      birthYear,
      addresses: dedupedAddresses,
      phoneNumbers,
      emailAddresses,
      ssnSubmitted,
    };
  };

  const resetState = () => {
    userMergedAutofill.value = null;
    autofill.value = null;
    dataDeletionProfile.value = null;
  };

  return {
    userMergedAutofill,
    autofill,
    dataDeletionProfile,
    isFetching,
    getUserInfos,
    resetState,
  };
};
