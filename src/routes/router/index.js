import { createRouter, createWebHistory } from "vue-router";
import { computed, nextTick } from "vue";
import store from "@/store";
import { AUTH_V3_ROUTES_ENABLED } from "@/scripts/featureFlags";
import { logout } from "@/scripts/actions/auth";
import { useToast } from "@/composables/useToast.js";
import { useBasicMode } from "@/composables/useBasicMode.js";
import { useCloakedPaySubscription } from "@/features/VirtualCards/composables/useCloakedPaySubscription.ts";
import { MOBILE_BREAKPOINT } from "@/composables/useDevice.js";

const toast = useToast();

// general
import HomePage from "@/features/home/HomePage.vue";

import AutoPasswordChange from "@/routes/AutoPasswordChange.vue";

// data delete
import DataRemovalGraphShared from "@/routes/DataDeletion/components/RequestGraph/DataRemovalGraphShared.vue";
import DataDeletePageGuestOtp from "@/features/data-delete/DataDeletePageGuestOtp.vue";
import DataRemoval from "@/routes/DataDeletion/DataRemoval.vue";

// data scan
import DataScan from "@/features/data-delete/DataScan.vue";

// cloaked pay
import { PH_VIRTUAL_CARDS_FEATURE_FLAG_SUMMARY_VIEW_DETAILS } from "@/features/VirtualCards/constants/posthog-feature-flag";
import VirtualCardsPage from "@/routes/CloakedPay/VirtualCardsPage.vue";
import VirtualCardsWalletLayoutPage from "@/routes/CloakedPay/VirtualCardsWalletLayoutPage.vue";
import VirtualCardsWalletIndexPage from "@/routes/CloakedPay/Wallet/VirtualCardsWalletIndexPage.vue";
import VirtualCardsWalletSummaryTransactionsPage from "@/routes/CloakedPay/Wallet/VirtualCardsWalletSummaryTransactionsPage.vue";
import VirtualCardsWalletCardPage from "@/routes/CloakedPay/Wallet/VirtualCardsWalletCardPage.vue";
import WalletWaitlistPage from "@/routes/WalletWaitlistPage.vue";
import CloakedPaySubscriptionOnboardingPage from "@/routes/CloakedPay/CloakedPaySubscriptionOnboardingPage.vue";

// identities
import All from "@/routes/your-cloaks/All.vue";
import Trash from "@/routes/Trash.vue";
import Shared from "@/routes/Shared.vue";
import Favorites from "@/routes/your-cloaks/Favorites.vue";
import NumberReuse from "@/routes/NumberReuse.vue";
import Muted from "@/routes/your-cloaks/Muted.vue";
import Category from "@/routes/categories/Category.vue";
import Import from "@/routes/import/Import.vue";
import ImportSource from "@/routes/import/ImportSource.vue";
import ImportUpload from "@/routes/import/ImportUpload.vue";
import ImportMapping from "@/routes/import/ImportMapping.vue";
import ImportReview from "@/routes/import/ImportReview.vue";
import ImportReviewEdit from "@/routes/import/ImportReviewEdit.vue";

// referral
import ReferralCode from "@/routes/ReferralCode.vue";
import ReferralDenied from "@/routes/ReferralDenied.vue";
import AcceptInvitation from "@/routes/AcceptInvitation.vue";
import Referral from "@/routes/Referral.vue";

// auth
import Login from "@/routes/guest/Login.vue";
import Forgot from "@/routes/guest/Forgot.vue";
import Register from "@/routes/guest/Register.vue";
import ForgotUsername from "@/routes/guest/ForgotUsername.vue";
import ResetRecoveryKey from "@/routes/guest/ResetRecoveryKey.vue";
import JoinTenant from "@/routes/guest/JoinTenant.vue";
import RegisterV3 from "@/routes/guest/RegisterV3.vue";
import ForgotPasswordV3 from "@/routes/guest/ForgotPasswordV3.vue";
import ForgotUsernameV3 from "@/routes/guest/ForgotUsernameV3.vue";
import LoginV3 from "@/routes/guest/LoginV3.vue";

// settings
import Settings from "@/routes/Settings.vue";
import SettingsAccount from "@/routes/Settings/SettingsAccount.vue";
import PersonalInformation from "@/routes/Settings/PersonalInformation.vue";
import Forwarding from "@/routes/Settings/Forwarding.vue";
import SettingsDataRemovalPage from "@/routes/Pages/SettingsDataRemovalPage.vue";
import SettingsDataRemovalPageAll from "@/routes/Pages/SettingsDataRemovalPageAll.vue";
import SettingsDataRemovalPageNames from "@/routes/Pages/SettingsDataRemovalPageNames.vue";
import SettingsDataRemovalPageAddresses from "@/routes/Pages/SettingsDataRemovalPageAddresses.vue";
import SettingsSubscription from "@/routes/Settings/SettingsSubscription.vue";
import Passphrase from "@/routes/Settings/Passphrase.vue";
import CloakedCards from "@/routes/Settings/CloakedCards.vue";
import SettingsEmail from "@/routes/Settings/SettingsEmail.vue";
import SettingsPermissions from "@/routes/Settings/SettingsPermissions.vue";

// activity
import InboxList from "@/features/inbox/InboxList.vue";
import InboxMessage from "@/features/inbox/InboxMessage.vue";
import InboxEmail from "@/features/inbox/InboxEmail.vue";
import InboxDetail from "@/features/inbox/InboxDetail.vue";

