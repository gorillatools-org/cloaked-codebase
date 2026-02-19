<script setup>
import { useRouter } from "vue-router";
import { HELP_CENTER_BASE_URL } from "@/scripts/constants";
import BaseText from "@/library/BaseText.vue";
import BaseButton from "@/library/BaseButton.vue";
import { datadogRum } from "@datadog/browser-rum";
import { onMounted } from "vue";

onMounted(() => {
  // when 404 component is mounted / shown
  datadogRum.addAction("page_not_found", { url: window.location.pathname });
});

const router = useRouter();

const goHome = () => {
  router.push("/");
};

const getHelp = () => {
  window.open(HELP_CENTER_BASE_URL, "_blank", "noopener,noreferrer");
};
</script>

<template>
  <div class="page-404">
    <div class="page-404__content">
      <div class="page-404__center">
        <BaseText
          variant="big-heading-semibold"
          as="h1"
          class="page-404__title"
        >
          404
        </BaseText>

        <BaseText
          variant="headline-4-bold"
          as="p"
          class="page-404__subtitle"
        >
          Page not found
        </BaseText>

        <div class="page-404__buttons">
          <BaseButton
            variant="primary"
            size="lg"
            class="page-404__button page-404__button--primary"
            @click="goHome"
          >
            Go home
          </BaseButton>

          <BaseButton
            variant="secondary"
            size="lg"
            icon="help"
            class="page-404__button page-404__button--secondary"
            @click="getHelp"
          >
            Get help
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-404 {
  display: flex;
  height: 100vh;
  overflow: hidden;
  position: relative;

  @media (width >= 1024px) {
    padding: 0 8px 8px 0;
  }

  &__content {
    flex: 1;
    border-radius: 20px;
    padding: 24px;
    overflow-y: auto;

    @include custom-scroll-bar;

    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    background-color: $color-primary-5;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    max-width: 500px;
    width: 100%;
    gap: 16px;
  }

  &__title {
    color: $color-primary-100;
    font-size: 120px;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 8px;

    @media (width >= 1024px) {
      font-size: 160px;
    }
  }

  &__subtitle {
    color: $color-primary-90;
    margin-bottom: 20px;
    text-align: center;
    max-width: 400px;
  }

  &__buttons {
    display: flex;
    gap: 16px;
    margin-top: 8px;
    flex-wrap: wrap;
    justify-content: center;

    @media (width <= 480px) {
      flex-direction: column;
      width: 100%;
    }
  }

  &__button {
    @media (width <= 480px) {
      width: 100%;
    }
  }
}
</style>
