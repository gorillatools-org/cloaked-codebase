export const read_trash = async (response, decrypt) => {
  if (response.data && response.data.results) {
    const promises = response.data.results.map(async (row) => {
      if (row.is_encrypted) {
        row.item = await decrypt(row.item);
      }
      return row;
    });
    return await Promise.all(promises).then((results) => {
      response.data.results = results;
      return response;
    });
  } else {
    return response;
  }
};
