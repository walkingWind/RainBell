import { CommandData, CommandLineInputs, CommandLineOptions } from '@ionic/cli-utils';
export declare const CORDOVA_INTENT = "CORDOVA";
export declare function filterArgumentsForCordova(metadata: CommandData, inputs: CommandLineInputs, options: CommandLineOptions): string[];
export declare function generateBuildOptions(metadata: CommandData, options: CommandLineOptions): CommandLineOptions;
