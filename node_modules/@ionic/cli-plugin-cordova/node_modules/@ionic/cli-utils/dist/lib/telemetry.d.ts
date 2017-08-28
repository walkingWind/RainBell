import { ConfigFile, IConfig, ITelemetry } from '../definitions';
export declare class Telemetry implements ITelemetry {
    protected config: IConfig<ConfigFile>;
    protected cliVersion: string;
    private tracker;
    constructor(config: IConfig<ConfigFile>, cliVersion: string);
    private generateUniqueToken();
    private setupTracker();
    sendCommand(command: string, args: string[]): Promise<void>;
    sendError(error: any, type: string): Promise<void>;
}
