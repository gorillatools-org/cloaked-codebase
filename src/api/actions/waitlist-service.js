import api from "@/api/api";
import store from "@/store";

export default class WaitlistService {
  static async getWaitlist() {
    const currentWaitlist = store.state.waitlist?.waitlist;
    if (currentWaitlist && currentWaitlist.length > 0) {
      return currentWaitlist;
    }

    return api()
      .get("/api/v1/waitlist/")
      .then((response) => {
        store.commit("setWaitlist", response.data);
        return response.data;
      });
  }

  static async joinWaitlist(item) {
    return api()
      .post("/api/v1/waitlist/join/", item)
      .then((response) => {
        store.commit("updateWaitlist", response.data);
        return response.data;
      });
  }
}
