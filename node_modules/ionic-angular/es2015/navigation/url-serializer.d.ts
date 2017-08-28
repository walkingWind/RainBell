import { OpaqueToken } from '@angular/core';
import { NavigationContainer } from './navigation-container';
import { DeepLinkConfig, NavLink, NavSegment } from './nav-util';
/**
 * @hidden
 */
export declare class UrlSerializer {
    links: NavLink[];
    constructor(config: DeepLinkConfig);
    /**
     * Parse the URL into a Path, which is made up of multiple NavSegments.
     * Match which components belong to each segment.
     */
    parse(browserUrl: string): NavSegment[];
    createSegmentFromName(navContainer: NavigationContainer, nameOrComponent: any): NavSegment;
    getLinkFromName(nameOrComponent: any): NavLink;
    /**
     * Serialize a path, which is made up of multiple NavSegments,
     * into a URL string. Turn each segment into a string and concat them to a URL.
     */
    serialize(segments: NavSegment[]): string;
    /**
     * Serializes a component and its data into a NavSegment.
     */
    serializeComponent(navGroup: NavGroup, component: any, data: any): NavSegment;
    /** @internal */
    _createSegment(navGroup: NavGroup, configLink: NavLink, data: any): NavSegment;
}
export declare function formatUrlPart(name: string): string;
export declare const parseUrlParts: (navGroups: NavGroup[], configLinks: NavLink[]) => NavSegment[];
export declare const isPartMatch: (urlPart: string, configLinkPart: string) => boolean;
export declare const createMatchedData: (matchedUrlParts: string[], link: NavLink) => any;
export declare const findLinkByComponentData: (links: NavLink[], component: any, instanceData: any) => NavLink;
export declare const normalizeLinks: (links: NavLink[]) => NavLink[];
/**
 * @hidden
 */
export declare const DeepLinkConfigToken: OpaqueToken;
export declare function setupUrlSerializer(userDeepLinkConfig: any): UrlSerializer;
export declare function urlToNavGroupStrings(url: string): string[];
export declare function navGroupStringtoObjects(navGroupStrings: string[]): NavGroup[];
export interface NavGroup {
    type: string;
    navId: string;
    secondaryId: string;
    segmentPieces?: string[];
}
