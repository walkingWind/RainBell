"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validators_1 = require("../validators");
const modules_1 = require("../modules");
const typeDefaults = new Map()
    .set(String, null)
    .set(Boolean, false);
function minimistOptionsToArray(options, dargsOptions = {}) {
    const dargs = modules_1.load('dargs');
    if (typeof dargsOptions.ignoreFalse === 'undefined') {
        dargsOptions.ignoreFalse = true;
    }
    const results = dargs(options, dargsOptions);
    results.splice(results.length - options._.length);
    return results;
}
exports.minimistOptionsToArray = minimistOptionsToArray;
function normalizeOption(option) {
    if (!option.type) {
        option.type = String;
    }
    if (!option.default) {
        option.default = typeDefaults.get(option.type);
    }
    if (!option.aliases) {
        option.aliases = [];
    }
    return option;
}
function metadataToMinimistOptions(metadata) {
    let options = {
        string: [],
        boolean: [],
        alias: {},
        default: {}
    };
    if (!metadata.options) {
        return { boolean: true, string: '_' };
    }
    for (let option of metadata.options.map(o => normalizeOption(o))) {
        if (option.type === String) {
            options.string.push(option.name);
        }
        else if (option.type === Boolean) {
            options.boolean.push(option.name);
        }
        options.default[option.name] = option.default;
        options.alias[option.name] = option.aliases;
    }
    return options;
}
exports.metadataToMinimistOptions = metadataToMinimistOptions;
function validateInputs(argv, metadata) {
    if (!metadata.inputs) {
        return;
    }
    const errors = [];
    for (let i in metadata.inputs) {
        const input = metadata.inputs[i];
        if (input.validators && input.validators.length > 0) {
            const vnames = input.validators.map(v => v.name);
            if (vnames.includes('required')) {
                validators_1.validate(argv[i], input.name, [validators_1.validators.required], errors);
            }
            else {
                if (argv[i]) {
                    validators_1.validate(argv[i], input.name, input.validators, errors);
                }
            }
        }
    }
    if (errors.length > 0) {
        throw errors;
    }
}
exports.validateInputs = validateInputs;
function filterOptionsByIntent(metadata, options, intentName) {
    const r = Object.keys(options).reduce((allOptions, optionName) => {
        const metadataOptionFound = (metadata.options || []).find((mdOption) => (mdOption.name === optionName || (mdOption.aliases || []).includes(optionName)));
        if (metadataOptionFound) {
            if (intentName && metadataOptionFound.intent === intentName) {
                allOptions[optionName] = options[optionName];
            }
            else if (!intentName && !metadataOptionFound.intent) {
                allOptions[optionName] = options[optionName];
            }
        }
        return allOptions;
    }, {});
    r._ = options._;
    r['--'] = options['--'];
    return r;
}
exports.filterOptionsByIntent = filterOptionsByIntent;
