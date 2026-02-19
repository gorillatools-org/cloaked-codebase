export const read_search = async (response, decrypt) => {
  if (response.data) {
    if (response.data.results) {
      const promises = response.data.results.map(async (r) => {
        if (r.e && r.e.ug) {
          r.e.ug = await decrypt(r.e.ug);
        }
        if (r.p && r.p.ug) {
          r.p.ug = await decrypt(r.p.ug);
        }
        if (r.u) {
          r.u = await decrypt(r.u);
        }
        return r;
      });
      return Promise.all(promises).then((results) => {
        response.data.results = results;
        return response;
      });
    }
  }
  return response;
};
