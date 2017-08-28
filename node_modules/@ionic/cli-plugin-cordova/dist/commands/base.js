"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const chalk = require("chalk");
const cli_utils_1 = require("@ionic/cli-utils");
const cordova_1 = require("../lib/utils/cordova");
const configXmlUtils_1 = require("../lib/utils/configXmlUtils");
const setup_1 = require("../lib/utils/setup");
exports.CORDOVA_RUN_COMMAND_OPTIONS = [
    {
        name: 'list',
        description: 'List all available Cordova targets',
        type: Boolean,
        intent: cordova_1.CORDOVA_INTENT,
    },
    {
        name: 'livereload',
        description: 'Spin up server to live-reload www files',
        type: Boolean,
        aliases: ['l'],
    },
    {
        name: 'consolelogs',
        description: 'Print out console logs to terminal',
        type: Boolean,
        aliases: ['c'],
    },
    {
        name: 'serverlogs',
        description: 'Print out dev server logs to terminal',
        type: Boolean,
        aliases: ['s'],
    },
    {
        name: 'address',
        description: 'Use specific address for dev/live-reload server',
        default: '0.0.0.0',
    },
    {
        name: 'port',
        description: 'Use specific port for the dev server',
        default: '8100',
        aliases: ['p'],
    },
    {
        name: 'livereload-port',
        description: 'Use specific port for live-reload server',
        default: '35729',
        aliases: ['r'],
    },
    {
        name: 'prod',
        description: 'Mark as a production build',
        type: Boolean,
    },
    {
        name: 'aot',
        description: 'Perform ahead-of-time compilation for this build',
        type: Boolean,
    },
    {
        name: 'minifyjs',
        description: 'Minify JS for this build',
        type: Boolean,
    },
    {
        name: 'minifycss',
        description: 'Minify CSS for this build',
        type: Boolean,
    },
    {
        name: 'optimizejs',
        description: 'Perform JS optimizations for this build',
        type: Boolean,
    },
    {
        name: 'debug',
        description: 'Mark as a debug build',
        type: Boolean,
        intent: cordova_1.CORDOVA_INTENT,
    },
    {
        name: 'release',
        description: 'Mark as a release build',
        type: Boolean,
        intent: cordova_1.CORDOVA_INTENT,
    },
    {
        name: 'device',
        description: 'Deploy Cordova build to a device',
        type: Boolean,
        intent: cordova_1.CORDOVA_INTENT,
    },
    {
        name: 'emulator',
        description: 'Deploy Cordova build to an emulator',
        type: Boolean,
        intent: cordova_1.CORDOVA_INTENT,
    },
    {
        name: 'target',
        description: `Deploy Cordova build to a device (use ${chalk.green('--list')} to see all)`,
        type: String,
        intent: cordova_1.CORDOVA_INTENT,
    },
    {
        name: 'buildConfig',
        description: 'Use the specified Cordova build configuration',
        intent: cordova_1.CORDOVA_INTENT,
    },
];
class CordovaCommand extends cli_utils_1.Command {
    checkForAssetsFolder() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.env.project.directory) {
                const wwwPath = path.join(this.env.project.directory, 'www');
                const wwwExists = yield cli_utils_1.pathExists(wwwPath);
                if (!wwwExists) {
                    this.env.tasks.next(`Creating ${chalk.bold(cli_utils_1.prettyPath(wwwPath))} directory for you`);
                    yield cli_utils_1.fsMkdir(wwwPath, undefined);
                    this.env.tasks.end();
                }
            }
        });
    }
    runCordova(argList, _a = {}) {
        var { fatalOnNotFound = false, truncateErrorOutput = 5000 } = _a, options = __rest(_a, ["fatalOnNotFound", "truncateErrorOutput"]);
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.env.shell.run('cordova', argList, Object.assign({ fatalOnNotFound, truncateErrorOutput }, options));
            }
            catch (e) {
                if (e === cli_utils_1.ERROR_SHELL_COMMAND_NOT_FOUND) {
                    const cdvInstallArgs = yield cli_utils_1.pkgManagerArgs(this.env, { pkg: 'cordova', global: true });
                    throw this.exit(`The Cordova CLI was not found on your PATH. Please install Cordova globally:\n\n` +
                        `${chalk.green(cdvInstallArgs.join(' '))}\n`);
                }
                this.env.log.nl();
                this.env.log.error('Cordova encountered an error.\nYou may get more insight by running the Cordova command above directly.\n');
                throw e;
            }
        });
    }
    checkForPlatformInstallation(runPlatform) {
        return __awaiter(this, void 0, void 0, function* () {
            if (runPlatform) {
                const platforms = yield setup_1.getProjectPlatforms(this.env.project.directory);
                if (!platforms.includes(runPlatform)) {
                    yield setup_1.installPlatform(this.env, runPlatform);
                }
            }
        });
    }
}
exports.CordovaCommand = CordovaCommand;
class CordovaRunCommand extends CordovaCommand {
    preRun(inputs, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkForAssetsFolder();
            if (options['list']) {
                const args = cordova_1.filterArgumentsForCordova(this.metadata, inputs, options);
                if (!options['device'] && !options['emulator']) {
                    if (args[0] === 'run') {
                        args.push('--device');
                    }
                    else if (args[0] === 'emulate') {
                        args.push('--emulator');
                    }
                }
                args[0] = 'run';
                yield this.runCordova(args, { showExecution: true });
                return 0;
            }
            if (!inputs[0]) {
                const platform = yield this.env.prompt({
                    type: 'input',
                    name: 'platform',
                    message: `What platform would you like to run: ${chalk.green('ios')}, ${chalk.green('android')}:`,
                });
                inputs[0] = platform.trim();
            }
            yield this.checkForPlatformInstallation(inputs[0]);
        });
    }
    run(inputs, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const isLiveReload = options['livereload'];
            if (!isLiveReload) {
                yield this.env.hooks.fire('build:before', { env: this.env });
                yield configXmlUtils_1.resetConfigXmlContentSrc(this.env.project.directory);
                yield this.env.hooks.fire('command:build', {
                    cmd: this,
                    env: this.env,
                    inputs,
                    options: cordova_1.generateBuildOptions(this.metadata, options),
                });
                yield this.env.hooks.fire('build:after', { env: this.env });
            }
            else {
                yield this.env.hooks.fire('watch:before', { env: this.env });
                const [serverSettings] = yield this.env.hooks.fire('command:serve', {
                    cmd: this,
                    env: this.env,
                    inputs,
                    options: cordova_1.generateBuildOptions(this.metadata, options),
                });
                yield configXmlUtils_1.writeConfigXmlContentSrc(this.env.project.directory, `http://${serverSettings.publicIp}:${serverSettings.httpPort}`);
            }
            yield this.runCordova(cordova_1.filterArgumentsForCordova(this.metadata, inputs, options), { showExecution: true });
        });
    }
}
exports.CordovaRunCommand = CordovaRunCommand;