// esim
import EsimGetStarted from "@/routes/Pages/EsimGetStarted.vue";
import EsimPage from "@/routes/Pages/EsimPage.vue";

// error pages
import Page404 from "@/routes/Pages/Page404.vue";
import { useEncryptionGate } from "@/composables/useEncryptionGate";
import CheckVerificationEmail from "@/features/verification/CheckVerificationEmail.vue";

// enrollment
import PageExposureStatusEnroll from "@/routes/enrollmentV2/PageExposureStatusEnroll.vue";
import PageExposureStatusEnrollExposures from "@/routes/enrollmentV2/PageExposureStatusEnrollExposures.vue";
import PageExposureStatusEnrollMonitoring from "@/routes/enrollmentV2/PageExposureStatusEnrollMonitoring.vue";
import PageExposureStatusEnrollSuccess from "@/routes/enrollmentV2/PageExposureStatusEnrollSuccess.vue";
import PageExposureStatusEnrollDownload from "@/routes/enrollmentV2/PageExposureStatusEnrollDownload.vue";

// Exposure Status
import PageExposureStatus from "@/routes/Pages/PageExposureStatus.vue";
import PageExposureStatusBrokers from "@/routes/Pages/PageExposureStatusBrokers.vue";
import PageExposureStatusRelatives from "@/routes/Pages/PageExposureStatusRelatives.vue";

// Call Guard
import PageCallGuard from "@/routes/Pages/PageCallGuard.vue";

// monitoring
import PageMonitoring from "@/routes/monitoring/PageMonitoring.vue";
import PageMonitoringSettings from "@/routes/monitoring/PageMonitoringSettings.vue";
import PageMonitoringSettingsAll from "@/routes/monitoring/PageMonitoringSettingsAll.vue";
import PageMonitoringSettingsNames from "@/routes/monitoring/PageMonitoringSettingsNames.vue";
import PageMonitoringSettingsAddress from "@/routes/monitoring/PageMonitoringSettingsAddress.vue";
import PageMonitoringStatus from "@/routes/monitoring/PageMonitoringStatus.vue";
import PageMonitoringEvent from "@/routes/monitoring/PageMonitoringEvent.vue";

// checkout
import PageCheckout from "@/routes/checkout/PageCheckout.vue";
import PageCheckoutCombined from "@/routes/checkout/PageCheckoutCombined.vue";
import PageCheckoutMobile from "@/routes/checkout/PageCheckoutMobile.vue";
import PageCheckoutSuccess from "@/routes/checkout/PageCheckoutSuccess.vue";
import PageCheckoutOnboarding from "@/routes/checkout/PageCheckoutOnboarding.vue";
import PageCheckoutDownloadApp from "@/routes/checkout/PageCheckoutDownloadApp.vue";

// mobile checkout
import NativeCheckout from "@/routes/NativeCheckout.vue";

import { useMonitoringModal } from "@/features/monitoring/useMonitoringModal.js";

import ExtensionAuthIssue from "@/features/extension-auth/ExtensionAuthIssue.vue";
import ExtensionAuthStatus from "@/features/extension-auth/ExtensionAuthStatus.vue";

// mobile
import RouteMobile from "@/routes/Mobile/RouteMobile.vue";

const authenticated = computed(() => {
  return store.getters["authentication/isAuthenticated"];
});

const beforeImportStepEnter = (to, from, next) => {
  if (!store.getters["accountsImporter/getFileName"]) {
    next({ name: "ImportSource" });
  }

  next();
};

const beforeEnterImport = (to, from, next) => {
  store.dispatch("settings/savePrevRouteName", from.name || "Home");
  next();
};

const beforeEnterWebviewWithAuth = async (to, from, next) => {
  const getCleanQuery = (query = {}) => {
    const cleanQuery = { ...query };
    delete cleanQuery.acctok;
    delete cleanQuery.webview;

    return cleanQuery;
  };

  const isWebview = to.query.webview === "true";
  const accessToken = to.query.acctok;
  const isUserAuthenticated = authenticated.value;

  store.dispatch("settings/savePrevRouteName", from.name || "Home");
  store.dispatch("closeRightPanel");

  if (isWebview) {
    store.commit("setWebviewMode", isWebview);
  }

  if (isUserAuthenticated) {
    if (accessToken || isWebview) {
      return next({
        name: to.name,
        params: to.params,
        query: getCleanQuery(to.query),
        hash: to.hash,
        replace: true,
      });
    }

    return next();
  }

  if (!accessToken) {
    return next({
      name: "login",
      query: { prevRoute: to.path },
    });
  }

  const cleanQuery = getCleanQuery(to.query);
  const cleanUrl = `${to.path}${Object.keys(cleanQuery).length > 0 ? "?" + new URLSearchParams(cleanQuery).toString() : ""}`;
  window.history.replaceState({}, "", cleanUrl);

  try {
    await store.dispatch("authentication/authWithAccessToken", {
      accessToken,
    });

    return next({
      ...to,
      query: cleanQuery,
      replace: true,
    });
  } catch {
    toast.error("Invalid or expired authentication token. Please log in.");
    return next({
      name: "login",
      query: { prevRoute: to.path },
    });
  }
};

const beforeEnterActivity = (to, from, next) => {
  if (authenticated.value) {
    store.dispatch("closeRightPanel");
    return next();
  }
  return next({ name: "login", query: { prevRoute: to.fullPath } });
};

const beforeEnterCloseRightPanel = (to, from, next) => {
  store.dispatch("closeRightPanel");
  return allowOnlyAuthenticatedUsers(to, from, next);
};

