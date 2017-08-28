"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const ci_info_1 = require("ci-info");
const chalk = require("chalk");
const minimist = require("minimist");
const modules_1 = require("./lib/modules");
const app_1 = require("./lib/app");
const config_1 = require("./lib/config");
const http_1 = require("./lib/http");
const events_1 = require("./lib/events");
const errors_1 = require("./lib/errors");
const hooks_1 = require("./lib/hooks");
const project_1 = require("./lib/project");
const logger_1 = require("./lib/utils/logger");
const fs_1 = require("./lib/utils/fs");
const task_1 = require("./lib/utils/task");
const telemetry_1 = require("./lib/telemetry");
const session_1 = require("./lib/session");
const shell_1 = require("./lib/shell");
const prompts_1 = require("./lib/prompts");
__export(require("./guards"));
__export(require("./lib/app"));
__export(require("./lib/command"));
__export(require("./lib/command/command"));
__export(require("./lib/command/namespace"));
__export(require("./lib/command/utils"));
__export(require("./lib/config"));
__export(require("./lib/deploy"));
__export(require("./lib/errors"));
__export(require("./lib/events"));
__export(require("./lib/help"));
__export(require("./lib/hooks"));
__export(require("./lib/http"));
__export(require("./lib/login"));
__export(require("./lib/modules"));
__export(require("./lib/package"));
__export(require("./lib/plugins"));
__export(require("./lib/project"));
__export(require("./lib/prompts"));
__export(require("./lib/security"));
__export(require("./lib/session"));
__export(require("./lib/shell"));
__export(require("./lib/telemetry"));
__export(require("./lib/utils/archive"));
__export(require("./lib/utils/array"));
__export(require("./lib/utils/environmentInfo"));
__export(require("./lib/utils/format"));
__export(require("./lib/utils/fs"));
__export(require("./lib/utils/logger"));
__export(require("./lib/utils/network"));
__export(require("./lib/utils/npm"));
__export(require("./lib/utils/promise"));
__export(require("./lib/utils/shell"));
__export(require("./lib/utils/string"));
__export(require("./lib/utils/task"));
__export(require("./lib/validators"));
exports.name = '@ionic/cli-utils';
exports.version = '1.5.0';
function registerHooks(hooks) {
    hooks.register(exports.name, 'command:info', () => __awaiter(this, void 0, void 0, function* () {
        return [
            { type: 'global-packages', name: exports.name, version: exports.version },
        ];
    }));
}
exports.registerHooks = registerHooks;
function generateIonicEnvironment(plugin, pargv, env) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!plugin.namespace) {
            throw new errors_1.FatalException('No root ionic namespace.');
        }
        const argv = minimist(pargv, { boolean: true, string: '_' });
        const config = new config_1.Config(env['IONIC_CONFIG_DIRECTORY'] || config_1.CONFIG_DIRECTORY, config_1.CONFIG_FILE);
        const changedFlags = yield config_1.handleCliFlags(config, argv);
        const configData = yield config.load();
        let stream;
        let tasks;
        let bottomBar;
        let log;
        if (ci_info_1.isCI && configData.cliFlags['interactive']) {
            configData.cliFlags['interactive'] = false;
            changedFlags.push(['interactive', false]);
        }
        if (configData.cliFlags['interactive']) {
            const inquirer = modules_1.load('inquirer');
            bottomBar = new inquirer.ui.BottomBar();
            try {
                const bottomBarHack = bottomBar;
                bottomBarHack.rl.output.mute();
            }
            catch (e) {
                console.error('EXCEPTION DURING BOTTOMBAR OUTPUT MUTE', e);
            }
            stream = bottomBar.log;
            log = new logger_1.Logger({ stream });
            tasks = new task_1.InteractiveTaskChain({ log, bottomBar });
        }
        else {
            stream = process.stdout;
            log = new logger_1.Logger({ stream });
            tasks = new task_1.TaskChain({ log });
        }
        for (let [flag, newValue] of changedFlags) {
            const prettyFlag = chalk.green('--' + (newValue ? '' : 'no-') + flag);
            if (flag === 'interactive' && !newValue && ci_info_1.isCI) {
                log.info('CI detected--switching to non-interactive mode.');
            }
            log.info(`CLI Flag ${prettyFlag} saved`);
            if (flag === 'telemetry' && newValue) {
                log.msg('Thank you for making the CLI better! ❤️');
            }
            else if (flag === 'confirm' && newValue) {
                log.warn(`Careful with ${prettyFlag}. Some auto-confirmed actions are destructive.`);
            }
        }
        const projectDir = yield fs_1.findBaseDirectory(process.cwd(), project_1.PROJECT_FILE);
        if (!projectDir) {
            const foundDir = yield fs_1.findBaseDirectory(process.cwd(), project_1.PROJECT_FILE_LEGACY);
            if (foundDir) {
                log.warn(`${chalk.bold(project_1.PROJECT_FILE_LEGACY)} file found in ${chalk.bold(foundDir)}--please rename it to ${chalk.bold(project_1.PROJECT_FILE)}, or your project directory will not be detected!`);
            }
        }
        env['IONIC_PROJECT_DIR'] = projectDir || '';
        env['IONIC_PROJECT_FILE'] = project_1.PROJECT_FILE;
        const project = new project_1.Project(projectDir || '', project_1.PROJECT_FILE);
        const hooks = new hooks_1.HookEngine();
        const client = new http_1.Client(configData.urls.api);
        const telemetry = new telemetry_1.Telemetry(config, plugin.version);
        const shell = new shell_1.Shell(tasks, log);
        const session = new session_1.Session(config, project, client);
        const app = new app_1.App(session, project, client);
        registerHooks(hooks);
        return {
            app,
            argv,
            client,
            close() {
                tasks.cleanup();
                if (bottomBar) {
                    bottomBar.close();
                    log.stream = process.stdout;
                }
            },
            config,
            events: new events_1.CLIEventEmitter,
            hooks,
            load: modules_1.load,
            log,
            namespace: plugin.namespace,
            pargv,
            plugins: {
                ionic: plugin,
            },
            prompt: yield prompts_1.createPromptModule(log, config),
            project,
            session,
            shell,
            tasks,
            telemetry,
        };
    });
}
exports.generateIonicEnvironment = generateIonicEnvironment;
