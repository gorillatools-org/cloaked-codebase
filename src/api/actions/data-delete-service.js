import api, { headers, cache } from "@/api/api";
import axios from "axios";
import store from "@/store";

function search() {
  return axios.create({
    baseURL: import.meta.env.VITE_SEARCH_API,
    headers: { ...headers() },
  });
}

export default class DataDeleteService {
  static async createScan({
    firstName,
    lastName,
    age,
    state,
    city,
    email,
    phone,
  } = {}) {
    return await api().post("/api/v1/data_deletion/scan/", {
      first_name: firstName,
      last_name: lastName,
      age: age,
      city: city,
      state: state,
      postal_code: undefined,
      country: "US",
      email_address: email,
      phone_number: phone,
    });
  }

  static async getScanProgress() {
    return await api().get("/api/v1/data_deletion/scan/");
  }

  static async getPublicRecords({
    firstName,
    lastName,
    state,
    phoneNumber,
    age,
    email,
    redactAddress = false,
  }) {
    let query = {
      firstName,
      lastName,
      stateAbbreviation: state,
      age,
      email,
      phone: phoneNumber,
      redactAddress: redactAddress,
    };

    return await search()
      .post("/api/v1/data_report_scan44/search/", query)
      .catch(async (error) => {
        // if 409, means user has already searched and results are in progress
        if (error.response.status === 409) {
          return {
            data: {
              in_progress: true,
            },
          };
        }
        // try again if failed and not 409
        return await search()
          .post("/api/v1/data_report_scan44/search/", query)
          .catch((error) => {
            // if 409, means user has already searched and results are in progress
            if (error.response.status === 409) {
              return {
                data: {
                  in_progress: true,
                },
              };
            }
            return {
              data: {
                hasError: true,
                results: [],
              },
            };
          });
      });
  }

  static async createEnrollmentData(payload) {
    return await api()
      .post("/api/v1/data_deletion/enrollment/", payload)
      .then((resp) => {
        store.dispatch("dataDelete/setEnrollmentData", resp);
        store.dispatch("authentication/getUser"); // need to refetch user flags
        window.dispatchEvent(new CustomEvent("cloak:refresh-emails"));
        return resp;
      });
  }

  static async getEnrollmentData() {
    return await api()
      .get("/api/v1/data_deletion/enrollment/")
      .then((resp) => {
        store.dispatch("dataDelete/setEnrollmentData", resp);
        return resp;
      })
      .catch(() => {});
  }

  static async getRemovalLog() {
    return await api()
      .get("/api/v1/data_deletion/enrollment/removal_log/")
      .then((resp) => {
        store.dispatch("dataDelete/setRemovalLogData", resp);
        return resp;
      });
  }

  static async getActionItems() {
    return await api()
      .get("/api/v1/data_deletion/enrollment/action_items/")
      .then((response) => {
        store.dispatch(
          "dataDelete/setActionRequiredFamilies",
          response?.data?.broker_families
        );
        return response;
      })
      .catch((error) => {
        store.dispatch("dataDelete/setActionRequiredFamilies", []);
        return error;
      });
  }

  static async markBrokerFamilyDone(brokerFamilyId) {
    const payload = {
      broker_family_id: brokerFamilyId,
    };

    return await api()
      .post("/api/v1/data_deletion/enrollment/actions/complete/", payload)
      .then((resp) => {
        const actionRequiredFamilies =
          store.getters["dataDelete/actionRequiredFamilies"];
        const updatedFamilies = actionRequiredFamilies.filter((family) => {
          return family?.id !== brokerFamilyId;
        });

        store.dispatch("dataDelete/setActionRequiredFamilies", updatedFamilies);
        return resp;
      });
  }

  static async getGraphData() {
    return await api()
      .get("/api/v1/data_deletion/enrollment/removal_count/")
      .then((resp) => {
        store.dispatch("dataDelete/setGraphData", resp.data);
        return resp;
      })
      .catch(() => {});
  }
  static async getEnrollmentProfile() {
    return await api()
      .get("api/v1/data_deletion/enrollment/profile/")
      .then((resp) => {
        store.dispatch("dataDelete/setEnrollmentProfile", resp?.data);
        return resp;
      })
      .catch(() => {});
  }
  static async getPastScan(id) {
    return await cache()
      .get(`/api/v1/data_deletion/enrollment/removal_log/${id}/`)
      .then((resp) => {
        store.dispatch("dataDelete/setRemovalLogDataPastScan", resp);
        return resp;
      })
      .catch(() => {});
  }

  static async updateEnrollmentProfile(payload) {
    return await api()
      .post("/api/v1/data_deletion/enrollment/profile/", payload)
      .then((resp) => {
        store.dispatch("dataDelete/setEnrollmentProfile", resp?.data);
        return resp;
      });
  }

  static async updateEnrollmentProfilePatch(payload) {
    return await api()
      .patch("/api/v1/data_deletion/enrollment/profile/", payload)
      .then((resp) => {
        store.dispatch("dataDelete/setEnrollmentProfile", resp?.data);
        return resp;
      });
  }

  // NOTE: cloaked basic mode summary
  static async getBasicModeSummary() {
    return api()
      .get(`/api/v1/data_deletion/basic-mode-summary/`)
      .then((resp) => {
        store.dispatch("dataDelete/setBasicModeSummary", resp.data);
        return resp;
      })
      .catch((err) => {
        return err;
      });
  }

  static async getRelatives() {
    return api().get(`/api/v1/data_deletion/relatives/?page_size=1000`);
  }

  static async updateRelative(id, isRelative) {
    return api().patch(`/api/v1/data_deletion/relatives/${id}/`, {
      is_relative: isRelative,
    });
  }

  static async getEmailBreachReport(email, page = 1, pageSize = 10) {
    return api().get(
      `/api/v1/breach/report/email/?email=${encodeURIComponent(email)}&page=${page}&page_size=${pageSize}`
    );
  }

  static async getBreachScanReport(email) {
    return api().get(
      `/api/v1/breach/report/breach_scan/?email=${encodeURIComponent(email)}`
    );
  }

  static async getEmailBreachCompany(company) {
    return api().get(`/api/v1/website/?search=${encodeURIComponent(company)}`);
  }
}

// MOCKS

// const mockSummaryResponse = {
//   summary: {
//     total_exposures_removed: 1,
//     latest_scan_date: "10/18/24",
//     exposures_found_in_latest_scan: 2000,
//     next_scan_date: "11/18/2024",
//     total_exposed_records: 3000,
//   },
//   statistics: {
//     scammer_visibility: 90,
//     potential_hacks: 20,
//     info_on_public_record: 60,
//   },
//   timeline: {
//     scan_1: {
//       scan_date: "11/17/24",
//       exposures_found: 2500,
//       mid_point: {
//         total_exposures_removed: 500,
//         exposure_info: {
//           type: "phone",
//           records_removed: 250,
//           statistic: 45,
//         },
//       },
//       end_point: null,
//     },
//     scan_2: {
//       scan_date: "11/20/24",
//       exposures_found: 2500,
//       mid_point: {
//         total_exposures_removed: 251,
//         exposure_info: {
//           type: "email",
//           records_removed: 250,
//           statistic: 15,
//         },
//       },
//       end_point: {
//         total_exposures_removed: 1500,
//         exposure_info: {
//           type: "phone",
//           records_removed: 500,
//           statistic: 50,
//         },
//       },
//     },
//     scan_3: {
//       scan_date: "12/16/24",
//       exposures_found: null,
//       mid_point: null,
//       end_point: null,
//     },
//   },
// };

// const mockProfileResponse = {
//   data: {
//     name: {
//       first: "first",
//       last: "lastly",
//       prefix: "Dr.",
//       middle: "middle",
//       suffix: "jr.",
//     },
//     other_names: [
//       {
//         first: "other",
//         last: "name",
//         prefix: "Queen",
//         middle: "middleton",
//         suffix: "IiI",
//       },
//       {
//         first: "other carington",
//         last: "lastname",
//         suffix: "i",
//       },
//     ],
//     birth_year: 1991,
//     phone_numbers: ["+16192958443", "+16192958443"],
//     email_addresses: [
//       "email@test.com",
//       "faker@somereallysuperlongthing@this.com",
//     ],
//     addresses: [
//       {
//         city: "SAN DIEGO",
//         state: "CA",
//         country: "US",
//         address1: "1234 main st",
//         address2: "apt 37",
//         postal_code: "23156",
//       },
//       {
//         city: "SAN DIEGO",
//         state: "CA",
//         country: "US",
//         address1: "321 main st",
//         address2: "Unit 14",
//       },
//       {
//         city: "SAN DIEGO",
//         state: "CA",
//         country: "US",
//         address1: "376 main st",
//         postal_code: "92101",
//       },
//     ],
//   },
// };

// const mockGraphResponse = {
//   data: {
//     interval: "daily", // in the future
//     graph_data: [
//       {
//         date: "2024-06-01",
//         email: 2,
//         phone: 1,
//         full_name: 1,
//       },
//       {
//         date: "2024-06-02",
//         full_name: 1,
//       },
//       {
//         date: "2024-06-03",
//         full_name: 1,
//       },
//       {
//         date: "2024-06-10",
//         full_name: 4,
//         address: 2,
//         relatives: 1,
//       },
//       {
//         date: "2024-06-20",
//         full_name: 21,
//         address: 22,
//       },
//       {
//         date: "2024-07-01",
//         full_name: 20,
//         address: 2,
//         relatives: 4,
//       },
//       {
//         date: "2024-07-10",
//         full_name: 2,
//         address: 2,
//         relatives: 10,
//       },
//       {
//         date: "2024-07-11",
//         full_name: 10,
//         address: 2,
//       },
//       {
//         date: "2024-07-12",
//         full_name: 2,
//         address: 2,
//       },
//       {
//         date: "2024-07-15",
//         full_name: 2,
//         address: 3,
//       },
//       {
//         date: "2024-07-03",
//         full_name: 2,
//         address: 2,
//       },
//       {
//         date: "2024-07-04",
//         full_name: 2,
//         address: 8,
//         relatives: 1,
//       },
//     ],
//   },
// };

// const mockActionItems = {
//   data: {
//     broker_families: [
//       {
//         id: "brokerFamily:BeenVerified",
//         name: "BeenVerified",
//         removal_steps: "1. do something \n2. do something else",
//         not_getting_removed: "what is this??",
//         brokers: [],
//       },
//       {
//         id: "brokerFamily:secondfamily",
//         name: "secondfamily",
//         removal_steps: "1. do something 2. do something else",
//         not_getting_removed: "what is this??",
//         brokers: [{ name: "name3" }, { name: "name4" }],
//       },
//       {
//         id: "brokerFamily:thirdfamily",
//         name: "thirdfamily",
//         removal_steps: "1. do something 2. do something else",
//         not_getting_removed: "what is this??",
//         brokers: null,
//       },
//     ],
//   },
// };

// const mockEnrollmentData = {
//   data: {
//     id: "2iNai8f8xq-E6jIIqd8uP",
//     array_created_at: "2024-07-01T18:52:54.605000Z",
//     array_modified_at: "2024-07-01T18:52:54.605000Z",
//     array_canceled_at: null,
//     array_rescan_at: "2024-09-29T17:29:03.000000Z",
//     latest_scan: {
//       id: "o5IMLvb1L6WF-Ax66dmoc",
//       broker_count: 104,
//       array_created_at: "2024-07-01T18:52:54.833000Z",
//       array_modified_at: "2024-07-01T18:54:49.989000Z",
//       array_started_at: "2024-07-01T18:52:55.751000Z",
//       array_stopped_at: null,
//       array_status: "done",
//       state: {
//         is_complete: false,
//         brokers_in_progress: 1,
//         brokers_complete: 103,
//         action_required_count: 0,
//       },
//     },
//     monitoring_status: {
//       scanning_sites: 104,
//       total_records_removed: 129,
//       days_protected: 53,
//       total_items_removed: 731,
//       items_removed_today: 0,
//     },
//     past_scans: [
//       { id: "abc123", date: "2024-07-06" },
//       { id: "def456", date: "2024-06-06" },
//       { id: "ghi789", date: "2024-05-05" },
//     ],
//   },
// };

