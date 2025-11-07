<script setup>
import { ref, computed, onBeforeMount } from "vue";
import { useRoute } from "vue-router";
import DataDeleteService from "@/api/actions/data-delete-service";
import BaseText from "@/library/BaseText.vue";

const route = useRoute();
const companyLogo = ref(null);
const companyName = ref(null);
const isLoading = ref(false);

const emailFromQuery = computed(() => route.query.email_address || null);

const getCompanyFromEmail = async (emailAddress) => {
  const domain = emailAddress?.split("@")?.[1]?.trim()?.toLowerCase();
  if (!domain) return;

  isLoading.value = true;
  try {
    const { data } = await DataDeleteService.getEmailBreachCompany(domain);
    if (data?.results?.[0]) {
      companyLogo.value =
        data.results[0].logo_svg_url || data.results[0].logo_image_url;
      companyName.value = data.results[0].name;
    }
  } catch (err) {
    console.error("Error fetching company:", err);
  } finally {
    isLoading.value = false;
  }
};

onBeforeMount(() => {
  getCompanyFromEmail(emailFromQuery.value);
});

const shouldShow = computed(
  () => isLoading.value || (companyLogo.value && companyName.value)
);
</script>

<template>
  <div
    v-if="shouldShow"
    class="data-delete-company-header"
  >
    <template v-if="isLoading">
      <div class="data-delete-company-header__logo-skeleton" />
      <div class="data-delete-company-header__name-skeleton" />
    </template>

    <template v-else>
      <img
        :src="companyLogo"
        :alt="companyName"
        class="data-delete-company-header__logo"
      />
      <BaseText
        variant="headline-4-bold"
        class="data-delete-company-header__name"
      >
        {{ companyName }}
      </BaseText>
    </template>
  </div>
</template>

<style lang="scss" scoped>
@mixin skeleton {
  @at-root .theme-dark & {
    @include base-skeleton(
      $color-primary-10-light,
      0.1,
      $color-primary-10-dark,
      0.5
    );
  }

  @at-root .theme-light & {
    @include base-skeleton($color-primary-10);
  }
}

.data-delete-company-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 8px;
  animation: appear-bottom-5 0.3s forwards ease-out;

  &__logo {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: $color-primary-100;
    padding: 4px;
    object-fit: contain;
  }

  &__logo-skeleton {
    width: 56px;
    height: 56px;
    border-radius: 50%;

    @include skeleton;
  }

  &__name {
    color: $color-primary-100;
  }

  &__name-skeleton {
    width: 140px;
    height: 24px;
    border-radius: 999px;

    @include skeleton;
  }
}
</style>
