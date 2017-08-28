"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const cli_utils_1 = require("@ionic/cli-utils");
const modules_1 = require("../modules");
function getOrientationFromConfigJson(configJson) {
    if (!configJson.widget.preference) {
        return;
    }
    var n = configJson.widget.preference.find((d) => {
        return d && d.$ && d.$.name && d.$.name.toLowerCase() === 'orientation';
    });
    if (n && n.$ && n.$.value) {
        return n.$.value.toLowerCase();
    }
}
exports.getOrientationFromConfigJson = getOrientationFromConfigJson;
function getPlatformEngine(configJson, platform) {
    if (!configJson.widget.engine) {
        return;
    }
    return configJson.widget.engine.find((d) => {
        return d && d.$ && d.$.name === platform;
    });
}
exports.getPlatformEngine = getPlatformEngine;
function addPlatformImagesToConfigJson(configJson, platform, images) {
    let configContents = JSON.parse(JSON.stringify(configJson));
    function createImageElement(platform, resourceType) {
        return (image) => {
            var iconDir = ['resources', platform, resourceType, image.name].join('/');
            if (platform === 'android') {
                return {
                    $: {
                        src: iconDir,
                        density: image.density
                    }
                };
            }
            else {
                return {
                    $: {
                        src: iconDir,
                        width: image.width,
                        height: image.height
                    }
                };
            }
        };
    }
    const platformIndex = configContents.widget.platform.findIndex((pl) => pl['$'].name === platform);
    Object.keys(images[platform]).forEach((resType) => {
        configContents.widget.platform[platformIndex][resType] = images[platform][resType].images.map(createImageElement(platform, resType));
    });
    return configContents;
}
exports.addPlatformImagesToConfigJson = addPlatformImagesToConfigJson;
function addSplashScreenPreferencesToConfigJson(configJson) {
    let configContents = JSON.parse(JSON.stringify(configJson));
    let hasSplashScreen = false;
    let hasSplashScreenDelay = false;
    if (!configContents.widget.preference) {
        configContents.widget.preference = [];
    }
    configContents.widget.preference.forEach(function (pref) {
        if (pref.$.name === 'SplashScreen') {
            hasSplashScreen = true;
        }
        if (pref.$.name === 'SplashScreenDelay') {
            hasSplashScreenDelay = true;
        }
    });
    if (!hasSplashScreen) {
        configContents.widget.preference.push({
            $: {
                name: 'SplashScreen',
                value: 'screen'
            }
        });
    }
    if (!hasSplashScreenDelay) {
        configContents.widget.preference.push({
            $: {
                name: 'SplashScreenDelay',
                value: '3000'
            }
        });
    }
    return configContents;
}
exports.addSplashScreenPreferencesToConfigJson = addSplashScreenPreferencesToConfigJson;
function parseConfigXmlToJson(projectDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const configFilePath = path.join(projectDir, 'config.xml');
        let configJson = null;
        const xml2js = modules_1.load('xml2js');
        const parseString = cli_utils_1.promisify(xml2js.parseString);
        try {
            let configFileContents = yield cli_utils_1.fsReadFile(configFilePath, { encoding: 'utf8' });
            configJson = yield parseString(configFileContents);
        }
        catch (e) {
            if (e === cli_utils_1.ERROR_FILE_NOT_FOUND) {
                throw new Error(`Cordova config.xml file was not found in ${projectDir}`);
            }
            throw e;
        }
        if (!configJson.widget) {
            throw new Error('\nYour config.xml file is invalid. You must have a <widget> element.');
        }
        return configJson;
    });
}
exports.parseConfigXmlToJson = parseConfigXmlToJson;
function writeConfigXml(projectDir, configJson) {
    return __awaiter(this, void 0, void 0, function* () {
        const xml2js = modules_1.load('xml2js');
        const builder = new xml2js.Builder({ renderOpts: { pretty: true, indent: '    ', } });
        const xml = builder.buildObject(configJson);
        const configFilePath = path.join(projectDir, 'config.xml');
        yield cli_utils_1.fsWriteFile(configFilePath, xml, { encoding: 'utf8' });
    });
}
exports.writeConfigXml = writeConfigXml;
function writeConfigXmlContentSrc(projectDir, devServerUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const configJson = yield parseConfigXmlToJson(projectDir);
        if (!configJson.widget.content) {
            throw new Error('\nYour config.xml file does not have a <content> element. ' +
                '\nAdd something like: <content src="index.html"/>');
        }
        if (!configJson.widget.content[0].$['original-src']) {
            configJson.widget.content[0].$['original-src'] = configJson.widget.content[0].$.src;
        }
        if (configJson.widget.content[0].$.src !== devServerUrl) {
            configJson.widget.content[0].$.src = devServerUrl;
            var allowNavigation = configJson.widget['allow-navigation'];
            var allowNavNode = {
                $: {
                    href: devServerUrl
                }
            };
            if (!allowNavigation) {
                configJson.widget['allow-navigation'] = [allowNavNode];
            }
            else {
                var foundAllowNav = false;
                for (var i = 0; i < allowNavigation.length; i++) {
                    if (allowNavigation[i].$.href === devServerUrl) {
                        foundAllowNav = true;
                    }
                }
                if (!foundAllowNav) {
                    configJson.widget['allow-navigation'].push(allowNavNode);
                }
            }
        }
        yield writeConfigXml(projectDir, configJson);
    });
}
exports.writeConfigXmlContentSrc = writeConfigXmlContentSrc;
function resetConfigXmlContentSrc(projectDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const configJson = yield parseConfigXmlToJson(projectDir);
        if (!configJson.widget.content) {
            throw new Error('\nYour config.xml file does not have a <content> element. ' +
                '\nAdd something like: <content src="index.html"/>');
        }
        if (configJson.widget.content[0].$['original-src']) {
            configJson.widget.content[0].$.src = configJson.widget.content[0].$['original-src'];
            delete configJson.widget.content[0].$['original-src'];
            yield writeConfigXml(projectDir, configJson);
        }
    });
}
exports.resetConfigXmlContentSrc = resetConfigXmlContentSrc;
