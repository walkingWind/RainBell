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
const chalk = require("chalk");
const modules_1 = require("./modules");
function createPromptModule(log, config) {
    return __awaiter(this, void 0, void 0, function* () {
        const inquirer = modules_1.load('inquirer');
        const inquirerPromptModule = inquirer.createPromptModule();
        return (question) => __awaiter(this, void 0, void 0, function* () {
            const configData = yield config.load();
            if (configData.cliFlags.interactive === false) {
                if (typeof question.noninteractiveValue !== 'undefined') {
                    return question.noninteractiveValue;
                }
                if (question.type === 'confirm') {
                    if (configData.cliFlags.confirm) {
                        log.info(`${chalk.green('--confirm')}: ${chalk.dim(question.message)} ${chalk.cyan('Yes')}`);
                        return 'confirm';
                    }
                    else {
                        log.info(`${chalk.green('--no-confirm')}: ${chalk.dim(question.message)} ${chalk.cyan('No')}`);
                        return '';
                    }
                }
                return '';
            }
            const result = (yield inquirerPromptModule(question))[question.name];
            if (result === true) {
                return 'confirm';
            }
            else if (result === false || result === undefined) {
                return '';
            }
            return result;
        });
    });
}
exports.createPromptModule = createPromptModule;
