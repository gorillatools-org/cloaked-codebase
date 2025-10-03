import api from "@/api/api";

export default class AddressService {
  static getAvailableAddresses() {
    return api().get("/api/v1/cloaked/address/available/");
  }

  static async getAddressForIdentity(identityId) {
    try {
      const response = await api().get(
        `/api/v1/cloaked/identity/${identityId}/mailbox/`
      );
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  static async setAddressForIdentity(mailboxId, identityId) {
    try {
      const response = await api().post(
        `/api/v1/cloaked/identity/${identityId}/mailbox/`,
        { address_pool_id: mailboxId }
      );
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  static async deleteAddressForIdentity(identityId) {
    try {
      const response = await api().delete(
        `/api/v1/cloaked/identity/${identityId}/mailbox/`
      );
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
}
