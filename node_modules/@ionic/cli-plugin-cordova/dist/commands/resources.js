"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
const chalk = require("chalk");
const cli_utils_1 = require("@ionic/cli-utils");
const resources_1 = require("../lib/resources");
const setup_1 = require("../lib/utils/setup");
const configXmlUtils_1 = require("../lib/utils/configXmlUtils");
const AVAILABLE_RESOURCE_TYPES = ['icon', 'splash'];
let ResourcesCommand = class ResourcesCommand extends cli_utils_1.Command {
    preRun(inputs, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const isLoggedIn = yield this.env.session.isLoggedIn();
            if (!isLoggedIn) {
                this.env.log.warn(`You need to be logged into your Ionic account in order to run ${chalk.green(`ionic cordova resources`)}.\n`);
                yield cli_utils_1.promptToLogin(this.env);
            }
        });
    }
    run(inputs, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const [platform] = inputs;
            let resourceTypes = AVAILABLE_RESOURCE_TYPES.filter((type, index, array) => options[type]);
            resourceTypes = (resourceTypes.length) ? resourceTypes : AVAILABLE_RESOURCE_TYPES;
            const resourceDir = path.join(this.env.project.directory, 'resources');
            this.env.tasks.next(`Collecting resource configuration and source images`);
            const configJson = yield configXmlUtils_1.parseConfigXmlToJson(this.env.project.directory);
            const config = yield this.env.config.load();
            const resourceJsonStructure = yield resources_1.getResourceConfigJson();
            this.env.log.debug(`resourceJsonStructure=${Object.keys(resourceJsonStructure).length}`);
            let platformDirContents = yield setup_1.getProjectPlatforms(this.env.project.directory);
            this.env.log.debug(`platformDirContents=${platformDirContents}`);
            if (platform && !platformDirContents.includes(platform)) {
                this.env.tasks.end();
                const confirm = yield this.env.prompt({
                    message: `Platform ${chalk.green(platform)} is not installed! Would you like to install it?`,
                    type: 'confirm',
                    name: 'confirm',
                });
                if (confirm) {
                    yield setup_1.installPlatform(this.env, platform);
                    platformDirContents = yield setup_1.getProjectPlatforms(this.env.project.directory);
                    this.env.log.debug(`platformDirContents=${platformDirContents}`);
                }
                else {
                    throw this.exit(`Platform ${chalk.green(platform)} not installed.`);
                }
            }
            const buildPlatforms = Object.keys(resourceJsonStructure).filter(p => platformDirContents.includes(p));
            this.env.log.debug(`buildPlatforms=${buildPlatforms}`);
            if (buildPlatforms.length === 0) {
                this.env.tasks.end();
                throw this.exit(`No platforms have been added. Please run: ${chalk.green('ionic cordova platform add')}`);
            }
            this.env.log.debug(`${chalk.green('getProjectPlatforms')} completed - length=${buildPlatforms.length}`);
            const orientation = configXmlUtils_1.getOrientationFromConfigJson(configJson) || 'default';
            let imgResources = resources_1.flattenResourceJsonStructure(resourceJsonStructure)
                .filter((img) => orientation === 'default' || typeof img.orientation === 'undefined' || img.orientation === orientation)
                .filter((img) => buildPlatforms.includes(img.platform))
                .filter((img) => resourceTypes.includes(img.resType))
                .map((img) => (Object.assign({}, img, { dest: path.join(resourceDir, img.platform, img.resType, img.name) })));
            if (platform) {
                imgResources = imgResources.filter((img) => img.platform === platform);
            }
            this.env.log.debug(`imgResources=${imgResources.length}`);
            const buildDirResponses = yield resources_1.createImgDestinationDirectories(imgResources);
            this.env.log.debug(`${chalk.green('createImgDestinationDirectories')} completed - length=${buildDirResponses.length}`);
            let srcImagesAvailable = [];
            try {
                srcImagesAvailable = yield resources_1.getSourceImages(buildPlatforms, resourceTypes, resourceDir);
                this.env.log.debug(`${chalk.green('getSourceImages')} completed - ${srcImagesAvailable.length}`);
            }
            catch (e) {
            }
            imgResources = imgResources.map((imageResource) => {
                const mostSpecificImageAvailable = resources_1.findMostSpecificImage(imageResource, srcImagesAvailable);
                return Object.assign({}, imageResource, { imageId: mostSpecificImageAvailable && mostSpecificImageAvailable.imageId ? mostSpecificImageAvailable.imageId : null });
            });
            const missingSrcImages = imgResources.filter((imageResource) => imageResource.imageId === null);
            if (missingSrcImages.length > 0) {
                const missingImageText = missingSrcImages
                    .reduce((list, img) => {
                    const str = `${img.platform}/${img.resType}`;
                    if (!list.includes(str)) {
                        list.push(str);
                    }
                    return list;
                }, [])
                    .map(v => chalk.bold(v))
                    .join(', ');
                throw new cli_utils_1.FatalException(`Source image files were not found for the following platforms/types: ${missingImageText}\n\n` +
                    `Please review ${chalk.green('--help')}`);
            }
            this.env.tasks.next(`Uploading source images to prepare for transformations`);
            let imageUploadResponses;
            const timeout = config.cliFlags.timeout;
            imageUploadResponses = yield resources_1.uploadSourceImages(srcImagesAvailable, timeout);
            this.env.log.debug(`${chalk.green('uploadSourceImages')} completed - responses=${JSON.stringify(imageUploadResponses, null, 2)}`);
            srcImagesAvailable = srcImagesAvailable.map((img, index) => {
                return Object.assign({}, img, { width: imageUploadResponses[index].Width, height: imageUploadResponses[index].Height, vector: imageUploadResponses[index].Vector });
            });
            const imagesTooLargeForSource = imgResources.filter((imageResource) => {
                const resourceSourceImage = srcImagesAvailable.find(srcImage => srcImage.imageId === imageResource.imageId);
                if (resourceSourceImage === undefined) {
                    return true;
                }
                return !resourceSourceImage.vector &&
                    (imageResource.width > resourceSourceImage.width || imageResource.height > resourceSourceImage.height);
            });
            imgResources = imgResources.filter(imageResource => {
                return !imagesTooLargeForSource.find(tooLargeForSourceImage => imageResource.name === tooLargeForSourceImage.name);
            });
            this.env.tasks.next(`Generating platform resources`);
            let count = 0;
            const promiseList = imgResources.map((img, index) => __awaiter(this, void 0, void 0, function* () {
                yield resources_1.transformResourceImage(img, timeout);
                count += 1;
                this.env.tasks.updateMsg(`Generating platform resources: ${chalk.bold(`${count} / ${imgResources.length}`)} complete`);
            }));
            const generateImageResponses = yield Promise.all(promiseList);
            this.env.tasks.updateMsg(`Generating platform resources: ${chalk.bold(`${imgResources.length} / ${imgResources.length}`)} complete`);
            this.env.log.debug(`${chalk.green('generateResourceImage')} completed - responses=${JSON.stringify(generateImageResponses, null, 2)}`);
            this.env.tasks.next(`Modifying config.xml to add new image resources`);
            const imageResourcesForConfig = imgResources.reduce((rc, img) => {
                if (!rc[img.platform]) {
                    rc[img.platform] = {
                        [img.resType]: {
                            images: [],
                            nodeName: '',
                            nodeAttributes: []
                        }
                    };
                }
                if (!rc[img.platform][img.resType]) {
                    rc[img.platform][img.resType] = {
                        images: [],
                        nodeName: '',
                        nodeAttributes: []
                    };
                }
                rc[img.platform][img.resType].images.push({
                    name: img.name,
                    width: img.width,
                    height: img.height,
                    density: img.density || null
                });
                rc[img.platform][img.resType].nodeName = img.nodeName;
                rc[img.platform][img.resType].nodeAttributes = img.nodeAttributes;
                return rc;
            }, {});
            const platformList = Object
                .keys(imageResourcesForConfig)
                .map(pn => pn);
            yield resources_1.addResourcesToConfigXml(this.env.project.directory, platformList, imageResourcesForConfig);
            this.env.tasks.end();
            if (imagesTooLargeForSource.length > 0) {
                const imagesTooLargeForSourceMsg = imagesTooLargeForSource
                    .map(imageResource => `    ${chalk.bold(imageResource.name)}     ${imageResource.platform}/${imageResource.resType} needed ${imageResource.width}w x ${imageResource.height}h`)
                    .concat((imagesTooLargeForSource.length > 0) ? `\nThe following images were not created because their source image was too small:` : [])
                    .reverse();
                this.env.log.info(imagesTooLargeForSourceMsg.join('\n'));
            }
        });
    }
};
ResourcesCommand = __decorate([
    cli_utils_1.CommandMetadata({
        name: 'resources',
        type: 'project',
        description: 'Automatically create icon and splash screen resources',
        longDescription: `
Ionic can automatically generate perfectly sized icons and splash screens from source images (${chalk.bold('.png')}, ${chalk.bold('.psd')}, or ${chalk.bold('.ai')}) for your Cordova platforms.

The source image for icons should ideally be at least ${chalk.bold('1024x1024px')} and located at ${chalk.bold('resources/icon.png')}. The source image for splash screens should ideally be at least ${chalk.bold('2732x2732px')} and located at ${chalk.bold('resources/splash.png')}. If you used ${chalk.green('ionic start')}, there should already be default Ionic resources in the ${chalk.bold('resources/')} directory, which you can overwrite.

You can also generate platform-specific icons and splash screens by placing them in the respective ${chalk.bold('resources/<platform>/')} directory. For example, to generate an icon for Android, place your image at ${chalk.bold('resources/android/icon.png')}.

${chalk.green('ionic cordova resources')} will automatically update your ${chalk.bold('config.xml')} to reflect the changes in the generated images, which Cordova then configures.

Cordova reference documentation:
- Icons: ${chalk.bold('https://cordova.apache.org/docs/en/latest/config_ref/images.html')}
- Splash Screens: ${chalk.bold('https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-splashscreen/')}

This command uses Ionic servers, so we require you to be logged into your free Ionic account. Use ${chalk.green('ionic login')} to login.
  `,
        exampleCommands: ['', 'ios', 'android'],
        inputs: [
            {
                name: 'platform',
                description: `The platform for which you would like to generate resources (e.g. ${chalk.green('ios')}, ${chalk.green('android')})`,
                required: false,
            }
        ],
        options: [
            {
                name: 'icon',
                description: 'Generate icon resources',
                type: Boolean,
                aliases: ['i'],
            },
            {
                name: 'splash',
                description: 'Generate splash screen resources',
                type: Boolean,
                aliases: ['s'],
            }
        ]
    })
], ResourcesCommand);
exports.ResourcesCommand = ResourcesCommand;
