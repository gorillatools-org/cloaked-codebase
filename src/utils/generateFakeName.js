import { faker } from "@faker-js/faker";

const FALLBACK_NAME = "dashboard user";
const FEATURE_FLAG_NAME = "stripe-placeholder-name";

function generateSeedFromEmail(email) {
  let seed = 0;
  for (let i = 0; i < email.length; i++) {
    seed = (seed << 5) - seed + email.charCodeAt(i);
  }
  return Math.abs(seed);
}

/**
 * Checks if the stripe-placeholder-name feature flag is enabled.
 * @returns {boolean} True if the feature flag is enabled, false otherwise
 */
function isFeatureFlagEnabled() {
  try {
    if (typeof window === "undefined" || !window.$posthog) {
      return false;
    }
    return window.$posthog.getFeatureFlag(FEATURE_FLAG_NAME) === true;
  } catch {
    return false;
  }
}

/**
 * Generates a consistent fake name based on an email address.
 * Uses the email as a seed to ensure the same email always produces the same fake name.
 * This maintains consistency across different payment flows while preserving user privacy.
 *
 * @param {string} email - The email address to use as a seed
 * @returns {string} A consistently generated fake name in the format "FirstName LastName"
 */
export function generateConsistentFakeName(email) {
  // Check feature flag first - if disabled, always return fallback
  if (!isFeatureFlagEnabled()) {
    return FALLBACK_NAME;
  }

  // Handle invalid inputs
  if (!email || typeof email !== "string" || email.trim().length === 0) {
    return FALLBACK_NAME;
  }

  try {
    // Create a numeric seed from the email string
    const seed = generateSeedFromEmail(email);

    // Seed faker and generate consistent name
    faker.seed(seed);
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    // Validate that faker returned valid strings
    if (
      !firstName ||
      !lastName ||
      typeof firstName !== "string" ||
      typeof lastName !== "string"
    ) {
      return FALLBACK_NAME;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    // Ensure the generated name is valid (not empty after trimming)
    return fullName.trim().length > 0 ? fullName : FALLBACK_NAME;
  } catch {
    // Fallback to safe default if anything goes wrong
    return FALLBACK_NAME;
  }
}
