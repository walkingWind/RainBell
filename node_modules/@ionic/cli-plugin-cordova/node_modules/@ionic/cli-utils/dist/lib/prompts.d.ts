import { ConfigFile, IConfig, ILogger, PromptModule } from '../definitions';
export declare function createPromptModule(log: ILogger, config: IConfig<ConfigFile>): Promise<PromptModule>;
