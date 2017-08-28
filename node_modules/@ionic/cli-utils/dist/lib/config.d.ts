import { CliFlag, ConfigFile, IConfig } from '../definitions';
export declare const CLI_FLAGS: {
    flag: CliFlag;
    visible?: boolean;
    defaultValue?: boolean;
}[];
export declare abstract class BaseConfig<T> implements IConfig<T> {
    fileName: string;
    directory: string;
    filePath: string;
    protected configFile?: T;
    protected originalConfigFile?: {
        [key: string]: any;
    };
    constructor(directory: string, fileName: string);
    abstract provideDefaults(o: {
        [key: string]: any;
    }): Promise<T>;
    abstract is(o: any): o is T;
    load(): Promise<T>;
    save(configFile?: T): Promise<void>;
}
export declare const CONFIG_FILE = "config.json";
export declare const CONFIG_DIRECTORY: string;
export declare class Config extends BaseConfig<ConfigFile> {
    provideDefaults(o: any): Promise<ConfigFile>;
    is(j: any): j is ConfigFile;
}
export declare function handleCliFlags(config: IConfig<ConfigFile>, argv: {
    [key: string]: any;
}): Promise<[CliFlag, boolean][]>;
