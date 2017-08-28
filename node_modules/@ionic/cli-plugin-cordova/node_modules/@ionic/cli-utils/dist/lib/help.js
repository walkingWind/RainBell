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
const stringWidth = require("string-width");
const guards_1 = require("../guards");
const config_1 = require("./config");
const format_1 = require("./utils/format");
const HELP_DOTS_WIDTH = 25;
function showHelp(env, inputs) {
    return __awaiter(this, void 0, void 0, function* () {
        if (inputs.length === 0) {
            return env.log.msg(yield getFormattedHelpDetails(env, env.namespace, inputs));
        }
        const [, slicedInputs, cmdOrNamespace] = env.namespace.locate(inputs);
        if (!guards_1.isCommand(cmdOrNamespace)) {
            let extra = '';
            if (!env.project.directory) {
                extra = '\nYou may need to be in an Ionic project directory.';
            }
            if (slicedInputs.length > 0) {
                env.log.error(`Unable to find command: ${chalk.green(inputs.join(' '))}${extra}\n`);
            }
        }
        env.log.msg(yield formatHelp(env, cmdOrNamespace, inputs));
    });
}
exports.showHelp = showHelp;
function formatHelp(env, cmdOrNamespace, inputs) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!guards_1.isCommand(cmdOrNamespace)) {
            return getFormattedHelpDetails(env, cmdOrNamespace, inputs);
        }
        const command = cmdOrNamespace;
        return formatCommandHelp(env, command.metadata);
    });
}
function getFormattedHelpDetails(env, ns, inputs) {
    return __awaiter(this, void 0, void 0, function* () {
        const globalMetadata = ns.getCommandMetadataList();
        const formatList = (details) => details.map(hd => `    ${hd}\n`).join('');
        if (ns.root) {
            const globalCommandDetails = getHelpDetails(env, globalMetadata, [cmd => cmd.type === 'global']);
            const projectCommandDetails = getHelpDetails(env, globalMetadata, [cmd => cmd.type === 'project']);
            return `${formatHeader(env)}\n\n` +
                `  ${chalk.bold('Usage')}:\n\n` +
                `${yield formatUsage(env)}\n` +
                `  ${chalk.bold('Global Commands')}:\n\n` +
                `${formatList(globalCommandDetails)}\n` +
                `  ${chalk.bold('Project Commands')}:\n\n` +
                `${env.project.directory ? formatList(projectCommandDetails) : '    You are not in a project directory.\n'}\n`;
        }
        else {
            const commandDetails = getHelpDetails(env, globalMetadata, []);
            return `\n  ${chalk.bold('Commands')}:\n\n` +
                `${formatList(commandDetails)}\n`;
        }
    });
}
function formatUsage(env) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = yield env.config.load();
        const cliFlags = config_1.CLI_FLAGS.filter(f => f.visible).map(f => `--${config.cliFlags[f.flag] === false ? '' : 'no-'}${f.flag}`);
        const options = ['--help', '--verbose', '--quiet'];
        const usageLines = [
            `<command> ${options.map(opt => chalk.dim('[' + opt + ']')).join(' ')} ${chalk.dim('[<args>] [options]')}`,
            format_1.wordWrap(`${cliFlags.map(f => chalk.dim('[' + f + ']')).join(' ')}`, { indentation: 12 }),
        ];
        return usageLines.map(u => `    ${chalk.dim('$')} ${chalk.green('ionic ' + u)}`).join('\n') + '\n';
    });
}
function formatHeader(env) {
    return `   _             _
  (_)           (_)
   _  ___  _ __  _  ___
  | |/ _ \\| '_ \\| |/ __|
  | | (_) | | | | | (__
  |_|\\___/|_| |_|_|\\___|  CLI ${env.plugins.ionic.version}\n`;
}
function getHelpDetails(env, commandMetadataList, filters = []) {
    for (let f of filters) {
        commandMetadataList = commandMetadataList.filter(f);
    }
    const foundCommandList = commandMetadataList.filter((cmd) => cmd.visible !== false);
    return getListOfCommandDetails(foundCommandList);
}
function formatCommandHelp(env, cmdMetadata) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!cmdMetadata.fullName) {
            cmdMetadata.fullName = cmdMetadata.name;
        }
        const displayCmd = 'ionic ' + cmdMetadata.fullName;
        const wrappedDescription = format_1.wordWrap(cmdMetadata.description, { indentation: displayCmd.length + 5 });
        return `
  ${chalk.bold(chalk.green(displayCmd) + ' - ' + wrappedDescription)}${formatLongDescription(cmdMetadata.longDescription)}
  ` +
            (yield formatCommandUsage(env, cmdMetadata.inputs, cmdMetadata.fullName)) +
            formatCommandInputs(cmdMetadata.inputs) +
            formatCommandOptions(cmdMetadata.options) +
            formatCommandExamples(cmdMetadata.exampleCommands, cmdMetadata.fullName);
    });
}
function getListOfCommandDetails(cmdMetadataList) {
    const fillStringArray = format_1.generateFillSpaceStringList(cmdMetadataList.map(cmdMd => cmdMd.fullName || cmdMd.name), HELP_DOTS_WIDTH, chalk.dim('.'));
    return cmdMetadataList.map((cmdMd, index) => {
        const description = cmdMd.description + `${cmdMd.aliases && cmdMd.aliases.length > 0 ? chalk.dim(' (alias' + (cmdMd.aliases.length === 1 ? '' : 'es') + ': ') + cmdMd.aliases.map((a) => chalk.green(a)).join(', ') + chalk.dim(')') : ''}`;
        const wrappedDescription = format_1.wordWrap(description, { indentation: HELP_DOTS_WIDTH + 6 });
        return `${chalk.green(cmdMd.fullName || '')} ${fillStringArray[index]} ${wrappedDescription}`;
    });
}
function formatCommandUsage(env, inputs = [], commandName) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = yield env.config.load();
        const formatInput = (input) => {
            if (!config.cliFlags.interactive && input.required !== false) {
                return '<' + input.name + '>';
            }
            return '[<' + input.name + '>]';
        };
        const usageLine = `${chalk.dim('$')} ${chalk.green('ionic ' + commandName + ' ' + inputs.map(formatInput).join(' '))}`;
        return `
  ${chalk.bold('Usage')}:

    ${usageLine}
  `;
    });
}
function formatLongDescription(longDescription) {
    if (!longDescription) {
        return '';
    }
    longDescription = longDescription.trim();
    longDescription = format_1.wordWrap(longDescription, { indentation: 4 });
    return '\n\n    ' + longDescription;
}
function formatCommandInputs(inputs = []) {
    if (inputs.length === 0) {
        return '';
    }
    const fillStrings = format_1.generateFillSpaceStringList(inputs.map(input => input.name), HELP_DOTS_WIDTH, chalk.dim('.'));
    function inputLineFn({ name, description }, index) {
        const optionList = chalk.green(`${name}`);
        const wrappedDescription = format_1.wordWrap(description, { indentation: HELP_DOTS_WIDTH + 6 });
        return `${optionList} ${fillStrings[index]} ${wrappedDescription}`;
    }
    return `
  ${chalk.bold('Inputs')}:

    ${inputs.map(inputLineFn).join(`
    `)}
  `;
}
function formatOptionDefault(opt) {
    if (typeof opt.default === 'string') {
        return chalk.dim(' (default: ') + chalk.green(opt.default) + chalk.dim(')');
    }
    else {
        return '';
    }
}
function formatOptionLine(opt) {
    const showInverse = opt.type === Boolean && opt.default === true && opt.name.length > 1;
    const optionList = (showInverse ? chalk.green(`--no-${opt.name}`) : chalk.green(`-${opt.name.length > 1 ? '-' : ''}${opt.name}`)) +
        (!showInverse && opt.aliases && opt.aliases.length > 0 ? ', ' +
            opt.aliases
                .map((alias) => chalk.green(`-${alias}`))
                .join(', ') : '');
    const optionListLength = stringWidth(optionList);
    const fullLength = optionListLength > HELP_DOTS_WIDTH ? optionListLength + 1 : HELP_DOTS_WIDTH;
    const wrappedDescription = format_1.wordWrap(opt.description + formatOptionDefault(opt), { indentation: HELP_DOTS_WIDTH + 6 });
    return `${optionList} ${Array(fullLength - optionListLength).fill(chalk.dim('.')).join('')} ${wrappedDescription}`;
}
function formatCommandOptions(options = []) {
    if (options.length === 0) {
        return '';
    }
    return `
  ${chalk.bold('Options')}:

    ${options.map(formatOptionLine).join(`
    `)}
  `;
}
function formatCommandExamples(exampleCommands, commandName) {
    if (!Array.isArray(exampleCommands)) {
        return '';
    }
    const exampleLines = exampleCommands.map(cmd => {
        const sepIndex = cmd.indexOf(' -- ');
        if (sepIndex === -1) {
            cmd = chalk.green(cmd);
        }
        else {
            cmd = chalk.green(cmd.substring(0, sepIndex)) + cmd.substring(sepIndex);
        }
        const wrappedCmd = format_1.wordWrap(cmd, { indentation: 12, append: ' \\' });
        return `${chalk.dim('$')} ${chalk.green('ionic ' + commandName)} ${wrappedCmd}`;
    });
    return `
  ${chalk.bold('Examples')}:

    ${exampleLines.join(`
    `)}
  `;
}
