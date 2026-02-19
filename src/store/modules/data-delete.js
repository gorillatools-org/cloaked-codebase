import { PH_FEATURE_FLAG_DATA_DELETION_IN_APP_SEARCH } from "@/scripts/posthogEvents";
import { getPosthog } from "@/scripts/posthog";

const defaultState = () => ({
  removalLogData: {
    brokerList: [],
    brokersInProgress: 0,
    totalBrokers: 0,
    isComplete: false,
    removalDate: new Date(),
    brokersCompleted: 0,
    removalLogFetched: false,
  },
  removalLogDataPastScan: {
    brokerList: [],
    brokersInProgress: 0,
    totalBrokers: 0,
    isComplete: false,
    removalDate: new Date(),
    brokersCompleted: 0,
    removalLogFetched: false,
  },
  enrollmentData: {
    enrollmentDataFetched: false,
    brokersCompleted: 0,
    brokersInProgress: 0,
    scanUpdatedDate: new Date(),
    isComplete: false,
    scanningSites: 0,
    totalRecordsRemoved: 0,
    daysProtected: 0,
    pastScans: [],
    latestScan: null,
  },
  automationResults: null,
  actionRequiredFamilies: [],
  graphData: null,
  enrollmentProfile: null,

  // posthog feature flags
  ddInAppSearchEnabled: false,

  // cloaked basic mode summary
  basicModeSummary: null,
  recentlyEnrolled: false,
});

export default {
  namespaced: true,
  state: defaultState(),

  mutations: {
    reset(state) {
      Object.assign(state, defaultState());
    },
    setRecentlyEnrolled(state, recentlyEnrolled) {
      state.recentlyEnrolled = recentlyEnrolled;
    },
    setRemovalLogData(state, resp) {
      state.removalLogData = {
        ...state.removalLogData,
        brokerList: resp?.data?.brokers ?? 0,
        brokersInProgress: resp?.data?.state?.brokers_in_progress ?? 0,
        totalBrokers:
          (resp?.data?.state?.brokers_in_progress ?? 0) +
          (resp?.data?.state?.brokers_complete ?? 0),
        isComplete: resp?.data?.state?.is_complete,
        removalDate: new Date(),
        brokersCompleted: resp?.data?.state?.brokers_complete ?? 0,
        removalLogFetched: true,
      };
    },
    setRemovalLogDataPastScan(state, resp) {
      state.removalLogDataPastScan = {
        ...state.removalLogData,
        brokerList: resp?.data?.brokers ?? 0,
        brokersInProgress: resp?.data?.state?.brokers_in_progress ?? 0,
        totalBrokers:
          (resp?.data?.state?.brokers_in_progress ?? 0) +
          (resp?.data?.state?.brokers_complete ?? 0),
        isComplete: resp?.data?.state?.is_complete,
        removalDate: new Date(),
        brokersCompleted: resp?.data?.state?.brokers_complete ?? 0,
        removalLogFetched: true,
      };
    },
    setEnrollmentData(state, resp) {
      state.enrollmentData = {
        brokersCompleted: resp?.data?.latest_scan?.state?.brokers_complete ?? 0,
        brokersInProgress:
          resp?.data?.latest_scan?.state?.brokers_in_progress ?? 0,
        scanUpdatedDate: new Date(),
        isComplete: resp?.data?.latest_scan?.state?.is_complete,
        scanningSites: resp?.data?.latest_scan?.broker_count ?? 0,
        totalRecordsRemoved:
          resp?.data?.monitoring_status?.total_records_removed ?? 0,
        totalItemsRemoved:
          resp?.data?.monitoring_status?.total_items_removed ?? 0,
        totalItemsRemovedToday:
          resp?.data?.monitoring_status?.items_removed_today ?? 0,
        nextScanDate: resp?.data?.array_rescan_at,
        daysProtected: resp?.data?.monitoring_status?.days_protected ?? 0,
        enrollmentDataFetched: true,
        apiCalledTimestamp: new Date(),
        pastScans: resp?.data?.past_scans,
        latestScan: resp?.data?.latest_scan,
      };
    },
    setAutomationResults(state, results) {
      state.automationResults = results;
    },
    setInAppSearchFeatureFlag(state, isEnabled) {
      state.ddInAppSearchEnabled = isEnabled;
    },
    setActionRequiredFamilies(state, brokerFamilies) {
      state.actionRequiredFamilies = brokerFamilies ?? [];
    },
    setRemovalLogBrokerList(state, brokerList) {
      state.removalLogData.brokerList = brokerList ?? [];
    },
    setGraphData(state, graphData) {
      state.graphData = graphData;
    },
    setEnrollmentProfile(state, profileData) {
      state.enrollmentProfile = profileData;
    },
    setBasicModeSummary(state, summary) {
      state.basicModeSummary = summary;
    },
  },
  getters: {
    removalLogData: (state) => {
      return state.removalLogData;
    },
    removalLogDataPastScan: (state) => {
      return state.removalLogDataPastScan;
    },
    enrollmentData: (state) => {
      return state.enrollmentData;
    },
    getDdInAppSearchEnabled: (state) => {
      return state.ddInAppSearchEnabled;
    },
    getDdOnboardingEnabled: (state, getters, rootState) => {
      return rootState.authentication?.user?.flags?.dd_onboarding_enabled;
    },
    actionRequiredFamilies: (state) => {
      return state?.actionRequiredFamilies;
    },
    getGraphData: (state) => {
      return state?.graphData;
    },
    getAutomationResults: (state) => {
      return state.automationResults;
    },
    getEnrollmentProfile: (state) => {
      return state?.enrollmentProfile;
    },
    getBasicModeSummary: (state) => {
      return state?.basicModeSummary;
    },
    hasRemovalEnrollment: (state) =>
      !!state.enrollmentProfile?.name?.first || state.recentlyEnrolled,
    hasMonitoringEnrollment: (state) => !!state.enrollmentProfile?.dob,
  },
  actions: {
    reset({ commit }) {
      commit("reset");
    },
    setRecentlyEnrolled({ commit }, recentlyEnrolled) {
      commit("setRecentlyEnrolled", recentlyEnrolled);
    },
    setBasicModeSummary({ commit }, summary) {
      commit("setBasicModeSummary", summary);
    },
    setRemovalLogData({ commit }, apiResponse) {
      commit("setRemovalLogData", apiResponse);
    },
    setRemovalLogDataPastScan({ commit }, apiResponse) {
      commit("setRemovalLogDataPastScan", apiResponse);
    },
    setEnrollmentData({ commit }, apiResponse) {
      commit("setEnrollmentData", apiResponse);
    },
    setActionRequiredFamilies({ commit }, brokerFamilies) {
      commit("setActionRequiredFamilies", brokerFamilies);
    },
    async loadFeatureFlags({ commit }) {
      const posthog = await getPosthog();
      posthog?.onFeatureFlags(() => {
        commit(
          "setInAppSearchFeatureFlag",
          posthog?.isFeatureEnabled(PH_FEATURE_FLAG_DATA_DELETION_IN_APP_SEARCH)
        );
      });
    },
    updateRemovalLogBrokerList({ commit }, brokerList) {
      commit("setRemovalLogBrokerList", brokerList);
    },
    setGraphData({ commit }, graphData) {
      commit("setGraphData", graphData);
    },
    setEnrollmentProfile({ commit }, profileData) {
      commit("setEnrollmentProfile", profileData);
    },
  },
};
