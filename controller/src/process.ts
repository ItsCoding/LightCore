import { ChildProcessWithoutNullStreams, spawn } from 'child_process';

export enum LogLevel {
    INFO = 'info',
    ERROR = 'error',
    DEBUG = 'debug'
}

export class Process {
    private childProcess: ChildProcessWithoutNullStreams;
    constructor(
        public readonly command
    ) { }

    public async run(handler: (data: string, level: LogLevel) => void, exitHandler: (code: number) => void) {
        this.childProcess = spawn(this.command, [], { shell: true });
        this.childProcess.stdout.setEncoding('utf8');
        this.childProcess.stdout.on('data', (data) => handler(data, LogLevel.INFO));
        this.childProcess.stderr.setEncoding('utf8');
        this.childProcess.stderr.on('data', (data) => handler(data, LogLevel.ERROR));
        this.childProcess.on('close', (code) => exitHandler(code));
    }
}