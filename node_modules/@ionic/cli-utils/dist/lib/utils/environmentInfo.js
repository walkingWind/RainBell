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
const shell_1 = require("./shell");
function getCommandInfo(cmd, args = []) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const out = yield shell_1.runcmd(cmd, args);
            return out.split('\n').join(' ');
        }
        catch (e) { }
    });
}
exports.getCommandInfo = getCommandInfo;
