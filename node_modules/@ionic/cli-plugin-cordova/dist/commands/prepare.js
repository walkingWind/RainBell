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
const setup_1 = require("../lib/utils/setup");
const configXmlUtils_1 = require("../lib/utils/configXmlUtils");
const base_1 = require("./base");
let PrepareCommand = class PrepareCommand extends base_1.CordovaCommand {
    preRun(inputs, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkForAssetsFolder();
        });
    }
    run(inputs, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const [platform] = inputs;
            if (platform) {
                const configJson = yield configXmlUtils_1.parseConfigXmlToJson(this.env.project.directory);
                const platformEngine = configXmlUtils_1.getPlatformEngine(configJson, platform);
                if (!platformEngine) {
                    const confirm = yield this.env.prompt({
                        message: `Platform ${chalk.green(platform)} is not installed! Would you like to install it?`,
                        type: 'confirm',
                        name: 'confirm',
                    });
                    if (confirm) {
                        yield setup_1.installPlatform(this.env, platform);
                    }
                    else {
                        throw this.exit(`Can't prepare for ${chalk.green(platform)} unless the platform is installed. Did you mean just ${chalk.green('ionic cordova prepare')}?`);
                    }
                }
            }
            yield configXmlUtils_1.resetConfigXmlContentSrc(this.env.project.directory);
            const response = yield this.runCordova(cordova_1.filterArgumentsForCordova(this.metadata, inputs, options), {});
            this.env.log.msg(response);
        });
    }
};
PrepareCommand = __decorate([
    cli_utils_1.CommandMetadata({
        name: 'prepare',
        type: 'project',
        description: 'Transform metadata to platform manifests and copies assets to Cordova platforms',
        longDescription: `
Like running ${chalk.green('cordova prepare')} directly, but provides friendly checks.
  `,
        exampleCommands: ['', 'ios', 'android'],
        inputs: [
            {
                name: 'platform',
                description: `The platform you would like to prepare (e.g. ${chalk.green('ios')}, ${chalk.green('android')})`,
                required: false,
            },
        ]
    })
], PrepareCommand);
exports.PrepareCommand = PrepareCommand;
