import { Linter, LintResult } from 'tslint';
import { Program, Diagnostic } from 'typescript';
import { BuildContext } from '../util/interfaces';
export interface LinterOptions {
    typeCheck?: boolean;
}
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
export declare function lint(context: BuildContext, tsConfig: string, tsLintConfig: string | null, filePath: string, fileContents: string, linterOptions?: LinterOptions): LintResult;
/**
 * Type check a TS program
 * @param {BuildContext} context
 * @param {string} tsConfig
 * @param {LinterOptions} linterOptions
 * @return {Promise<Diagnostic[]>}
 */
export declare function typeCheck(context: BuildContext, tsConfig: string, linterOptions?: LinterOptions): Promise<Diagnostic[]>;
/**
 * Create a TS program based on the BuildContext {srcDir} or TS config file path (if provided)
 * @param {BuildContext} context
 * @param {string} tsConfig
 * @return {Program}
 */
export declare function createProgram(context: BuildContext, tsConfig: string): Program;
/**
 * Get all files that are sourced in TS config
 * @param {BuildContext} context
 * @param {string} tsConfig
 * @return {Array<string>}
 */
export declare function getFileNames(context: BuildContext, tsConfig: string): string[];
/**
 * Get linter
 * @param {BuildContext} context
 * @param {string} tsConfig
 * @return {Linter}
 */
export declare function getLinter(context: BuildContext, tsConfig: string): Linter;
