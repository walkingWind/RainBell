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
const modules_1 = require("./modules");
const GA_CODE = 'UA-44023830-30';
class Telemetry {
    constructor(config, cliVersion) {
        this.config = config;
        this.cliVersion = cliVersion;
    }
    generateUniqueToken() {
        const uuid = modules_1.load('uuid');
        return uuid.v4().toString();
    }
    setupTracker() {
        return __awaiter(this, void 0, void 0, function* () {
            const configFile = yield this.config.load();
            if (!configFile.tokens.telemetry) {
                configFile.tokens.telemetry = this.generateUniqueToken();
            }
            const Leek = modules_1.load('leek');
            this.tracker = new Leek({
                name: configFile.tokens.telemetry,
                trackingCode: GA_CODE,
                globalName: 'ionic',
                version: this.cliVersion,
                silent: configFile.cliFlags.telemetry !== true
            });
        });
    }
    sendCommand(command, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.tracker) {
                yield this.setupTracker();
            }
            let messageList = [];
            const name = 'command execution';
            const message = messageList.concat([command], args).join(' ');
            yield this.tracker.track({
                name,
                message
            });
        });
    }
    sendError(error, type) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.tracker.trackError({
                description: error.message + ' ' + error.stack,
                isFatal: true
            });
        });
    }
}
exports.Telemetry = Telemetry;
