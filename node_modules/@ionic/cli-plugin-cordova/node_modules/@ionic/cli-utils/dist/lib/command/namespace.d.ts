import { CommandData, CommandMapGetter, ICommand, INamespace, NamespaceMapGetter } from '../../definitions';
export declare class CommandMap extends Map<string, string | CommandMapGetter> {
    getAliases(): Map<string, string[]>;
    resolveAliases(cmdName: string): undefined | CommandMapGetter;
}
export declare class NamespaceMap extends Map<string, NamespaceMapGetter> {
}
export declare class Namespace implements INamespace {
    root: boolean;
    name: string;
    namespaces: NamespaceMap;
    commands: CommandMap;
    source: string;
    locate(argv: string[]): [number, string[], ICommand | INamespace];
    getCommandMetadataList(): CommandData[];
}
