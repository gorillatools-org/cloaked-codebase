import { cache } from "@/api/api";

export default class WebService {
  static getWebsite(baseDomain) {
    const url = `/api/v1/website/meta/?domain=${baseDomain}`;
    return cache().get(url);
  }
  static searchWebsites(query) {
    const url = `/api/v1/website/?search=${query}`;
    return cache().get(url);
  }
}
