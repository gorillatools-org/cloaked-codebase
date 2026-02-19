import api from "@/api/api";

export default class NumberLockingService {
  static async unlockPhoneNumber(phoneId) {
    return api().post(`/api/v2/cloaked/number/${phoneId}/unlock/`);
  }
  static async lockPhoneNumber(phoneId) {
    return api().post(`/api/v2/cloaked/number/${phoneId}/lock/`);
  }
}
