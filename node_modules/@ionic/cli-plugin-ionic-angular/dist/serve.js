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
const chalk = require("chalk");
const cli_utils_1 = require("@ionic/cli-utils");
const modules_1 = require("./lib/modules");
function serve(args) {
    return __awaiter(this, void 0, void 0, function* () {
        let chosenIP = 'localhost';
        if (args.options.externalIpRequired) {
            const availableIPs = cli_utils_1.getAvailableIPAddress();
            if (availableIPs.length === 0) {
                throw new Error(`It appears that you do not have any external network interfaces. ` +
                    `In order to use livereload with emulate you will need one.`);
            }
            chosenIP = (availableIPs.length === 0) ? '0.0.0.0' : availableIPs[0].address;
            if (availableIPs.length > 1) {
                if (availableIPs.find(({ address }) => address === args.options.address)) {
                    chosenIP = args.options.address;
                }
                else {
                    args.env.log.warn(`${chalk.bold('Multiple network interfaces detected!')}\n` +
                        'You will be prompted to select an external-facing IP for the livereload server that your device or emulator has access to.\n' +
                        `You may also use the ${chalk.green('--address')} option to skip this prompt.\n`);
                    const promptedIp = yield args.env.prompt({
                        type: 'list',
                        name: 'promptedIp',
                        message: 'Please select which IP to use:',
                        choices: availableIPs.map(ip => ip.address)
                    });
                    chosenIP = promptedIp;
                }
            }
        }
        const appScriptsArgs = cli_utils_1.minimistOptionsToArray(args.options, { useEquals: false, ignoreFalse: true, allowCamelCase: true });
        process.argv = ['node', 'appscripts'].concat(appScriptsArgs);
        const AppScripts = modules_1.load('@ionic/app-scripts');
        const context = AppScripts.generateContext();
        args.env.log.info(`Starting app-scripts server: ${chalk.bold(appScriptsArgs.join(' '))} - Ctrl+C to cancel`);
        const settings = yield AppScripts.serve(context);
        if (!settings) {
            throw new cli_utils_1.FatalException(`app-scripts serve unexpectedly failed.` +
                `settings: ${settings}` +
                `context: ${context}`);
        }
        const localAddress = 'http://localhost:' + settings.httpPort;
        const externalAddress = 'http://' + chosenIP + ':' + settings.httpPort;
        args.env.log.info(`Development server running\n` +
            `Local: ${chalk.bold(localAddress)}\n` +
            (localAddress !== externalAddress ? `External: ${chalk.bold(externalAddress)}` : ''));
        return Object.assign({ publicIp: chosenIP, protocol: 'http' }, settings);
    });
}
exports.serve = serve;
