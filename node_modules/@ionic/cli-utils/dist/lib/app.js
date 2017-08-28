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
const http_1 = require("./http");
const guards_1 = require("../guards");
class App {
    constructor(session, project, client) {
        this.session = session;
        this.project = project;
        this.client = client;
        this.details = {};
    }
    load(app_id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!app_id) {
                app_id = yield this.project.loadAppId();
            }
            if (!this.details[app_id]) {
                const req = this.client.make('GET', `/apps/${app_id}`)
                    .set('Authorization', `Bearer ${yield this.session.getAppUserToken(app_id)}`)
                    .send({});
                const res = yield this.client.do(req);
                if (!guards_1.isAppResponse(res)) {
                    throw http_1.createFatalAPIFormat(req, res);
                }
                this.details[app_id] = res.data;
            }
            return this.details[app_id];
        });
    }
}
exports.App = App;
