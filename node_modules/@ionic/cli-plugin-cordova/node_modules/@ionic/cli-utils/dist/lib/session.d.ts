import { ConfigFile, IClient, IConfig, IProject, ISession } from '../definitions';
export declare class Session implements ISession {
    protected config: IConfig<ConfigFile>;
    protected project: IProject;
    protected client: IClient;
    constructor(config: IConfig<ConfigFile>, project: IProject, client: IClient);
    login(email: string, password: string): Promise<void>;
    isLoggedIn(): Promise<boolean>;
    getUserToken(): Promise<string>;
    getAppUserToken(app_id?: string): Promise<string>;
}
