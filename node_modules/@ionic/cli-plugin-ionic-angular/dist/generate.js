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
const path = require("path");
const cli_utils_1 = require("@ionic/cli-utils");
const modules_1 = require("./lib/modules");
const generate_1 = require("./utils/generate");
function generate(args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!args.env.project.directory) {
            return [];
        }
        const appScriptsArgs = cli_utils_1.minimistOptionsToArray(args.options, { useEquals: false, ignoreFalse: true, allowCamelCase: true });
        process.argv = ['node', 'appscripts'].concat(appScriptsArgs);
        const ionicAngularPackageJsonFilePath = path.resolve(args.env.project.directory, 'node_modules', 'ionic-angular', 'package.json');
        try {
            const ionicAngularPackageJson = yield cli_utils_1.readPackageJsonFile(ionicAngularPackageJsonFilePath);
            if (ionicAngularPackageJson.version && Number(ionicAngularPackageJson.version.charAt(0)) < 3) {
                throw new Error(`The generate command is only available for projects that use ionic-angular >= 3.0.0`);
            }
        }
        catch (e) {
            args.env.log.error(`Error with ${chalk.bold(cli_utils_1.prettyPath(ionicAngularPackageJsonFilePath))} file: ${e}`);
        }
        const AppScripts = modules_1.load('@ionic/app-scripts');
        const context = AppScripts.generateContext();
        const [type, name] = args.inputs;
        switch (type) {
            case 'page':
                yield AppScripts.processPageRequest(context, name);
                break;
            case 'component':
                const componentData = yield promptQuestions(context);
                yield AppScripts.processComponentRequest(context, name, componentData);
                break;
            case 'directive':
                const directiveData = yield promptQuestions(context);
                yield AppScripts.processDirectiveRequest(context, name, directiveData);
                break;
            case 'pipe':
                const pipeData = yield promptQuestions(context);
                yield AppScripts.processPipeRequest(context, name, pipeData);
                break;
            case 'provider':
                const providerData = yield promptQuestions(context);
                yield AppScripts.processProviderRequest(context, name, providerData);
                break;
            case 'tabs':
                const tabsData = yield generate_1.tabsPrompt(args.env);
                yield AppScripts.processTabsRequest(context, name, tabsData);
                break;
        }
        return [];
    });
}
exports.generate = generate;
function promptQuestions(context) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield generate_1.prompt(context);
    });
}
