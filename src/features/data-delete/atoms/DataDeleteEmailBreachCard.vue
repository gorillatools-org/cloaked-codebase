<script setup>
import { ref } from "vue";
import DataDeleteCard from "@/features/data-delete/atoms/DataDeleteCard.vue";
import BaseText from "@/library/BaseText.vue";
import BaseIcon from "@/library/BaseIcon.vue";
import { useDisplay } from "@/composables/useDisplay";

const { isMobile } = useDisplay();

const props = defineProps({
  breach: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["breach-revealed"]);

const isOpen = ref(false);
const isRevealed = ref(false);

const toggleOpen = () => {
  isOpen.value = !isOpen.value;
};

const toggleReveal = () => {
  const wasRevealed = isRevealed.value;
  isRevealed.value = !isRevealed.value;

  if (!wasRevealed && isRevealed.value) {
    emit("breach-revealed");
  }
};

const getDisplayValue = (field, placeholder) => {
  if (isRevealed.value && props.breach[field]) {
    return props.breach[field];
  }
  return placeholder;
};

const formatDate = (date) => {
  if (!date) return "Unknown";
  try {
    const formattedDate = new Date(date);
    return formattedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Unknown";
  }
};
</script>

<template>
  <DataDeleteCard type="light">
    <div class="breach-card">
      <div class="breach-card__header">
        <div class="breach-card__icon">
          <img
            :src="breach.logo_url"
            class="breach-card__icon"
          />
        </div>
        <div class="breach-card__info">
          <BaseText variant="headline-4-bold">
            {{
              breach.breached_companies
                ?.map((c) => c.company_name)
                .join(", ") || "Unknown Company"
            }}
          </BaseText>
          <br />
          <BaseText
            v-if="breach.breach_date"
            variant="body-3-regular"
            class="breach-date"
          >
            <BaseIcon
              name="calendar"
              class="breach-card__row__icon"
            />
            {{ isMobile ? "" : "Breach Date:" }}
            {{ formatDate(breach.breach_date) }}
          </BaseText>
        </div>
      </div>

      <div class="breach-card__rows">
        <div
          v-if="breach?.password_plaintext"
          class="breach-card__row"
        >
          <BaseIcon
            name="key"
            class="breach-card__row__icon"
          />
          <span class="breach-card__row__value">
            {{ getDisplayValue("password_plaintext", "Password") }}
          </span>
          <button
            type="button"
            class="breach-card__row__reveal"
            @click="toggleReveal"
          >
            <BaseIcon :name="isRevealed ? 'eye-hidden-filled' : 'eye-filled'" />
          </button>
        </div>

        <div
          v-if="breach?.email"
          class="breach-card__row"
        >
          <BaseIcon
            name="email"
            class="breach-card__row__icon"
          />
          <span class="breach-card__row__value">
            {{ getDisplayValue("email", "Email") }}
          </span>
          <button
            type="button"
            class="breach-card__row__reveal"
            @click="toggleReveal"
          >
            <BaseIcon :name="isRevealed ? 'eye-hidden-filled' : 'eye-filled'" />
          </button>
        </div>

        <div
          v-if="breach?.email_username"
          class="breach-card__row"
        >
          <BaseIcon
            name="name-card"
            class="breach-card__row__icon"
          />
          <span class="breach-card__row__value">
            {{ getDisplayValue("email_username", "Username") }}
          </span>
          <button
            type="button"
            class="breach-card__row__reveal"
            @click="toggleReveal"
          >
            <BaseIcon :name="isRevealed ? 'eye-hidden-filled' : 'eye-filled'" />
          </button>
        </div>
      </div>

      <div
        v-if="isOpen"
        class="breach-card__description"
      >
        <BaseText
          variant="headline-6-bold"
          class="breach-card__description__title"
        >
          Description:
        </BaseText>
        <BaseText
          variant="body-3-regular"
          class="breach-card__description__text"
        >
          {{ breach?.description }}
        </BaseText>
        <div class="breach-card__details">
          <BaseText
            variant="headline-6-bold"
            class="breach-card__details__title"
          >
            Info Discovered:
          </BaseText>
          <div class="breach-card__tags">
            <span
              v-if="breach?.email"
              class="breach-card__tag"
            >
              Email Address
            </span>
            <span
              v-if="breach?.password_plaintext"
              class="breach-card__tag"
            >
              Password
            </span>
            <span
              v-if="breach?.email_username"
              class="breach-card__tag"
            >
              Username
            </span>
          </div>
        </div>
      </div>

      <div class="breach-card__actions">
        <BaseText
          variant="body-3-semibold"
          size="sm"
          class="see-details-btn"
          :class="{ open: isOpen }"
          @click="toggleOpen"
        >
          {{ isOpen ? "Hide Details" : "See Details" }}
          <BaseIcon
            name="chevron-down"
            class="breach-card__chevron-icon"
            :class="{ 'breach-card__chevron-icon--rotated': isOpen }"
          />
        </BaseText>
      </div>
    </div>
  </DataDeleteCard>
</template>

<style lang="scss" scoped>
.breach-card {
  width: 100%;

  &__header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  &__separator {
    border: $color-base-black-15;
  }

  &__icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    color: $color-primary-5;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    object-fit: contain;
  }

  &__chevron-icon {
    transition: transform 0.2s ease;
    transform-origin: center;
    transform: translateY(1px);

    &--rotated {
      transform: rotate(180deg) translateY(-1px);
    }
  }

  &__info {
    flex: 1;
  }

  &__details {
    padding: 16px 16px 16px 0;

    &__title {
      font-size: 15px;
    }
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
    border-radius: 20px;
    padding-left: 0;
  }

  &__tag {
    padding: 0.25rem 0.5rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 500;
    color: white;
    background: $color-base-black-15;
  }

  &__actions {
    text-align: left;
    padding: 12px 0 0;
    padding-left: 0;
    border-top: 1px solid $color-base-black-15;
  }

  &__rows {
    margin-top: 12px;
    display: grid;
    gap: 8px;
    margin-bottom: 1rem;
  }

  &__row {
    display: grid;
    align-items: center;
    grid-template-columns: 22px auto 22px;

    &__icon {
      width: 16px;
      height: 16px;
    }

    &__value {
      color: $color-primary-100;
      font-size: 15px;
      font-weight: 600;
    }

    &__reveal {
      background: none;
      border: none;
      cursor: pointer;
      color: $color-primary-100;
    }

    &__icon-svg {
      width: 18px;
      height: 18px;
    }
  }

  &__desc {
    margin-top: 12px;
  }

  &__description__title {
    margin-bottom: 8px;
    display: block;
    font-size: 15px;
  }

  &__description__text {
    font-size: 13px;
    font-weight: 500;
    color: $color-primary-100;
    line-height: 1.45;
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 6px;
  }

  &__chip {
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 6px;
    background: linear-gradient(180deg, #d1fff6, #81ffe8);
    color: #052430;
  }

  &__footer {
    margin-top: 14px;
  }

  &__toggle {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 8px;
    background: rgb(157 233 255 / 8%);
    border: 1px dashed rgb(157 233 255 / 35%);
    color: #9de9ff;
    cursor: pointer;

    &__icon {
      width: 14px;
      height: 14px;
    }
  }

  @media all and (min-width: $screen-sm) {
    &__tags {
      padding-left: 10px;
      margin-top: 0;
      display: inline-flex;
    }
  }
}

.breach-date {
  margin-top: 6px;
  display: flex;
  text-align: center;
  align-items: center;
  gap: 8px;
}

.see-details-btn {
  cursor: pointer;
  position: relative;
  padding-right: 18px;
  font-size: 13px;
  font-weight: 700;
  justify-content: flex-start;
  align-items: end;
  gap: 5px;
}
</style>
