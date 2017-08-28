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
let CompileCommand = class CompileCommand extends base_1.CordovaCommand {
    preRun(inputs, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkForAssetsFolder();
            if (!inputs[0]) {
                const platform = yield this.env.prompt({
                    type: 'input',
                    name: 'platform',
                    message: `What platform would you like to compile ${chalk.green('ios')}, ${chalk.green('android')}:`
                });
                inputs[0] = platform.trim();
            }
            yield this.checkForPlatformInstallation(inputs[0]);
        });
    }
    run(inputs, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield configXmlUtils_1.resetConfigXmlContentSrc(this.env.project.directory);
            const response = yield this.runCordova(cordova_1.filterArgumentsForCordova(this.metadata, inputs, options));
            this.env.log.msg(response);
        });
    }
};
CompileCommand = __decorate([
    cli_utils_1.CommandMetadata({
        name: 'compile',
        type: 'project',
        description: 'Compile native platform code',
        longDescription: `
Like running ${chalk.green('cordova compile')} directly, but provides friendly checks.
  `,
        exampleCommands: ['ios'],
        inputs: [
            {
                name: 'platform',
                description: `The platform to compile: ${chalk.green('ios')}, ${chalk.green('android')}`,
            }
        ],
    })
], CompileCommand);
exports.CompileCommand = CompileCommand;
