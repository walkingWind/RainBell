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
const guards_1 = require("../../guards");
const shell_1 = require("../shell");
const fs_1 = require("./fs");
exports.ERROR_INVALID_PACKAGE_JSON = 'INVALID_PACKAGE_JSON';
exports.ERROR_INVALID_BOWER_JSON = 'INVALID_BOWER_JSON';
let installer;
function isValidPackageName(name) {
    return encodeURIComponent(name) === name;
}
exports.isValidPackageName = isValidPackageName;
function readPackageJsonFile(path) {
    return __awaiter(this, void 0, void 0, function* () {
        const packageJson = yield fs_1.fsReadJsonFile(path);
        if (!guards_1.isPackageJson(packageJson)) {
            throw exports.ERROR_INVALID_PACKAGE_JSON;
        }
        return packageJson;
    });
}
exports.readPackageJsonFile = readPackageJsonFile;
function readBowerJsonFile(path) {
    return __awaiter(this, void 0, void 0, function* () {
        const bowerJson = yield fs_1.fsReadJsonFile(path);
        if (!guards_1.isBowerJson(bowerJson)) {
            throw exports.ERROR_INVALID_BOWER_JSON;
        }
        return bowerJson;
    });
}
exports.readBowerJsonFile = readBowerJsonFile;
function pkgManagerArgs(env, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        let vocab;
        const config = yield env.config.load();
        if (!options.command) {
            options.command = 'install';
        }
        let command = options.command;
        if (options.link) {
            if (command === 'install') {
                command = 'link';
            }
            else if (command === 'uninstall') {
                command = 'unlink';
            }
        }
        if (options.global || options.link) {
            options.save = false;
            options.saveDev = false;
            options.saveExact = false;
        }
        else if (options.pkg && typeof options.save === 'undefined' && typeof options.saveDev === 'undefined') {
            options.save = true;
        }
        if (options.pkg && typeof options.saveExact === 'undefined') {
            options.saveExact = true;
        }
        if (config.cliFlags.yarn) {
            if (!installer) {
                try {
                    yield env.shell.run('yarn', ['--version'], { fatalOnNotFound: false, showCommand: false });
                    installer = 'yarn';
                }
                catch (e) {
                    if (e === shell_1.ERROR_SHELL_COMMAND_NOT_FOUND) {
                        env.log.warn(`You have opted into yarn, but ${chalk.green('yarn')} was not found in PATH`);
                    }
                    else {
                        env.log.debug(`Error running yarn: ${e}`);
                    }
                    installer = 'npm';
                }
            }
        }
        else {
            installer = 'npm';
        }
        const installerArgs = [];
        if (installer === 'npm') {
            vocab = { install: 'install', bareInstall: 'install', uninstall: 'uninstall', global: '-g', save: '--save', saveDev: '--save-dev', saveExact: '--save-exact', nonInteractive: '' };
        }
        else if (installer === 'yarn') {
            vocab = { install: 'add', bareInstall: 'install', uninstall: 'remove', global: '', save: '', saveDev: '--dev', saveExact: '--exact', nonInteractive: '--non-interactive' };
            if (options.global) {
                installerArgs.push('global');
            }
        }
        else {
            throw new Error(`unknown installer: ${installer}`);
        }
        if (command === 'install') {
            if (options.pkg) {
                installerArgs.push(vocab.install);
            }
            else {
                installerArgs.push(vocab.bareInstall);
            }
        }
        else if (command === 'uninstall') {
            installerArgs.push(vocab.uninstall);
        }
        else {
            installerArgs.push(command);
        }
        if (options.global && vocab.global) {
            installerArgs.push(vocab.global);
        }
        if (options.save && vocab.save) {
            installerArgs.push(vocab.save);
        }
        if (options.saveDev && vocab.saveDev) {
            installerArgs.push(vocab.saveDev);
        }
        if (options.saveExact && vocab.saveExact) {
            installerArgs.push(vocab.saveExact);
        }
        if (vocab.nonInteractive) {
            installerArgs.push(vocab.nonInteractive);
        }
        if (options.pkg) {
            if (options.link) {
                options.pkg = options.pkg.replace(/(.+)@.+/, '$1');
            }
            installerArgs.push(options.pkg);
        }
        return [installer, ...installerArgs];
    });
}
exports.pkgManagerArgs = pkgManagerArgs;
