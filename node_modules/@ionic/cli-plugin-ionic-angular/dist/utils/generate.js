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
const path = require("path");
const cli_utils_1 = require("@ionic/cli-utils");
const modules_1 = require("../lib/modules");
function getPages(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const AppScripts = modules_1.load('@ionic/app-scripts');
        const pages = yield AppScripts.getNgModules(context, ['page', 'component']);
        const ngModuleSuffix = yield AppScripts.getStringPropertyValue('IONIC_NG_MODULE_FILENAME_SUFFIX');
        return pages.map((page) => {
            return {
                fileName: path.basename(page.absolutePath, ngModuleSuffix),
                absolutePath: page.absolutePath,
                relativePath: path.relative(context.rootDir, page.absolutePath)
            };
        });
    });
}
exports.getPages = getPages;
function prompt(context) {
    return __awaiter(this, void 0, void 0, function* () {
        return context.appNgModulePath;
    });
}
exports.prompt = prompt;
function tabsPrompt(env) {
    return __awaiter(this, void 0, void 0, function* () {
        const tabNames = [];
        const howMany = yield env.prompt({
            type: 'input',
            name: 'howMany',
            message: 'How many tabs?',
            validate: v => cli_utils_1.validators.numeric(v),
        });
        for (let i = 0; i < parseInt(howMany, 10); i++) {
            const tabName = yield env.prompt({
                type: 'input',
                name: 'tabName',
                message: 'Name of this tab:'
            });
            tabNames.push(tabName);
        }
        return tabNames;
    });
}
exports.tabsPrompt = tabsPrompt;
