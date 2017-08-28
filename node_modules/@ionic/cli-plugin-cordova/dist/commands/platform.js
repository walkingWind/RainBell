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
const resources_1 = require("../lib/resources");
const setup_1 = require("../lib/utils/setup");
const base_1 = require("./base");
let PlatformCommand = class PlatformCommand extends base_1.CordovaCommand {
    preRun(inputs, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkForAssetsFolder();
            inputs[0] = (typeof inputs[0] === 'undefined') ? 'ls' : inputs[0];
            inputs[0] = (inputs[0] === 'rm') ? 'remove' : inputs[0];
            inputs[0] = (inputs[0] === 'list') ? 'ls' : inputs[0];
            cli_utils_1.validate(inputs[0], 'action', [cli_utils_1.contains(['add', 'remove', 'update', 'ls', 'check', 'save'], {})]);
            if (['ls', 'check', 'save'].includes(inputs[0])) {
                const response = yield this.runCordova(['platform', inputs[0]]);
                this.env.log.msg(response);
                return 0;
            }
            if (!inputs[1]) {
                const platform = yield this.env.prompt({
                    type: 'input',
                    name: 'platform',
                    message: `What platform would you like to ${inputs[0]} ${chalk.green('ios')}, ${chalk.green('android')}:`,
                });
                inputs[1] = platform.trim();
            }
            cli_utils_1.validate(inputs[1], 'platform', [cli_utils_1.validators.required]);
        });
    }
    run(inputs, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let [action, platformName] = inputs;
            yield configXmlUtils_1.resetConfigXmlContentSrc(this.env.project.directory);
            const platforms = yield setup_1.getProjectPlatforms(this.env.project.directory);
            if (action === 'add' && platforms.includes(platformName)) {
                this.env.log.ok(`Platform ${platformName} already exists.`);
                return;
            }
            const optionList = cordova_1.filterArgumentsForCordova(this.metadata, inputs, options);
            if ((action === 'add' || action === 'remove') && !optionList.includes('--save')) {
                optionList.push('--save');
            }
            const response = yield this.runCordova(optionList);
            this.env.log.msg(response);
            if (action === 'add' && !(options['noresources']) && ['ios', 'android', 'wp8'].includes(platformName)) {
                this.env.tasks.next(`Copying default image resources into ${chalk.bold('./resources/' + platformName)}`);
                yield resources_1.addDefaultImagesToProjectResources(this.env.project.directory, platformName);
            }
            this.env.tasks.end();
        });
    }
};
PlatformCommand = __decorate([
    cli_utils_1.CommandMetadata({
        name: 'platform',
        type: 'project',
        description: 'Manage Cordova platform targets',
        longDescription: `
Like running ${chalk.green('cordova platform')} directly, but adds default Ionic icons and splash screen resources (during ${chalk.green('add')}) and provides friendly checks.
  `,
        exampleCommands: ['', 'add ios', 'add android', 'rm ios'],
        inputs: [
            {
                name: 'action',
                description: `${chalk.green('add')}, ${chalk.green('remove')}, or ${chalk.green('update')} a platform; ${chalk.green('ls')}, ${chalk.green('check')}, or ${chalk.green('save')} all project platforms`,
            },
            {
                name: 'platform',
                description: `The platform that you would like to add (e.g. ${chalk.green('ios')}, ${chalk.green('android')})`,
            }
        ],
        options: [
            {
                name: 'noresources',
                description: `Do not add default Ionic icons and splash screen resources (corresponds to ${chalk.green('add')})`,
                type: Boolean,
                default: false,
                aliases: ['r'],
            },
        ]
    })
], PlatformCommand);
exports.PlatformCommand = PlatformCommand;
