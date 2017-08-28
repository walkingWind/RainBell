import { KnownPlatform, ResourcesConfig } from '../../definitions';
export declare function getOrientationFromConfigJson(configJson: any): string | undefined;
export declare function getPlatformEngine(configJson: any, platform: string): any;
export declare function addPlatformImagesToConfigJson(configJson: any, platform: KnownPlatform, images: ResourcesConfig): any;
export declare function addSplashScreenPreferencesToConfigJson(configJson: any): any;
export declare function parseConfigXmlToJson(projectDir: string): Promise<any>;
export declare function writeConfigXml(projectDir: string, configJson: any): Promise<void>;
export declare function writeConfigXmlContentSrc(projectDir: string, devServerUrl: string): Promise<void>;
export declare function resetConfigXmlContentSrc(projectDir: string): Promise<void>;
