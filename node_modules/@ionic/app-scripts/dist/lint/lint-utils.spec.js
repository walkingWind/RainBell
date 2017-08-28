"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var typescript_1 = require("typescript");
var helpers = require("../util/helpers");
var loggerDiagnostics = require("../logger/logger-diagnostics");
var tsLogger = require("../logger/logger-typescript");
var tsLintLogger = require("../logger/logger-tslint");
var linter = require("./lint-factory");
var utils = require("./lint-utils");
describe('lint utils', function () {
    describe('lintFile()', function () {
        it('should return lint details', function () {
            var filePath = 'test.ts';
            var tsConfigPath = '';
            var fileContent = "\n        export const foo = 'bar';\n      ";
            var context = {};
            var linterOptions = {
                typeCheck: true
            };
            var mockLintResult = {
                errorCount: 0,
                warningCount: 0,
                failures: [],
                fixes: [],
                format: '',
                output: ''
            };
            spyOn(linter, linter.lint.name).and.returnValue(mockLintResult);
            // Mock the file read
            spyOn(helpers, helpers.readFileAsync.name).and.returnValue(Promise.resolve(fileContent));
            spyOn(fs, 'openSync').and.returnValue(null);
            spyOn(fs, 'readSync').and.returnValue(null);
            spyOn(fs, 'closeSync').and.returnValue(null);
            return utils.lintFile(context, tsConfigPath, null, filePath, linterOptions)
                .then(function (result) {
                expect(result).toEqual(mockLintResult);
                expect(linter.lint)
                    .toHaveBeenCalledWith(context, tsConfigPath, null, filePath, fileContent, linterOptions);
            });
        });
    });
    describe('processTypeCheckDiagnostics()', function () {
        it('should not throw an error when there are no files with errors or warnings', function () {
            utils.processTypeCheckDiagnostics({}, []);
        });
        it('should throw an error when one or more file has failures', function () {
            var knownError = new Error('Should never get here');
            var results = [
                {
                    file: {},
                    start: 0,
                    length: 10,
                    messageText: 'Something failed',
                    category: typescript_1.DiagnosticCategory.Warning,
                    code: 100
                }
            ];
            spyOn(tsLogger, tsLogger.runTypeScriptDiagnostics.name).and.returnValue(null);
            spyOn(loggerDiagnostics, loggerDiagnostics.printDiagnostics.name).and.returnValue(null);
            try {
                utils.processTypeCheckDiagnostics({}, results);
                throw knownError;
            }
            catch (e) {
                expect(loggerDiagnostics.printDiagnostics).toHaveBeenCalledTimes(1);
                expect(e).not.toEqual(knownError);
            }
        });
    });
    describe('processLintResults()', function () {
        it('should not throw an error when there are no files with errors or warnings', function () {
            utils.processLintResults({}, [
                {
                    errorCount: 0,
                    warningCount: 0,
                    failures: [],
                    fixes: [],
                    format: '',
                    output: ''
                }
            ]);
        });
        it('should throw an error when one or more file has failures', function () {
            var knownError = new Error('Should never get here');
            var results = [
                {
                    errorCount: 1,
                    warningCount: 0,
                    failures: [
                        {
                            getFileName: function () {
                                return 'test.ts';
                            }
                        }
                    ],
                    fixes: [],
                    format: '',
                    output: ''
                }
            ];
            spyOn(tsLintLogger, tsLintLogger.runTsLintDiagnostics.name).and.returnValue(null);
            spyOn(loggerDiagnostics, loggerDiagnostics.printDiagnostics.name).and.returnValue(null);
            try {
                utils.processLintResults({}, results);
                throw knownError;
            }
            catch (ex) {
                expect(loggerDiagnostics.printDiagnostics).toHaveBeenCalledTimes(1);
                expect(ex).not.toEqual(knownError);
            }
        });
    });
    describe('generateErrorMessageForFiles()', function () {
        it('should generate a string from an array of files', function () {
            expect(utils.generateErrorMessageForFiles(['test_one.ts', 'test_two.ts'], 'Just testing:'))
                .toEqual('Just testing:\ntest_one.ts\ntest_two.ts');
        });
    });
    describe('getFileNames()', function () {
        it('should retrieve file names from an array of RuleFailure objects', function () {
            var ruleFailures = [
                {
                    getFileName: function () {
                        return '/User/john/test.ts';
                    }
                }
            ];
            var fileNames = utils.getFileNames({ rootDir: '/User/john' }, ruleFailures);
            expect(fileNames)
                .toEqual(['test.ts']);
        });
    });
    describe('removeDuplicateFileNames()', function () {
        it('should remove duplicate string entries in arrays', function () {
            expect(utils.removeDuplicateFileNames(['test.ts', 'test.ts']))
                .toEqual(['test.ts']);
        });
    });
});
