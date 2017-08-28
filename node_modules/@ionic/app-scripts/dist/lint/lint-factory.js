"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslint_1 = require("tslint");
var typescript_1 = require("typescript");
var util_1 = require("util");
/**
 * Run linter on a file
 * @param {BuildContext} context
 * @param {string} tsLintConfig
 * @param {string} tsConfig
 * @param {string} filePath
 * @param {string} fileContents
 * @param {LinterOptions} linterOptions
 * @return {LintResult}
 */
function lint(context, tsConfig, tsLintConfig, filePath, fileContents, linterOptions) {
    var linter = getLinter(context, tsConfig);
    var configuration = tslint_1.Configuration.findConfiguration(tsLintConfig, filePath);
    linter.lint(filePath, fileContents, Object.assign(configuration.results, util_1.isObject(linterOptions) ? { linterOptions: linterOptions } : {}));
    return linter.getResult();
}
exports.lint = lint;
/**
 * Type check a TS program
 * @param {BuildContext} context
 * @param {string} tsConfig
 * @param {LinterOptions} linterOptions
 * @return {Promise<Diagnostic[]>}
 */
function typeCheck(context, tsConfig, linterOptions) {
    if (util_1.isObject(linterOptions) && linterOptions.typeCheck) {
        var program = createProgram(context, tsConfig);
        return Promise.resolve(typescript_1.getPreEmitDiagnostics(program));
    }
    return Promise.resolve([]);
}
exports.typeCheck = typeCheck;
/**
 * Create a TS program based on the BuildContext {srcDir} or TS config file path (if provided)
 * @param {BuildContext} context
 * @param {string} tsConfig
 * @return {Program}
 */
function createProgram(context, tsConfig) {
    return tslint_1.Linter.createProgram(tsConfig, context.rootDir);
}
exports.createProgram = createProgram;
/**
 * Get all files that are sourced in TS config
 * @param {BuildContext} context
 * @param {string} tsConfig
 * @return {Array<string>}
 */
function getFileNames(context, tsConfig) {
    var program = createProgram(context, tsConfig);
    return tslint_1.Linter.getFileNames(program);
}
exports.getFileNames = getFileNames;
/**
 * Get linter
 * @param {BuildContext} context
 * @param {string} tsConfig
 * @return {Linter}
 */
function getLinter(context, tsConfig) {
    var program = createProgram(context, tsConfig);
    return new tslint_1.Linter({
        fix: false
    }, program);
}
exports.getLinter = getLinter;
