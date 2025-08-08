import api from "@/api/api";

export default class ContactsService {
  static async fetchContactsPage(url) {
    return api()
      .get(url)
      .then(({ data }) => {
        return data;
      })
      .catch((e) => {
        throw new Error(e);
      });
  }

  static async fetchEmailContactsPage(identityId, page) {
    const res = await this.fetchContactsPage(
      `/api/v1/contacts/email/?identity=${identityId}&page_size=5&page=${page}&ordering=-updated_at`
    );
    return res;
  }

  static async fetchPhoneContactsPage(identityId, page) {
    const res = await this.fetchContactsPage(
      `/api/v1/contacts/phone/?identity=${identityId}&page_size=5&page=${page}&ordering=-updated_at`
    );
    return res;
  }

  static async fetchContactsInfoByType({ contactId, contactType }) {
    return api()
      .get(`/api/v1/contacts/${contactType}/${contactId}/`)
      .then(({ data }) => {
        return data;
      });
  }

  static async changeContactStatus(contactType, contactId, newStatus) {
    return api()
      .post(`/api/v1/contacts/${contactType}/${contactId}/${newStatus}/`)
      .then(async ({ data }) => {
        return data;
      })
      .catch((e) => {
        throw new Error(e);
      });
  }

  static async saveChangesToContact({
    contactType,
    contactId,
    first_name,
    last_name,
    company,
  }) {
    const payload = {
      first_name,
      last_name,
      company,
    };
    return api().patch(`api/v1/contacts/${contactType}/${contactId}/`, payload);
  }

  static async addContactToPhone({
    cloakPhoneId,
    first_name,
    last_name,
    company,
    contact_number,
  }) {
    const payload = {
      first_name,
      last_name,
      company,
      contact_number,
    };
    return api().post(
      `/api/v2/cloaked/number/${cloakPhoneId}/bind_number/`,
      payload
    );
  }
  static async addContactToEmail({
    cloakEmailId,
    first_name,
    last_name,
    company,
    contact_email,
  }) {
    const payload = {
      first_name,
      last_name,
      company,
      contact_email,
    };
    return api().post(
      `/api/v2/cloaked/email/${cloakEmailId}/bind_email/`,
      payload
    );
  }
}
