"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
const cordova_1 = require("../lib/utils/cordova");
const configXmlUtils_1 = require("../lib/utils/configXmlUtils");
const base_1 = require("./base");
let PluginCommand = class PluginCommand extends base_1.CordovaCommand {
    preRun(inputs, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkForAssetsFolder();
            inputs[0] = (typeof inputs[0] === 'undefined') ? 'ls' : inputs[0];
            inputs[0] = (inputs[0] === 'rm') ? 'remove' : inputs[0];
            inputs[0] = (inputs[0] === 'list') ? 'ls' : inputs[0];
            cli_utils_1.validate(inputs[0], 'action', [cli_utils_1.contains(['add', 'remove', 'ls', 'save'], {})]);
            if (['ls', 'save'].includes(inputs[0])) {
                const response = yield this.runCordova(['plugin', inputs[0]]);
                this.env.log.msg(response);
                return 0;
            }
            if (!inputs[1]) {
                const plugin = yield this.env.prompt({
                    message: `What plugin would you like to ${inputs[0]}:`,
                    type: 'input',
                    name: 'plugin',
                });
                inputs[1] = plugin;
            }
            cli_utils_1.validate(inputs[1], 'plugin', [cli_utils_1.validators.required]);
        });
    }
    run(inputs, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield configXmlUtils_1.resetConfigXmlContentSrc(this.env.project.directory);
            const optionList = cordova_1.filterArgumentsForCordova(this.metadata, inputs.splice(0, 2), options);
            if (!optionList.includes('--save')) {
                optionList.push('--save');
            }
            const response = yield this.runCordova(optionList);
            this.env.log.msg(response);
        });
    }
};
PluginCommand = __decorate([
    cli_utils_1.CommandMetadata({
        name: 'plugin',
        type: 'project',
        description: 'Manage Cordova plugins',
        longDescription: `
Like running ${chalk.green('cordova plugin')} directly, but provides friendly checks.
  `,
        exampleCommands: ['', 'add cordova-plugin-inappbrowser@latest', 'add phonegap-plugin-push --variable SENDER_ID=XXXXX', 'rm cordova-plugin-camera'],
        inputs: [
            {
                name: 'action',
                description: `${chalk.green('add')} or ${chalk.green('remove')} a plugin; ${chalk.green('ls')} or ${chalk.green('save')} all project plugins`,
            },
            {
                name: 'plugin',
                description: `The name of the plugin (corresponds to ${chalk.green('add')} and ${chalk.green('remove')})`,
            },
        ],
        options: [
            {
                name: 'force',
                description: `Forve overwrite the plugin if it exists (corresponds to ${chalk.green('add')})`,
                type: Boolean,
                intent: cordova_1.CORDOVA_INTENT,
            },
            {
                name: 'variable',
                description: 'Specify plugin variables',
                intent: cordova_1.CORDOVA_INTENT,
            }
        ]
    })
], PluginCommand);
exports.PluginCommand = PluginCommand;
