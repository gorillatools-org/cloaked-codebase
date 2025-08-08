import VueTelInput from "vue-tel-input";
import "vue-tel-input/vue-tel-input.css";
import VueObserveVisibility from "vue-observe-visibility";
import { createApp } from "vue";
import App from "./App.vue";
import router from "@/routes/router";
import store from "./store";
import { getPosthog } from "@/scripts/posthog";
import * as Sentry from "@sentry/vue";

// Importing the global styles
import "@/assets/scss/recursive/_reset.scss";
import "@/assets/scss/recursive/_fonts.scss";

const app = createApp(App);

Sentry.init({
  app,
  dsn: "https://24e50a7f100a8114ac6abeab571e6497@o129529.ingest.us.sentry.io/4508138378756097",
  environment: import.meta.env.VITE_APP_ENV || "localhost",
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampler: ({ name }) => {
    if (import.meta.env.VITE_APP_ENV !== "production") {
      return 0;
    }

    if (!["/data-delete", "/subscribe-now"].includes(name)) {
      return 0;
    }

    return 0.01;
  },
});

app.use({
  async install(app) {
    if (!import.meta.env.VITE_POSTHOG_PROJECT_API_KEY) {
      return;
    }
    const $posthog = await getPosthog();
    window.$posthog = app.$posthog = $posthog;
  },
});
app.use(VueObserveVisibility);
app.use(VueTelInput);

app.use(router);
app.use(store);
router.isReady().then(() => app.mount("#app"));
