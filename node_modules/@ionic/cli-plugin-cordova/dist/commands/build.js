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
let BuildCommand = class BuildCommand extends base_1.CordovaCommand {
    preRun(inputs, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkForAssetsFolder();
            if (!inputs[0]) {
                const platform = yield this.env.prompt({
                    type: 'input',
                    name: 'platform',
                    message: `What platform would you like to build: ${chalk.green('ios')}, ${chalk.green('android')}:`
                });
                inputs[0] = platform.trim();
            }
            yield this.checkForPlatformInstallation(inputs[0]);
        });
    }
    run(inputs, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield configXmlUtils_1.resetConfigXmlContentSrc(this.env.project.directory);
            yield this.env.hooks.fire('build:before', { env: this.env });
            yield this.env.hooks.fire('command:build', {
                cmd: this,
                env: this.env,
                inputs,
                options: cordova_1.generateBuildOptions(this.metadata, options)
            });
            yield this.env.hooks.fire('build:after', { env: this.env });
            const response = yield this.runCordova(cordova_1.filterArgumentsForCordova(this.metadata, inputs, options));
            this.env.log.msg(response);
        });
    }
};
BuildCommand = __decorate([
    cli_utils_1.CommandMetadata({
        name: 'build',
        type: 'project',
        description: 'Build (prepare + compile) an Ionic project for a given platform',
        longDescription: `
Like running ${chalk.green('cordova build')} directly, but also builds web assets and provides friendly checks.
  `,
        exampleCommands: [
            'ios',
            'ios --prod --release',
            'ios --device --prod --release -- --developmentTeam="ABCD" --codeSignIdentity="iPhone Developer" --provisioningProfile="UUID"',
            'android',
            'android --prod --release -- -- --minSdkVersion=21',
            'android --prod --release -- -- --gradleArg=-PcdvBuildMultipleApks=true',
        ],
        inputs: [
            {
                name: 'platform',
                description: `The platform to build: ${chalk.green('ios')}, ${chalk.green('android')}`,
            }
        ],
        options: [
            {
                name: 'prod',
                description: 'Build the application for production',
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
                description: 'Create a Cordova debug build',
                type: Boolean,
                intent: cordova_1.CORDOVA_INTENT,
            },
            {
                name: 'release',
                description: 'Create a Cordova release build',
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
                name: 'buildConfig',
                description: 'Use the specified Cordova build configuration',
                intent: cordova_1.CORDOVA_INTENT,
            },
        ]
    })
], BuildCommand);
exports.BuildCommand = BuildCommand;