const allowOnlyGuests = (to, from, next) => {
  if (authenticated.value) {
    if (
      to.query &&
      (to.query.cloaked_client_id ||
        to.query.signup_key ||
        to.query.utm_campaign)
    ) {
      logout();
      return next();
    } else if (to.query?.enable_pay) {
      return next({ path: "/", query: to.query.enable_pay });
    }

    return next({ name: "Home" });
  }
  return next();
};

const allowMobileScreenOnly = (redirectRouteName) => (to, from, next) => {
  if (window.innerWidth >= MOBILE_BREAKPOINT) {
    return next({ name: redirectRouteName, query: to.query });
  }
  return next();
};

const allowOnlyAuthenticatedUsers = (to, from, next) => {
  if (authenticated.value) {
    return next();
  }
  return next({ name: "login", query: { prevRoute: to.fullPath } });
};

const clearGuestToken = async (to, from, next) => {
  await store.dispatch("authentication/setGuestToken", null);
  return next();
};

const callGuardEnabled = computed(() => {
  return store.state.authentication?.user?.flags?.["spam-blocking"];
});

const { isCloakedPaySubscriptionEnabled } = useCloakedPaySubscription();

const isCloakedPaySummaryViewDetailsEnabled = computed(() => {
  return !!store.state.authentication?.user?.flags?.[
    PH_VIRTUAL_CARDS_FEATURE_FLAG_SUMMARY_VIEW_DETAILS
  ];
});

const isCallGuardEnabled = (to, from, next) => {
  if (authenticated.value && callGuardEnabled.value) {
    return next();
  }
  return next({ name: "Home" });
};

const isAuthV3Enabled = (to, from, next) => {
  if (!AUTH_V3_ROUTES_ENABLED) {
    return next({ name: "signup" });
  }
  if (authenticated.value) {
    return next({ name: "Home" });
  }
  return next();
};

const isResetRecoveryKeyEnabled = (to, from, next) => {
  if (authenticated.value) {
    return next({ name: "Home" });
  }
  return next();
};

const customEmailEnabled = (to, from, next) => {
  if (!store.state.authentication?.user?.flags?.email_custom_domain) {
    return next({ name: "Home" });
  }
  return next();
};

const { withEncryptionGate } = useEncryptionGate();
const { isBasicModeEnabled } = useBasicMode();

const allowOnlyEncryptedUsers = (to, from, next) => {
  withEncryptionGate(() => next(), {
    fallback: () => {
      if (!from.name) {
        next({ name: "Home" });
      }
    },
  }).catch(() => {
    // If encryption gate is cancelled, redirect to home
    next({ name: "Home" });
  });
};

const allowOnlyAdvancedMode = (to, from, next) => {
  if (isBasicModeEnabled.value) {
    return next({ name: "Home" });
  }
  return next();
};

const allowOnlyCloakedPaySummaryViewDetailsEnabledUsers = (to, from, next) => {
  if (!isCloakedPaySummaryViewDetailsEnabled.value) {
    return next({ name: "VirtualCardsWalletIndex" });
  }
  return next();
};

const allowOnlyPayEnabledUsers = (to, from, next) => {
  if (
    (store.state.authentication?.user?.cloaked_card_enabled_status !==
      "enabled" ||
      !store.state.authentication?.user?.cloaked_card_enabled) &&
    !isCloakedPaySubscriptionEnabled.value
  ) {
    return next({ name: "VirtualCardsWaitlist" });
  }
  return next();
};

const allowOnlyPayDisabledUsers = (to, from, next) => {
  if (
    store.state.authentication?.user?.cloaked_card_enabled ||
    store.state.authentication?.user?.cloaked_card_enabled_status ===
      "enabled" ||
    isCloakedPaySubscriptionEnabled.value
  ) {
    return next({ name: "VirtualCardsIndex" });
  }
  return next();
};

const allowOnlyPayWalletEnabledUsers = (to, from, next) => {
  const user = store.state.authentication?.user;

  const isEnabled =
    !!user?.cloaked_card_enabled ||
    user?.cloaked_card_enabled_status === "enabled";

  const isKycValidated = !!user?.cloaked_card_kyc_configured;
  const isOnboardingCompleted =
    !!user?.cloaked_card_post_kyc_onboarding_completed;

  if (isEnabled && isKycValidated && isOnboardingCompleted) {
    return next();
  }

  return next({ name: "VirtualCardsIndex" });
};

const allowOnlyPayOnboardingEnabled = (to, from, next) => {
  if (!store.getters["cloakedPayOnboarding/isOnboardingEnabled"]) {
    return next({ name: "VirtualCardsIndex" });
  }

  return next();
};

const allowOnlyAdvancedModeInSettings = (to, from, next) => {
  if (isBasicModeEnabled.value) {
    return next({ name: "settings.account" });
  }
  return next();
};

const { openMonitoringModal } = useMonitoringModal();

