var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import chalk from "chalk";
import process from "process";
import { LogLevel, Process } from "./process";
const workingDir = process.env.INIT_CWD;
const logHandler = (moduleType, data, level) => {
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
};
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(chalk.green("[SYS] 🚥 Starting controller and all components..."));
    console.log(chalk.green("[SYS] 🚀 Starting MessageBroker..."));
    const messageBroker = new Process(`cd ${workingDir}/../messageBroker && yarn start`);
    messageBroker.run((data) => logHandler("MessageBroker", data, LogLevel.INFO), (code) => {
        console.log(chalk.bgRed(`[☠️]MessageBroker exited with code ${code}`));
    });
    // await sleep(8*1000);
    console.log(chalk.green("[SYS] 🚀 Starting Light-Designer..."));
    const visualizer = new Process(`cd ${workingDir}/../light-designer && yarn start`);
    visualizer.run((data) => logHandler("Light-Designer", data, LogLevel.INFO), (code) => {
        console.log(chalk.bgRed(`[☠️]Light-Designer exited with code ${code}`));
    });
    // await sleep(10*1000);
    console.log(chalk.green("[SYS] 🚀 Starting Light-Client..."));
    const lightClient = new Process(`cd ${workingDir}/../light-client && yarn start`);
    lightClient.run((data) => logHandler("Light-Client", data, LogLevel.DEBUG), (code) => {
        console.log(chalk.bgRed(`[☠️]Light-Client exited with code ${code}`));
    });
    yield sleep(45 * 1000);
    console.log(chalk.green("[SYS] 🚀 Starting Light-Core..."));
    const lightCore = new Process(`cd ${workingDir}/../python && python pipeline.py`);
    lightCore.run((data, level) => logHandler("LightCore", data, level), (code) => {
        console.log(chalk.bgRed(`[☠️]LightCore exited with code ${code}`));
    });
    // await sleep(5*1000);
    console.log(chalk.cyan("[SYS] ✅ All components started!"));
});
run().then();
