import api from "@/api/api";
import store from "@/store";

export default class BreachesServices {
  static async getBreachesForPrimaryEmailPhone() {
    return await api()
      .get("/api/v1/breach_report/personal/primary/")
      .then((response) => {
        store.dispatch(
          "breaches/setEmailBreaches",
          response?.data?.primary_email_report?.items
        );
        return response;
      });
  }
  static async dismissBreach(breachId) {
    const url = `/api/v1/breach_report/personal/item/${breachId}/dismiss/`;
    return await api().post(url);
  }
}

// NOTE: this is to mock the response for getBreachesForPrimaryEmailPhone
// const mockResponse = {
//   data: {
//     primary_email_report: {
//       id: 17367,
//       created_at: "2024-06-20T16:39:08.738715Z",
//       updated_at: "2024-06-20T16:39:08.738741Z",
//       personal_email: {
//         url: "https://secure.cloaked.app/api/v1/email/199/",
//         id: 199,
//         verified: true,
//         email: "aaronbiller@gmail.com",
//         email_type: "email",
//         created_at: "2021-06-30T14:13:48.797659Z",
//         updated_at: "2024-03-27T23:23:17.366879Z",
//         collection_name: "email",
//         checksum: "d899b12aee58ae183b4f964da480037fd725ac5b9bed05f34eae1b14",
//         flagged: false,
//         primary: true,
//         collection: "https://secure.cloaked.app/api/v1/collection/2/",
//         user: "https://secure.cloaked.app/api/v1/user/199/",
//       },
//       personal_phone: null,
//       items: [
//         {
//           id: 25532,
//           created_at: "2024-06-20T16:39:09.922115Z",
//           name: "Zynga",
//           domain: "zynga.com",
//           breach_date: "2019-09-01",
//           logo_url:
//             "https://haveibeenpwned.com/Content/Images/PwnedLogos/Zynga.png",
//           dismissed: false,
//           dismissed_at: null,
//         },
//         {
//           id: 25531,
//           created_at: "2024-06-20T16:39:09.922090Z",
//           name: "Verifications.io",
//           domain: "verifications.io",
//           breach_date: "2019-02-25",
//           logo_url:
//             "https://haveibeenpwned.com/Content/Images/PwnedLogos/VerificationsIO.png",
//           dismissed: false,
//           dismissed_at: null,
//         },
//         {
//           id: 25530,
//           created_at: "2024-06-20T16:39:09.922065Z",
//           name: "Trello",
//           domain: "trello.com",
//           breach_date: "2024-01-16",
//           logo_url:
//             "https://haveibeenpwned.com/Content/Images/PwnedLogos/Trello.png",
//           dismissed: false,
//           dismissed_at: null,
//         },
//         {
//           id: 25529,
//           created_at: "2024-06-20T16:39:09.922039Z",
//           name: "Robinhood",
//           domain: "robinhood.com",
//           breach_date: "2021-11-03",
//           logo_url:
//             "https://haveibeenpwned.com/Content/Images/PwnedLogos/Robinhood.png",
//           dismissed: false,
//           dismissed_at: null,
//         },
//         {
//           id: 25528,
//           created_at: "2024-06-20T16:39:09.922014Z",
//           name: "River City Media Spam List",
//           domain: "rivercitymediaonline.com",
//           breach_date: "2017-01-01",
//           logo_url:
//             "https://haveibeenpwned.com/Content/Images/PwnedLogos/Email.png",
//           dismissed: false,
//           dismissed_at: null,
//         },
//         {
//           id: 25527,
//           created_at: "2024-06-20T16:39:09.921989Z",
//           name: "Nitro",
//           domain: "gonitro.com",
//           breach_date: "2020-09-28",
//           logo_url:
//             "https://haveibeenpwned.com/Content/Images/PwnedLogos/Nitro.png",
//           dismissed: false,
//           dismissed_at: null,
//         },
//         {
//           id: 25526,
//           created_at: "2024-06-20T16:39:09.921964Z",
//           name: "Naz.API",
//           domain: "",
//           breach_date: "2023-09-20",
//           logo_url:
//             "https://haveibeenpwned.com/Content/Images/PwnedLogos/List.png",
//           dismissed: false,
//           dismissed_at: null,
//         },
//         {
//           id: 25525,
//           created_at: "2024-06-20T16:39:09.921939Z",
//           name: "MyFitnessPal",
//           domain: "myfitnesspal.com",
//           breach_date: "2018-02-01",
//           logo_url:
//             "https://haveibeenpwned.com/Content/Images/PwnedLogos/MyFitnessPal.png",
//           dismissed: false,
//           dismissed_at: null,
//         },
//         {
//           id: 25524,
//           created_at: "2024-06-20T16:39:09.921913Z",
//           name: "LinkedIn Scraped Data (2021)",
//           domain: "linkedin.com",
//           breach_date: "2021-04-08",
//           logo_url:
//             "https://haveibeenpwned.com/Content/Images/PwnedLogos/LinkedIn.png",
//           dismissed: false,
//           dismissed_at: null,
//         },
//         {
//           id: 25523,
//           created_at: "2024-06-20T16:39:09.921888Z",
//           name: "LinkedIn",
//           domain: "linkedin.com",
//           breach_date: "2012-05-05",
//           logo_url:
//             "https://haveibeenpwned.com/Content/Images/PwnedLogos/LinkedIn.png",
//           dismissed: false,
//           dismissed_at: null,
//         },
//         {
//           id: 25522,
//           created_at: "2024-06-20T16:39:09.921863Z",
//           name: "Kickstarter",
//           domain: "kickstarter.com",
//           breach_date: "2014-02-16",
//           logo_url:
//             "https://haveibeenpwned.com/Content/Images/PwnedLogos/Kickstarter.png",
//           dismissed: false,
//           dismissed_at: null,
//         },
//         {
//           id: 25521,
//           created_at: "2024-06-20T16:39:09.921833Z",
//           name: "Jefit",
//           domain: "jefit.com",
//           breach_date: "2020-08-11",
//           logo_url:
//             "https://haveibeenpwned.com/Content/Images/PwnedLogos/Jefit.png",
//           dismissed: false,
//           dismissed_at: null,
//         },
//         {
//           id: 25520,
//           created_at: "2024-06-20T16:39:09.921795Z",
//           name: "Houzz",
//           domain: "houzz.com",
//           breach_date: "2018-05-23",
//           logo_url:
//             "https://haveibeenpwned.com/Content/Images/PwnedLogos/Houzz.png",
//           dismissed: false,
//           dismissed_at: null,
//         },
//         {
//           id: 25519,
//           created_at: "2024-06-20T16:39:09.921742Z",
//           name: "Gravatar",
//           domain: "gravatar.com",
//           breach_date: "2020-10-03",
//           logo_url:
//             "https://haveibeenpwned.com/Content/Images/PwnedLogos/Gravatar.png",
//           dismissed: false,
//           dismissed_at: null,
//         },
//         {
//           id: 25518,
//           created_at: "2024-06-20T16:39:09.921706Z",
//           name: "Exactis",
//           domain: "exactis.com",
//           breach_date: "2018-06-01",
//           logo_url:
//             "https://haveibeenpwned.com/Content/Images/PwnedLogos/Exactis.png",
//           dismissed: false,
//           dismissed_at: null,
//         },
//         {
//           id: 25517,
//           created_at: "2024-06-20T16:39:09.921641Z",
//           name: "Dropbox",
//           domain: "dropbox.com",
//           breach_date: "2012-07-01",
//           logo_url:
//             "https://haveibeenpwned.com/Content/Images/PwnedLogos/Dropbox.png",
//           dismissed: false,
//           dismissed_at: null,
//         },
//         {
//           id: 25516,
//           created_at: "2024-06-20T16:39:09.921615Z",
//           name: "Deezer",
//           domain: "deezer.com",
//           breach_date: "2019-04-22",
//           logo_url:
//             "https://haveibeenpwned.com/Content/Images/PwnedLogos/Deezer.png",
//           dismissed: false,
//           dismissed_at: null,
//         },
//         {
//           id: 25515,
//           created_at: "2024-06-20T16:39:09.921585Z",
//           name: "Data Enrichment Exposure From PDL Customer",
//           domain: "",
//           breach_date: "2019-10-16",
//           logo_url:
//             "https://haveibeenpwned.com/Content/Images/PwnedLogos/List.png",
//           dismissed: false,
//           dismissed_at: null,
//         },
//         {
//           id: 25514,
//           created_at: "2024-06-20T16:39:09.921557Z",
//           name: "Collection #1",
//           domain: "",
//           breach_date: "2019-01-07",
//           logo_url:
//             "https://haveibeenpwned.com/Content/Images/PwnedLogos/List.png",
//           dismissed: false,
//           dismissed_at: null,
//         },
//         {
//           id: 25513,
//           created_at: "2024-06-20T16:39:09.921528Z",
//           name: "Apollo",
//           domain: "apollo.io",
//           breach_date: "2018-07-23",
//           logo_url:
//             "https://haveibeenpwned.com/Content/Images/PwnedLogos/Apollo.png",
//           dismissed: false,
//           dismissed_at: null,
//         },
//         {
//           id: 25512,
//           created_at: "2024-06-20T16:39:09.921493Z",
//           name: "Animoto",
//           domain: "animoto.com",
//           breach_date: "2018-07-10",
//           logo_url:
//             "https://haveibeenpwned.com/Content/Images/PwnedLogos/Animoto.png",
//           dismissed: false,
//           dismissed_at: null,
//         },
//         {
//           id: 25511,
//           created_at: "2024-06-20T16:39:09.921453Z",
//           name: "Adobe",
//           domain: "adobe.com",
//           breach_date: "2013-10-04",
//           logo_url:
//             "https://haveibeenpwned.com/Content/Images/PwnedLogos/Adobe.png",
//           dismissed: false,
//           dismissed_at: null,
//         },
//         {
//           id: 25510,
//           created_at: "2024-06-20T16:39:09.921367Z",
//           name: "500px",
//           domain: "500px.com",
//           breach_date: "2018-07-05",
//           logo_url:
//             "https://haveibeenpwned.com/Content/Images/PwnedLogos/500px.png",
//           dismissed: false,
//           dismissed_at: null,
//         },
//       ],
//     },
//     primary_phone_report: null,
//   },
// };
