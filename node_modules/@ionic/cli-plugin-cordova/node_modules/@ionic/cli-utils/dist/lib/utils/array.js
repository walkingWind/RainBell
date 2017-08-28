"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function flattenArray(arr) {
    return arr.reduce(function (flat, toFlatten) {
        return flat.concat(Array.isArray(toFlatten) ? flattenArray(toFlatten) : toFlatten);
    }, []);
}
exports.flattenArray = flattenArray;