const routes = [
  {
    path: "/invitation/:id",
    name: "Accept Invitation",
    component: AcceptInvitation,
    meta: { title: "Accept Invitation" },
  },
  {
    path: "/data-remove-graph",
    name: "DataRemovalGraphShared",
    component: DataRemovalGraphShared,
  },
  {
    path: "/cloaked-pay",
    name: "CloakedPay",
    meta: { title: "Cloaked Pay", icon: "credit-card" },
    redirect: { name: "VirtualCardsIndex" },
    beforeEnter: [beforeEnterActivity],
    children: [
      {
        path: "/cloaked-pay/subscription-onboarding",
        name: "CloakedPaySubscriptionOnboarding",
        component: CloakedPaySubscriptionOnboardingPage,
        meta: { title: "Cloaked Pay Onboarding", icon: "credit-card" },
        beforeEnter: [
          clearGuestToken,
          allowOnlyAuthenticatedUsers,
          allowOnlyPayOnboardingEnabled,
        ],
      },
    ],
  },
  {
    path: "/virtual-cards",
    name: "VirtualCards",
    alias: "/wallet",
    meta: { title: "Virtual Cards", icon: "credit-card" },
    beforeEnter: [beforeEnterWebviewWithAuth, beforeEnterActivity],
    children: [
      {
        path: "",
        name: "VirtualCardsIndex",
        component: VirtualCardsPage,
        meta: { title: "Virtual Cards", icon: "credit-card" },
        beforeEnter: [allowOnlyEncryptedUsers, allowOnlyPayEnabledUsers],
        children: [
          {
            path: "wallet",
            name: "VirtualCardsWallet",
            component: VirtualCardsWalletLayoutPage,
            meta: { title: "Virtual Cards", icon: "credit-card" },
            beforeEnter: [allowOnlyPayWalletEnabledUsers],
            children: [
              {
                path: "",
                name: "VirtualCardsWalletIndex",
                component: VirtualCardsWalletIndexPage,
                meta: {
                  title: "Virtual Cards",
                  icon: "credit-card",
                  viewKey: "index",
                },
              },
              {
                path: "summary",
                name: "VirtualCardsWalletSummary",
                component: VirtualCardsWalletIndexPage,
                beforeEnter: [
                  allowOnlyCloakedPaySummaryViewDetailsEnabledUsers,
                ],
                meta: {
                  title: "Virtual Cards",
                  icon: "credit-card",
                  viewKey: "index",
                },
              },
              {
                path: "summary/:type(payments|refunds|blocked)",
                name: "VirtualCardsWalletSummaryTransactions",
                component: VirtualCardsWalletSummaryTransactionsPage,
                beforeEnter: [
                  allowOnlyCloakedPaySummaryViewDetailsEnabledUsers,
                ],
              },
              {
                path: "card/:id",
                name: "VirtualCardsWalletCard",
                alias: ["/virtual-cards/card/:id", "/wallet/card/:id"], // Legacy route
                component: VirtualCardsWalletCardPage,
                meta: {
                  title: "Virtual Cards",
                  icon: "credit-card",
                  viewKey: "card",
                },
              },
              {
                path: "funding-source/:fsId/update",
                name: "VirtualCardsWalletFundingSourceUpdate",
                component: VirtualCardsWalletIndexPage,
                meta: {
                  title: "Virtual Cards",
                  icon: "credit-card",
                  viewKey: "index",
                },
              },
            ],
          },
        ],
      },
      {
        path: "waitlist",
        name: "VirtualCardsWaitlist",
        component: WalletWaitlistPage,
        meta: { title: "Virtual Cards", icon: "credit-card" },
        beforeEnter: [allowOnlyPayDisabledUsers],
      },
    ],
    // Allow query parameters
    props: (route) => ({ query: route.query }),
  },
  {
    path: "/trash",
    name: "Trash",
    component: Trash,
    meta: { title: "Trash", icon: "delete-trash" },
    beforeEnter: [
      allowOnlyEncryptedUsers,
      allowOnlyAdvancedMode,
      beforeEnterCloseRightPanel,
    ],
  },
  {
    path: "/auth/referral",
    name: "referralCode",
    component: ReferralCode,
    beforeEnter: allowOnlyGuests,
  },
  {
    path: "/auth/referral-denied",
    name: "referralDenied",
    component: ReferralDenied,
    beforeEnter: allowOnlyGuests,
  },
  {
    path: "/auth/signup",
    alias: ["/auth/register", "/auth/sign-up"],
    name: "signup",
    component: Register,
    beforeEnter: allowOnlyGuests,
  },
  {
    path: "/auth/forgot-password",
    name: "forgot",
    component: Forgot,
    beforeEnter: allowOnlyGuests,
  },
  {
    path: "/auth/forgot-username",
    name: "ForgotUsername",
    component: ForgotUsername,
    beforeEnter: allowOnlyGuests,
  },
  {
    path: "/auth/join",
    name: "JoinTenant",
    component: JoinTenant,
    beforeEnter: allowOnlyGuests,
    children: [
      {
        path: ":id",
        name: "JoinTenantWithId",
        component: JoinTenant,
        beforeEnter: allowOnlyGuests,
      },
    ],
  },
  {
    path: "/auth/reset-recovery-key",
    name: "ResetRecoveryKey",
    component: ResetRecoveryKey,
    beforeEnter: isResetRecoveryKeyEnabled,
    children: [
      {
        path: ":id",
        name: "ResetRecoveryKeyWithId",
        component: ResetRecoveryKey,
        beforeEnter: isResetRecoveryKeyEnabled,
      },
    ],
  },
  {
    path: "/auth/login",
    name: "login",
    component: Login,
    beforeEnter: allowOnlyGuests,
  },
  {
    path: "/extension-auth/issue",
    name: "ExtensionAuthIssue",
    component: ExtensionAuthIssue,
    meta: { layout: "hideSidebar" },
    beforeEnter: allowOnlyAuthenticatedUsers,
  },
  {
    path: "/extension-auth-status",
    name: "ExtensionAuthStatus",
    component: ExtensionAuthStatus,
    meta: { layout: "hideSidebar" },
    beforeEnter: allowOnlyAuthenticatedUsers,
  },
  {
    path: "/auth/v3/signup",
    alias: ["/auth/v3/register", "/auth/v3/sign-up"],
    name: "signupv3",
    component: RegisterV3,
    beforeEnter: isAuthV3Enabled,
  },
  {
    path: "/auth/v3/forgot-password",
    name: "ForgotPasswordV3",
    component: ForgotPasswordV3,
    beforeEnter: isAuthV3Enabled,
  },
  {
    path: "/auth/v3/forgot-username",
    name: "ForgotUsernameV3",
    component: ForgotUsernameV3,
    beforeEnter: isAuthV3Enabled,
  },
  {
    path: "/auth/v3/login",
    name: "LoginV3",
    component: LoginV3,
    beforeEnter: isAuthV3Enabled,
  },
  {
    path: "/auth/*",
    name: "auth",
    redirect: { name: "login" },
    beforeEnter: allowOnlyGuests,
  },
  {
    path: "/share/",
    name: "share",
    component: Shared,
    meta: { title: "View your shared identity " },
  },
  {
    path: "/favorites",
    name: "Favorites",
    component: Favorites,
    meta: { title: "Favorites", icon: "favorite-filled" },
    beforeEnter: [
      allowOnlyEncryptedUsers,
      beforeEnterCloseRightPanel,
      allowOnlyAdvancedMode,
    ],
  },
  {
    path: "/number-reuse",
    name: "NumberReuse",
    component: NumberReuse,
    meta: { title: "Number Reuse" },
    beforeEnter: [
      allowOnlyEncryptedUsers,
      allowOnlyEncryptedUsers,
      allowOnlyAdvancedMode,
    ],
  },
  {
    path: "/ignored",
    name: "Ignored",
    component: Muted,
    meta: { title: "Ignored", icon: "user-block" },
    beforeEnter: [
      allowOnlyEncryptedUsers,
      beforeEnterCloseRightPanel,
      allowOnlyAdvancedMode,
    ],
  },
  {
    path: "/settings",
    name: "settings",
    component: Settings,
    meta: { title: "Settings" },
    redirect: { name: "settings.account" },
    beforeEnter: beforeEnterWebviewWithAuth,
    children: [
      {
        path: "account",
        name: "settings.account",
        meta: { title: "Settings", icon: "cog" },
        component: SettingsAccount,
      },
      {
        path: "personal-information",
        name: "settings.personal-information",
        meta: { title: "Settings", icon: "cog" },
        component: PersonalInformation,
        beforeEnter: [allowOnlyEncryptedUsers, allowOnlyAdvancedModeInSettings],
      },
      {
        path: "forwarding",
        name: "settings.forwarding",
        meta: { title: "Settings", icon: "cog" },
        component: Forwarding,
        beforeEnter: [allowOnlyEncryptedUsers, allowOnlyAdvancedModeInSettings],
      },
      {
        path: "data-removal",
        name: "settings.dataRemoval",
        meta: { title: "Settings", icon: "cog" },
        component: SettingsDataRemovalPage,
        redirect: "/settings/data-removal/",
        children: [
          {
            path: "",
            name: "settings.dataRemoval.all",
            component: SettingsDataRemovalPageAll,
            beforeEnter: allowOnlyAuthenticatedUsers,
          },
          {
            path: "add-names",
            name: "settings.dataRemoval.names",
            component: SettingsDataRemovalPageNames,
            beforeEnter: allowOnlyAuthenticatedUsers,
          },
          {
            path: "add-addresses",
            name: "settings.dataRemoval.addresses",
            component: SettingsDataRemovalPageAddresses,
            beforeEnter: allowOnlyAuthenticatedUsers,
          },
        ],
      },
      {
        path: "subscription",
        name: "settings.subscription",
        meta: { title: "Settings", icon: "cog" },
        component: SettingsSubscription,
      },
      {
        path: "recovery",
        name: "settings.recovery",
        meta: { title: "Settings", icon: "cog" },
        component: Passphrase,
        beforeEnter: allowOnlyEncryptedUsers,
      },
      {
        path: "cloaked-cards",
        name: "settings.cloaked-cards",
        meta: { title: "Settings", icon: "cog" },
        component: CloakedCards,
        beforeEnter: allowOnlyEncryptedUsers,
      },
      {
        path: "email",
        name: "settings.email",
        meta: { title: "Email" },
        component: SettingsEmail,
        beforeEnter: [allowOnlyEncryptedUsers, customEmailEnabled],
      },
      {
        path: "permissions",
        name: "settings.permissions",
        meta: { title: "Permissions" },
        component: SettingsPermissions,
      },
    ],
  },
  {
    path: "/inbox",
    alias: "/activities",
    name: "Inbox",
    component: InboxList,
    meta: {
      title: "All Inboxes",
      message: true,
      icon: "inbox-filled",
      nav: "inbox",
    },
    beforeEnter: [
      allowOnlyEncryptedUsers,
      beforeEnterActivity,
      allowOnlyAdvancedMode,
    ],
  },
  {
    path: "/inbox/texts",
    alias: ["/inbox/messages", "/activities/texts", "/activities/messages"],
    name: "Texts",
    component: InboxList,
    meta: {
      nav: "inbox",
      title: "Texts",
      message: true,
      icon: "chat",
    },
    beforeEnter: [
      allowOnlyEncryptedUsers,
      beforeEnterActivity,
      allowOnlyAdvancedMode,
    ],
  },
  {
    path: "/inbox/texts/:id",
    alias: [
      "/activities/texts/:id",
      "/activities/messages/:id",
      "/inbox/messages/:id",
      "/inbox/calls/:id",
      "/activities/calls/:id",
    ],
    name: "Text",
    component: InboxMessage,
    meta: {
      title: "Inbox",
      message: true,
      icon: "left-arrow",
      showActivityIcons: true,
      inboxDetailPage: true,
    },
    beforeEnter: [
      allowOnlyEncryptedUsers,
      beforeEnterActivity,
      allowOnlyAdvancedMode,
    ],
  },
  {
    path: "/inbox/calls",
    alias: "/activities/calls",
    name: "Calls",
    component: InboxList,
    meta: {
      nav: "inbox",
      title: "Calls",
      message: true,
      icon: "phone-filled",
    },
    beforeEnter: [
      allowOnlyEncryptedUsers,
      beforeEnterActivity,
      allowOnlyAdvancedMode,
    ],
  },
  {
    path: "/inbox/emails",
    alias: "/activities/emails",
    component: InboxList,
    name: "Emails",
    meta: {
      nav: "inbox",
      title: "Emails",
      message: true,
      icon: "mail",
    },
    beforeEnter: [
      allowOnlyEncryptedUsers,
      beforeEnterActivity,
      allowOnlyAdvancedMode,
    ],
  },
  {
    path: "/inbox/emails/:id",
    alias: "/activities/emails/:id",
    name: "Email",
    component: InboxEmail,
    meta: {
      title: "Email",
      message: true,
      icon: "left-arrow",
      showActivityIcons: true,
      inboxDetailPage: true,
    },
    beforeEnter: [
      allowOnlyEncryptedUsers,
      beforeEnterActivity,
      allowOnlyAdvancedMode,
    ],
  },
  {
    path: "/inbox/requests",
    alias: "/activities/requests",
    name: "Requests",
    component: InboxList,
    meta: {
      nav: "inbox",
      title: "Requests",
      message: true,
      icon: "requests",
    },
    beforeEnter: [
      allowOnlyEncryptedUsers,
      allowOnlyAdvancedMode,
      beforeEnterActivity,
    ],
  },
  {
    path: "/inbox/starred",
    alias: "/activities/starred",
    name: "Starred",
    component: InboxList,
    meta: {
      nav: "inbox",
      title: "Starred",
      message: true,
      icon: "star",
    },
    beforeEnter: [
      allowOnlyEncryptedUsers,
      beforeEnterActivity,
      allowOnlyAdvancedMode,
    ],
  },
  {
    path: "/inbox/recent",
    name: "RecentInbox",
    component: InboxList,
    meta: {
      nav: "inbox",
      title: "Recent",
      message: true,
      icon: "clock",
    },
    beforeEnter: [
      allowOnlyEncryptedUsers,
      beforeEnterActivity,
      allowOnlyAdvancedMode,
    ],
  },
  {
    path: "/inbox/favorites",
    name: "FavoritesInbox",
    component: InboxList,
    meta: {
      nav: "inbox",
      title: "Favorites",
      message: true,
      icon: "favorite",
    },
    beforeEnter: [allowOnlyEncryptedUsers, beforeEnterActivity],
  },
  {
    path: "/inbox/id/:id",
    alias: ["/activities/id/:id", "/id/:id", "/activities/:id"],
    name: "ActivityRouter",
    component: InboxDetail,
    meta: { title: "Inbox", message: true },
    beforeEnter: [
      allowOnlyEncryptedUsers,
      beforeEnterActivity,
      allowOnlyAdvancedMode,
    ],
  },
  {
    path: "/cloak/:id/inbox",
    name: "CloakInbox",
    alias: "/cloak/:id/activities",
    component: InboxList,
    meta: {
      title: "Identity Inbox",
      cloak: true,
      nav: "inbox",
    },
    beforeEnter: [
      allowOnlyEncryptedUsers,
      beforeEnterActivity,
      allowOnlyAdvancedMode,
    ],
  },
  {
    path: "/category/:id/inbox",
    name: "CategoryInbox",
    component: InboxList,
    meta: { title: "Category Inbox", nav: "inbox" },
    beforeEnter: [
      allowOnlyEncryptedUsers,
      beforeEnterActivity,
      allowOnlyAdvancedMode,
    ],
  },
  {
    path: "/category/:id",
    name: "Category",
    component: Category,
    meta: { title: "Categories", icon: "stacked-blocks" },
    beforeEnter: [
      allowOnlyEncryptedUsers,
      beforeEnterCloseRightPanel,
      allowOnlyAdvancedMode,
    ],
  },
  {
    path: "/esim/get-started",
    name: "EsimGetStarted",
    component: EsimGetStarted,
    meta: { title: "Esims", icon: "esim-page" },
    beforeEnter: [allowOnlyEncryptedUsers, beforeEnterCloseRightPanel],
  },
  {
    path: "/esim",
    name: "Esim",
    component: EsimPage,
    meta: { title: "Manage eSIM", icon: "esim-page" },
    beforeEnter: [allowOnlyEncryptedUsers, beforeEnterCloseRightPanel],
  },
  {
    path: "/import",
    name: "Import",
    component: Import,
    meta: { title: "Import" },
    redirect: "/import/source",
    beforeEnter: [allowOnlyEncryptedUsers, beforeEnterImport],
    children: [
      {
        path: "source",
        name: "ImportSource",
        component: ImportSource,
        meta: { step: 0, title: "Import" },
      },
      {
        path: "upload/:source",
        name: "ImportUpload",
        component: ImportUpload,
        meta: { step: 1, title: "Import" },
      },
      {
        path: "mapping",
        name: "ImportMapping",
        component: ImportMapping,
        meta: { step: 2, title: "Import" },
        beforeEnter: beforeImportStepEnter,
      },
      {
        path: "review",
        name: "ImportReview",
        component: ImportReview,
        meta: { step: 3, title: "Import" },
        beforeEnter: beforeImportStepEnter,
        children: [
          {
            path: "edit/:id",
            name: "ImportReviewIdentityEdit",
            component: ImportReviewEdit,
            meta: { step: 3, title: "Import" },
            beforeEnter: beforeImportStepEnter,
          },
        ],
      },
    ],
  },
  {
    path: "/referrals",
    name: "Referrals",
    component: Referral,
    meta: { title: "Referrals", icon: "gift" },
  },
  {
    path: "/identities",
    name: "All",
    component: All,
    alias: ["/all", "/start"], // not sure what/if /start is used
    meta: { title: "All identities", icon: "blocks" },
    beforeEnter: [allowOnlyEncryptedUsers, allowOnlyAdvancedMode],
  },
  // NOTE: "cloak/:id" route is used by extension
  // adding the id param breaks left nav highlighting functionality
  // which is why its not aliased above
  {
    path: "/cloak/:id",
    name: "Cloak",
    component: All,
    meta: { title: "All identities", icon: "blocks" },
    beforeEnter: [allowOnlyEncryptedUsers, allowOnlyAdvancedMode],
  },
  {
    path: "/data-delete",
    name: "DataDeleteGuest",
    component: DataDeletePageGuestOtp,
    meta: { title: "Delete Data" },
    beforeEnter: [
      allowOnlyGuests,
      (to, from, next) => {
        const { phone, email_address } = to.query;
        const hasBoth = !!phone && !!email_address;
        if (hasBoth) {
          next();
        } else {
          next({ name: "DataScan", query: to.query });
        }
      },
    ],
  },
  {
    path: "/data-scan",
    name: "DataScan",
    component: DataScan,
    meta: { title: "Data Scan" },
    beforeEnter: allowOnlyGuests,
  },
  {
    path: "/data-remove",
    name: "DataRemove",
    component: DataRemoval,
    meta: { title: "Data removal", icon: "data-delete/remove-data" },
  },
  {
    path: "/native-checkout",
    name: "NativeCheckout",
    component: NativeCheckout,
    meta: { title: "Checkout" },
    beforeEnter: allowOnlyGuests,
  },
  {
    path: "/subscribe-now",
    name: "SubscribeNow",
    redirect: (to) => ({
      name: "CheckoutCombined",
      query: to.query,
    }),
    beforeEnter: allowOnlyGuests,
  },
  {
    path: "/checkout",
    name: "Checkout",
    component: PageCheckout,
    meta: { title: "Checkout" },
    children: [
      {
        path: "",
        name: "CheckoutCombined",
        component: PageCheckoutCombined,
        meta: { title: "Checkout" },
        beforeEnter: allowOnlyGuests,
      },
      {
        path: "mobile",
        name: "CheckoutMobile",
        component: PageCheckoutMobile,
        meta: { title: "Checkout" },
        beforeEnter: [
          allowMobileScreenOnly("CheckoutCombined"),
          allowOnlyGuests,
        ],
      },
      {
        path: "success",
        name: "CheckoutSuccess",
        component: PageCheckoutSuccess,
        meta: { title: "Checkout" },
        beforeEnter: allowOnlyAuthenticatedUsers,
      },
      {
        path: "onboarding",
        name: "CheckoutOnboarding",
        component: PageCheckoutOnboarding,
        meta: { title: "Onboarding" },
        beforeEnter: allowOnlyAuthenticatedUsers,
      },
      {
        path: "download-app",
        name: "CheckoutDownloadApp",
        component: PageCheckoutDownloadApp,
        meta: { title: "Checkout" },
        beforeEnter: allowOnlyAuthenticatedUsers,
      },
    ],
  },
  {
    path: "/home",
    name: "Home",
    component: HomePage,
    alias: ["/!**/auth**", "/"],
    meta: { title: "Home" },
    beforeEnter: [clearGuestToken, allowOnlyAuthenticatedUsers],
  },
  {
    path: "/verify",
    name: "Verify",
    component: CheckVerificationEmail,
    meta: { title: "Verify Email" },
  },
  {
    path: "/exposure-status",
    name: "ExposureStatus",
    component: PageExposureStatus,
    meta: { title: "Exposure Status" },
    beforeEnter: allowOnlyAuthenticatedUsers,
    children: [
      {
        path: "",
        name: "ExposureStatusBrokers",
        component: PageExposureStatusBrokers,
        meta: { title: "Exposure Status" },
        beforeEnter: allowOnlyAuthenticatedUsers,
      },
      {
        path: "relatives",
        name: "ExposureStatusRelatives",
        component: PageExposureStatusRelatives,
        meta: { title: "Relatives" },
        beforeEnter: allowOnlyAuthenticatedUsers,
      },
    ],
  },

  {
    path: "/exposures-enroll",
    name: "ExposuresEnroll",
    component: PageExposureStatusEnroll,
    meta: { title: "Exposures Enrollment", hideAside: true },
    beforeEnter: allowOnlyAuthenticatedUsers,
    children: [
      {
        path: "",
        name: "ExposureStatusEnrollExposures",
        component: PageExposureStatusEnrollExposures,
        meta: { title: "Exposures Enrollment", hideAside: true },
        beforeEnter: allowOnlyAuthenticatedUsers,
      },
      {
        path: "monitoring",
        name: "ExposureStatusEnrollMonitoring",
        component: PageExposureStatusEnrollMonitoring,
        meta: { title: "Monitoring Enrollment", hideAside: true },
        beforeEnter: allowOnlyAuthenticatedUsers,
      },
      {
        path: "success",
        name: "ExposureStatusEnrollSuccess",
        component: PageExposureStatusEnrollSuccess,
        meta: { title: "You're protected", hideAside: true },
        beforeEnter: allowOnlyAuthenticatedUsers,
      },
      {
        path: "download",
        name: "ExposureStatusEnrollDownload",
        component: PageExposureStatusEnrollDownload,
        meta: {
          title: "Download Cloaked",
          hideAside: true,
        },
        beforeEnter: allowOnlyAuthenticatedUsers,
      },
    ],
  },
  {
    path: "/identity-monitoring",
    name: "Monitoring",
    component: PageMonitoring,
    meta: { title: "Identity Monitoring" },
    beforeEnter: [
      allowOnlyAuthenticatedUsers,
      (to, from) => {
        if (from.name && !store.getters["dataDelete/hasMonitoringEnrollment"]) {
          openMonitoringModal();
          return false;
        }
      },
    ],
    children: [
      {
        path: "",
        name: "MonitoringStatus",
        component: PageMonitoringStatus,
        meta: { title: "Identity Monitoring" },
        beforeEnter: allowOnlyAuthenticatedUsers,
      },
      {
        path: "event/:id",
        name: "MonitoringEvent",
        component: PageMonitoringEvent,
        meta: { title: "Event Details" },
        beforeEnter: allowOnlyAuthenticatedUsers,
      },
      {
        path: "settings",
        name: "MonitoringSettings",
        component: PageMonitoringSettings,
        meta: { title: "Monitoring Settings" },
        redirect: "/identity-monitoring/settings/",
        beforeEnter: allowOnlyAuthenticatedUsers,
        children: [
          {
            path: "",
            name: "MonitoringSettingsAll",
            component: PageMonitoringSettingsAll,
            meta: { title: "Identity Monitoring" },
            beforeEnter: allowOnlyAuthenticatedUsers,
          },
          {
            path: "add-names",
            name: "MonitoringSettingsNames",
            component: PageMonitoringSettingsNames,
            meta: { title: "Identity Monitoring" },
            beforeEnter: allowOnlyAuthenticatedUsers,
          },
          {
            path: "add-address",
            name: "MonitoringSettingsAddress",
            component: PageMonitoringSettingsAddress,
            beforeEnter: allowOnlyAuthenticatedUsers,
          },
        ],
      },
    ],
  },
  {
    path: "/call-guard",
    name: "CallGuard",
    component: PageCallGuard,
    meta: { title: "Call Guard" },
    beforeEnter: [allowOnlyAuthenticatedUsers, isCallGuardEnabled],
  },
  {
    path: "/auto-password-change",
    name: "AutoPasswordChange",
    component: AutoPasswordChange,
    meta: {
      requiresAuth: true,
      title: "Auto Password Change",
    },
    beforeEnter: [allowOnlyAuthenticatedUsers, allowOnlyAdvancedMode],
  },
  {
    path: "/mobile",
    name: "Mobile",
    component: RouteMobile,
    meta: { title: "Mobile" },
  },
  // NOTE: this catchall should always be listed last
  {
    path: "/:pathMatch(.*)*",
    name: "404",
    component: Page404,
    meta: { title: "Page Not Found" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export const IMPORT_ROUTES = [
  "Import",
  "ImportSource",
  "ImportUpload",
  "ImportMapping",
  "ImportReview",
  "ImportReviewIdentityEdit",
];

router.beforeEach((to, from, next) => {
  const except = ["Cloak"];
  if (except.indexOf(to.name) === -1 && except.indexOf(from.name) === -1) {
    window.scrollTo(0, 0);
  }
  if (store.state.ui.open_dialog) {
    store.commit("unclipBody");
  }
  store.commit("closeCloak");

  // Check if it's the root path AND NOT an extension auth callback
  if (to.path === "/") {
    const has_enable_pay =
      !!to.query.enable_pay || (from && !!from?.query?.enable_pay);
    const persistedQuery = has_enable_pay
      ? { enable_pay: to.query.enable_pay }
      : null;
    // NOTE: i have to leave this navigation guard here otherwise it causes an infinite routing loop
    return next({
      path: "/home",
      name: "Home",
      component: () => import("@/features/home/HomePage.vue"),
      meta: { title: "Home", icon: "home" },
      query: persistedQuery,
    });
  }
  next();
});
router.afterEach((to, from) => {
  store.dispatch("navigation/updateNavHistory", from.name);

  nextTick(() => {
    document.title = to.meta.title ? `${to.meta.title} - Cloaked` : "Cloaked";
  });

  if (to.name === "login" && from.name === "Verify") {
    // NOTE: user is trying to verify their email but is being redirected to auth/login
    toast.success("You need to log in to verify your email.");
  }
});

export default router;
