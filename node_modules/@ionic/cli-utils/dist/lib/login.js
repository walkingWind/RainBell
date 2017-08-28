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
const validators_1 = require("./validators");
function promptToLogin(env) {
    return __awaiter(this, void 0, void 0, function* () {
        env.log.msg(`Log into your Ionic account\nIf you don't have one yet, create yours by running: ${chalk.green(`ionic signup`)}\n`);
        const email = yield env.prompt({
            type: 'input',
            name: 'email',
            message: 'Email:',
            validate: v => validators_1.validators.email(v),
        });
        const password = yield env.prompt({
            type: 'password',
            name: 'password',
            message: 'Password:'
        });
        yield env.session.login(email, password);
    });
}
exports.promptToLogin = promptToLogin;
