import { LintResult, RuleFailure } from 'tslint';
import { Diagnostic } from 'typescript';
import { LinterOptions } from './lint-factory';
import { BuildContext } from '../util/interfaces';
/**
 * Lint files
 * @param {BuildContext} context
 * @param {string} tsConfig - Path to TS config file
 * @param {string|null} tsLintConfig - TSLint config file path
 * @param {Array<string>} filePaths
 * @param {LinterOptions} linterOptions
 */
export declare function lintFiles(context: BuildContext, tsConfig: string, tsLintConfig: string | null, filePaths: string[], linterOptions?: LinterOptions): Promise<void>;
export declare function lintFile(context: BuildContext, tsConfig: string, tsLintConfig: string | null, filePath: string, linterOptions?: LinterOptions): Promise<LintResult>;
/**
 * Process typescript diagnostics after type checking
 * NOTE: This will throw a BuildError if there were any type errors.
 * @param {BuildContext} context
 * @param {Array<Diagnostic>} tsDiagnostics
 */
export declare function processTypeCheckDiagnostics(context: BuildContext, tsDiagnostics: Diagnostic[]): void;
/**
 * Process lint results
 * NOTE: This will throw a BuildError if there were any warnings or errors in any of the lint results.
 * @param {BuildContext} context
 * @param {Array<LintResult>} results
 */
export declare function processLintResults(context: BuildContext, results: LintResult[]): void;
export declare function generateErrorMessageForFiles(failingFiles: string[], message?: string): string;
export declare function getFileNames(context: BuildContext, failures: RuleFailure[]): string[];
export declare function removeDuplicateFileNames(fileNames: string[]): string[];
