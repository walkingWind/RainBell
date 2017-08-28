"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const guards_1 = require("../guards");
const http_1 = require("./http");
class SecurityClient {
    constructor(appUserToken, client) {
        this.appUserToken = appUserToken;
        this.client = client;
    }
    getProfile(tag) {
        return __awaiter(this, void 0, void 0, function* () {
            const req = this.client.make('GET', `/security/profiles/${tag}`)
                .set('Authorization', `Bearer ${this.appUserToken}`)
                .query({})
                .send();
            const res = yield this.client.do(req);
            if (!guards_1.isSecurityProfileResponse(res)) {
                throw http_1.createFatalAPIFormat(req, res);
            }
            return res.data;
        });
    }
    getProfiles({ page = 1, pageSize = 25 }) {
        return __awaiter(this, void 0, void 0, function* () {
            const req = this.client.make('GET', '/security/profiles')
                .set('Authorization', `Bearer ${this.appUserToken}`)
                .query({ page, 'page_size': pageSize, })
                .send();
            const res = yield this.client.do(req);
            if (!guards_1.isSecurityProfilesResponse(res)) {
                throw http_1.createFatalAPIFormat(req, res);
            }
            return res.data;
        });
    }
}
exports.SecurityClient = SecurityClient;
