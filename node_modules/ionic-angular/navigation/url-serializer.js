import { OpaqueToken } from '@angular/core';
import { isArray, isBlank, isPresent } from '../util/util';
/**
 * @hidden
 */
var UrlSerializer = (function () {
    /**
     * @param {?} config
     */
    function UrlSerializer(config) {
        if (config && isArray(config.links)) {
            this.links = normalizeLinks(config.links);
        }
        else {
            this.links = [];
        }
    }
    /**
     * Parse the URL into a Path, which is made up of multiple NavSegments.
     * Match which components belong to each segment.
     * @param {?} browserUrl
     * @return {?}
     */
    UrlSerializer.prototype.parse = function (browserUrl) {
        if (browserUrl.charAt(0) === '/') {
            browserUrl = browserUrl.substr(1);
        }
        // trim off data after ? and #
        browserUrl = browserUrl.split('?')[0].split('#')[0];
        var /** @type {?} */ navGroupStrings = urlToNavGroupStrings(browserUrl);
        var /** @type {?} */ navGroups = navGroupStringtoObjects(navGroupStrings);
        return parseUrlParts(navGroups, this.links);
    };
    /**
     * @param {?} navContainer
     * @param {?} nameOrComponent
     * @return {?}
     */
    UrlSerializer.prototype.createSegmentFromName = function (navContainer, nameOrComponent) {
        var /** @type {?} */ configLink = this.getLinkFromName(nameOrComponent);
        if (configLink) {
            return this._createSegment({ navId: navContainer.id, secondaryId: navContainer.getSecondaryIdentifier(), type: 'tabs' }, configLink, null);
        }
        return null;
    };
    /**
     * @param {?} nameOrComponent
     * @return {?}
     */
    UrlSerializer.prototype.getLinkFromName = function (nameOrComponent) {
        return this.links.find(function (link) {
            return (link.component === nameOrComponent) ||
                (link.name === nameOrComponent);
        });
    };
    /**
     * Serialize a path, which is made up of multiple NavSegments,
     * into a URL string. Turn each segment into a string and concat them to a URL.
     * @param {?} segments
     * @return {?}
     */
    UrlSerializer.prototype.serialize = function (segments) {
        if (!segments || !segments.length) {
            return '/';
        }
        var /** @type {?} */ sections = segments.map(function (segment) {
            if (segment.type === 'tabs') {
                return "/" + segment.type + "/" + segment.navId + "/" + segment.secondaryId + "/" + segment.id;
            }
            return "/" + segment.type + "/" + segment.navId + "/" + segment.id;
        });
        return sections.join('');
    };
    /**
     * Serializes a component and its data into a NavSegment.
     * @param {?} navGroup
     * @param {?} component
     * @param {?} data
     * @return {?}
     */
    UrlSerializer.prototype.serializeComponent = function (navGroup, component, data) {
        if (component) {
            var /** @type {?} */ link = findLinkByComponentData(this.links, component, data);
            if (link) {
                return this._createSegment(navGroup, link, data);
            }
        }
        return null;
    };
    /**
     * \@internal
     * @param {?} navGroup
     * @param {?} configLink
     * @param {?} data
     * @return {?}
     */
    UrlSerializer.prototype._createSegment = function (navGroup, configLink, data) {
        var /** @type {?} */ urlParts = configLink.segmentParts;
        if (isPresent(data)) {
            // create a copy of the original parts in the link config
            urlParts = urlParts.slice();
            // loop through all the data and convert it to a string
            var /** @type {?} */ keys = Object.keys(data);
            var /** @type {?} */ keysLength = keys.length;
            if (keysLength) {
                for (var /** @type {?} */ i = 0; i < urlParts.length; i++) {
                    if (urlParts[i].charAt(0) === ':') {
                        for (var /** @type {?} */ j = 0; j < keysLength; j++) {
                            if (urlParts[i] === ":" + keys[j]) {
                                // this data goes into the URL part (between slashes)
                                urlParts[i] = encodeURIComponent(data[keys[j]]);
                                break;
                            }
                        }
                    }
                }
            }
        }
        return {
            id: urlParts.join('/'),
            name: configLink.name,
            component: configLink.component,
            loadChildren: configLink.loadChildren,
            data: data,
            defaultHistory: configLink.defaultHistory,
            navId: navGroup.navId,
            type: navGroup.type,
            secondaryId: navGroup.secondaryId
        };
    };
    return UrlSerializer;
}());
export { UrlSerializer };
function UrlSerializer_tsickle_Closure_declarations() {
    /** @type {?} */
    UrlSerializer.prototype.links;
}
/**
 * @param {?} name
 * @return {?}
 */
