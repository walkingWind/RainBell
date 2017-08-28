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
const chalk = require("chalk");
const guards_1 = require("../guards");
const errors_1 = require("./errors");
const http_1 = require("./http");
class Session {
    constructor(config, project, client) {
        this.config = config;
        this.project = project;
        this.client = client;
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const req = this.client.make('POST', '/login')
                .send({ email, password });
            try {
                const res = yield this.client.do(req);
                if (!guards_1.isLoginResponse(res)) {
                    throw http_1.createFatalAPIFormat(req, res);
                }
                const { token, user_id } = res.data;
                const c = yield this.config.load();
                if (c.user.id !== user_id) {
                    c.tokens.appUser = {};
                }
                c.user.id = user_id;
                c.user.email = email;
                c.tokens.user = token;
            }
            catch (e) {
                if (guards_1.isSuperAgentError(e) && e.response.status === 401) {
                    throw new errors_1.FatalException(chalk.red('Incorrect email or password'));
                }
                throw e;
            }
        });
    }
    isLoggedIn() {
        return __awaiter(this, void 0, void 0, function* () {
            const c = yield this.config.load();
            return typeof c.tokens.user === 'string';
        });
    }
    getUserToken() {
        return __awaiter(this, void 0, void 0, function* () {
            const c = yield this.config.load();
            if (!c.tokens.user) {
                throw new errors_1.FatalException(`Oops, sorry! You'll need to log in:\n\n    ${chalk.green('ionic login')}\n\n` +
                    `You can create a new account by signing up:\n\n    ${chalk.green('ionic signup')}\n`);
            }
            return c.tokens.user;
        });
    }
    getAppUserToken(app_id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!app_id) {
                app_id = yield this.project.loadAppId();
            }
            const c = yield this.config.load();
            if (!c.tokens.appUser[app_id]) {
                const token = yield this.getUserToken();
                const paginator = this.client.paginate(() => this.client.make('GET', '/auth/tokens').set('Authorization', `Bearer ${token}`).query({ 'page_size': 100, type: 'app-user' }), guards_1.isAuthTokensResponse);
                for (let r of paginator) {
                    const res = yield r;
                    for (let token of res.data) {
                        c.tokens.appUser[token.details.app_id] = token.token;
                    }
                }
            }
            if (!c.tokens.appUser[app_id]) {
                throw new errors_1.FatalException(`A token does not exist for your account on app ${chalk.bold(app_id)}.`);
            }
            return c.tokens.appUser[app_id];
        });
    }
}
exports.Session = Session;
