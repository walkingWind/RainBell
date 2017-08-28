"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
const guards_1 = require("../guards");
const errors_1 = require("./errors");
const shell_1 = require("./utils/shell");
exports.ERROR_SHELL_COMMAND_NOT_FOUND = 'SHELL_COMMAND_NOT_FOUND';
class Shell {
    constructor(tasks, log) {
        this.tasks = tasks;
        this.log = log;
    }
    run(command, args, _a) {
        var { showCommand = true, showError = true, fatalOnNotFound = true, fatalOnError = true, showExecution, truncateErrorOutput } = _a, crossSpawnOptions = __rest(_a, ["showCommand", "showError", "fatalOnNotFound", "fatalOnError", "showExecution", "truncateErrorOutput"]);
        return __awaiter(this, void 0, void 0, function* () {
            const fullCmd = command + ' ' + (args.length > 0 ? args.map(a => a.includes(' ') ? `"${a}"` : a).join(' ') : '');
            const truncatedCmd = fullCmd.length > 80 ? fullCmd.substring(0, 80) + '...' : fullCmd;
            const options = Object.assign({}, crossSpawnOptions);
            if (showExecution) {
                options.stdoutPipe = this.log.stream;
                options.stderrPipe = this.log.stream;
            }
            if (showCommand) {
                if (this.log.shouldLog('info')) {
                    this.log.msg(`> ${chalk.green(fullCmd)}`);
                }
                if (!showExecution) {
                    this.tasks.next('Running command');
                }
            }
            try {
                try {
                    const out = yield shell_1.runcmd(command, args, options);
                    if (showExecution) {
                        this.log.nl();
                    }
                    if (showCommand && !showExecution) {
                        this.tasks.end();
                    }
                    return out;
                }
                catch (e) {
                    if (e.code === 'ENOENT') {
                        if (fatalOnNotFound) {
                            throw new errors_1.FatalException(`Command not found: ${chalk.green(command)}`, 127);
                        }
                        else {
                            throw exports.ERROR_SHELL_COMMAND_NOT_FOUND;
                        }
                    }
                    if (!guards_1.isExitCodeException(e)) {
                        throw e;
                    }
                    let err = e.message || '';
                    if (truncateErrorOutput && err.length > truncateErrorOutput) {
                        err = `${chalk.bold('(truncated)')} ... ` + err.substring(err.length - truncateErrorOutput);
                    }
                    const helpLine = showExecution ? '.\n' : (err ? `:\n\n${err}` : ' with no output.\n');
                    const publicErrorMsg = `An error occurred while running ${chalk.green(truncatedCmd)} (exit code ${e.exitCode})` + helpLine;
                    const privateErrorMsg = `Subprocess (${chalk.green(command)}) encountered an error (exit code ${e.exitCode}).`;
                    if (fatalOnError) {
                        if (showError) {
                            throw new errors_1.FatalException(publicErrorMsg, e.exitCode);
                        }
                        else {
                            throw new errors_1.FatalException(privateErrorMsg, e.exitCode);
                        }
                    }
                    else {
                        if (showError) {
                            this.log.error(publicErrorMsg);
                        }
                    }
                    throw e;
                }
            }
            catch (e) {
                if (showCommand && !showExecution) {
                    this.tasks.fail();
                }
                throw e;
            }
        });
    }
}
exports.Shell = Shell;