export function formatUrlPart(name) {
    name = name.replace(URL_REPLACE_REG, '-');
    name = name.charAt(0).toLowerCase() + name.substring(1).replace(/[A-Z]/g, function (match) {
        return '-' + match.toLowerCase();
    });
    while (name.indexOf('--') > -1) {
        name = name.replace('--', '-');
    }
    if (name.charAt(0) === '-') {
        name = name.substring(1);
    }
    if (name.substring(name.length - 1) === '-') {
        name = name.substring(0, name.length - 1);
    }
    return encodeURIComponent(name);
}
export var /** @type {?} */ parseUrlParts = function (navGroups, configLinks) {
    var /** @type {?} */ segments = [];
    for (var _i = 0, configLinks_1 = configLinks; _i < configLinks_1.length; _i++) {
        var link = configLinks_1[_i];
        for (var _a = 0, navGroups_1 = navGroups; _a < navGroups_1.length; _a++) {
            var navGroup = navGroups_1[_a];
            if (link.segmentPartsLen === navGroup.segmentPieces.length) {
                // check if the segment pieces are a match
                var /** @type {?} */ allSegmentsMatch = true;
                for (var /** @type {?} */ i = 0; i < navGroup.segmentPieces.length; i++) {
                    if (!isPartMatch(navGroup.segmentPieces[i], link.segmentParts[i])) {
                        allSegmentsMatch = false;
                        break;
                    }
                }
                // sweet, we found a match!
                if (allSegmentsMatch) {
                    segments.push({
                        id: link.segmentParts.join('/'),
                        name: link.name,
                        component: link.component,
                        loadChildren: link.loadChildren,
                        data: createMatchedData(navGroup.segmentPieces, link),
                        defaultHistory: link.defaultHistory,
                        navId: navGroup.navId,
                        type: navGroup.type,
                        secondaryId: navGroup.secondaryId
                    });
                }
            }
        }
    }
    return segments;
};
export var /** @type {?} */ isPartMatch = function (urlPart, configLinkPart) {
    if (isPresent(urlPart) && isPresent(configLinkPart)) {
        if (configLinkPart.charAt(0) === ':') {
            return true;
        }
        return (urlPart === configLinkPart);
    }
    return false;
};
export var /** @type {?} */ createMatchedData = function (matchedUrlParts, link) {
    var /** @type {?} */ data = null;
    for (var /** @type {?} */ i = 0; i < link.segmentPartsLen; i++) {
        if (link.segmentParts[i].charAt(0) === ':') {
            data = data || {};
            data[link.segmentParts[i].substring(1)] = decodeURIComponent(matchedUrlParts[i]);
        }
    }
    return data;
};
export var /** @type {?} */ findLinkByComponentData = function (links, component, instanceData) {
    var /** @type {?} */ foundLink = null;
    var /** @type {?} */ foundLinkDataMatches = -1;
    for (var /** @type {?} */ i = 0; i < links.length; i++) {
        var /** @type {?} */ link = links[i];
        if (link.component === component) {
            // ok, so the component matched, but multiple links can point
            // to the same component, so let's make sure this is the right link
            var /** @type {?} */ dataMatches = 0;
            if (instanceData) {
                var /** @type {?} */ instanceDataKeys = Object.keys(instanceData);
                // this link has data
                for (var /** @type {?} */ j = 0; j < instanceDataKeys.length; j++) {
                    if (isPresent(link.dataKeys[instanceDataKeys[j]])) {
                        dataMatches++;
                    }
                }
            }
            else if (link.dataLen) {
                // this component does not have data but the link does
                continue;
            }
            if (dataMatches >= foundLinkDataMatches) {
                foundLink = link;
                foundLinkDataMatches = dataMatches;
            }
        }
    }
    return foundLink;
};
export var /** @type {?} */ normalizeLinks = function (links) {
    for (var /** @type {?} */ i = 0, /** @type {?} */ ilen = links.length; i < ilen; i++) {
        var /** @type {?} */ link = links[i];
        if (isBlank(link.segment)) {
            link.segment = link.name;
        }
        link.dataKeys = {};
        link.segmentParts = link.segment.split('/');
        link.segmentPartsLen = link.segmentParts.length;
        // used for sorting
        link.staticLen = link.dataLen = 0;
        var /** @type {?} */ stillCountingStatic = true;
        for (var /** @type {?} */ j = 0; j < link.segmentPartsLen; j++) {
            if (link.segmentParts[j].charAt(0) === ':') {
                link.dataLen++;
                stillCountingStatic = false;
                link.dataKeys[link.segmentParts[j].substring(1)] = true;
            }
            else if (stillCountingStatic) {
                link.staticLen++;
            }
        }
    }
    // sort by the number of parts, with the links
    // with the most parts first
    return links.sort(sortConfigLinks);
};
/**
 * @param {?} a
 * @param {?} b
 * @return {?}
 */
