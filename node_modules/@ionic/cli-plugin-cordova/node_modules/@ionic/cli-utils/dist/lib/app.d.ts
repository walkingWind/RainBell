import { AppDetails, IApp, IClient, IProject, ISession } from '../definitions';
export declare class App implements IApp {
    protected session: ISession;
    protected project: IProject;
    protected client: IClient;
    protected details: {
        [app_id: string]: AppDetails;
    };
    constructor(session: ISession, project: IProject, client: IClient);
    load(app_id?: string): Promise<AppDetails>;
}
