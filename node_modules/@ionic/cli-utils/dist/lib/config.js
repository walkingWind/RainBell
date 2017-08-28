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
const os = require("os");
const chalk = require("chalk");
const errors_1 = require("./errors");
const format_1 = require("./utils/format");
const fs_1 = require("./utils/fs");
const modules_1 = require("./modules");
exports.CLI_FLAGS = [
    { flag: 'confirm', visible: true, defaultValue: false },
    { flag: 'interactive', visible: true, defaultValue: true },
    { flag: 'telemetry', defaultValue: true },
    { flag: 'yarn', visible: true, defaultValue: false },
    { flag: 'timeout', visible: true, defaultValue: true },
    { flag: 'dev-always-plugin-updates' },
    { flag: 'dev-always-ionic-updates' },
];
class BaseConfig {
    constructor(directory, fileName) {
        this.fileName = fileName;
        if (directory) {
            this.directory = path.resolve(directory);
        }
        else {
            this.directory = '';
        }
        this.filePath = path.resolve(this.directory, fileName);
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.configFile) {
                let o;
                try {
                    const stats = yield fs_1.fsStat(this.filePath);
                    if (stats.size < 5) {
                        o = {};
                    }
                }
                catch (e) {
                    if (e.code !== 'ENOENT') {
                        throw e;
                    }
                    o = {};
                }
                if (typeof o === 'undefined') {
                    try {
                        o = yield fs_1.fsReadJsonFile(this.filePath);
                    }
                    catch (e) {
                        if (e === fs_1.ERROR_FILE_INVALID_JSON) {
                            throw new errors_1.FatalException(`The config file (${chalk.bold(format_1.prettyPath(this.filePath))}) is not valid JSON format.\n\n` +
                                `Please fix any JSON errors in the file.`);
                        }
                        else {
                            throw e;
                        }
                    }
                }
                const lodash = modules_1.load('lodash');
                this.originalConfigFile = lodash.cloneDeep(o);
                o = yield this.provideDefaults(o);
                if (this.is(o)) {
                    this.configFile = o;
                }
                else {
                    throw new errors_1.FatalException(`The config file (${chalk.bold(format_1.prettyPath(this.filePath))}) has an unrecognized JSON format.\n\n` +
                        `This usually means a key had an unexpected value. Please look through it and fix any issues.\n` +
                        `If all else fails--the CLI will recreate the file if you delete it.`);
                }
            }
            return this.configFile;
        });
    }
    save(configFile) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!configFile) {
                configFile = this.configFile;
            }
            if (configFile) {
                const lodash = modules_1.load('lodash');
                if (!lodash.isEqual(configFile, this.originalConfigFile)) {
                    const dirPath = path.dirname(this.filePath);
                    try {
                        const stats = yield fs_1.fsStat(dirPath);
                        if (!stats.isDirectory()) {
                            throw `${dirPath} must be a directory it is currently a file`;
                        }
                    }
                    catch (e) {
                        if (e.code !== 'ENOENT') {
                            throw e;
                        }
                        yield fs_1.fsMkdirp(dirPath);
                    }
                    yield fs_1.fsWriteJsonFile(this.filePath, configFile, { encoding: 'utf8' });
                    this.configFile = configFile;
                    this.originalConfigFile = lodash.cloneDeep(configFile);
                }
            }
        });
    }
}
exports.BaseConfig = BaseConfig;
exports.CONFIG_FILE = 'config.json';
exports.CONFIG_DIRECTORY = path.resolve(os.homedir(), '.ionic');
class Config extends BaseConfig {
    provideDefaults(o) {
        return __awaiter(this, void 0, void 0, function* () {
            const lodash = modules_1.load('lodash');
            const results = lodash.cloneDeep(o);
            if (!results.lastCommand) {
                results.lastCommand = new Date().toISOString();
            }
            if (!results.urls) {
                results.urls = {};
            }
            if (!results.urls.api) {
                results.urls.api = 'https://api.ionic.io';
            }
            if (!results.urls.dash) {
                results.urls.dash = 'https://apps.ionic.io';
            }
            if (!results.user) {
                results.user = {};
            }
            if (!results.tokens) {
                results.tokens = {};
            }
            if (!results.tokens.appUser) {
                results.tokens.appUser = {};
            }
            if (!results.cliFlags) {
                results.cliFlags = {};
            }
            for (let cliFlag of exports.CLI_FLAGS) {
                const { flag, defaultValue } = cliFlag;
                if (typeof results.cliFlags[flag] === 'undefined') {
                    if (flag === 'telemetry') {
                        if (typeof results.cliFlags.enableTelemetry !== 'undefined') {
                            results.cliFlags.telemetry = results.cliFlags.enableTelemetry;
                        }
                        else {
                            results.cliFlags.telemetry = true;
                        }
                    }
                    else if (typeof defaultValue === 'boolean') {
                        results.cliFlags[flag] = defaultValue;
                    }
                }
            }
            delete results.lastUpdated;
            delete results.cliFlags.promptedForTelemetry;
            delete results.cliFlags.promptedForSignup;
            delete results.cliFlags.enableTelemetry;
            return results;
        });
    }
    is(j) {
        return j
            && typeof j.lastCommand === 'string'
            && typeof j.urls === 'object'
            && typeof j.urls.api === 'string'
            && typeof j.urls.dash === 'string'
            && typeof j.user === 'object'
            && typeof j.tokens === 'object'
            && typeof j.tokens.appUser === 'object'
            && typeof j.cliFlags === 'object';
    }
}
exports.Config = Config;
function handleCliFlags(config, argv) {
    return __awaiter(this, void 0, void 0, function* () {
        const changedFlags = [];
        const configData = yield config.load();
        const enableTelemetry = configData.cliFlags.telemetry;
        for (let cliFlag of exports.CLI_FLAGS) {
            const { flag, defaultValue } = cliFlag;
            const currentValue = configData.cliFlags[flag];
            const newValue = argv[flag];
            if (typeof newValue === 'boolean') {
                configData.cliFlags[flag] = newValue;
                if (currentValue !== newValue) {
                    changedFlags.push([flag, newValue]);
                }
            }
        }
        return changedFlags;
    });
}
exports.handleCliFlags = handleCliFlags;
