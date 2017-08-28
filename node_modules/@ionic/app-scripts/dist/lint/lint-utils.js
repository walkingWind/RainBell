"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var errors_1 = require("../util/errors");
var lint_factory_1 = require("./lint-factory");
var helpers_1 = require("../util/helpers");
var logger_1 = require("../logger/logger");
var logger_diagnostics_1 = require("../logger/logger-diagnostics");
var logger_typescript_1 = require("../logger/logger-typescript");
var logger_tslint_1 = require("../logger/logger-tslint");
/**
 * Lint files
 * @param {BuildContext} context
 * @param {string} tsConfig - Path to TS config file
 * @param {string|null} tsLintConfig - TSLint config file path
 * @param {Array<string>} filePaths
 * @param {LinterOptions} linterOptions
 */
function lintFiles(context, tsConfig, tsLintConfig, filePaths, linterOptions) {
    return lint_factory_1.typeCheck(context, tsConfig, linterOptions)
        .then(function (diagnostics) { return processTypeCheckDiagnostics(context, diagnostics); })
        .then(function () { return Promise.all(filePaths.map(function (filePath) { return lintFile(context, tsConfig, tsLintConfig, filePath, linterOptions); }))
        .then(function (lintResults) { return processLintResults(context, lintResults); }); });
}
exports.lintFiles = lintFiles;
function lintFile(context, tsConfig, tsLintConfig, filePath, linterOptions) {
    if (isMpegFile(filePath)) {
        return Promise.reject(filePath + " is not a valid TypeScript file");
    }
    return helpers_1.readFileAsync(filePath)
        .then(function (fileContents) { return lint_factory_1.lint(context, tsConfig, tsLintConfig, filePath, fileContents, linterOptions); });
}
exports.lintFile = lintFile;
/**
 * Process typescript diagnostics after type checking
 * NOTE: This will throw a BuildError if there were any type errors.
 * @param {BuildContext} context
 * @param {Array<Diagnostic>} tsDiagnostics
 */
function processTypeCheckDiagnostics(context, tsDiagnostics) {
    if (tsDiagnostics.length > 0) {
        var diagnostics = logger_typescript_1.runTypeScriptDiagnostics(context, tsDiagnostics);
        logger_diagnostics_1.printDiagnostics(context, logger_diagnostics_1.DiagnosticsType.TypeScript, diagnostics, true, false);
        var files = removeDuplicateFileNames(diagnostics.map(function (diagnostic) { return diagnostic.relFileName; }));
        var errorMessage = generateErrorMessageForFiles(files, 'The following files failed type checking:');
        throw new errors_1.BuildError(errorMessage);
    }
}
exports.processTypeCheckDiagnostics = processTypeCheckDiagnostics;
/**
 * Process lint results
 * NOTE: This will throw a BuildError if there were any warnings or errors in any of the lint results.
 * @param {BuildContext} context
 * @param {Array<LintResult>} results
 */
function processLintResults(context, results) {
    var filesThatDidNotPass = [];
    for (var _i = 0, results_1 = results; _i < results_1.length; _i++) {
        var result = results_1[_i];
        // Only process result if there are no errors or warnings
        if (result.errorCount !== 0 || result.warningCount !== 0) {
            var diagnostics = logger_tslint_1.runTsLintDiagnostics(context, result.failures);
            logger_diagnostics_1.printDiagnostics(context, logger_diagnostics_1.DiagnosticsType.TsLint, diagnostics, true, false);
            filesThatDidNotPass.push.apply(filesThatDidNotPass, getFileNames(context, result.failures));
        }
    }
    var files = removeDuplicateFileNames(filesThatDidNotPass);
    if (files.length > 0) {
        var errorMessage = generateErrorMessageForFiles(files);
        throw new errors_1.BuildError(errorMessage);
    }
}
exports.processLintResults = processLintResults;
function generateErrorMessageForFiles(failingFiles, message) {
    return (message || 'The following files did not pass tslint:') + "\n" + failingFiles.join('\n');
}
exports.generateErrorMessageForFiles = generateErrorMessageForFiles;
function getFileNames(context, failures) {
    return failures.map(function (failure) { return failure.getFileName()
        .replace(context.rootDir, '')
        .replace(/^\//g, ''); });
}
exports.getFileNames = getFileNames;
// TODO: We can just use new Set() to filter duplicate entries
function removeDuplicateFileNames(fileNames) {
    var result = [];
    for (var _i = 0, fileNames_1 = fileNames; _i < fileNames_1.length; _i++) {
        var fileName = fileNames_1[_i];
        if (result.indexOf(fileName) === -1) {
            result.push(fileName);
        }
    }
    return result;
}
exports.removeDuplicateFileNames = removeDuplicateFileNames;
function isMpegFile(file) {
    var buffer = new Buffer(256);
    buffer.fill(0);
    var fd = fs.openSync(file, 'r');
    try {
        fs.readSync(fd, buffer, 0, 256, null);
        if (buffer.readInt8(0) === 0x47 && buffer.readInt8(188) === 0x47) {
            logger_1.Logger.debug("tslint: " + file + ": ignoring MPEG transport stream");
            return true;
        }
    }
    finally {
        fs.closeSync(fd);
    }
    return false;
}
