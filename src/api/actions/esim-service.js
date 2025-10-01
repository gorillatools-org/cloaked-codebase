import api from "@/api/api";
const route = "/api/v1/sim";
import store from "@/store";

export default class ESimService {
  static async enableESim() {
    return api()
      .post(`${route}/feature/enable/`)
      .then((response) => {
        return response.data.installed;
      });
  }

  static async getDevices() {
    return api()
      .get(`${route}/device/?page_size=100`)
      .then((response) => {
        return response.data;
      });
  }

  static async getSims(params) {
    let queryString = "";
    if (params) {
      let queryArray = [];
      Object.keys(params).forEach((key) =>
        queryArray.push(`${key}=${params[key]}`)
      );
      queryString = `?${queryArray.join("&")}`;
    }
    return api()
      .get(`${route}/user/${queryString}`)
      .then((response) => {
        store.dispatch("esim/setEsims", response?.data?.results);
        return response;
      });
  }

  static async createDeviceTmobile(imei, eid, nickname = "optional_nickname") {
    const payload = {
      imei: imei,
      eid: eid,
      nickname: nickname,
    };
    return api()
      .post(`${route}/device/tmobile/create/`, payload)
      .then((response) => {
        return response;
      });
  }

  static async activateSim(simID, zipCode) {
    const reservePayload = {
      zip: zipCode,
    };
    return api()
      .post(`${route}/user/${simID}/activate/`, reservePayload)
      .then((response) => {
        return response;
      })
      .catch((err) => {
        throw err;
      });
  }
  static async checkCoverage({ street1, street2, city, stateAb, zipCode }) {
    const payload = {
      street1: street1 || "1",
      street2: street2 || "1",
      city: city || "1",
      state: stateAb || "1",
      zip: zipCode,
    };
    return api()
      .post(`${route}/inventory/tmobile/coverage/`, payload)
      .then((response) => {
        return response?.data?.location;
      });
  }
  static async getAssignedSims() {
    return api()
      .get(`${route}/user/`)
      .then((response) => {
        return response.data;
      });
  }

  static async deleteDevice(id) {
    return api().delete(`${route}/device/${id}/`);
  }

  static async getAvaliableSim() {
    return api()
      .get(`${route}/inventory/tmobile/available/`)
      .then((res) => {
        return res?.data?.sim;
      })
      .catch((err) => {
        return err.response.data.sim;
      });
  }

  static async holdAvaliableSim() {
    return api()
      .get(`${route}/user/tmobile/hold/`)
      .then((response) => {
        return response.data.sim.uuid;
      });
  }

  static async reserveSim(uuid, zipCode) {
    const reservePayload = {
      uuid: uuid,
      zip: zipCode,
    };
    api()
      .post(`${route}/user/tmobile/reserve/`, reservePayload)
      .then((response) => {
        const eSimPhoneNumber = response.data.assignment.msisdn;
        const simID = response.data.assignment.id;
        return [simID, eSimPhoneNumber];
      });
  }

  static async confirmEsimProfile(simID) {
    return api().get(`${route}/user/${simID}/profile/confirm/`);
  }

  static async getEsimProfile(simID) {
    return api().get(`${route}/user/${simID}/profile/`);
  }

  static async getSimUsage(simId) {
    return api()
      .get(`${route}/user/${simId}/profile/usage/`)
      .then((response) => {
        store.dispatch("esim/setSimUsage", {
          simId,
          usageData: response?.data?.profile?.result,
        });
        return response.data;
      });
  }
}
