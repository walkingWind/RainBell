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
const configXmlUtils_1 = require("./utils/configXmlUtils");
const SUPPORTED_SOURCE_EXTENSIONS = ['.psd', '.ai', '.png'];
const UPLOAD_URL = 'https://res.ionic.io/api/v1/upload';
const TRANSFORM_URL = 'https://res.ionic.io/api/v1/transform';
const RESOURCES_CONFIG_FILE = path.resolve(__dirname, '..', 'resources.json');
const DEFAULT_RESOURCES_DIR = path.resolve(__dirname, '..', 'default-resources');
function flattenResourceJsonStructure(jsonStructure) {
    return cli_utils_1.flattenArray(Object.keys(jsonStructure).map(platform => (Object.keys(jsonStructure[platform]).map(resType => (jsonStructure[platform][resType]['images'].map((imgInfo) => ({
        platform,
        resType,
        name: imgInfo.name,
        width: imgInfo.width,
        height: imgInfo.height,
        density: imgInfo.density,
        orientation: imgInfo.orientation,
        nodeName: jsonStructure[platform][resType]['nodeName'],
        nodeAttributes: jsonStructure[platform][resType]['nodeAttributes']
    })))))));
}
exports.flattenResourceJsonStructure = flattenResourceJsonStructure;
function createImgDestinationDirectories(imgResources) {
    return __awaiter(this, void 0, void 0, function* () {
        const buildDirPromises = imgResources
            .map(img => path.dirname(img.dest))
            .filter((dir, index, dirNames) => dirNames.indexOf(dir) === index)
            .map(dir => cli_utils_1.fsMkdirp(dir));
        return Promise.all(buildDirPromises);
    });
}
exports.createImgDestinationDirectories = createImgDestinationDirectories;
function getResourceConfigJson() {
    return __awaiter(this, void 0, void 0, function* () {
        let resourceJsonStructure;
        const filePath = RESOURCES_CONFIG_FILE;
        try {
            resourceJsonStructure = yield cli_utils_1.fsReadJsonFile(filePath);
        }
        catch (e) {
            if (e === cli_utils_1.ERROR_FILE_NOT_FOUND) {
                throw new Error(`${filePath} not found`);
            }
            else if (e === cli_utils_1.ERROR_FILE_INVALID_JSON) {
                throw new Error(`${filePath} is not valid JSON.`);
            }
            throw e;
        }
        return resourceJsonStructure;
    });
}
exports.getResourceConfigJson = getResourceConfigJson;
function getSourceImages(buildPlatforms, resourceTypes, resourceDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const srcDirList = buildPlatforms
            .map((platform) => ({
            platform,
            path: path.join(resourceDir, platform)
        }))
            .concat({
            platform: 'global',
            path: resourceDir
        });
        const srcImageDirContentList = yield Promise.all(srcDirList.map((srcImgDir) => cli_utils_1.readDir(srcImgDir.path)));
        const sourceImages = cli_utils_1.flattenArray(srcImageDirContentList.map((srcImageDirContents, index) => (srcImageDirContents
            .map((imgName) => {
            const ext = path.extname(imgName);
            return {
                ext,
                platform: srcDirList[index].platform,
                resType: path.basename(imgName, ext),
                path: path.join(srcDirList[index].path, imgName),
                vector: false,
                height: 0,
                width: 0
            };
        })
            .filter((img) => SUPPORTED_SOURCE_EXTENSIONS.includes(img.ext))
            .filter((img) => resourceTypes.includes(img.resType)))));
        const sourceImageChecksums = yield Promise.all(sourceImages.map(img => cli_utils_1.getFileChecksum(img.path)));
        return sourceImages.map((img, index) => (Object.assign({}, img, { imageId: sourceImageChecksums[index] })));
    });
}
exports.getSourceImages = getSourceImages;
function findMostSpecificImage(imageResource, srcImagesAvailable) {
    return srcImagesAvailable.reduce((mostSpecificImage, sourceImage) => {
        if (sourceImage.platform === imageResource.platform && sourceImage.resType === imageResource.resType) {
            return sourceImage;
        }
        if (sourceImage.platform === 'global' && sourceImage.resType === imageResource.resType && !mostSpecificImage) {
            return sourceImage;
        }
        return mostSpecificImage;
    }, null);
}
exports.findMostSpecificImage = findMostSpecificImage;
function uploadSourceImages(srcImages, timeout) {
    return __awaiter(this, void 0, void 0, function* () {
        return Promise.all(srcImages.map((srcImage) => __awaiter(this, void 0, void 0, function* () {
            const res = yield cli_utils_1.createRequest('POST', UPLOAD_URL)
                .timeout({ response: timeout ? 120000 : 0 })
                .type('form')
                .attach('src', srcImage.path)
                .field('image_id', srcImage.imageId || '');
            return res.body;
        })));
    });
}
exports.uploadSourceImages = uploadSourceImages;
function transformResourceImage(imageResource, timeout) {
    return new Promise((resolve, reject) => {
        const req = cli_utils_1.createRequest('POST', TRANSFORM_URL)
            .timeout({ response: timeout ? 120000 : 0 })
            .type('form')
            .send({
            'name': imageResource.name,
            'image_id': imageResource.imageId,
            'width': imageResource.width,
            'height': imageResource.height,
            'res_type': imageResource.resType,
            'crop': 'center',
            'encoding': 'png',
        })
            .on('response', (res) => {
            if (res.statusCode !== 200) {
                let bufs = [];
                res.on('data', (chunk) => {
                    bufs.push(chunk);
                });
                res.on('end', () => {
                    const buf = Buffer.concat(bufs);
                    const body = buf.toString();
                    reject(new Error(`encountered bad status code (${res.statusCode}) for ${TRANSFORM_URL}\nbody: ${body}`));
                });
            }
        })
            .on('error', (err) => {
            if (err.code === 'ECONNABORTED') {
                reject(new Error(`timeout of ${err.timeout}ms reached for ${TRANSFORM_URL}`));
            }
            else {
                reject(err);
            }
        });
        cli_utils_1.writeStreamToFile(req, imageResource.dest).then(resolve, reject);
    });
}
exports.transformResourceImage = transformResourceImage;
function addDefaultImagesToProjectResources(projectDirectory, platform) {
    return __awaiter(this, void 0, void 0, function* () {
        const resourcesDir = path.resolve(projectDirectory, 'resources', platform);
        const platformResourceDir = path.resolve(DEFAULT_RESOURCES_DIR, platform);
        yield cli_utils_1.fsMkdirp(platformResourceDir);
        yield cli_utils_1.copyDirectory(platformResourceDir, resourcesDir);
        const resourceJson = yield getResourceConfigJson();
        return addResourcesToConfigXml(projectDirectory, [platform], resourceJson);
    });
}
exports.addDefaultImagesToProjectResources = addDefaultImagesToProjectResources;
function addResourcesToConfigXml(projectDirectory, platformList, resourceJson) {
    return __awaiter(this, void 0, void 0, function* () {
        let configJson = yield configXmlUtils_1.parseConfigXmlToJson(projectDirectory);
        if (!configJson.widget.platform || configJson.widget.platform.length === 0) {
            throw `Config.xml does not contain a platform entry. Please compare your config.xml file with one of our starter projects.`;
        }
        platformList.forEach((platform) => {
            if (!configJson.widget.platform.find((pl) => pl['$'].name === platform)) {
                throw `Config.xml does not contain an entry for ${platform}`;
            }
            configJson = configXmlUtils_1.addPlatformImagesToConfigJson(configJson, platform, resourceJson);
        });
        configJson = configXmlUtils_1.addSplashScreenPreferencesToConfigJson(configJson);
        return configXmlUtils_1.writeConfigXml(projectDirectory, configJson);
    });
}
exports.addResourcesToConfigXml = addResourcesToConfigXml;
