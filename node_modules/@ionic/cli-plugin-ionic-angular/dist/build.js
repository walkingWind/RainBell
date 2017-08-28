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
const cli_utils_1 = require("@ionic/cli-utils");
const modules_1 = require("./lib/modules");
function build(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const appScriptsArgs = cli_utils_1.minimistOptionsToArray(args.options, { useEquals: false, ignoreFalse: true, allowCamelCase: true });
        process.argv = ['node', 'appscripts'].concat(appScriptsArgs);
        const AppScripts = modules_1.load('@ionic/app-scripts');
        const context = AppScripts.generateContext();
        console.log(`Running app-scripts build: ${chalk.bold(appScriptsArgs.join(' '))}\n`);
        return yield AppScripts.build(context);
    });
}
exports.build = build;
