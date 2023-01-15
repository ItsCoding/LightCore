var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { spawn } from 'child_process';
export var LogLevel;
(function (LogLevel) {
    LogLevel["INFO"] = "info";
    LogLevel["ERROR"] = "error";
    LogLevel["DEBUG"] = "debug";
})(LogLevel || (LogLevel = {}));
export class Process {
    constructor(command) {
        this.command = command;
    }
    run(handler, exitHandler) {
        return __awaiter(this, void 0, void 0, function* () {
            this.childProcess = spawn(this.command, [], { shell: true });
            this.childProcess.stdout.setEncoding('utf8');
            this.childProcess.stdout.on('data', (data) => handler(data, LogLevel.INFO));
            this.childProcess.stderr.setEncoding('utf8');
            this.childProcess.stderr.on('data', (data) => handler(data, LogLevel.ERROR));
            this.childProcess.on('close', (code) => exitHandler(code));
        });
    }
}
