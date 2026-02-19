import api, { cache } from "@/api/api";
import { fetchFeatureFlag } from "@/composables/usePostHogFeatureFlag.js";

export default class InboxService {
  static async getInbox(params, useCache = true, source) {
    // Fetch feature flag value directly (works in static methods)
    const { value: activity25Flag } = await fetchFeatureFlag(
      "dashboard-activity-2-5"
    );

    const queryKeys = {
      ordering: "-created_at",
      ...params,
    };

    if (!activity25Flag) {
      queryKeys.group_threads = true;
      if (queryKeys.search) {
        queryKeys.sensitive_search = queryKeys.search;
        delete queryKeys.search;
      }
    }
    const queryParams = Object.keys(queryKeys).map((key) => {
      return `${key}=${queryKeys[key]}`;
    });

    // NOTE: This is an example cache call
    if (useCache) {
      return cache(source).get(
        activity25Flag
          ? `api/v2_5/cloaked/activity/group/?${queryParams.join("&")}`
          : `api/v2/cloaked/activity/?${queryParams.join("&")}`
      );
    }
    return api(source)
      .get(
        activity25Flag
          ? `api/v2_5/cloaked/activity/group/?${queryParams.join("&")}`
          : `api/v2/cloaked/activity/?${queryParams.join("&")}`
      )
      .catch((err) => err);
  }

  static async getActivityDetails(activityId) {
    const { value: activity25Flag } = await fetchFeatureFlag(
      "dashboard-activity-2-5"
    );

    const url = activity25Flag
      ? `/api/v2_5/cloaked/activity/${activityId}/?ordering=-created_at`
      : `/api/v2/cloaked/activity/${activityId}/?ordering=-created_at`;

    // NOTE: This is an example cache call
    // return cache().get(url);
    return api().get(url);
  }

  static getThread(url) {
    // NOTE: This is an example cache call
    // return cache().get(url);
    return api().get(url);
  }

  static getConversation(threadId) {
    const url = `/api/v2/cloaked/activity/conversation/${threadId}/?ordering=-created_at`;
    // NOTE: This is an example cache call
    // return cache().get(url);
    return api().get(url);
  }

  static markThreadsAsRead(threadIds) {
    const url = `/api/v2/cloaked/activity/read-thread/`;
    return api()
      .post(url, { ids: threadIds })
      .then((response) => {
        window.dispatchEvent(new CustomEvent("inbox-updated"));
        return response;
      });
  }

  static bulkDeleteActivity(threadIds) {
    const url = `/api/v2/cloaked/activity/bulk-delete-thread/`;
    const payload = { ids: threadIds };
    return api()
      .post(url, payload)
      .then((response) => {
        window.dispatchEvent(new CustomEvent("inbox-updated"));
        return response;
      });
  }

  static markThreadsAsUnread(threadIds) {
    const url = `api/v2/cloaked/activity/unread-thread/`;
    return api()
      .post(url, { ids: threadIds })
      .then((response) => {
        window.dispatchEvent(new CustomEvent("inbox-updated"));
        return response;
      });
  }

  static deleteActivity(activity_id) {
    const url = `/api/v1/cloaked/activity/${activity_id}/`;
    return api().delete(url);
  }

  static deleteEmail(email_id) {
    const url = `/api/v1/inbox/email/${email_id}/`;
    return api().delete(url);
  }

  static getContent(activityId) {
    const url = `/api/v2/cloaked/activity/${activityId}/content/`;
    return api().get(url);
  }

  static getContentUri(contentUri) {
    return api().get(contentUri);
  }

  static async postEmailForward(activityId, body) {
    const { value: activity25Flag } = await fetchFeatureFlag(
      "dashboard-activity-2-5"
    );
    const url = activity25Flag
      ? `/api/v2_5/cloaked/activity/${activityId}/email/forward/`
      : `/api/v2/cloaked/activity/${activityId}/email/forward/`;
    return api().post(url, body);
  }

  static sendComposeMessage(payload) {
    return api().post("/api/v1/cloaked/activity/message/compose/", payload);
  }

  static sendComposeEmail(payload) {
    return api().post("/api/v1/cloaked/activity/email/compose/", payload);
  }

  static async sendReply(id, payload) {
    delete payload?.original_html;
    const { value: activity25Flag } = await fetchFeatureFlag(
      "dashboard-activity-2-5"
    );
    const url = activity25Flag
      ? `/api/v2_5/cloaked/activity/${id}/reply/`
      : `/api/v2/cloaked/activity/${id}/reply/`;
    return api().post(url, payload);
  }

  static async postContactStatus(id, status) {
    return await api().post(`/api/v1/contacts/phone/${id}/${status}/`);
  }

  static async deleteThread(id) {
    const payload = {
      thread_id: id,
    };

    return api()
      .post("/api/v1/cloaked/activity/delete-thread/", payload)
      .then((response) => {
        window.dispatchEvent(new CustomEvent("inbox-updated"));
        return response;
      });
  }

  static async handleMessageUploads(payload) {
    const url = "/api/v1/cloaked/activity/upload_media_urls/";
    return api().post(url, payload);
  }

  static async handleEmailUploads(payload) {
    const url = "/api/v1/cloaked/activity/upload_urls/";
    return api().post(url, payload);
  }

  static async getUnreadCount() {
    return await api().get(`/api/v2/cloaked/activity/unread-count/`);
  }

  static async checkIfThreadExists(payload) {
    const url = "/api/v2/cloaked/activity/number/thread/";
    return await api().post(url, payload);
  }

  static async markThreadsStarred(threadIds) {
    const url = "/api/v2/cloaked/activity/star-thread/";
    return await api()
      .post(url, { ids: threadIds })
      .then((response) => {
        window.dispatchEvent(new CustomEvent("inbox-updated"));
        return response;
      });
  }
  static async markThreadsUnstarred(threadIds) {
    const url = "/api/v2/cloaked/activity/unstar-thread/";
    return await api()
      .post(url, { ids: threadIds })
      .then((response) => {
        window.dispatchEvent(new CustomEvent("inbox-updated"));
        return response;
      });
  }
}
