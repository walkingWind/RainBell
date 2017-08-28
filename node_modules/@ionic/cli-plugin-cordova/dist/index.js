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
const cli_utils_1 = require("@ionic/cli-utils");
const commands_1 = require("./commands");
exports.name = '@ionic/cli-plugin-cordova';
exports.version = '1.4.1';
exports.preferGlobal = false;
exports.namespace = new commands_1.CordovaNamespace();
exports.namespace.source = exports.name;
function registerHooks(hooks) {
    hooks.register(exports.name, 'command:info', () => __awaiter(this, void 0, void 0, function* () {
        let cordovaPlatforms;
        const cordovaVersion = yield cli_utils_1.getCommandInfo('cordova', ['-v', '--no-telemetry']);
        if (cordovaVersion) {
            cordovaPlatforms = yield cli_utils_1.getCommandInfo('cordova', ['platform', 'ls', '--no-telemetry']);
            if (cordovaPlatforms) {
                cordovaPlatforms = cordovaPlatforms.replace(/\s+/g, ' ');
                cordovaPlatforms = cordovaPlatforms.replace('Installed platforms:', '');
                cordovaPlatforms = cordovaPlatforms.replace(/Available platforms.+/, '');
                cordovaPlatforms = cordovaPlatforms.trim();
            }
        }
        return [
            { type: 'global-packages', name: 'Cordova CLI', version: cordovaVersion || 'not installed' },
            { type: 'local-packages', name: exports.name, version: exports.version },
            { type: 'local-packages', name: 'Cordova Platforms', version: cordovaPlatforms || 'none' },
        ];
    }));
}
exports.registerHooks = registerHooks;
