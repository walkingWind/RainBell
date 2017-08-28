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
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const guards_1 = require("../guards");
const errors_1 = require("./errors");
const modules_1 = require("./modules");
const format_1 = require("./utils/format");
const fs_1 = require("./utils/fs");
const http_1 = require("./http");
const npm_1 = require("./utils/npm");
exports.KNOWN_COMMAND_PLUGINS = ['cordova'];
exports.KNOWN_GLOBAL_PLUGINS = ['proxy'];
exports.KNOWN_PROJECT_PLUGINS = ['ionic1', 'ionic-angular'];
exports.ORG_PREFIX = '@ionic';
exports.PLUGIN_PREFIX = 'cli-plugin-';
exports.ERROR_PLUGIN_NOT_INSTALLED = 'PLUGIN_NOT_INSTALLED';
exports.ERROR_PLUGIN_NOT_FOUND = 'PLUGIN_NOT_FOUND';
exports.ERROR_PLUGIN_INVALID = 'PLUGIN_INVALID';
function formatFullPluginName(name) {
    return `${exports.ORG_PREFIX}/${exports.PLUGIN_PREFIX}${name}`;
}
exports.formatFullPluginName = formatFullPluginName;
function promptToInstallProjectPlugin(env, { message }) {
    return __awaiter(this, void 0, void 0, function* () {
        const project = yield env.project.load();
        const projectPlugin = formatFullPluginName(project.type);
        if (!message) {
            message = `Looks like this is an ${env.project.formatType(project.type)} project, would you like to install ${chalk.green(projectPlugin)} and continue?`;
        }
        return yield promptToInstallPlugin(env, projectPlugin, { message });
    });
}
exports.promptToInstallProjectPlugin = promptToInstallProjectPlugin;
function promptToInstallPlugin(env, pluginName, { message, global = false, reinstall = false }) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!global && !env.project.directory) {
            return;
        }
        try {
            return yield loadPlugin(env, pluginName, {
                askToInstall: true,
                global,
                reinstall,
                message,
            });
        }
        catch (e) {
            if (e !== exports.ERROR_PLUGIN_NOT_INSTALLED) {
                throw e;
            }
        }
    });
}
exports.promptToInstallPlugin = promptToInstallPlugin;
function installPlugin(env, plugin) {
    const ns = plugin.namespace;
    if (ns) {
        env.namespace.namespaces.set(ns.name, () => ns);
    }
    if (plugin.registerHooks) {
        plugin.registerHooks(env.hooks);
    }
    env.plugins[plugin.name] = plugin;
}
exports.installPlugin = installPlugin;
function uninstallPlugin(env, plugin) {
    if (plugin.namespace) {
        env.namespace.namespaces.delete(plugin.namespace.name);
    }
    env.hooks.deleteSource(plugin.name);
    delete env.plugins[plugin.name];
}
exports.uninstallPlugin = uninstallPlugin;
function loadPlugins(env) {
    return __awaiter(this, void 0, void 0, function* () {
        const globalPluginPkgs = exports.KNOWN_GLOBAL_PLUGINS.map(formatFullPluginName);
        const globalPluginPromises = globalPluginPkgs.map((pkgName) => __awaiter(this, void 0, void 0, function* () {
            try {
                return yield loadPlugin(env, pkgName, { askToInstall: false, global: true });
            }
            catch (e) {
                if (e !== exports.ERROR_PLUGIN_NOT_INSTALLED) {
                    throw e;
                }
            }
        }));
        for (let p of globalPluginPromises) {
            const plugin = yield p;
            if (plugin) {
                installPlugin(env, plugin);
            }
        }
        const [, proxyVar] = http_1.getGlobalProxy();
        if (proxyVar) {
            const proxyPluginPkg = formatFullPluginName('proxy');
            env.log.debug(`Detected ${chalk.green(proxyVar)} in environment`);
            if (!(proxyPluginPkg in env.plugins)) {
                const meta = env.plugins.ionic.meta;
                if (!meta) {
                    throw new errors_1.FatalException(`${chalk.green('ionic')} missing meta information`);
                }
                const canInstall = yield fs_1.pathAccessible(meta.filePath, fs.constants.W_OK);
                const proxyInstallArgs = yield npm_1.pkgManagerArgs(env, { pkg: proxyPluginPkg, global: true });
                const installMsg = `Detected ${chalk.green(proxyVar)} in environment, but to proxy CLI requests, you'll need ${chalk.green(proxyPluginPkg)} installed globally.`;
                if (canInstall) {
                    const p = yield promptToInstallPlugin(env, proxyPluginPkg, {
                        message: `${installMsg} Install now?`,
                        reinstall: true,
                        global: true,
                    });
                    if (p) {
                        installPlugin(env, p);
                    }
                }
                else {
                    env.log.warn(`${installMsg}\nYou can install it manually (you will likely need ${chalk.green('sudo')}):\n\n${chalk.green(proxyInstallArgs.join(' '))}\n`);
                }
            }
        }
        if (!env.project.directory) {
            return;
        }
        const project = yield env.project.load();
        const gulpFilePath = path.join(env.project.directory, project.gulpFile || 'gulpfile.js');
        const mPath = path.join(env.project.directory, 'node_modules', '@ionic');
        const [gulpFileExists, ionicModules] = yield Promise.all([
            fs_1.pathExists(gulpFilePath),
            fs_1.readDir(mPath),
        ]);
        const plugins = [];
        const pluginPkgs = ionicModules
            .filter(pkgName => pkgName.indexOf(exports.PLUGIN_PREFIX) === 0)
            .map(pkgName => `${exports.ORG_PREFIX}/${pkgName}`);
        const gulpPluginPkg = formatFullPluginName('gulp');
        if (gulpFileExists) {
            env.log.debug(`Detected ${chalk.green(format_1.prettyPath(gulpFilePath))} in project directory`);
            if (!pluginPkgs.includes(gulpPluginPkg)) {
                const gulpPluginInstallArgs = yield npm_1.pkgManagerArgs(env, { pkg: gulpPluginPkg, saveDev: true });
                const installMsg = `Detected ${chalk.green(format_1.prettyPath(gulpFilePath))} in project directory, but to integrate gulp with the CLI, you'll need to install ${chalk.green(gulpPluginPkg)}.`;
                const p = yield promptToInstallPlugin(env, gulpPluginPkg, {
                    message: `${installMsg} Install now?`,
                    reinstall: true,
                });
                if (p) {
                    plugins.push(p);
                }
            }
        }
        const pluginPromises = pluginPkgs.map(pkgName => {
            return loadPlugin(env, pkgName, { askToInstall: false });
        });
        for (let p of pluginPromises) {
            const plugin = yield p;
            plugins.push(plugin);
        }
        const projectPlugin = formatFullPluginName(project.type);
        if (!pluginPkgs.includes(projectPlugin)) {
            const plugin = yield promptToInstallProjectPlugin(env, {});
            if (plugin) {
                plugins.push(plugin);
            }
        }
        for (let plugin of plugins) {
            installPlugin(env, plugin);
        }
        validatePlugins(env);
    });
}
exports.loadPlugins = loadPlugins;
function validatePlugins(env) {
    const projectPlugins = new Set(exports.KNOWN_PROJECT_PLUGINS.map(formatFullPluginName));
    const installedPlugins = new Set(Object.keys(env.plugins));
    const installedProjectPlugins = new Set([...projectPlugins].filter(p => installedPlugins.has(p)));
    if (installedProjectPlugins.size === 0) {
        env.log.warn('You have no CLI project plugins installed. CLI functionality may be limited.');
    }
    else if (installedProjectPlugins.size > 1) {
        env.log.warn(`You have multiple CLI project plugins installed (${[...installedProjectPlugins].map(p => chalk.green(p)).join(', ')}). ${chalk.bold('Please make sure you have only one installed.')}`);
    }
}
exports.validatePlugins = validatePlugins;
function loadPlugin(env, pluginName, { message, askToInstall = true, reinstall = false, global = false }) {
    return __awaiter(this, void 0, void 0, function* () {
        const mPath = global ? pluginName : path.join(env.project.directory, 'node_modules', ...pluginName.split('/'));
        let mResolvedPath;
        let m;
        if (!message) {
            message = `The plugin ${chalk.green(pluginName)} is not installed. Would you like to install it and continue?`;
        }
        env.log.debug(`Loading ${global ? 'global' : 'local'} plugin ${chalk.green(pluginName)}`);
        try {
            mResolvedPath = require.resolve(mPath);
            delete require.cache[mResolvedPath];
            m = require(mResolvedPath);
        }
        catch (e) {
            if (e.code !== 'MODULE_NOT_FOUND') {
                throw e;
            }
            if (!askToInstall) {
                env.log.debug(`Throwing ${chalk.red(exports.ERROR_PLUGIN_NOT_INSTALLED)} for ${global ? 'global' : 'local'} ${chalk.green(pluginName)}`);
                throw exports.ERROR_PLUGIN_NOT_INSTALLED;
            }
        }
        if (!m || reinstall) {
            const confirm = yield env.prompt({
                type: 'confirm',
                name: 'confirm',
                message,
            });
            if (confirm) {
                const [installer, ...installerArgs] = yield pkgInstallPluginArgs(env, pluginName, { global });
                yield env.shell.run(installer, installerArgs, {});
                m = yield loadPlugin(env, pluginName, { askToInstall: false, global });
                mResolvedPath = require.resolve(mPath);
            }
            else {
                throw exports.ERROR_PLUGIN_NOT_INSTALLED;
            }
        }
        if (!guards_1.isPlugin(m) || !mResolvedPath) {
            env.log.debug(`Throwing ${chalk.red(exports.ERROR_PLUGIN_INVALID)} for ${global ? 'global' : 'local'} ${chalk.green(pluginName)}`);
            throw exports.ERROR_PLUGIN_INVALID;
        }
        m.meta = {
            filePath: mResolvedPath,
        };
        return m;
    });
}
exports.loadPlugin = loadPlugin;
function hydratePlugin(env, plugin) {
    return __awaiter(this, void 0, void 0, function* () {
        const semver = modules_1.load('semver');
        env.log.debug(`Getting plugin info for ${chalk.green(plugin.name)}`);
        const currentVersion = plugin.version;
        const latestVersion = yield getLatestPluginVersion(env, plugin);
        const distTag = determineDistTag(currentVersion);
        const meta = plugin.meta;
        if (!meta) {
            throw new errors_1.FatalException(`${chalk.green(plugin.name)} missing meta information`);
        }
        return Object.assign({}, plugin, { meta,
            distTag,
            currentVersion,
            latestVersion, updateAvailable: semver.gt(latestVersion, currentVersion) || (distTag === 'canary' && latestVersion !== currentVersion) });
    });
}
exports.hydratePlugin = hydratePlugin;
function facilitateIonicUpdate(env, ionicPlugin) {
    return __awaiter(this, void 0, void 0, function* () {
        const ionicInstallArgs = yield pkgInstallPluginArgs(env, 'ionic', { global: true });
        const updateMsg = `The Ionic CLI has an update available (${chalk.green(ionicPlugin.currentVersion)} => ${chalk.green(ionicPlugin.latestVersion)})!`;
        const canInstall = yield fs_1.pathAccessible(ionicPlugin.meta.filePath, fs.constants.W_OK);
        if (canInstall) {
            const confirm = yield env.prompt({
                name: 'confirm',
                type: 'confirm',
                message: `${updateMsg} Would you like to install it?`,
                noninteractiveValue: '',
            });
            if (confirm) {
                const [installer, ...installerArgs] = ionicInstallArgs;
                yield env.shell.run(installer, installerArgs, {});
                const revertArgs = yield npm_1.pkgManagerArgs(env, { pkg: `ionic@${ionicPlugin.currentVersion}`, global: true });
                env.log.nl();
                env.log.ok(`Upgraded Ionic CLI to ${chalk.green(ionicPlugin.latestVersion)}! 🎉`);
                env.log.nl();
                env.log.msg(chalk.bold('Please re-run your command.'));
                env.log.nl();
                throw new errors_1.FatalException(`${chalk.bold('Note')}: You can downgrade to your old version by running: ${chalk.green(revertArgs.join(' '))}`, 0);
            }
            else {
                env.log.ok(`Not automatically updating your CLI. You can update manually:\n\n${chalk.green(ionicInstallArgs.join(' '))}\n`);
            }
        }
        else {
            env.log.info(updateMsg);
            env.log.nl();
            env.log.warn(`No write permissions for global ${chalk.bold('node_modules')}--automatic CLI updates are disabled.\n` +
                `To fix, see ${chalk.bold('https://docs.npmjs.com/getting-started/fixing-npm-permissions')}\n\n` +
                `Or, install the CLI update manually (you will likely need ${chalk.green('sudo')}):\n\n${chalk.green(ionicInstallArgs.join(' '))}\n`);
        }
    });
}
function facilitatePluginUpdate(env, ionicPlugin, plugin) {
    return __awaiter(this, void 0, void 0, function* () {
        const pluginInstallArgs = yield pkgInstallPluginArgs(env, plugin.name, { global: plugin.preferGlobal });
        const startMsg = `${plugin.preferGlobal ? 'Global' : 'Local'} plugin ${chalk.green(plugin.name)}`;
        const updateMsg = `${startMsg} has an update available (${chalk.green(plugin.currentVersion)} => ${chalk.green(plugin.latestVersion)})!`;
        const canInstall = plugin.preferGlobal ? yield fs_1.pathAccessible(plugin.meta.filePath, fs.constants.W_OK) : true;
        if (canInstall) {
            const message = ionicPlugin.distTag === plugin.distTag ?
                `${updateMsg} Would you like to install it?` :
                `${startMsg} has a different dist-tag (${chalk.green('@' + plugin.distTag)}) than the Ionic CLI (${chalk.green('@' + ionicPlugin.distTag)}). Would you like to install the appropriate plugin version?`;
            const p = yield promptToInstallPlugin(env, plugin.name, {
                message,
                reinstall: true,
                global: plugin.preferGlobal,
            });
            if (p) {
                uninstallPlugin(env, plugin);
                installPlugin(env, p);
                env.log.ok(`Upgraded ${chalk.green(plugin.name)} to ${chalk.green(plugin.latestVersion)}! 🎉`);
                return true;
            }
            env.log.ok(`Not automatically updating ${chalk.green(plugin.name)}. You can update manually:\n\n${chalk.green(pluginInstallArgs.join(' '))}\n`);
        }
        else {
            env.log.info(updateMsg);
            env.log.nl();
            env.log.warn(`No write permissions for global ${chalk.bold('node_modules')}--automatic global plugin updates are disabled.\n` +
                `To fix, see ${chalk.bold('https://docs.npmjs.com/getting-started/fixing-npm-permissions')}\n`);
        }
        return false;
    });
}
function checkForUpdates(env) {
    return __awaiter(this, void 0, void 0, function* () {
        const allPlugins = yield Promise.all(Object.keys(env.plugins).map(n => hydratePlugin(env, env.plugins[n])));
        const ionicPlugin = allPlugins.find(p => p.name === 'ionic');
        if (!ionicPlugin) {
            throw new errors_1.FatalException('Ionic plugin not initialized.');
        }
        if (ionicPlugin.updateAvailable) {
            yield facilitateIonicUpdate(env, ionicPlugin);
        }
        const plugins = allPlugins.filter(p => p.name !== 'ionic');
        const updates = [];
        for (let plugin of plugins) {
            if (plugin.updateAvailable || ionicPlugin.distTag !== plugin.distTag) {
                const installed = yield facilitatePluginUpdate(env, ionicPlugin, plugin);
                if (installed) {
                    updates.push(plugin.name);
                }
            }
        }
        return updates;
    });
}
exports.checkForUpdates = checkForUpdates;
function getLatestPluginVersion(env, plugin) {
    return __awaiter(this, void 0, void 0, function* () {
        let cmdResult, latestVersion;
        const config = yield env.config.load();
        const distTag = determineDistTag(plugin.version);
        if ((plugin.name === 'ionic' && config.cliFlags['dev-always-ionic-updates']) || (plugin.name !== 'ionic' && config.cliFlags['dev-always-plugin-updates'])) {
            return '999.999.999';
        }
        if (distTag === 'local') {
            return plugin.version;
        }
        env.log.debug(`Checking for latest plugin version of ${chalk.green(plugin.name + '@' + distTag)}.`);
        const shellOptions = { fatalOnError: false, showCommand: false };
        try {
            if (config.cliFlags['yarn']) {
                cmdResult = yield env.shell.run('yarn', ['info', plugin.name, `dist-tags.${distTag}`, '--json'], shellOptions);
                latestVersion = JSON.parse(cmdResult).data;
            }
            else {
                cmdResult = yield env.shell.run('npm', ['view', plugin.name, `dist-tags.${distTag}`, '--json'], shellOptions);
                if (!cmdResult) {
                    return plugin.version;
                }
                latestVersion = JSON.parse(cmdResult);
            }
        }
        catch (e) {
            if (e.fatal || !guards_1.isExitCodeException(e)) {
                throw e;
            }
        }
        if (!latestVersion) {
            return plugin.version;
        }
        env.log.debug(`Latest version of ${chalk.green(plugin.name + '@' + distTag)} is ${latestVersion.trim()}.`);
        return latestVersion.trim();
    });
}
function pkgInstallPluginArgs(env, name, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const releaseChannelName = determineDistTag(env.plugins.ionic.version);
        let pluginInstallVersion = `${name}@${releaseChannelName}`;
        if (releaseChannelName === 'local') {
            options.link = true;
            pluginInstallVersion = name;
        }
        options.pkg = pluginInstallVersion;
        options.saveDev = true;
        return npm_1.pkgManagerArgs(env, options);
    });
}
exports.pkgInstallPluginArgs = pkgInstallPluginArgs;
function determineDistTag(version) {
    if (version.includes('-local')) {
        return 'local';
    }
    if (version.includes('-alpha')) {
        return 'canary';
    }
    if (version.includes('-beta') || version.includes('-rc')) {
        return 'beta';
    }
    return 'latest';
}
exports.determineDistTag = determineDistTag;
