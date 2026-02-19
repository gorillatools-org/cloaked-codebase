const email_fields = ["subject", "html", "text", "body_preview"];
const message_fields = ["body"];

export const activity_decrypter = async (payload, decrypt) => {
  const isArray = Array.isArray(payload) ? true : false;
  const data = isArray ? payload : [payload];
  const promisesData = data.map(async (row) => {
    if (row.is_encrypted) {
      if (row.email) {
        let emailData = {};
        for (const k of email_fields) {
          emailData[k] = await decrypt(row.email[k]);
          if (
            (k === "html" || k === "text") &&
            row?.email?.all_attachments?.length
          ) {
            const all_attachments = row.email.all_attachments;
            all_attachments.forEach(function (a) {
              emailData[k]?.replace(`cid:${a.content_id}`, a.url);
            });
          }
        }
        const activity = { ...row };
        activity.email = { ...activity.email, ...emailData };
        return activity;
      }
      if (row.message) {
        let msgData = {};
        for (const k of message_fields) {
          msgData[k] = await decrypt(row.message[k]);
        }
        const activity = { ...row };
        activity.message = { ...activity.message, ...msgData };
        return activity;
      }
    }
    return row;
  });
  const resp = await Promise.all(promisesData);
  if (!isArray) {
    return resp[0];
  }
  return resp;
};

export const read_activity = async (response, decrypt) => {
  if (response.data?.results) {
    response.data.results = await activity_decrypter(
      response.data.results,
      decrypt
    );
  } else if (response.data) {
    response.data = await activity_decrypter(response.data, decrypt);
  }
  return response;
};

export const read_activity_content = async (response, decrypt) => {
  if (response.data) {
    response.data = await decrypt(response.data);
  }
  return response;
};

export const read_activity_single = async (response, decrypt) => {
  if (response.data?.is_encrypted) {
    if (response.data?.email) {
      if (response.data?.email?.text) {
        response.data.email.text = await decrypt(response.data.email.text);
        const all_attachments = response.data.email.all_attachments;
        all_attachments.forEach(function (a) {
          response.data.email.text?.replace(`cid:${a.content_id}`, a.url);
        });
      }
      if (response.data?.email?.html) {
        response.data.email.html = await decrypt(response.data.email.html);
        const all_attachments = response.data.email.all_attachments;
        all_attachments.forEach(function (a) {
          response.data.email.html?.replace(`cid:${a.content_id}`, a.url);
        });
      }
      if (response.data?.email?.body_preview) {
        response.data.email.body_preview = await decrypt(
          response.data.email.body_preview
        );
      }
      if (response.data?.email?.subject) {
        response.data.email.subject = await decrypt(
          response.data.email.subject
        );
      }
    }
    if (response.data?.message) {
      if (response.data?.message?.body) {
        response.data.message.body = await decrypt(response.data.message.body);
      }
    }
    return response;
  }
  return response;
};
