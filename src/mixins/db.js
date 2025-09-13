import { db } from "@/store/modules/localdb";
import store from "@/store";
import moment from "moment";
import { withDecryptedCustomFields } from "@/scripts/customFields";
import IdentityService from "@/api/actions/identity-service";

export const getLatestTimestamp = async () => {
  let timestamp;

  const timestampProperty = await db.properties.get({
    key: "last_checked",
  });

  if (timestampProperty) {
    timestamp = timestampProperty.value;
  }

  if (!timestamp) {
    const lastUpdatedCloak = await db.cloaks.orderBy("updated_at").last();
    if (lastUpdatedCloak) {
      timestamp = lastUpdatedCloak.updated_at;
    }
  }
  return timestamp;
};

export const dbMixin = {
  data() {
    return {
      tasks: [],
    };
  },
  computed: {
    dbUpToDate() {
      return this.tasks.length === 1;
    },
    cloaks() {
      return store.state.localdb.db_cloaks;
    },
  },
  methods: {
    async frontLoadCloaks(bootup, url) {
      const page_size = 5000;
      if (url) {
        return IdentityService.frontloadIdentities(url).then(({ data }) => {
          return this.formatAndSaveCloaks(data.results, bootup);
        });
      } else {
        return IdentityService.frontloadIdentities(
          `/api/v1/search/identity/?page_size=${page_size}`
        )
          .then(({ data }) => {
            return this.formatAndSaveCloaks(data.results, bootup).then(() => {
              const urls = [];
              store.dispatch("setLoaded", {
                status: true,
                cloakCount: data.count,
              });
              if (data.count > page_size) {
                const pages = Math.ceil(data.count / page_size);
                for (let i = 2; i <= pages; i++) {
                  urls.push(
                    `/api/v1/search/identity/?page_size=${page_size}&page=${i}`
                  );
                }
                const promises = urls.map((page_url) =>
                  IdentityService.frontloadIdentities(page_url).then(
                    (resp) => resp.data.results
                  )
                );
                Promise.all(promises).then((args) => {
                  const results = args.reduce((result, item) => {
                    return [...result, ...item];
                  }, []);
                  this.formatAndSaveCloaks(results, bootup).then(() => {
                    /// set this once all cloaks are loaded
                    return this.updateTaskList("front-loaded");
                  });
                });
                return data.count;
              } else {
                /// set this once all cloaks are loaded
                this.updateTaskList("front-loaded");
                return data.count;
              }
            });
          })
          .catch(() => {
            store.dispatch("setLoaded", {
              status: true,
              cloakCount: 0,
            });
            return 0;
          });
      }
    },
    async formatAndSaveCloaks(cloaks, bootup) {
      const formattedCloaks = cloaks.map((r) => {
        const is_cloaked_email = !!r.e.c && r.e.lc === "c";
        const email_enabled = r.e && r.e.e;
        const is_cloaked_phone = !!r.p.c && r.p.lc === "c";
        const phone_enabled = r.p && r.p.e;
        let muted = null;

        if (is_cloaked_email || is_cloaked_phone) {
          muted = true;
          if (is_cloaked_email && email_enabled) {
            muted = false;
          }
          if (is_cloaked_phone && phone_enabled) {
            muted = false;
          }
        }

        return {
          id: r.i,
          nickname: r.n,
          email: r.e && r.e[r.e.lc],
          email_enabled,
          is_cloaked_email,
          phone: r.p && r.p[r.p.lc],
          phone_enabled,
          is_cloaked_phone,
          has_password: !!r.em?.password,
          muted,
          logo_url: r.l,
          color: r.pc,
          secondary_color: r.sc,
          cloak_brand_color: r.cbc,
          username: r.u,
          website_url: r.w && !r.w.includes("cloaked") ? r.w : null,
          favorited: r.f,
          created_at: r.c,
          updated_at: r.lu,
          protected: r.pr,
          customFields: r.cf,
          categories: r.cat || [],
        };
      });

      const decryptedFormattedCloaks = await Promise.all(
        formattedCloaks.map((identity) => withDecryptedCustomFields(identity))
      );

      if (bootup) {
        db.cloaks.clear();
        const cloaksSaved = await db.cloaks.bulkPut(decryptedFormattedCloaks);
        return cloaksSaved;
      }

      return this.updateOrAddCloaks(decryptedFormattedCloaks);
    },
    async updateOrAddCloaks(formattedCloaks) {
      const foundCloaks = await db.cloaks.bulkGet(
        formattedCloaks.map((c) => c?.id)
      );
      const foundCloakIds = foundCloaks.filter((d) => !!d).map((c) => c?.id);
      const newCloaks = formattedCloaks.filter(
        (c) => !foundCloakIds.includes(c?.id)
      );
      const updatedCloaks = formattedCloaks.filter((c) =>
        foundCloakIds.includes(c?.id)
      );

      const updatedCloaksPopulated = updatedCloaks.map((cloak) => {
        const cloakInDb = foundCloaks.find((c) => c?.id === cloak?.id);
        return {
          ...cloakInDb,
          ...cloak,
        };
      });

      return store.dispatch("updateCloaks", [
        ...newCloaks,
        ...updatedCloaksPopulated,
      ]);
    },
    updateTaskList(task) {
      this.tasks = [...new Set([...this.tasks, task])];
    },
  },
  watch: {
    dbUpToDate: {
      handler(newVal, oldVal) {
        if (!oldVal && newVal) {
          db.properties.put({
            key: "last_checked",
            value: moment().toISOString(),
          });
        }
      },
      deep: true,
    },
  },
};