// const mockRemovalLog = {
//   data: {
//     id: "o5IMLvb1L6WF-Ax66dmoc",
//     broker_count: 104,
//     array_created_at: "2024-07-01T18:52:54.833000Z",
//     array_modified_at: "2024-07-01T18:54:49.989000Z",
//     array_started_at: "2024-07-01T18:52:55.751000Z",
//     array_stopped_at: null,
//     array_status: "done",
//     state: {
//       is_complete: false,
//       brokers_in_progress: 1,
//       brokers_complete: 103,
//       action_required_count: 0,
//     },
//     brokers: [
//       {
//         id: "rWS4wTJZCsMGuNuO3uw1-",
//         records_matched: 1,
//         broker_name: "411locate",
//         broker_info_types: [
//           "Name",
//           "Address",
//           "Age",
//           "Phone numbers",
//           "Email addresses",
//           "Relatives",
//         ],
//         removal_instructions: "",
//         state: "continued",
//         sent_at: "2024-07-01T18:53:02.476000Z",
//         completed_at: "2024-07-01T18:57:16.284000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "8-4bO4i_y7NO5asq1p1Tn",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA I SMITH", "relatives": ["Keenan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//             total_items: 23,
//             is_removed: true,
//           },
//         ],
//       },
//       {
//         id: "KKlhwYcuIYx5H-9T__bP6",
//         records_matched: 2,
//         broker_name: "Addresses",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Employment",
//           "Education",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions:
//           'Follow these steps to remove your private exposed data from public search on the PeopleConnect family of sites\n1. Head over to [https://suppression.peopleconnect.us/login](https://suppression.peopleconnect.us/login) to begin the opt out process.\n2. Enter your email address and click submit.\n3. Log into your email account, you will receive an email with the subject of “Confirm your email address”.\n4. In that email, click on “Verify Email” to navigate to the identity page of the suppression flow. \n5. Provide date of birth and click continue.\n6. Enter legal name and click continue.\n7. Identify your record and click continue to manage suppression rules. \n8. Use the Desired Behavior dropdown to select “Suppressed”.\n9. Click "Save" to prevent your record from appearing in the people search site search results.',
//         state: "continued",
//         sent_at: null,
//         completed_at: "2024-07-05T11:45:30.961000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "fhrRQs-RMZ49RsWqulk58",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "2a81YNclI2_LHXdlU1Lbp",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "mVs7uNJ51ncfkSY-BL8pI",
//         records_matched: 2,
//         broker_name: "AddressSearch",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Employment",
//           "Education",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions:
//           'Follow these steps to remove your private exposed data from public search on the PeopleConnect family of sites\n1. Head over to [https://suppression.peopleconnect.us/login](https://suppression.peopleconnect.us/login) to begin the opt out process.\n2. Enter your email address and click submit.\n3. Log into your email account, you will receive an email with the subject of “Confirm your email address”.\n4. In that email, click on “Verify Email” to navigate to the identity page of the suppression flow. \n5. Provide date of birth and click continue.\n6. Enter legal name and click continue.\n7. Identify your record and click continue to manage suppression rules. \n8. Use the Desired Behavior dropdown to select “Suppressed”.\n9. Click "Save" to prevent your record from appearing in the people search site search results.',
//         state: "removed",
//         sent_at: null,
//         completed_at: "2024-07-05T11:45:30.961000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "RXH9LgVl4X5KWgiY7-S3t",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "5FYEMzICSAUbc4ued07g9",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "OD0cjdCNRVmlnHpr0R4GW",
//         records_matched: 1,
//         broker_name: "AdvancedBackgroundChecks",
//         broker_info_types: [
//           "Name",
//           "Address",
//           "Age",
//           "Relatives",
//           "Phone numbers",
//           "Email addresses",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: "2024-07-01T18:53:02.476000Z",
//         completed_at: "2024-07-01T18:57:16.284000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "nr4uQK3UCWqFRwT3TnK7V",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA I SMITH", "relatives": ["Keenan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "VbfWPW1NoPeAcF2PGSBqb",
//         records_matched: 1,
//         broker_name: "AdvancedPeopleSearch",
//         broker_info_types: [
//           "Name",
//           "Address",
//           "Age",
//           "Relatives",
//           "Phone numbers",
//           "Email addresses",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: "2024-07-01T18:53:02.476000Z",
//         completed_at: "2024-07-01T18:57:16.284000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "9CcFfL0pT8M5B6wPb4b2r",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA I SMITH", "relatives": ["Keenan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "0NX8nG44aSsGpXUdEhBRK",
//         records_matched: 0,
//         broker_name: "AffordableBackgroundChecks",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions: "",
//         state: "no_records_found",
//         sent_at: "2024-07-01T18:53:04.747000Z",
//         completed_at: "2024-07-01T18:53:04.747000Z",
//         estimated_days_to_remove_records: 3,
//         records: [],
//       },
//       {
//         id: "ALA6zfJx0KgGJ3Pw58rhN",
//         records_matched: 2,
//         broker_name: "AllAreaCodes",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Employment",
//           "Education",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions:
//           'Follow these steps to remove your private exposed data from public search on the PeopleConnect family of sites\n1. Head over to [https://suppression.peopleconnect.us/login](https://suppression.peopleconnect.us/login) to begin the opt out process.\n2. Enter your email address and click submit.\n3. Log into your email account, you will receive an email with the subject of “Confirm your email address”.\n4. In that email, click on “Verify Email” to navigate to the identity page of the suppression flow. \n5. Provide date of birth and click continue.\n6. Enter legal name and click continue.\n7. Identify your record and click continue to manage suppression rules. \n8. Use the Desired Behavior dropdown to select “Suppressed”.\n9. Click "Save" to prevent your record from appearing in the people search site search results.',
//         state: "removed",
//         sent_at: null,
//         completed_at: "2024-07-05T11:45:30.961000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "gxqv1yGOZUA3ABnjrqnsi",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "cTZDavGtioWTdaEhGO4gP",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "22iRCHR1_2FjNeGRbZlJx",
//         records_matched: 2,
//         broker_name: "AnyWho",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Employment",
//           "Education",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions:
//           'Follow these steps to remove your private exposed data from public search on the PeopleConnect family of sites\n1. Head over to [https://suppression.peopleconnect.us/login](https://suppression.peopleconnect.us/login) to begin the opt out process.\n2. Enter your email address and click submit.\n3. Log into your email account, you will receive an email with the subject of “Confirm your email address”.\n4. In that email, click on “Verify Email” to navigate to the identity page of the suppression flow. \n5. Provide date of birth and click continue.\n6. Enter legal name and click continue.\n7. Identify your record and click continue to manage suppression rules. \n8. Use the Desired Behavior dropdown to select “Suppressed”.\n9. Click "Save" to prevent your record from appearing in the people search site search results.',
//         state: "removal_in_progress",
//         sent_at: null,
//         completed_at: null,
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "MkTQLzYGuxjEmqd78QQ2y",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "4g7Lw5F7LvEQCO6xnuUZT",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "22iRCHR1_2FjNeGRbZlJx",
//         records_matched: 2,
//         broker_name: "AnyWho",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Employment",
//           "Education",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions:
//           'Follow these steps to remove your private exposed data from public search on the PeopleConnect family of sites\n1. Head over to [https://suppression.peopleconnect.us/login](https://suppression.peopleconnect.us/login) to begin the opt out process.\n2. Enter your email address and click submit.\n3. Log into your email account, you will receive an email with the subject of “Confirm your email address”.\n4. In that email, click on “Verify Email” to navigate to the identity page of the suppression flow. \n5. Provide date of birth and click continue.\n6. Enter legal name and click continue.\n7. Identify your record and click continue to manage suppression rules. \n8. Use the Desired Behavior dropdown to select “Suppressed”.\n9. Click "Save" to prevent your record from appearing in the people search site search results.',
//         state: "action_required",
//         sent_at: null,
//         completed_at: null,
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "MkTQLzYGuxjEmqd78QQ2y",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "4g7Lw5F7LvEQCO6xnuUZT",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "zmuJLE2xY_Zn8AFqJ5tUJ",
//         records_matched: 1,
//         broker_name: "BackgroundCheckers",
//         broker_info_types: [
//           "Name",
//           "Address",
//           "Email addresses",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: "2024-07-01T18:53:00.835000Z",
//         completed_at: "2024-07-01T18:57:03.137000Z",
//         estimated_days_to_remove_records: 2,
//         records: [
//           {
//             id: "-QmJs6V396MIiS6Y5fSCK",
//             record_url: null,
//             pii: '{"age": "32", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA W SMITH", "relatives": ["available"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "Zm_T-RsEBC9pYRHvEEXKA",
//         records_matched: 2,
//         broker_name: "BackgroundCheckGateway",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Employment",
//           "Education",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions:
//           'Follow these steps to remove your private exposed data from public search on the PeopleConnect family of sites\n1. Head over to [https://suppression.peopleconnect.us/login](https://suppression.peopleconnect.us/login) to begin the opt out process.\n2. Enter your email address and click submit.\n3. Log into your email account, you will receive an email with the subject of “Confirm your email address”.\n4. In that email, click on “Verify Email” to navigate to the identity page of the suppression flow. \n5. Provide date of birth and click continue.\n6. Enter legal name and click continue.\n7. Identify your record and click continue to manage suppression rules. \n8. Use the Desired Behavior dropdown to select “Suppressed”.\n9. Click "Save" to prevent your record from appearing in the people search site search results.',
//         state: "removed",
//         sent_at: "2024-07-01T18:53:00.431000Z",
//         completed_at: "2024-07-05T11:45:30.961000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "_SmUoI4CmvsDAAM0qN0EX",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "dj7aA_iaoS1awyl0v7ggL",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "rUzhAy7mf3MyCMBCgyg5K",
//         records_matched: 2,
//         broker_name: "BackgroundCheckMe",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Email addresses",
//           "Address",
//           "Social media profiles",
//           "Age",
//           "Relatives",
//           "Legal records",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: null,
//         completed_at: "2024-07-05T11:45:30.961000Z",
//         estimated_days_to_remove_records: 1,
//         records: [
//           {
//             id: "XsH2QWGJgiVbNLofX0Bcb",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "dZxArs4Yt_Fq7ZevxhzyL",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "7OcTnYCbOXFge3rr7xOZs",
//         records_matched: 2,
//         broker_name: "BackgroundChecks",
//         broker_info_types: [
//           "Name",
//           "Address",
//           "Phone numbers",
//           "Email addresses",
//           "Age",
//           "Social media profiles",
//           "Relatives",
//           "Legal records",
//         ],
//         removal_instructions:
//           '1. Search for records here [https://www.beenverified.com/app/optout/search](https://www.beenverified.com/app/optout/search)\n2. Click the specific record URL on the search results page.\n3. Enter your email address and click "Confirm opt-out".\n4. Log into your email account. You will receive an email with the subject of "Action required to process your opt-out request".\n5. In that email, click "Verify Opt Out" to complete the removal process.',
//         state: "removed",
//         sent_at: "2024-07-23T17:48:13.935069Z",
//         completed_at: "2024-07-02T20:27:59.579000Z",
//         estimated_days_to_remove_records: 1,
//         records: [
//           {
//             id: "hIMawaQkVZQ9VX8pUbA-x",
//             record_url: null,
//             pii: '{"age": "28", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA C SMITH", "relatives": ["Carolanne SMITH", "Mariano S SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "2raP03_fCUL7OmcD1Cv4T",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA SMITH", "relatives": ["available"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "zHJ2FH3-qF4WzOupAq8dT",
//         records_matched: 2,
//         broker_name: "BackgroundChecksMe",
//         broker_info_types: [
//           "Name",
//           "Address",
//           "Phone numbers",
//           "Email addresses",
//           "Age",
//           "Social media profiles",
//           "Relatives",
//           "Legal records",
//         ],
//         removal_instructions:
//           '1. Search for records here [https://www.beenverified.com/app/optout/search](https://www.beenverified.com/app/optout/search)\n2. Click the specific record URL on the search results page.\n3. Enter your email address and click "Confirm opt-out".\n4. Log into your email account. You will receive an email with the subject of "Action required to process your opt-out request".\n5. In that email, click "Verify Opt Out" to complete the removal process.',
//         state: "removed",
//         sent_at: "2024-07-23T17:48:13.935069Z",
//         completed_at: "2024-07-02T20:27:59.579000Z",
//         estimated_days_to_remove_records: 1,
//         records: [
//           {
//             id: "VDYAoRup13LxsS87cTLU5",
//             record_url: null,
//             pii: '{"age": "28", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA C SMITH", "relatives": ["Carolanne SMITH", "Mariano S SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "0POqGrA8Ezp0OhMwP881-",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA SMITH", "relatives": ["available"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "9dlJd7-LDP5_jKU2a3dFg",
//         records_matched: 2,
//         broker_name: "BackgroundRecords",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Email addresses",
//           "Address",
//           "Social media profiles",
//           "Age",
//           "Relatives",
//           "Legal records",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: null,
//         completed_at: "2024-07-05T11:45:30.961000Z",
//         estimated_days_to_remove_records: 1,
//         records: [
//           {
//             id: "CdmQE1I6yuB0BnBG_a47K",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "2jI9gNer2bb5QLLicwf-5",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "pSL95NEYTXU1Zfhxc1IkX",
//         records_matched: 2,
//         broker_name: "BeenVerified",
//         broker_info_types: [
//           "Name",
//           "Address",
//           "Phone numbers",
//           "Email addresses",
//           "Age",
//           "Social media profiles",
//           "Relatives",
//           "Legal records",
//         ],
//         removal_instructions:
//           '1. Search for records here [https://www.beenverified.com/app/optout/search](https://www.beenverified.com/app/optout/search)\n2. Click the specific record URL on the search results page.\n3. Enter your email address and click "Confirm opt-out".\n4. Log into your email account. You will receive an email with the subject of "Action required to process your opt-out request".\n5. In that email, click "Verify Opt Out" to complete the removal process.',
//         state: "removed",
//         sent_at: "2024-07-23T17:48:13.935069Z",
//         completed_at: "2024-07-02T20:27:59.579000Z",
//         estimated_days_to_remove_records: 1,
//         records: [
//           {
//             id: "W-nJeCTijIfmQPSKnAZ38",
//             record_url: null,
//             pii: '{"age": "28", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA C SMITH", "relatives": ["Carolanne SMITH", "Mariano S SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "HVSflxHBSpPKvnRshLcXm",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA SMITH", "relatives": ["available"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "tpalZl6Pms_i2Cj1oFS6s",
//         records_matched: 2,
//         broker_name: "CallerNear",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Age",
//           "Legal records",
//           "Relatives",
//           "Social media profiles",
//         ],
//         removal_instructions:
//           '1. Search for records here [https://www.beenverified.com/app/optout/search](https://www.beenverified.com/app/optout/search)\n2. Click the specific record URL on the search results page.\n3. Enter your email address and click "Confirm opt-out".\n4. Log into your email account. You will receive an email with the subject of "Action required to process your opt-out request".\n5. In that email, click "Verify Opt Out" to complete the removal process.',
//         state: "removed",
//         sent_at: "2024-07-23T17:48:13.935069Z",
//         completed_at: "2024-07-02T20:27:59.579000Z",
//         estimated_days_to_remove_records: 1,
//         records: [
//           {
//             id: "QgMazaQbgIw7rC_j2udDX",
//             record_url: null,
//             pii: '{"age": "28", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA C SMITH", "relatives": ["Carolanne SMITH", "Mariano S SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "PvOCxa6nPNIB07qzGrHqh",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA SMITH", "relatives": ["available"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "WhhJ0G9f6aY8R8HzZewI3",
//         records_matched: 1,
//         broker_name: "CheckSecrets",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: "2024-07-01T18:53:00.835000Z",
//         completed_at: "2024-07-01T18:57:03.137000Z",
//         estimated_days_to_remove_records: 2,
//         records: [
//           {
//             id: "Hn6x3qNAaCjdX0GYA_zWi",
//             record_url: null,
//             pii: '{"age": "32", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA W SMITH", "relatives": ["available"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "gRBrht_g_HeBLQAUIKFFl",
//         records_matched: 2,
//         broker_name: "DOBSearch",
//         broker_info_types: [
//           "Name",
//           "Address",
//           "Phone numbers",
//           "Email addresses",
//           "Age",
//           "Social media profiles",
//           "Relatives",
//           "Legal records",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: "2024-07-01T18:53:02.543000Z",
//         completed_at: "2024-07-02T20:27:59.579000Z",
//         estimated_days_to_remove_records: 1,
//         records: [
//           {
//             id: "hGM0tnKrQ1EQ30Agl4ozb",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA SMITH", "relatives": ["available"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "3nKxCiMcfHNUXxWQ8ssKB",
//             record_url: null,
//             pii: '{"age": "28", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA C SMITH", "relatives": ["Carolanne SMITH", "Mariano S SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "e3rv-MqK6qWBF8mp1e5jC",
//         records_matched: 2,
//         broker_name: "EasyBackgroundChecks",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Employment",
//           "Education",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions:
//           'Follow these steps to remove your private exposed data from public search on the PeopleConnect family of sites\n1. Head over to [https://suppression.peopleconnect.us/login](https://suppression.peopleconnect.us/login) to begin the opt out process.\n2. Enter your email address and click submit.\n3. Log into your email account, you will receive an email with the subject of “Confirm your email address”.\n4. In that email, click on “Verify Email” to navigate to the identity page of the suppression flow. \n5. Provide date of birth and click continue.\n6. Enter legal name and click continue.\n7. Identify your record and click continue to manage suppression rules. \n8. Use the Desired Behavior dropdown to select “Suppressed”.\n9. Click "Save" to prevent your record from appearing in the people search site search results.',
//         state: "removed",
//         sent_at: null,
//         completed_at: "2024-07-05T11:45:30.961000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "cuUCffBu-GBezofDClpzT",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "6P-iiCwY0m37warBHDmt_",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "g7mKXeL-p0ug2a5YkUtaZ",
//         records_matched: 2,
//         broker_name: "EmailFinder",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Age",
//           "Legal records",
//           "Relatives",
//           "Social media profiles",
//         ],
//         removal_instructions:
//           '1. Search for records here [https://www.beenverified.com/app/optout/search](https://www.beenverified.com/app/optout/search)\n2. Click the specific record URL on the search results page.\n3. Enter your email address and click "Confirm opt-out".\n4. Log into your email account. You will receive an email with the subject of "Action required to process your opt-out request".\n5. In that email, click "Verify Opt Out" to complete the removal process.',
//         state: "removed",
//         sent_at: "2024-07-23T17:48:13.935069Z",
//         completed_at: "2024-07-02T20:27:59.579000Z",
//         estimated_days_to_remove_records: 1,
//         records: [
//           {
//             id: "EuKZZx_usvcMQ17MPPu6V",
//             record_url: null,
//             pii: '{"age": "28", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA C SMITH", "relatives": ["Carolanne SMITH", "Mariano S SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "d8XA8BqxvRxPCwlN7OMpK",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA SMITH", "relatives": ["available"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "7C85yBPvLyBP3_XATejqI",
//         records_matched: 0,
//         broker_name: "EmailTracer",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions: "",
//         state: "no_records_found",
//         sent_at: "2024-07-01T18:53:04.747000Z",
//         completed_at: "2024-07-01T18:53:04.747000Z",
//         estimated_days_to_remove_records: 3,
//         records: [],
//       },
//       {
//         id: "kgRPmgvmHKOnt0k7w6kPo",
//         records_matched: 1,
//         broker_name: "FastBackgroundCheck",
//         broker_info_types: [
//           "Name",
//           "Address",
//           "Age",
//           "Relatives",
//           "Phone numbers",
//           "Email addresses",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: "2024-07-01T18:53:02.476000Z",
//         completed_at: "2024-07-01T18:57:16.284000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "d2MQNQejr3QbwbzIlm00M",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA I SMITH", "relatives": ["Keenan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "3_2m3mILXn2BeXm3NiryR",
//         records_matched: 1,
//         broker_name: "FindPeopleSearch",
//         broker_info_types: [
//           "Name",
//           "Address",
//           "Age",
//           "Relatives",
//           "Phone numbers",
//           "Email addresses",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: "2024-07-01T18:53:02.476000Z",
//         completed_at: "2024-07-01T18:57:16.284000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "fJqxkVewrgB1nP5fOe1Cx",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA I SMITH", "relatives": ["Keenan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "0ZZRwrA-tltcAGN1-Ldce",
//         records_matched: 0,
//         broker_name: "FreeBackgroundCheck",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions: "",
//         state: "no_records_found",
//         sent_at: "2024-07-01T18:53:04.747000Z",
//         completed_at: "2024-07-01T18:53:04.747000Z",
//         estimated_days_to_remove_records: 3,
//         records: [],
//       },
//       {
//         id: "5FfIYgbNibMHfDwzkkJxV",
//         records_matched: 2,
//         broker_name: "FreeBackgroundChecks",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Email addresses",
//           "Address",
//           "Social media profiles",
//           "Age",
//           "Relatives",
//           "Legal records",
//         ],
//         removal_instructions:
//           'Follow these steps to remove your private exposed data from public search on the PeopleConnect family of sites\n1. Head over to [https://suppression.peopleconnect.us/login](https://suppression.peopleconnect.us/login) to begin the opt out process.\n2. Enter your email address and click submit.\n3. Log into your email account, you will receive an email with the subject of “Confirm your email address”.\n4. In that email, click on “Verify Email” to navigate to the identity page of the suppression flow. \n5. Provide date of birth and click continue.\n6. Enter legal name and click continue.\n7. Identify your record and click continue to manage suppression rules. \n8. Use the Desired Behavior dropdown to select “Suppressed”.\n9. Click "Save" to prevent your record from appearing in the people search site search results.',
//         state: "removed",
//         sent_at: null,
//         completed_at: "2024-07-05T11:45:30.961000Z",
//         estimated_days_to_remove_records: 1,
//         records: [
//           {
//             id: "g5eV9VXBm4qmMpgACUO7R",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//             total_items: 35,
//             is_removed: true,
//           },
//           {
//             id: "EZV-OKSeN_SstfYskfVwx",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//             total_items: 12,
//             is_removed: false,
//           },
//         ],
//       },
//       {
//         id: "QrdaRWZCqh1LJHJNnIg3k",
//         records_matched: 1,
//         broker_name: "FreePeopleDirectory",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Relatives",
//           "Legal records",
//           "Marital status",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: "2024-07-01T18:53:01.779000Z",
//         completed_at: "2024-07-05T19:50:12.540000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "sojDFDJoQnU1nDInPeHts",
//             record_url: null,
//             pii: '{"age": "", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA SMITH", "relatives": ["Johathan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//             total_items: 35,
//             is_removed: false,
//           },
//         ],
//       },
//       {
//         id: "OqneYOOWmrv7Ro31eWGe5",
//         records_matched: 2,
//         broker_name: "FreePeopleScan",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Email addresses",
//           "Address",
//           "Social media profiles",
//           "Age",
//           "Relatives",
//           "Legal records",
//         ],
//         removal_instructions:
//           'Follow these steps to remove your private exposed data from public search on the PeopleConnect family of sites\n1. Head over to [https://suppression.peopleconnect.us/login](https://suppression.peopleconnect.us/login) to begin the opt out process.\n2. Enter your email address and click submit.\n3. Log into your email account, you will receive an email with the subject of “Confirm your email address”.\n4. In that email, click on “Verify Email” to navigate to the identity page of the suppression flow. \n5. Provide date of birth and click continue.\n6. Enter legal name and click continue.\n7. Identify your record and click continue to manage suppression rules. \n8. Use the Desired Behavior dropdown to select “Suppressed”.\n9. Click "Save" to prevent your record from appearing in the people search site search results.',
//         state: "removed",
//         sent_at: null,
//         completed_at: "2024-07-05T11:45:30.961000Z",
//         estimated_days_to_remove_records: 1,
//         records: [
//           {
//             id: "q7pv2_nhQBBiPl-f3_NGj",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//             total_items: 35,
//             is_removed: false,
//           },
//           {
//             id: "d8D2aNewJKZjEXSj6n12B",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//             total_items: 35,
//             is_removed: true,
//           },
//         ],
//       },
//       {
//         id: "Pqxlft6GZu1xwb4tKfUMF",
//         records_matched: 2,
//         broker_name: "FreePhoneTracer",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Age",
//           "Legal records",
//           "Relatives",
//           "Social media profiles",
//         ],
//         removal_instructions:
//           '1. Search for records here [https://www.beenverified.com/app/optout/search](https://www.beenverified.com/app/optout/search)\n2. Click the specific record URL on the search results page.\n3. Enter your email address and click "Confirm opt-out".\n4. Log into your email account. You will receive an email with the subject of "Action required to process your opt-out request".\n5. In that email, click "Verify Opt Out" to complete the removal process.',
//         state: "removed",
//         sent_at: "2024-07-23T17:48:13.935069Z",
//         completed_at: "2024-07-02T20:27:59.579000Z",
//         estimated_days_to_remove_records: 1,
//         records: [
//           {
//             id: "WuLrOTANI1wojuFJ7obzy",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA SMITH", "relatives": ["available"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "wq_OcJE2C8R6o1FB_d90N",
//             record_url: null,
//             pii: '{"age": "28", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA C SMITH", "relatives": ["Carolanne SMITH", "Mariano S SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "wLRDKCjcX4q8GSI_UeDXR",
//         records_matched: 2,
//         broker_name: "GovArrestRecords",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Email addresses",
//           "Address",
//           "Social media profiles",
//           "Age",
//           "Relatives",
//           "Legal records",
//         ],
//         removal_instructions:
//           'Follow these steps to remove your private exposed data from public search on the PeopleConnect family of sites\n1. Head over to [https://suppression.peopleconnect.us/login](https://suppression.peopleconnect.us/login) to begin the opt out process.\n2. Enter your email address and click submit.\n3. Log into your email account, you will receive an email with the subject of “Confirm your email address”.\n4. In that email, click on “Verify Email” to navigate to the identity page of the suppression flow. \n5. Provide date of birth and click continue.\n6. Enter legal name and click continue.\n7. Identify your record and click continue to manage suppression rules. \n8. Use the Desired Behavior dropdown to select “Suppressed”.\n9. Click "Save" to prevent your record from appearing in the people search site search results.',
//         state: "removed",
//         sent_at: null,
//         completed_at: "2024-07-05T11:45:30.961000Z",
//         estimated_days_to_remove_records: 1,
//         records: [
//           {
//             id: "y0vjEliKO0u_DXgKsuPMl",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "ver_vB5pg0Fbhg5Z5fGXi",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "VLQ6iu2qjLE319rY9M9aR",
//         records_matched: 2,
//         broker_name: "GovBackgroundChecks",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Email addresses",
//           "Address",
//           "Social media profiles",
//           "Age",
//           "Relatives",
//           "Legal records",
//         ],
//         removal_instructions:
//           'Follow these steps to remove your private exposed data from public search on the PeopleConnect family of sites\n1. Head over to [https://suppression.peopleconnect.us/login](https://suppression.peopleconnect.us/login) to begin the opt out process.\n2. Enter your email address and click submit.\n3. Log into your email account, you will receive an email with the subject of “Confirm your email address”.\n4. In that email, click on “Verify Email” to navigate to the identity page of the suppression flow. \n5. Provide date of birth and click continue.\n6. Enter legal name and click continue.\n7. Identify your record and click continue to manage suppression rules. \n8. Use the Desired Behavior dropdown to select “Suppressed”.\n9. Click "Save" to prevent your record from appearing in the people search site search results.',
//         state: "removed",
//         sent_at: null,
//         completed_at: "2024-07-05T11:45:30.961000Z",
//         estimated_days_to_remove_records: 1,
//         records: [
//           {
//             id: "Yg7ap65svcLImlT8DzWP1",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "Tz5dFhrw6OzOsXTuqLJd0",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "mgbh_nYwJnB-lnjy6D7fN",
//         records_matched: 0,
//         broker_name: "GovernmentRegistry",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions: "",
//         state: "no_records_found",
//         sent_at: "2024-07-01T18:53:04.747000Z",
//         completed_at: "2024-07-01T18:53:04.747000Z",
//         estimated_days_to_remove_records: 3,
//         records: [],
//       },
//       {
//         id: "ItID1nPw86qYnmfIb19gH",
//         records_matched: 0,
//         broker_name: "GovWarrantSearch",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions: "",
//         state: "no_records_found",
//         sent_at: "2024-07-01T18:53:04.747000Z",
//         completed_at: "2024-07-01T18:53:04.747000Z",
//         estimated_days_to_remove_records: 3,
//         records: [],
//       },
//       {
//         id: "qboWAYYOjKDvVp5vP5njf",
//         records_matched: 2,
//         broker_name: "IdentityPI",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Age",
//           "Legal records",
//           "Relatives",
//           "Social media profiles",
//         ],
//         removal_instructions:
//           '1. Search for records here [https://www.beenverified.com/app/optout/search](https://www.beenverified.com/app/optout/search)\n2. Click the specific record URL on the search results page.\n3. Enter your email address and click "Confirm opt-out".\n4. Log into your email account. You will receive an email with the subject of "Action required to process your opt-out request".\n5. In that email, click "Verify Opt Out" to complete the removal process.',
//         state: "removed",
//         sent_at: "2024-07-23T17:48:13.935069Z",
//         completed_at: "2024-07-02T20:27:59.579000Z",
//         estimated_days_to_remove_records: 1,
//         records: [
//           {
//             id: "djptfz09bySe_7RgYoYJc",
//             record_url: null,
//             pii: '{"age": "28", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA C SMITH", "relatives": ["Carolanne SMITH", "Mariano S SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "a3rlvGWZTtFqYHiYp7zoP",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA SMITH", "relatives": ["available"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "tbjJn5SXsq_lbIRNmz5FA",
//         records_matched: 0,
//         broker_name: "Infotracer",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions: "",
//         state: "no_records_found",
//         sent_at: "2024-07-01T18:53:04.747000Z",
//         completed_at: "2024-07-01T18:53:04.747000Z",
//         estimated_days_to_remove_records: 3,
//         records: [],
//       },
//       {
//         id: "sx2EDg74d3dr10haHuDFR",
//         records_matched: 1,
//         broker_name: "InmatesSearcher",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Relatives",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: "2024-07-01T18:53:00.835000Z",
//         completed_at: "2024-07-01T18:57:03.137000Z",
//         estimated_days_to_remove_records: 2,
//         records: [
//           {
//             id: "nsVXwfUpsjSdw3Wq-PxpL",
//             record_url: null,
//             pii: '{"age": "32", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA W SMITH", "relatives": ["available"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "a1WIGAwO851YQNBUA_T8C",
//         records_matched: 2,
//         broker_name: "InstantCheckmate",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Email addresses",
//           "Address",
//           "Social media profiles",
//           "Age",
//           "Relatives",
//           "Legal records",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: null,
//         completed_at: "2024-07-05T11:45:30.961000Z",
//         estimated_days_to_remove_records: 1,
//         records: [
//           {
//             id: "zWaaIzL54WFNjOtFmHY5f",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "OYdr6e2_TN2TphyXk3X5O",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "67621_HvlRxiEYpeHpx4K",
//         records_matched: 2,
//         broker_name: "InstantCheckSpy",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Email addresses",
//           "Address",
//           "Social media profiles",
//           "Age",
//           "Relatives",
//           "Legal records",
//         ],
//         removal_instructions:
//           'Follow these steps to remove your private exposed data from public search on the PeopleConnect family of sites\n1. Head over to [https://suppression.peopleconnect.us/login](https://suppression.peopleconnect.us/login) to begin the opt out process.\n2. Enter your email address and click submit.\n3. Log into your email account, you will receive an email with the subject of “Confirm your email address”.\n4. In that email, click on “Verify Email” to navigate to the identity page of the suppression flow. \n5. Provide date of birth and click continue.\n6. Enter legal name and click continue.\n7. Identify your record and click continue to manage suppression rules. \n8. Use the Desired Behavior dropdown to select “Suppressed”.\n9. Click "Save" to prevent your record from appearing in the people search site search results.',
//         state: "removed",
//         sent_at: null,
//         completed_at: "2024-07-05T11:45:30.961000Z",
//         estimated_days_to_remove_records: 1,
//         records: [
//           {
//             id: "pRaJj-QD70pJwhVO8ZUDM",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "DVnOtF7XIKbhlB8UYtALc",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "LYGe4Q2Ht2awUU6K1fOsj",
//         records_matched: 2,
//         broker_name: "InstantPeopleFinder",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Employment",
//           "Education",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions:
//           'Follow these steps to remove your private exposed data from public search on the PeopleConnect family of sites\n1. Head over to [https://suppression.peopleconnect.us/login](https://suppression.peopleconnect.us/login) to begin the opt out process.\n2. Enter your email address and click submit.\n3. Log into your email account, you will receive an email with the subject of “Confirm your email address”.\n4. In that email, click on “Verify Email” to navigate to the identity page of the suppression flow. \n5. Provide date of birth and click continue.\n6. Enter legal name and click continue.\n7. Identify your record and click continue to manage suppression rules. \n8. Use the Desired Behavior dropdown to select “Suppressed”.\n9. Click "Save" to prevent your record from appearing in the people search site search results.',
//         state: "removed",
//         sent_at: null,
//         completed_at: "2024-07-05T11:45:30.961000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "-pCTbQREZTHo6FoQZuFq2",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "4PO8BeAQbHEHrSMkPOw9s",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "ncQVnWdywWcsXxO0dsizT",
//         records_matched: 2,
//         broker_name: "Intelius",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Employment",
//           "Education",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions:
//           'Follow these steps to remove your private exposed data from public search on the PeopleConnect family of sites\n1. Head over to [https://suppression.peopleconnect.us/login](https://suppression.peopleconnect.us/login) to begin the opt out process.\n2. Enter your email address and click submit.\n3. Log into your email account, you will receive an email with the subject of “Confirm your email address”.\n4. In that email, click on “Verify Email” to navigate to the identity page of the suppression flow. \n5. Provide date of birth and click continue.\n6. Enter legal name and click continue.\n7. Identify your record and click continue to manage suppression rules. \n8. Use the Desired Behavior dropdown to select “Suppressed”.\n9. Click "Save" to prevent your record from appearing in the people search site search results.',
//         state: "removed",
//         sent_at: null,
//         completed_at: "2024-07-05T11:45:30.961000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "KhlL5pxU4jICdhUI2KvRZ",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "Et9FAoiN_VcPMzysl1wT5",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "oqZTMql1RKtZx4ZtdgkWw",
//         records_matched: 1,
//         broker_name: "MugshotLook",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: "2024-07-01T18:53:00.835000Z",
//         completed_at: "2024-07-01T18:57:03.137000Z",
//         estimated_days_to_remove_records: 2,
//         records: [
//           {
//             id: "O3Nldq44U5_RfTeb-3j_-",
//             record_url: null,
//             pii: '{"age": "32", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA W SMITH", "relatives": ["available"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "DFBRbozl-bQ73kDiaLUNI",
//         records_matched: 0,
//         broker_name: "Ndb",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions: "",
//         state: "no_records_found",
//         sent_at: "2024-07-01T18:53:04.747000Z",
//         completed_at: "2024-07-01T18:53:04.747000Z",
//         estimated_days_to_remove_records: 3,
//         records: [],
//       },
//       {
//         id: "rcMnbWbDSbIWvQYxe5GPD",
//         records_matched: 2,
//         broker_name: "NeighborWho",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Age",
//           "Legal records",
//           "Relatives",
//           "Social media profiles",
//         ],
//         removal_instructions:
//           '1. Search for records here [https://www.beenverified.com/app/optout/search](https://www.beenverified.com/app/optout/search)\n2. Click the specific record URL on the search results page.\n3. Enter your email address and click "Confirm opt-out".\n4. Log into your email account. You will receive an email with the subject of "Action required to process your opt-out request".\n5. In that email, click "Verify Opt Out" to complete the removal process.',
//         state: "removed",
//         sent_at: "2024-07-23T17:48:13.935069Z",
//         completed_at: "2024-07-02T20:27:59.579000Z",
//         estimated_days_to_remove_records: 1,
//         records: [
//           {
//             id: "jGLCGGUH-9qcfi_8SuzaG",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA SMITH", "relatives": ["available"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "Dg1im4tHuuMOzKiQ35FPb",
//             record_url: null,
//             pii: '{"age": "28", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA C SMITH", "relatives": ["Carolanne SMITH", "Mariano S SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "ukxXaqNxUPYk7kP2rL_dy",
//         records_matched: 2,
//         broker_name: "NumberGuru",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Age",
//           "Legal records",
//           "Relatives",
//           "Social media profiles",
//         ],
//         removal_instructions:
//           '1. Search for records here [https://www.beenverified.com/app/optout/search](https://www.beenverified.com/app/optout/search)\n2. Click the specific record URL on the search results page.\n3. Enter your email address and click "Confirm opt-out".\n4. Log into your email account. You will receive an email with the subject of "Action required to process your opt-out request".\n5. In that email, click "Verify Opt Out" to complete the removal process.',
//         state: "removed",
//         sent_at: "2024-07-23T17:48:13.935069Z",
//         completed_at: "2024-07-02T20:27:59.579000Z",
//         estimated_days_to_remove_records: 1,
//         records: [
//           {
//             id: "Pb2hW9f9Hp91P5uNkPHEn",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA SMITH", "relatives": ["available"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "6tezEfKWP6N_1bByYgwat",
//             record_url: null,
//             pii: '{"age": "28", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA C SMITH", "relatives": ["Carolanne SMITH", "Mariano S SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "RfYY2Vh6fn2IVjymZrKZ4",
//         records_matched: 2,
//         broker_name: "OnlineSearches",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Employment",
//           "Education",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions:
//           'Follow these steps to remove your private exposed data from public search on the PeopleConnect family of sites\n1. Head over to [https://suppression.peopleconnect.us/login](https://suppression.peopleconnect.us/login) to begin the opt out process.\n2. Enter your email address and click submit.\n3. Log into your email account, you will receive an email with the subject of “Confirm your email address”.\n4. In that email, click on “Verify Email” to navigate to the identity page of the suppression flow. \n5. Provide date of birth and click continue.\n6. Enter legal name and click continue.\n7. Identify your record and click continue to manage suppression rules. \n8. Use the Desired Behavior dropdown to select “Suppressed”.\n9. Click "Save" to prevent your record from appearing in the people search site search results.',
//         state: "removed",
//         sent_at: null,
//         completed_at: "2024-07-05T11:45:30.961000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "PtUiyql9LiFXc5GK07VXN",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "lWYOFmLcTes0sMqtO6Wmx",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "Q6YFK6AZSSSCixDuxo92K",
//         records_matched: 2,
//         broker_name: "OpenPublicRecords",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Age",
//           "Legal records",
//           "Relatives",
//           "Social media profiles",
//         ],
//         removal_instructions:
//           '1. Search for records here [https://www.beenverified.com/app/optout/search](https://www.beenverified.com/app/optout/search)\n2. Click the specific record URL on the search results page.\n3. Enter your email address and click "Confirm opt-out".\n4. Log into your email account. You will receive an email with the subject of "Action required to process your opt-out request".\n5. In that email, click "Verify Opt Out" to complete the removal process.',
//         state: "removed",
//         sent_at: "2024-07-23T17:48:13.935069Z",
//         completed_at: "2024-07-02T20:27:59.579000Z",
//         estimated_days_to_remove_records: 1,
//         records: [
//           {
//             id: "VDa5qGYQQ1bbx7Ol5iPbE",
//             record_url: null,
//             pii: '{"age": "28", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA C SMITH", "relatives": ["Carolanne SMITH", "Mariano S SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "pSFAPFTNMJmAGfsbq-CGT",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA SMITH", "relatives": ["available"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "8173HuZPXeL09UhMpNn9j",
//         records_matched: 2,
//         broker_name: "PeopleFinder",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Employment",
//           "Education",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions:
//           'Follow these steps to remove your private exposed data from public search on the PeopleConnect family of sites\n1. Head over to [https://suppression.peopleconnect.us/login](https://suppression.peopleconnect.us/login) to begin the opt out process.\n2. Enter your email address and click submit.\n3. Log into your email account, you will receive an email with the subject of “Confirm your email address”.\n4. In that email, click on “Verify Email” to navigate to the identity page of the suppression flow. \n5. Provide date of birth and click continue.\n6. Enter legal name and click continue.\n7. Identify your record and click continue to manage suppression rules. \n8. Use the Desired Behavior dropdown to select “Suppressed”.\n9. Click "Save" to prevent your record from appearing in the people search site search results.',
//         state: "removed",
//         sent_at: null,
//         completed_at: "2024-07-05T11:45:30.961000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "tWU4lmt251SryOKAOMDQ5",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "KiV7ebBxXfZP8b_iw345v",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "7pICNFQ6Ygo3NwnmCvRO0",
//         records_matched: 1,
//         broker_name: "PeopleFinders",
//         broker_info_types: [
//           "Name",
//           "Address",
//           "Age",
//           "Relatives",
//           "Phone numbers",
//           "Email addresses",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: "2024-07-01T18:53:02.476000Z",
//         completed_at: "2024-07-01T18:57:16.284000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "HEelyThp9dIb5fuzAOrMK",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA I SMITH", "relatives": ["Keenan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "hac3pkBQBSPlvAUPoHPik",
//         records_matched: 2,
//         broker_name: "PeopleLooker",
//         broker_info_types: [
//           "Name",
//           "Address",
//           "Phone numbers",
//           "Email addresses",
//           "Age",
//           "Social media profiles",
//           "Relatives",
//           "Legal records",
//         ],
//         removal_instructions:
//           '1. Search for records here [https://www.beenverified.com/app/optout/search](https://www.beenverified.com/app/optout/search)\n2. Click the specific record URL on the search results page.\n3. Enter your email address and click "Confirm opt-out".\n4. Log into your email account. You will receive an email with the subject of "Action required to process your opt-out request".\n5. In that email, click "Verify Opt Out" to complete the removal process.',
//         state: "removed",
//         sent_at: "2024-07-23T17:48:13.935069Z",
//         completed_at: "2024-07-02T20:27:59.579000Z",
//         estimated_days_to_remove_records: 1,
//         records: [
//           {
//             id: "p4OUoiKNZEGqxMWfcKarH",
//             record_url: null,
//             pii: '{"age": "28", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA C SMITH", "relatives": ["Carolanne SMITH", "Mariano S SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "oIi6izYeShHUVn5LALiy0",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA SMITH", "relatives": ["available"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "2G_YuXyDi7MFf3SH_gyVM",
//         records_matched: 2,
//         broker_name: "PeopleLookup",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Employment",
//           "Education",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions:
//           'Follow these steps to remove your private exposed data from public search on the PeopleConnect family of sites\n1. Head over to [https://suppression.peopleconnect.us/login](https://suppression.peopleconnect.us/login) to begin the opt out process.\n2. Enter your email address and click submit.\n3. Log into your email account, you will receive an email with the subject of “Confirm your email address”.\n4. In that email, click on “Verify Email” to navigate to the identity page of the suppression flow. \n5. Provide date of birth and click continue.\n6. Enter legal name and click continue.\n7. Identify your record and click continue to manage suppression rules. \n8. Use the Desired Behavior dropdown to select “Suppressed”.\n9. Click "Save" to prevent your record from appearing in the people search site search results.',
//         state: "removed",
//         sent_at: null,
//         completed_at: "2024-07-05T11:45:30.961000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "MUJJ_mkyI2neDzolziSn-",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "AyvMeBlJX17FfS2l8E92Z",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "ebNUHXexLbqzjzXIe-fLy",
//         records_matched: 1,
//         broker_name: "PeopleSearch123",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: "2024-07-01T18:53:00.835000Z",
//         completed_at: "2024-07-01T18:57:03.137000Z",
//         estimated_days_to_remove_records: 2,
//         records: [
//           {
//             id: "RXPs8GXoMK_tUxS_jhot2",
//             record_url: null,
//             pii: '{"age": "32", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA W SMITH", "relatives": ["available"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "XgdHCraKoUyCuq-u3vZ0M",
//         records_matched: 1,
//         broker_name: "PeopleSearcher",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Employment",
//           "Family, neighbors & associates",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: "2024-07-01T18:53:00.835000Z",
//         completed_at: "2024-07-01T18:57:03.137000Z",
//         estimated_days_to_remove_records: 2,
//         records: [
//           {
//             id: "llY59jVRF1_7TtVbyl2Fe",
//             record_url: null,
//             pii: '{"age": "32", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA W SMITH", "relatives": ["available"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "mZVlabQGMninTSNC_nonZ",
//         records_matched: 1,
//         broker_name: "PeopleSearchUSA",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: "2024-07-01T18:53:00.835000Z",
//         completed_at: "2024-07-01T18:57:03.137000Z",
//         estimated_days_to_remove_records: 2,
//         records: [
//           {
//             id: "XQNiCch7Hqstwd26J-pYr",
//             record_url: null,
//             pii: '{"age": "32", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA W SMITH", "relatives": ["available"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "Tbg5AwhOHh18v4m4Jl-bB",
//         records_matched: 2,
//         broker_name: "PeopleSmart",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Age",
//           "Legal records",
//           "Relatives",
//           "Social media profiles",
//         ],
//         removal_instructions:
//           '1. Search for records here [https://www.beenverified.com/app/optout/search](https://www.beenverified.com/app/optout/search)\n2. Click the specific record URL on the search results page.\n3. Enter your email address and click "Confirm opt-out".\n4. Log into your email account. You will receive an email with the subject of "Action required to process your opt-out request".\n5. In that email, click "Verify Opt Out" to complete the removal process.',
//         state: "removed",
//         sent_at: "2024-07-23T17:48:13.935069Z",
//         completed_at: "2024-07-02T20:27:59.579000Z",
//         estimated_days_to_remove_records: 1,
//         records: [
//           {
//             id: "zoCUCX_N8dFRDApC_T8qK",
//             record_url: null,
//             pii: '{"age": "28", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA C SMITH", "relatives": ["Carolanne SMITH", "Mariano S SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "Y3ZeCyRu1n56bpMmmD7K6",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA SMITH", "relatives": ["available"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "PditxcWF-cuhM3dGGfECs",
//         records_matched: 0,
//         broker_name: "PeoplesWhized",
//         broker_info_types: ["Name", "Address", "Age", "Relatives"],
//         removal_instructions: "",
//         state: "no_records_found",
//         sent_at: "2024-07-01T18:54:49.911000Z",
//         completed_at: "2024-07-01T18:54:49.911000Z",
//         estimated_days_to_remove_records: 28,
//         records: [],
//       },
//       {
//         id: "3T9C7xCoDtK2ftn4v3xvW",
//         records_matched: 0,
//         broker_name: "PeoplesWhizr",
//         broker_info_types: ["Name", "Address", "Age", "Relatives"],
//         removal_instructions: "",
//         state: "no_records_found",
//         sent_at: "2024-07-01T18:54:49.911000Z",
//         completed_at: "2024-07-01T18:54:49.911000Z",
//         estimated_days_to_remove_records: 28,
//         records: [],
//       },
//       {
//         id: "FXkohZ1W17K1n3dQL3oJ0",
//         records_matched: 0,
//         broker_name: "PeoplesWiz",
//         broker_info_types: ["Name", "Address", "Age", "Relatives"],
//         removal_instructions: "",
//         state: "no_records_found",
//         sent_at: "2024-07-01T18:54:49.911000Z",
//         completed_at: "2024-07-01T18:54:49.911000Z",
//         estimated_days_to_remove_records: 28,
//         records: [],
//       },
//       {
//         id: "takUssVHrVEYCnGeCa99l",
//         records_matched: 0,
//         broker_name: "PeoplesWizard",
//         broker_info_types: ["Name", "Address", "Age", "Relatives"],
//         removal_instructions: "",
//         state: "no_records_found",
//         sent_at: "2024-07-01T18:54:49.911000Z",
//         completed_at: "2024-07-01T18:54:49.911000Z",
//         estimated_days_to_remove_records: 28,
//         records: [],
//       },
//       {
//         id: "JeLDPv0a_W50lVArm5r8a",
//         records_matched: 0,
//         broker_name: "PeopleWhiz",
//         broker_info_types: ["Name", "Address", "Age", "Relatives"],
//         removal_instructions: "",
//         state: "no_records_found",
//         sent_at: "2024-07-01T18:54:49.911000Z",
//         completed_at: "2024-07-01T18:54:49.911000Z",
//         estimated_days_to_remove_records: 28,
//         records: [],
//       },
//       {
//         id: "j530pXSuj2Nr2XFaFhY-m",
//         records_matched: 0,
//         broker_name: "PeopleWhizedCom",
//         broker_info_types: ["Name", "Address", "Age", "Relatives"],
//         removal_instructions: "",
//         state: "no_records_found",
//         sent_at: "2024-07-01T18:54:49.911000Z",
//         completed_at: "2024-07-01T18:54:49.911000Z",
//         estimated_days_to_remove_records: 28,
//         records: [],
//       },
//       {
//         id: "22MKlFP_H_P7292vTIdF6",
//         records_matched: 0,
//         broker_name: "PeopleWhizedNet",
//         broker_info_types: ["Name", "Address", "Age", "Relatives"],
//         removal_instructions: "",
//         state: "no_records_found",
//         sent_at: "2024-07-01T18:54:49.911000Z",
//         completed_at: "2024-07-01T18:54:49.911000Z",
//         estimated_days_to_remove_records: 28,
//         records: [],
//       },
//       {
//         id: "tE-7PO9tEOoTy6WaUI7Sw",
//         records_matched: 0,
//         broker_name: "PeopleWhizNet",
//         broker_info_types: ["Name", "Address", "Age", "Relatives"],
//         removal_instructions: "",
//         state: "scanning",
//         sent_at: null,
//         completed_at: null,
//         estimated_days_to_remove_records: 28,
//         records: [],
//       },
//       {
//         id: "65hiJv1hoez4w86-NeZYr",
//         records_matched: 0,
//         broker_name: "PeopleWhizRCom",
//         broker_info_types: ["Name", "Address", "Age", "Relatives"],
//         removal_instructions: "",
//         state: "no_records_found",
//         sent_at: "2024-07-01T18:54:49.911000Z",
//         completed_at: "2024-07-01T18:54:49.911000Z",
//         estimated_days_to_remove_records: 28,
//         records: [],
//       },
//       {
//         id: "EGbdfiIzP0PlZWtGhtJYt",
//         records_matched: 0,
//         broker_name: "PeopleWhizrNet",
//         broker_info_types: ["Name", "Address", "Age", "Relatives"],
//         removal_instructions: "",
//         state: "no_records_found",
//         sent_at: "2024-07-01T18:54:49.911000Z",
//         completed_at: "2024-07-01T18:54:49.911000Z",
//         estimated_days_to_remove_records: 28,
//         records: [],
//       },
//       {
//         id: "4OfXXxd_ocNi1QCTFBZ9H",
//         records_matched: 1,
//         broker_name: "PeopleWin",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Relatives",
//           "Legal records",
//           "Marital status",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: "2024-07-01T18:53:01.779000Z",
//         completed_at: "2024-07-05T19:50:12.540000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "v0IUPd5WiZq8XCe1rEDbI",
//             record_url: null,
//             pii: '{"age": "", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA SMITH", "relatives": ["Johathan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "-obhEPbQG1vBfGl3pgXYW",
//         records_matched: 0,
//         broker_name: "PeopleWizardCom",
//         broker_info_types: ["Name", "Address", "Age", "Relatives"],
//         removal_instructions: "",
//         state: "no_records_found",
//         sent_at: "2024-07-01T18:54:49.911000Z",
//         completed_at: "2024-07-01T18:54:49.911000Z",
//         estimated_days_to_remove_records: 28,
//         records: [],
//       },
//       {
//         id: "JljFsHcTxM3fls49M_kis",
//         records_matched: 0,
//         broker_name: "PeopleWizardNet",
//         broker_info_types: ["Name", "Address", "Age", "Relatives"],
//         removal_instructions: "",
//         state: "no_records_found",
//         sent_at: "2024-07-01T18:54:49.911000Z",
//         completed_at: "2024-07-01T18:54:49.911000Z",
//         estimated_days_to_remove_records: 28,
//         records: [],
//       },
//       {
//         id: "_hPheVFiafxuD7e3kGq0S",
//         records_matched: 0,
//         broker_name: "PeopleWizCom",
//         broker_info_types: ["Name", "Address", "Age", "Relatives"],
//         removal_instructions: "",
//         state: "no_records_found",
//         sent_at: "2024-07-01T18:54:49.911000Z",
//         completed_at: "2024-07-01T18:54:49.911000Z",
//         estimated_days_to_remove_records: 28,
//         records: [],
//       },
//       {
//         id: "NlI_it3ULrEWcxhGomkDN",
//         records_matched: 0,
//         broker_name: "PeopleWizr",
//         broker_info_types: ["Name", "Address", "Age", "Relatives"],
//         removal_instructions: "",
//         state: "no_records_found",
//         sent_at: "2024-07-01T18:54:49.911000Z",
//         completed_at: "2024-07-01T18:54:49.911000Z",
//         estimated_days_to_remove_records: 28,
//         records: [],
//       },
//       {
//         id: "PGgn0KvgABiIFxOwcbojP",
//         records_matched: 1,
//         broker_name: "PersonSearchers",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Employment",
//           "Family, neighbors & associates",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: "2024-07-01T18:53:00.835000Z",
//         completed_at: "2024-07-01T18:57:03.137000Z",
//         estimated_days_to_remove_records: 2,
//         records: [
//           {
//             id: "vh-LQnE_A-FxDRti-cug_",
//             record_url: null,
//             pii: '{"age": "32", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA W SMITH", "relatives": ["available"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "Np7y3_-EcePgoFpZJVdRR",
//         records_matched: 1,
//         broker_name: "PrivateEye",
//         broker_info_types: [
//           "Name",
//           "Address",
//           "Age",
//           "Relatives",
//           "Phone numbers",
//           "Email addresses",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: "2024-07-01T18:53:02.476000Z",
//         completed_at: "2024-07-01T18:57:16.284000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "zO7GOsktOBVuHzYFkgms6",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA I SMITH", "relatives": ["Keenan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "4-exBrYLGh1hNQbZfO4eU",
//         records_matched: 1,
//         broker_name: "PrivateRecords",
//         broker_info_types: [
//           "Name",
//           "Address",
//           "Age",
//           "Relatives",
//           "Phone numbers",
//           "Email addresses",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: "2024-07-01T18:53:00.835000Z",
//         completed_at: "2024-07-01T18:57:03.137000Z",
//         estimated_days_to_remove_records: 2,
//         records: [
//           {
//             id: "6lY5tkPeglnoVvtGMxDys",
//             record_url: null,
//             pii: '{"age": "32", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA W SMITH", "relatives": ["available"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "3gVdTU1eS0V8IWIwQefgl",
//         records_matched: 1,
//         broker_name: "PrivateReports",
//         broker_info_types: [
//           "Name",
//           "Relatives",
//           "Address",
//           "Age",
//           "Court, arrest, criminal & civil records",
//           "Social media profiles",
//           "Photos & videos",
//           "Bankruptcies & liens",
//           "Phone numbers",
//           "Mugshots",
//           "Sexual offenses",
//           "Marriage & divorce records",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: "2024-07-01T18:53:00.835000Z",
//         completed_at: "2024-07-01T18:57:03.137000Z",
//         estimated_days_to_remove_records: 2,
//         records: [
//           {
//             id: "k8gLM3h6RpZXuIzq7YdW8",
//             record_url: null,
//             pii: '{"age": "32", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA W SMITH", "relatives": ["available"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "LntpdyqNaTSvi7iXI0h14",
//         records_matched: 2,
//         broker_name: "PublicRecords",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Employment",
//           "Education",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions:
//           'Follow these steps to remove your private exposed data from public search on the PeopleConnect family of sites\n1. Head over to [https://suppression.peopleconnect.us/login](https://suppression.peopleconnect.us/login) to begin the opt out process.\n2. Enter your email address and click submit.\n3. Log into your email account, you will receive an email with the subject of “Confirm your email address”.\n4. In that email, click on “Verify Email” to navigate to the identity page of the suppression flow. \n5. Provide date of birth and click continue.\n6. Enter legal name and click continue.\n7. Identify your record and click continue to manage suppression rules. \n8. Use the Desired Behavior dropdown to select “Suppressed”.\n9. Click "Save" to prevent your record from appearing in the people search site search results.',
//         state: "removed",
//         sent_at: null,
//         completed_at: "2024-07-05T11:45:30.961000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "kHU4mW3lcIHadVknToA0f",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "jwsIfF8DQg5Sx4ksr8Rkp",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "GkX4OJzjXSz180nNyPDFU",
//         records_matched: 2,
//         broker_name: "PublicRecordsCenter",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Email addresses",
//           "Address",
//           "Social media profiles",
//           "Age",
//           "Relatives",
//           "Legal records",
//         ],
//         removal_instructions:
//           'Follow these steps to remove your private exposed data from public search on the PeopleConnect family of sites\n1. Head over to [https://suppression.peopleconnect.us/login](https://suppression.peopleconnect.us/login) to begin the opt out process.\n2. Enter your email address and click submit.\n3. Log into your email account, you will receive an email with the subject of “Confirm your email address”.\n4. In that email, click on “Verify Email” to navigate to the identity page of the suppression flow. \n5. Provide date of birth and click continue.\n6. Enter legal name and click continue.\n7. Identify your record and click continue to manage suppression rules. \n8. Use the Desired Behavior dropdown to select “Suppressed”.\n9. Click "Save" to prevent your record from appearing in the people search site search results.',
//         state: "removed",
//         sent_at: null,
//         completed_at: "2024-07-05T11:45:30.961000Z",
//         estimated_days_to_remove_records: 1,
//         records: [
//           {
//             id: "zd_82hsijEj0EsUyxVYu9",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "oLNeJLrLOxSzHf8_o30jp",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "uM4WtCjetD1uE0L4T4nhd",
//         records_matched: 1,
//         broker_name: "PublicRecordsNow",
//         broker_info_types: [
//           "Name",
//           "Address",
//           "Age",
//           "Relatives",
//           "Phone numbers",
//           "Email addresses",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: "2024-07-01T18:53:02.476000Z",
//         completed_at: "2024-07-01T18:57:16.284000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "YabgluP-HBnuwxcGAINQa",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA I SMITH", "relatives": ["Keenan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "GPzi1NBXYDZdSb0_FzWcy",
//         records_matched: 2,
//         broker_name: "PublicRecordsOfficial",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Email addresses",
//           "Address",
//           "Social media profiles",
//           "Age",
//           "Relatives",
//           "Legal records",
//         ],
//         removal_instructions:
//           'Follow these steps to remove your private exposed data from public search on the PeopleConnect family of sites\n1. Head over to [https://suppression.peopleconnect.us/login](https://suppression.peopleconnect.us/login) to begin the opt out process.\n2. Enter your email address and click submit.\n3. Log into your email account, you will receive an email with the subject of “Confirm your email address”.\n4. In that email, click on “Verify Email” to navigate to the identity page of the suppression flow. \n5. Provide date of birth and click continue.\n6. Enter legal name and click continue.\n7. Identify your record and click continue to manage suppression rules. \n8. Use the Desired Behavior dropdown to select “Suppressed”.\n9. Click "Save" to prevent your record from appearing in the people search site search results.',
//         state: "removed",
//         sent_at: null,
//         completed_at: "2024-07-05T11:45:30.961000Z",
//         estimated_days_to_remove_records: 1,
//         records: [
//           {
//             id: "La77IZUrgXAPg8vlU98rK",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "BDSb2PtFU-JPwptcp4YCF",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "TGZ09gitrieqGE_bIg5HK",
//         records_matched: 2,
//         broker_name: "PublicRecordsReviews",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Email addresses",
//           "Address",
//           "Social media profiles",
//           "Age",
//           "Relatives",
//           "Legal records",
//         ],
//         removal_instructions:
//           'Follow these steps to remove your private exposed data from public search on the PeopleConnect family of sites\n1. Head over to [https://suppression.peopleconnect.us/login](https://suppression.peopleconnect.us/login) to begin the opt out process.\n2. Enter your email address and click submit.\n3. Log into your email account, you will receive an email with the subject of “Confirm your email address”.\n4. In that email, click on “Verify Email” to navigate to the identity page of the suppression flow. \n5. Provide date of birth and click continue.\n6. Enter legal name and click continue.\n7. Identify your record and click continue to manage suppression rules. \n8. Use the Desired Behavior dropdown to select “Suppressed”.\n9. Click "Save" to prevent your record from appearing in the people search site search results.',
//         state: "removed",
//         sent_at: null,
//         completed_at: "2024-07-05T11:45:30.961000Z",
//         estimated_days_to_remove_records: 1,
//         records: [
//           {
//             id: "tCRiVGegq4lUzR-bTdfmM",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "boRw0OIJEqGKyDN3pR4y4",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "gtE881UXsZzlkL4T5H6Ex",
//         records_matched: 1,
//         broker_name: "PublicSearcher",
//         broker_info_types: [
//           "Name",
//           "Address",
//           "Email addresses",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: "2024-07-01T18:53:00.835000Z",
//         completed_at: "2024-07-01T18:57:03.137000Z",
//         estimated_days_to_remove_records: 2,
//         records: [
//           {
//             id: "h6wpXFupGno2tOil3qsYu",
//             record_url: null,
//             pii: '{"age": "32", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA W SMITH", "relatives": ["available"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "33OfuD4EKyMCS5LAtvftj",
//         records_matched: 2,
//         broker_name: "PublicsRecords",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Email addresses",
//           "Address",
//           "Social media profiles",
//           "Age",
//           "Relatives",
//           "Legal records",
//         ],
//         removal_instructions:
//           'Follow these steps to remove your private exposed data from public search on the PeopleConnect family of sites\n1. Head over to [https://suppression.peopleconnect.us/login](https://suppression.peopleconnect.us/login) to begin the opt out process.\n2. Enter your email address and click submit.\n3. Log into your email account, you will receive an email with the subject of “Confirm your email address”.\n4. In that email, click on “Verify Email” to navigate to the identity page of the suppression flow. \n5. Provide date of birth and click continue.\n6. Enter legal name and click continue.\n7. Identify your record and click continue to manage suppression rules. \n8. Use the Desired Behavior dropdown to select “Suppressed”.\n9. Click "Save" to prevent your record from appearing in the people search site search results.',
//         state: "removed",
//         sent_at: null,
//         completed_at: "2024-07-05T11:45:30.961000Z",
//         estimated_days_to_remove_records: 1,
//         records: [
//           {
//             id: "lzWDgHu3SvYqwg6NF5LAb",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "kLT7TI2j6NoADHqLWi2Ab",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "7nxMjDiMVT7RRfIJ6CaHd",
//         records_matched: 1,
//         broker_name: "QuickPeopleTrace",
//         broker_info_types: [
//           "Name",
//           "Address",
//           "Age",
//           "Relatives",
//           "Phone numbers",
//           "Email addresses",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: "2024-07-01T18:53:02.476000Z",
//         completed_at: "2024-07-01T18:57:16.284000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "xF_lDlvprRzFdY1uOjgGU",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA I SMITH", "relatives": ["Keenan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "8-IS5BE2TJEOeTvB8eouj",
//         records_matched: 2,
//         broker_name: "ReversePhoneLookup",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Employment",
//           "Education",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions:
//           'Follow these steps to remove your private exposed data from public search on the PeopleConnect family of sites\n1. Head over to [https://suppression.peopleconnect.us/login](https://suppression.peopleconnect.us/login) to begin the opt out process.\n2. Enter your email address and click submit.\n3. Log into your email account, you will receive an email with the subject of “Confirm your email address”.\n4. In that email, click on “Verify Email” to navigate to the identity page of the suppression flow. \n5. Provide date of birth and click continue.\n6. Enter legal name and click continue.\n7. Identify your record and click continue to manage suppression rules. \n8. Use the Desired Behavior dropdown to select “Suppressed”.\n9. Click "Save" to prevent your record from appearing in the people search site search results.',
//         state: "removed",
//         sent_at: "2024-07-01T18:53:00.431000Z",
//         completed_at: "2024-07-05T11:45:30.961000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "uI0x2aKCNO_pgsmD7VQM2",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "FXnyID-m3zDmgkPazsx0q",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "KDl7qYV4RK-difcJ50Lze",
//         records_matched: 1,
//         broker_name: "SealedRecords",
//         broker_info_types: [
//           "Name",
//           "Address",
//           "Email addresses",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: "2024-07-01T18:53:00.835000Z",
//         completed_at: "2024-07-01T18:57:03.137000Z",
//         estimated_days_to_remove_records: 2,
//         records: [
//           {
//             id: "618I0JcpJ_h2_URddijTF",
//             record_url: null,
//             pii: '{"age": "32", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA W SMITH", "relatives": ["available"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "iSnqlRbXCyCIk7n5hGgTr",
//         records_matched: 1,
//         broker_name: "SearchPeopleFree",
//         broker_info_types: [
//           "Name",
//           "Address",
//           "Age",
//           "Relatives",
//           "Phone numbers",
//           "Email addresses",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: "2024-07-01T18:53:02.476000Z",
//         completed_at: "2024-07-01T18:57:16.284000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "4ePvHlvUJYFhYH9fpijuS",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA I SMITH", "relatives": ["Keenan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "utTMmXaszTpxh9npOUQel",
//         records_matched: 2,
//         broker_name: "SearchSystems",
//         broker_info_types: [
//           "Name",
//           "Address",
//           "Phone numbers",
//           "Email addresses",
//           "Age",
//           "Social media profiles",
//           "Relatives",
//           "Legal records",
//         ],
//         removal_instructions:
//           '1. Search for records here [https://www.beenverified.com/app/optout/search](https://www.beenverified.com/app/optout/search)\n2. Click the specific record URL on the search results page.\n3. Enter your email address and click "Confirm opt-out".\n4. Log into your email account. You will receive an email with the subject of "Action required to process your opt-out request".\n5. In that email, click "Verify Opt Out" to complete the removal process.',
//         state: "removed",
//         sent_at: "2024-07-23T17:48:13.935069Z",
//         completed_at: "2024-07-02T20:27:59.579000Z",
//         estimated_days_to_remove_records: 1,
//         records: [
//           {
//             id: "OMtlPosY0M8NffkQ4FAPc",
//             record_url: null,
//             pii: '{"age": "28", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA C SMITH", "relatives": ["Carolanne SMITH", "Mariano S SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "aPPqTuZCfsif_oljIsJdJ",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA SMITH", "relatives": ["available"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "vH7sqP56xJVkh1IC-1uaD",
//         records_matched: 0,
//         broker_name: "SearchUSAPeople",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions: "",
//         state: "no_records_found",
//         sent_at: "2024-07-01T18:53:04.747000Z",
//         completed_at: "2024-07-01T18:53:04.747000Z",
//         estimated_days_to_remove_records: 3,
//         records: [],
//       },
//       {
//         id: "NrFpMK60IZw0oeB_kPXQb",
//         records_matched: 1,
//         broker_name: "SecretInfo",
//         broker_info_types: [
//           "Name",
//           "Relatives",
//           "Address",
//           "Age",
//           "Court, arrest, criminal & civil records",
//           "Social media profiles",
//           "Photos & videos",
//           "Bankruptcies & liens",
//           "Phone numbers",
//           "Mugshots",
//           "Sexual offenses",
//           "Marriage & divorce records",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: "2024-07-01T18:53:00.835000Z",
//         completed_at: "2024-07-01T18:57:03.137000Z",
//         estimated_days_to_remove_records: 2,
//         records: [
//           {
//             id: "rqzEqx6LgakwEWuzr97g7",
//             record_url: null,
//             pii: '{"age": "32", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA W SMITH", "relatives": ["available"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "uEd1S0_jDFTFmoAt4qWdp",
//         records_matched: 1,
//         broker_name: "SelfieNetwork",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Relatives",
//           "Legal records",
//           "Marital status",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: "2024-07-01T18:53:01.779000Z",
//         completed_at: "2024-07-05T19:50:12.540000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "GU5txwWp8rIlaEHTkdWe1",
//             record_url: null,
//             pii: '{"age": "", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA SMITH", "relatives": ["Johathan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "kAMK8tVyF67dHyClutqyC",
//         records_matched: 2,
//         broker_name: "SheriffsDepartment",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Email addresses",
//           "Address",
//           "Social media profiles",
//           "Age",
//           "Relatives",
//           "Legal records",
//         ],
//         removal_instructions:
//           'Follow these steps to remove your private exposed data from public search on the PeopleConnect family of sites\n1. Head over to [https://suppression.peopleconnect.us/login](https://suppression.peopleconnect.us/login) to begin the opt out process.\n2. Enter your email address and click submit.\n3. Log into your email account, you will receive an email with the subject of “Confirm your email address”.\n4. In that email, click on “Verify Email” to navigate to the identity page of the suppression flow. \n5. Provide date of birth and click continue.\n6. Enter legal name and click continue.\n7. Identify your record and click continue to manage suppression rules. \n8. Use the Desired Behavior dropdown to select “Suppressed”.\n9. Click "Save" to prevent your record from appearing in the people search site search results.',
//         state: "removed",
//         sent_at: null,
//         completed_at: "2024-07-05T11:45:30.961000Z",
//         estimated_days_to_remove_records: 1,
//         records: [
//           {
//             id: "dYUFEJMCz9XS6KzURi5k0",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "cLsUP59r8pu2kqsMt4tm8",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "GKicKS4ZeP3nzWZusMH83",
//         records_matched: 1,
//         broker_name: "SmartBackgroundChecks",
//         broker_info_types: [
//           "Name",
//           "Address",
//           "Age",
//           "Relatives",
//           "Phone numbers",
//           "Email addresses",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: "2024-07-01T18:53:02.476000Z",
//         completed_at: "2024-07-01T18:57:16.284000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "h7N0X9mvIfPN7_32kN826",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA I SMITH", "relatives": ["Keenan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "KhxeNJe6oSK9n9JBrl4al",
//         records_matched: 2,
//         broker_name: "SnoopStation",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Employment",
//           "Education",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions:
//           'Follow these steps to remove your private exposed data from public search on the PeopleConnect family of sites\n1. Head over to [https://suppression.peopleconnect.us/login](https://suppression.peopleconnect.us/login) to begin the opt out process.\n2. Enter your email address and click submit.\n3. Log into your email account, you will receive an email with the subject of “Confirm your email address”.\n4. In that email, click on “Verify Email” to navigate to the identity page of the suppression flow. \n5. Provide date of birth and click continue.\n6. Enter legal name and click continue.\n7. Identify your record and click continue to manage suppression rules. \n8. Use the Desired Behavior dropdown to select “Suppressed”.\n9. Click "Save" to prevent your record from appearing in the people search site search results.',
//         state: "removed",
//         sent_at: null,
//         completed_at: "2024-07-05T11:45:30.961000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "EgrRORMHtqEjRkhFxv27v",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "7kqwNrAvNXiJmXmANKxjW",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "n1W1ou8lJNqfzVZfPSWSv",
//         records_matched: 1,
//         broker_name: "Spokeo",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Relatives",
//           "Legal records",
//           "Marital status",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: null,
//         completed_at: "2024-07-05T19:50:12.540000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "vfJ3qUTTD7dGN9HAcH_OV",
//             record_url: null,
//             pii: '{"age": "", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA SMITH", "relatives": ["Johathan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "zflh9m1oXOTfYAbyU14_X",
//         records_matched: 2,
//         broker_name: "ThePublicRecords",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Employment",
//           "Education",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions:
//           'Follow these steps to remove your private exposed data from public search on the PeopleConnect family of sites\n1. Head over to [https://suppression.peopleconnect.us/login](https://suppression.peopleconnect.us/login) to begin the opt out process.\n2. Enter your email address and click submit.\n3. Log into your email account, you will receive an email with the subject of “Confirm your email address”.\n4. In that email, click on “Verify Email” to navigate to the identity page of the suppression flow. \n5. Provide date of birth and click continue.\n6. Enter legal name and click continue.\n7. Identify your record and click continue to manage suppression rules. \n8. Use the Desired Behavior dropdown to select “Suppressed”.\n9. Click "Save" to prevent your record from appearing in the people search site search results.',
//         state: "removed",
//         sent_at: null,
//         completed_at: "2024-07-05T11:45:30.961000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "mPRBAdoDsWNcN5rk1iDhk",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "0aFAqbte_z5Tgxok-HaKz",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "u49gqa2pjnnkzuESvWh_6",
//         records_matched: 2,
//         broker_name: "truePeopleSearch",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Email addresses",
//           "Address",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: "2024-07-01T18:53:01.818000Z",
//         completed_at: "2024-07-01T18:57:16.176000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "KiMdSo0taB1XJPGuQ0_JU",
//             record_url: null,
//             pii: '{"age": "32", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA R SMITH", "relatives": ["available"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "2vpbQLDRLEK_CY8GV08Ww",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA C SMITH", "relatives": ["available"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "_A2JsR9rdeqJYZaxGkJvM",
//         records_matched: 2,
//         broker_name: "TruthFinder",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Email addresses",
//           "Address",
//           "Social media profiles",
//           "Age",
//           "Relatives",
//           "Legal records",
//         ],
//         removal_instructions:
//           'Follow these steps to remove your private exposed data from public search on the PeopleConnect family of sites\n1. Head over to [https://suppression.peopleconnect.us/login](https://suppression.peopleconnect.us/login) to begin the opt out process.\n2. Enter your email address and click submit.\n3. Log into your email account, you will receive an email with the subject of “Confirm your email address”.\n4. In that email, click on “Verify Email” to navigate to the identity page of the suppression flow. \n5. Provide date of birth and click continue.\n6. Enter legal name and click continue.\n7. Identify your record and click continue to manage suppression rules. \n8. Use the Desired Behavior dropdown to select “Suppressed”.\n9. Click "Save" to prevent your record from appearing in the people search site search results.',
//         state: "removed",
//         sent_at: null,
//         completed_at: "2024-07-05T11:45:30.961000Z",
//         estimated_days_to_remove_records: 1,
//         records: [
//           {
//             id: "LpX0KkJWUnAnQKH9OyvbU",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "8RFl42q4JXN1ZMsKAMnC4",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "OahKo0JGsJDh06wmWDdCj",
//         records_matched: 1,
//         broker_name: "TruthRecord",
//         broker_info_types: [
//           "Name",
//           "Address",
//           "Email addresses",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: "2024-07-01T18:53:00.835000Z",
//         completed_at: "2024-07-01T18:57:03.137000Z",
//         estimated_days_to_remove_records: 2,
//         records: [
//           {
//             id: "a9GtgQ4cHBWlPIVmGye8P",
//             record_url: null,
//             pii: '{"age": "32", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA W SMITH", "relatives": ["available"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "1-DAk2EuGlAVJrJ3Cp2Cy",
//         records_matched: 1,
//         broker_name: "USATrace",
//         broker_info_types: [
//           "Name",
//           "Address",
//           "Age",
//           "Relatives",
//           "Phone numbers",
//           "Email addresses",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: "2024-07-01T18:53:02.476000Z",
//         completed_at: "2024-07-01T18:57:16.284000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "go5ntgufaGRn38emPI4KK",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA I SMITH", "relatives": ["Keenan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "Mm-vrK2AQVajU48NRssZ3",
//         records_matched: 1,
//         broker_name: "USFriendsReunited",
//         broker_info_types: [
//           "Name",
//           "Address",
//           "Age",
//           "Relatives",
//           "Phone numbers",
//           "Email addresses",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: "2024-07-01T18:53:02.476000Z",
//         completed_at: "2024-07-01T18:57:16.284000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "cmBxr3xv_pLEhswKrCpKY",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA I SMITH", "relatives": ["Keenan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "eOvLE2Sn8dLJBuxZ20R7x",
//         records_matched: 0,
//         broker_name: "USRecords",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions: "",
//         state: "no_records_found",
//         sent_at: "2024-07-01T18:53:04.747000Z",
//         completed_at: "2024-07-01T18:53:04.747000Z",
//         estimated_days_to_remove_records: 1,
//         records: [],
//       },
//       {
//         id: "i-v-pBU9dGx99JsKM_y_G",
//         records_matched: 2,
//         broker_name: "USSearch",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Employment",
//           "Education",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions:
//           'Follow these steps to remove your private exposed data from public search on the PeopleConnect family of sites\n1. Head over to [https://suppression.peopleconnect.us/login](https://suppression.peopleconnect.us/login) to begin the opt out process.\n2. Enter your email address and click submit.\n3. Log into your email account, you will receive an email with the subject of “Confirm your email address”.\n4. In that email, click on “Verify Email” to navigate to the identity page of the suppression flow. \n5. Provide date of birth and click continue.\n6. Enter legal name and click continue.\n7. Identify your record and click continue to manage suppression rules. \n8. Use the Desired Behavior dropdown to select “Suppressed”.\n9. Click "Save" to prevent your record from appearing in the people search site search results.',
//         state: "removed",
//         sent_at: null,
//         completed_at: "2024-07-05T11:45:30.961000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "kyIeHeeII3AGMYhCyYBgF",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "ctVrLSxm9hV6VumRWCeCB",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "9sSMX1-iSrsFWxvjnKjJs",
//         records_matched: 1,
//         broker_name: "WeInform",
//         broker_info_types: [
//           "Name",
//           "Address",
//           "Email addresses",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: "2024-07-01T18:53:00.835000Z",
//         completed_at: "2024-07-01T18:57:03.137000Z",
//         estimated_days_to_remove_records: 2,
//         records: [
//           {
//             id: "jUAs1sk9aCTpooWCu5LSY",
//             record_url: null,
//             pii: '{"age": "32", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA W SMITH", "relatives": ["available"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "yZAGs9iSaE1UPfqUkS95y",
//         records_matched: 2,
//         broker_name: "YellowBook",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Age",
//           "Legal records",
//           "Relatives",
//           "Social media profiles",
//         ],
//         removal_instructions:
//           '1. Search for records here [https://www.beenverified.com/app/optout/search](https://www.beenverified.com/app/optout/search)\n2. Click the specific record URL on the search results page.\n3. Enter your email address and click "Confirm opt-out".\n4. Log into your email account. You will receive an email with the subject of "Action required to process your opt-out request".\n5. In that email, click "Verify Opt Out" to complete the removal process.',
//         state: "removed",
//         sent_at: "2024-07-23T17:48:13.935069Z",
//         completed_at: "2024-07-02T20:27:59.579000Z",
//         estimated_days_to_remove_records: 1,
//         records: [
//           {
//             id: "J5o7gBoTObOwOMTp0W_HM",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA SMITH", "relatives": ["available"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "4txGvF95_wOsAwIpTybGu",
//             record_url: null,
//             pii: '{"age": "28", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA C SMITH", "relatives": ["Carolanne SMITH", "Mariano S SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "gNoOMB7jEs2wqxYMBLKW3",
//         records_matched: 2,
//         broker_name: "YellowPages",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Employment",
//           "Education",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions:
//           'Follow these steps to remove your private exposed data from public search on the PeopleConnect family of sites\n1. Head over to [https://suppression.peopleconnect.us/login](https://suppression.peopleconnect.us/login) to begin the opt out process.\n2. Enter your email address and click submit.\n3. Log into your email account, you will receive an email with the subject of “Confirm your email address”.\n4. In that email, click on “Verify Email” to navigate to the identity page of the suppression flow. \n5. Provide date of birth and click continue.\n6. Enter legal name and click continue.\n7. Identify your record and click continue to manage suppression rules. \n8. Use the Desired Behavior dropdown to select “Suppressed”.\n9. Click "Save" to prevent your record from appearing in the people search site search results.',
//         state: "removed",
//         sent_at: null,
//         completed_at: "2024-07-05T11:45:30.961000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "UAIQwwf_9Gt38Cm06FM28",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "RF-_YbI_tBEivBsnSFOBU",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "3ovHnxy1WAtF9gzHJQcn2",
//         records_matched: 2,
//         broker_name: "ZabaSearch",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Address",
//           "Email addresses",
//           "Employment",
//           "Education",
//           "Age",
//           "Relatives",
//         ],
//         removal_instructions:
//           'Follow these steps to remove your private exposed data from public search on the PeopleConnect family of sites\n1. Head over to [https://suppression.peopleconnect.us/login](https://suppression.peopleconnect.us/login) to begin the opt out process.\n2. Enter your email address and click submit.\n3. Log into your email account, you will receive an email with the subject of “Confirm your email address”.\n4. In that email, click on “Verify Email” to navigate to the identity page of the suppression flow. \n5. Provide date of birth and click continue.\n6. Enter legal name and click continue.\n7. Identify your record and click continue to manage suppression rules. \n8. Use the Desired Behavior dropdown to select “Suppressed”.\n9. Click "Save" to prevent your record from appearing in the people search site search results.',
//         state: "removed",
//         sent_at: null,
//         completed_at: "2024-07-05T11:45:30.961000Z",
//         estimated_days_to_remove_records: 3,
//         records: [
//           {
//             id: "OkChAxd_N9ddAkJBw_ikC",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "aVyT60gWtl_JgCXfv33qM",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//       {
//         id: "QUOgbur9rZCEcNhrbcxpl",
//         records_matched: 2,
//         broker_name: "ZoSearch",
//         broker_info_types: [
//           "Name",
//           "Phone numbers",
//           "Email addresses",
//           "Address",
//           "Social media profiles",
//           "Age",
//           "Relatives",
//           "Legal records",
//         ],
//         removal_instructions: "",
//         state: "removed",
//         sent_at: null,
//         completed_at: "2024-07-05T11:45:30.961000Z",
//         estimated_days_to_remove_records: 1,
//         records: [
//           {
//             id: "DjaQgul_qINyy_CWVh2fv",
//             record_url: null,
//             pii: '{"age": "31", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA H SMITH", "relatives": ["Elijah R SMITH", "Meda SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//           {
//             id: "5qJeorF1Fz1d7Z39S0wKm",
//             record_url: null,
//             pii: '{"age": "30", "addresses": ["SAN DIEGO, CA"], "full_name": "SHANYNTHIA K SMITH", "relatives": ["Tess M SMITH", "Brendan SMITH"], "phone_numbers": ["available"], "email_addresses": ["available"], "education": "", "employment": [], "gender": "", "occupation": "", "property": []}',
//           },
//         ],
//       },
//     ],
//   },
// };
