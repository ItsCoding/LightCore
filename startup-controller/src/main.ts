
import process from "process";
import { LogLevel, Process } from "./process.js"
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import chalk from "chalk";

const workingDir = process.env.INIT_CWD;

export const logHandler = (moduleType: string, data: string, level: LogLevel) => {
    switch (level) {
        case LogLevel.INFO:
            console.log(`[${moduleType}] ${data}`);
            break;
        case LogLevel.ERROR:
            console.log(chalk.yellow(`[${moduleType}] ${data}`));
            break;
        case LogLevel.DEBUG:
            break;
    }
}

const sleep = (ms:number) => new Promise(resolve => setTimeout(resolve, ms));

const run = async () => {
    console.log(chalk.green("[SYS] 🚥 Starting controller and all components..."));
    console.log(chalk.green("[SYS] 🚀 Starting MessageBroker..."));
    const messageBroker = new Process(`cd ${workingDir}/../messageBroker && yarn start`);
    await messageBroker.run((data) => logHandler("MessageBroker", data, LogLevel.INFO), (code) => {
        console.log(chalk.bgRed(`[☠️]MessageBroker exited with code ${code}`));
    });
    // await sleep(8*1000);


    console.log(chalk.green("[SYS] 🚀 Starting Light-Designer..."));
    const visualizer = new Process(`cd ${workingDir}/../light-designer && yarn start`);
    await visualizer.run((data) => logHandler("Light-Designer", data, LogLevel.INFO), (code) => {
        console.log(chalk.bgRed(`[☠️]Light-Designer exited with code ${code}`));
    });
    // await sleep(10*1000);

    console.log(chalk.green("[SYS] 🚀 Starting Light-Client..."));
    const lightClient = new Process(`cd ${workingDir}/../light-client && yarn start`);
    await lightClient.run((data) => logHandler("Light-Client", data, LogLevel.DEBUG), (code) => {
        console.log(chalk.bgRed(`[☠️]Light-Client exited with code ${code}`));
    });
    await sleep(45*1000);

    console.log(chalk.green("[SYS] 🚀 Starting Light-Core..."));
    const lightCore = new Process(`cd ${workingDir}/../python && python pipeline.py`);
    await lightCore.run((data,level) => logHandler("LightCore", data, level), (code) => {
        console.log(chalk.bgRed(`[☠️]LightCore exited with code ${code}`));
    });
    // await sleep(5*1000);
    console.log(chalk.cyan("[SYS] ✅ All components started!"));

    const rl = readline.createInterface({
        input,
        output
    });

    rl.on('line', async (input) => {
        if (input === "exit") {
            console.log(chalk.red("[SYS] ❌ Shutting down..."));
            console.log(chalk.red("[SYS] ❌ Shut down!"));
            process.exit(0);
        }
    });

}

run().then()