function sortConfigLinks(a, b) {
    // sort by the number of parts
    if (a.segmentPartsLen > b.segmentPartsLen) {
        return -1;
    }
    if (a.segmentPartsLen < b.segmentPartsLen) {
        return 1;
    }
    // sort by the number of static parts in a row
    if (a.staticLen > b.staticLen) {
        return -1;
    }
    if (a.staticLen < b.staticLen) {
        return 1;
    }
    // sort by the number of total data parts
    if (a.dataLen < b.dataLen) {
        return -1;
    }
    if (a.dataLen > b.dataLen) {
        return 1;
    }
    return 0;
}
var /** @type {?} */ URL_REPLACE_REG = /\s+|\?|\!|\$|\,|\.|\+|\"|\'|\*|\^|\||\/|\\|\[|\]|#|%|`|>|<|;|:|@|&|=/g;
/**
 * @hidden
 */
export var DeepLinkConfigToken = new OpaqueToken('USERLINKS');
/**
 * @param {?} userDeepLinkConfig
 * @return {?}
 */
export function setupUrlSerializer(userDeepLinkConfig) {
    return new UrlSerializer(userDeepLinkConfig);
}
/**
 * @param {?} url
 * @return {?}
 */
export function urlToNavGroupStrings(url) {
    var /** @type {?} */ tokens = url.split('/');
    var /** @type {?} */ keywordIndexes = [];
    for (var /** @type {?} */ i = 0; i < tokens.length; i++) {
        if (tokens[i] === 'nav' || tokens[i] === 'tabs') {
            keywordIndexes.push(i);
        }
    }
    var /** @type {?} */ groupings = [];
    for (var /** @type {?} */ i = 0; i < keywordIndexes.length; i++) {
        var /** @type {?} */ startIndex = keywordIndexes[i];
        var /** @type {?} */ endIndex = keywordIndexes[i + 1 < keywordIndexes.length ? i + 1 : keywordIndexes.length];
        var /** @type {?} */ group = tokens.slice(startIndex, endIndex);
        groupings.push(group.join('/'));
    }
    return groupings;
}
/**
 * @param {?} navGroupStrings
 * @return {?}
 */
export function navGroupStringtoObjects(navGroupStrings) {
    // each string has a known format-ish, convert it to it
    return navGroupStrings.map(function (navGroupString) {
        var /** @type {?} */ sections = navGroupString.split('/');
        if (sections[0] === 'nav') {
            return {
                type: 'nav',
                navId: sections[1],
                secondaryId: null,
                segmentPieces: sections.splice(2)
            };
        }
        return {
            type: 'tabs',
            navId: sections[1],
            secondaryId: sections[2],
            segmentPieces: sections.splice(3)
        };
    });
}
//# sourceMappingURL=url-serializer.js.map