"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
const cli_utils_1 = require("@ionic/cli-utils");
const base_1 = require("./base");
let EmulateCommand = class EmulateCommand extends base_1.CordovaRunCommand {
};
EmulateCommand = __decorate([
    cli_utils_1.CommandMetadata({
        name: 'emulate',
        type: 'project',
        description: 'Emulate an Ionic project on a simulator or emulator',
        longDescription: `
Like running ${chalk.green('cordova emulate')} directly, but also watches for changes in web assets and provides live-reload functionality with the ${chalk.green('--livereload')} option.

For Android and iOS, you can setup Remote Debugging on your emulator with browser development tools: ${chalk.bold('https://docs.ionic.io/tools/developer/#remote-debugging')}
  `,
        exampleCommands: ['', 'ios', 'ios -lc', 'android --livereload -cs'],
        inputs: [
            {
                name: 'platform',
                description: `The platform to emulate: ${chalk.green('ios')}, ${chalk.green('android')}`,
            }
        ],
        options: base_1.CORDOVA_RUN_COMMAND_OPTIONS,
    })
], EmulateCommand);
exports.EmulateCommand = EmulateCommand;
