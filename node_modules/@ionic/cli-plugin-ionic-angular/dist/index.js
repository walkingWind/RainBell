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
const build_1 = require("./build");
const generate_1 = require("./generate");
const serve_1 = require("./serve");
exports.name = '@ionic/cli-plugin-ionic-angular';
exports.version = '1.3.2';
exports.preferGlobal = false;
function getIonicAngularVersion(env) {
    return __awaiter(this, void 0, void 0, function* () {
        const ionicAngularPackageJsonFilePath = path.resolve(env.project.directory, 'node_modules', 'ionic-angular', 'package.json');
        try {
            const ionicAngularPackageJson = yield cli_utils_1.readPackageJsonFile(ionicAngularPackageJsonFilePath);
            return ionicAngularPackageJson.version;
        }
        catch (e) {
            env.log.error(`Error with ${chalk.bold(cli_utils_1.prettyPath(ionicAngularPackageJsonFilePath))} file: ${e}`);
        }
    });
}
function getAppScriptsVersion(env) {
    return __awaiter(this, void 0, void 0, function* () {
        const appScriptsPackageJsonFilePath = path.resolve(env.project.directory, 'node_modules', '@ionic', 'app-scripts', 'package.json');
        try {
            const appScriptsPackageJson = yield cli_utils_1.readPackageJsonFile(appScriptsPackageJsonFilePath);
            return appScriptsPackageJson.version;
        }
        catch (e) {
            env.log.error(`Error with ${chalk.bold(cli_utils_1.prettyPath(appScriptsPackageJsonFilePath))} file: ${e}`);
        }
    });
}
function registerHooks(hooks) {
    hooks.register(exports.name, 'command:docs', ({ env }) => __awaiter(this, void 0, void 0, function* () {
        const docsHomepage = 'https://ionicframework.com/docs';
        if (!env.project.directory) {
            return docsHomepage;
        }
        const ionicAngularVersion = yield getIonicAngularVersion(env);
        const url = `${docsHomepage}/${ionicAngularVersion ? ionicAngularVersion + '/' : ''}api`;
        return url;
    }));
    hooks.register(exports.name, 'command:generate', (args) => __awaiter(this, void 0, void 0, function* () {
        yield generate_1.generate(args);
    }));
    hooks.register(exports.name, 'command:info', ({ env }) => __awaiter(this, void 0, void 0, function* () {
        if (!env.project.directory) {
            return [];
        }
        const [ionicAngularVersion, appScriptsVersion] = yield Promise.all([getIonicAngularVersion(env), getAppScriptsVersion(env)]);
        return [
            { type: 'local-packages', name: 'Ionic Framework', version: ionicAngularVersion ? `ionic-angular ${ionicAngularVersion}` : 'not installed' },
            { type: 'local-packages', name: exports.name, version: exports.version },
            { type: 'local-packages', name: '@ionic/app-scripts', version: appScriptsVersion ? appScriptsVersion : 'not installed' },
        ];
    }));
    hooks.register(exports.name, 'command:serve', (args) => __awaiter(this, void 0, void 0, function* () {
        return serve_1.serve(args);
    }));
    hooks.register(exports.name, 'command:build', (args) => __awaiter(this, void 0, void 0, function* () {
        yield build_1.build(args);
    }));
}
exports.registerHooks = registerHooks;
