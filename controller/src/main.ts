import chalk from "chalk";
import process from "process";
import { LogLevel, Process } from "./process.js"

const workingDir = process.env.INIT_CWD;

const logHandler = (moduleType: string, data: string, level: LogLevel) => {
    switch (level) {
        case LogLevel.INFO:
            console.log(`[${moduleType}] ${data}`);
            break;
        case LogLevel.ERROR:
            console.log(chalk.bgYellow(`[${moduleType}] ${data}`));
            break;
        case LogLevel.DEBUG:
            break;
    }
}

const sleep = (ms:number) => new Promise(resolve => setTimeout(resolve, ms));

const run = async () => {
    console.log(chalk.bgGreen("[SYS] Starting controller and all components..."));
    console.log(chalk.bgGreen("[SYS] Starting MessageBroker..."));
    const messageBroker = new Process(`cd ${workingDir}/../messageBroker && yarn start`);
    messageBroker.run((data) => logHandler("MessageBroker", data, LogLevel.INFO), (code) => {
        console.log(chalk.bgRed(`[☠️]MessageBroker exited with code ${code}`));
    });
    await sleep(8*1000);


    console.log(chalk.bgGreen("[SYS] Starting Visualizer..."));
    const visualizer = new Process(`cd ${workingDir}/../../LightCore-Virtualization/LightCore-Virtualization-Electron && yarn start`);
    visualizer.run((data) => logHandler("Visualizer", data, LogLevel.DEBUG), (code) => {
        console.log(chalk.bgRed(`[☠️]Visualizer exited with code ${code}`));
    });
    await sleep(10*1000);

    console.log(chalk.bgGreen("[SYS] Starting Light-Client..."));
    const lightClient = new Process(`cd ${workingDir}/../light-client && yarn start`);
    lightClient.run((data) => logHandler("Light-Client", data, LogLevel.DEBUG), (code) => {
        console.log(chalk.bgRed(`[☠️]Light-Client exited with code ${code}`));
    });
    await sleep(15*1000);

    console.log(chalk.bgGreen("[SYS] Starting Light-Core..."));
    const lightCore = new Process(`cd ${workingDir}/../python && python pipeline.py`);
    lightCore.run((data,level) => logHandler("LightCore", data, level), (code) => {
        console.log(chalk.bgRed(`[☠️]LightCore exited with code ${code}`));
    });
    await sleep(5*1000);
    console.log(chalk.bgCyan("[SYS] All components started!"));
}

run().then()