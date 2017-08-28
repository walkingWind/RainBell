import { CommandData, CommandLineInputs, CommandLineOptions, ICommand, IonicEnvironment } from '../../definitions';
import { FatalException } from '../errors';
export declare class Command implements ICommand {
    env: IonicEnvironment;
    metadata: CommandData;
    run(inputs: CommandLineInputs, options: CommandLineOptions): Promise<void | number>;
    validate(inputs: CommandLineInputs): Promise<void>;
    execute(inputs: CommandLineInputs, options: CommandLineOptions): Promise<void>;
    exit(msg: string, code?: number): FatalException;
    getCleanInputsForTelemetry(inputs: CommandLineInputs, options: CommandLineOptions): string[];
}
