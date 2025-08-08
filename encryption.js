! function(e, t) {
    if ("object" == typeof exports && "object" == typeof module) module.exports = t();
    else if ("function" == typeof define && define.amd) define([], t);
    else {
        var r = t();
        for (var a in r)("object" == typeof exports ? exports : e)[a] = r[a]
    }
}(self, (() => (() => {
    "use strict";
    var e = {
            d: (t, r) => {
                for (var a in r) e.o(r, a) && !e.o(t, a) && Object.defineProperty(t, a, {
                    enumerable: !0,
                    get: r[a]
                })
            },
            o: (e, t) => Object.prototype.hasOwnProperty.call(e, t),
            r: e => {
                "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
                    value: "Module"
                }), Object.defineProperty(e, "__esModule", {
                    value: !0
                })
            }
        },
        t = {};
    e.r(t), e.d(t, {
        CloakedEncryption: () => i
    });
    class r extends Error {
        constructor(e) {
            super(e), this.name = "UserDoesNotExistsLocally"
        }
    }
    let a = 0;

    function s(e, t) {
        let r = t.data;
        if (!Array.isArray(r) || r.length < 2) return;
        let a = r[0],
            s = r[1],
            n = r[2],
            o = e._callbacks[a];
        o && (delete e._callbacks[a], o(s, n))
    }

    function n(e) {
        let t = this;
        t._worker = e, t._callbacks = {}, e.addEventListener("message", (function(e) {
            s(t, e)
        }))
    }
    n.prototype.postMessage = function(e) {
        let t = this,
            r = a++,
            n = [r, e];
        return new Promise((function(e, a) {
            if (t._callbacks[r] = function(t, r) {
                    if (t) return a(new Error(t.message));
                    e(r)
                }, void 0 !== t._worker.controller) {
                let e = new MessageChannel;
                e.port1.onmessage = function(e) {
                    s(t, e)
                }, t._worker.controller.postMessage(n, [e.port2])
            } else t._worker.postMessage(n)
        }))
    };
    const o = n;
    class i {
        static async build(e = "/encryption.wasm") {
            const t = new i;
            return await t._init(e), t
        }
        async _init(e) {
            const t = await fetch("https://cloaked-encryption-sdk.s3.amazonaws.com/0.2.0/webworker.js"),
                r = await t.text(),
                a = new Blob([r], {
                    type: "application/javascript"
                }),
                s = URL.createObjectURL(a),
                n = new Worker(s);
            return this.encryptionWorker = new o(n), new Promise(((e, t) => {
                this.encryptionWorker._worker.addEventListener("message", (t => {
                    "sdk-loaded" === t.data && e()
                }))
            }))
        }
        async setDataFromStorage(e = null) {
            if (null !== e) {
                const t = await this.loadDataForUser(e);
                if (null === t) throw new r(`the User "${e}" does not exists locally, please load first`);
                this.userId = e, this.publicKey = t.pubk, this.privateKey = t.privk
            } else this.userId = null, this.publicKey = null, this.privateKey = null
        }
        async storeDataForUser(e, t, r) {
            const a = {
                uid: e,
                pubk: t,
                privk: r
            };
            window.localStorage.setItem(e, JSON.stringify(a)), await this.setDataFromStorage(e)
        }
        async clearData() {
            return window.localStorage ? (window?.localStorage?.clear(), !0) : (console.error("localStorage is not available to encryptionjs."), !1)
        }
        async loadDataForUser(e) {
            const t = window.localStorage.getItem(e);
            return JSON.parse(t)
        }
        async generateUsernameHash(e) {
            return await this.encryptionWorker.postMessage({
                fn: "generateUsernameHash",
                args: [e]
            })
        }
        async generateUserSalt() {
            return await this.encryptionWorker.postMessage({
                fn: "generateUserSalt",
                args: []
            })
        }
        async generatePasswordSecretBoxKey(e, t) {
            return await this.encryptionWorker.postMessage({
                fn: "generatePasswordSecretBoxKey",
                args: [e, t]
            })
        }
        async generatePasswordAuthKey(e, t) {
            return await this.encryptionWorker.postMessage({
                fn: "generatePasswordAuthKey",
                args: [e, t]
            })
        }
        async generateRecoveryCode(e, t) {
            return await this.encryptionWorker.postMessage({
                fn: "generateRecoveryCode",
                args: [e, t]
            })
        }
        async generateAsymmetricKeys() {
            return await this.encryptionWorker.postMessage({
                fn: "generateAsymmetricKeys",
                args: []
            })
        }
        async encryptPrivateKey(e, t) {
            return await this.encryptionWorker.postMessage({
                fn: "encryptPrivateKey",
                args: [e, t]
            })
        }
        async decryptPrivateKey(e, t) {
            return await this.encryptionWorker.postMessage({
                fn: "decryptPrivateKey",
                args: [e, t]
            })
        }
        async decryptPrivateKeyRecovery(e, t, r) {
            return await this.encryptionWorker.postMessage({
                fn: "decryptPrivateKeyRecovery",
                args: [e, t, r]
            })
        }
        async encryptWithPublicKeyPair(e, t) {
            return await this.encryptionWorker.postMessage({
                fn: "encryptWithPublicKeyPair",
                args: [e, t]
            })
        }
        async decryptWithPrivateKeyPair(e, t, r) {
            return await this.encryptionWorker.postMessage({
                fn: "decryptWithPrivateKeyPair",
                args: [e, t, r]
            })
        }
        async passwordChange(e, t, r) {
            return await this.encryptionWorker.postMessage({
                fn: "passwordChange",
                args: [e, t, r]
            })
        }
    }
    return t
})()));