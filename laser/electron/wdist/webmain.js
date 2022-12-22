(() => {
    const defines = {};
    const entry = [null];
    function define(name, dependencies, factory) {
        defines[name] = { dependencies, factory };
        entry[0] = name;
    }
    define("require", ["exports"], (exports) => {
        Object.defineProperty(exports, "__cjsModule", { value: true });
        Object.defineProperty(exports, "default", { value: (name) => resolve(name) });
    });
    var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() { return m[k]; } };
        }
        Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
    }));
    var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
        o["default"] = v;
    });
    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    };
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    define("main", ["require", "exports", "electron", "path"], function (require, exports, electron_1, path) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        path = __importStar(path);
        function createWindow() {
            // Create the browser window.
            const mainWindow = new electron_1.BrowserWindow({
                height: 600,
                webPreferences: {
                    preload: path.join(__dirname, "preload.js"),
                    nodeIntegration: true,
                    contextIsolation: false,
                    allowRunningInsecureContent: true,
                },
                width: 800,
            });
            // and load the index.html of the app.
            mainWindow.loadFile(path.join(__dirname, "../index.html"));
            // Open the DevTools.
            mainWindow.webContents.openDevTools();
        }
        // This method will be called when Electron has finished
        // initialization and is ready to create browser windows.
        // Some APIs can only be used after this event occurs.
        electron_1.app.whenReady().then(() => {
            createWindow();
            electron_1.app.on("activate", function () {
                // On macOS it's common to re-create a window in the app when the
                // dock icon is clicked and there are no other windows open.
                if (electron_1.BrowserWindow.getAllWindows().length === 0)
                    createWindow();
            });
        });
        // Quit when all windows are closed, except on macOS. There, it's common
        // for applications and their menu bar to stay active until the user quits
        // explicitly with Cmd + Q.
        electron_1.app.on("window-all-closed", () => {
            if (process.platform !== "darwin") {
                electron_1.app.quit();
            }
        });
    });
    // In this file you can include the rest of your app"s specific main process
    // code. You can also put them in separate files and require them here.
    // All of the Node.js APIs are available in the preload process.
    // It has the same sandbox as a Chrome extension.
    window.addEventListener("DOMContentLoaded", () => {
        const replaceText = (selector, text) => {
            const element = document.getElementById(selector);
            if (element) {
                element.innerText = text;
            }
        };
        for (const type of ["chrome", "node", "electron"]) {
            replaceText(`${type}-version`, process.versions[type]);
        }
    });
    define("effekts/Fecher", ["require", "exports", "@laser-dac/draw"], function (require, exports, draw_1) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.Fecher = void 0;
        class Fecher {
            constructor(scene, parts, min, max, speed, color, debug, y = 0.25) {
                this.scene = scene;
                this.parts = parts;
                this.min = min;
                this.max = max;
                this.speed = speed;
                this.color = color;
                this.debug = debug;
                this.y = y;
                this.partsArray = [];
                this.changeMinMax = (min, max) => {
                    this.min = min;
                    this.max = max;
                    this.partsArray.forEach((part, i) => {
                        part.x = this.min;
                    });
                };
                this.changeY = (y) => {
                    this.y = y;
                    this.reloadYForParts();
                };
                this.addY = (y) => {
                    this.y = this.y + y;
                    this.reloadYForParts();
                };
                this.reloadYForParts = () => {
                    this.partsArray.forEach((part, i) => {
                        part.y = this.y;
                    });
                };
                this.init = () => {
                    for (let i = 0; i < this.parts; i++) {
                        this.partsArray.push({
                            x: this.min,
                            y: this.y,
                            width: 0.005,
                            height: 0.005,
                            color: this.color,
                        });
                    }
                };
                //make a function that lets the part move between min and max without sin
                this.getMove = (i) => {
                    const range = this.max - this.min;
                    const offset = ((Date.now() + i) % 11) / 10;
                    if (this.debug)
                        console.log(offset * range, offset, range);
                    return offset * range;
                };
                this.render = () => {
                    this.partsArray.forEach((part, i) => {
                        const wobble = this.getMove(i * 2);
                        const myPart = Object.assign({}, part);
                        myPart.x = myPart.x + wobble;
                        this.scene.add(new draw_1.Rect(myPart));
                    });
                };
                this.init();
            }
        }
        exports.Fecher = Fecher;
    });
    define("renderPipeline", ["require", "exports", "@laser-dac/core", "@laser-dac/simulator", "@laser-dac/draw", "effekts/Fecher"], function (require, exports, core_1, simulator_1, draw_2, Fecher_1) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.renderPipeline = void 0;
        const timestart = Date.now();
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        const dac = new core_1.DAC();
        dac.use(new simulator_1.Simulator());
        (() => __awaiter(void 0, void 0, void 0, function* () {
            yield dac.start();
        }))();
        const renderPipeline = () => {
            // eslint-disable-next-line no-async-promise-executor
            return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
                const scene = new draw_2.Scene({
                // resolution: 500,
                });
                const outerFecherL = new Fecher_1.Fecher(scene, 3, 0.1, 0.25, 0.5, [0, 255, 0]);
                const outerFecherR = new Fecher_1.Fecher(scene, 3, 0.75, 0.9, 0.5, [0, 255, 0]);
                const middleFecher = new Fecher_1.Fecher(scene, 6, 0.4, 0.6, 0.5, [0, 0, 255]);
                const preset = () => __awaiter(void 0, void 0, void 0, function* () {
                    yield sleep(2000);
                    console.log("Step");
                    middleFecher.changeMinMax(0.35, 0.65);
                    yield sleep(2000);
                    console.log("Step");
                    middleFecher.changeMinMax(0.25, 0.75);
                    yield sleep(2000);
                    console.log("Step");
                    middleFecher.changeMinMax(0.1, 0.9);
                    yield sleep(2000);
                    console.log("Step");
                    for (let i = 0; i < 10; i++) {
                        yield sleep(30);
                        middleFecher.addY(0.02);
                    }
                    resolve("done");
                    scene.stop();
                });
                function renderFrame() {
                    outerFecherL.render();
                    outerFecherR.render();
                    middleFecher.render();
                }
                preset();
                scene.start(renderFrame);
                dac.stream(scene);
            }));
        };
        exports.renderPipeline = renderPipeline;
    });
    define("renderer", ["require", "exports", "renderPipeline"], function (require, exports, renderPipeline_1) {
        "use strict";
        Object.defineProperty(exports, "__esModule", { value: true });
        //on window ready
        console.log("hi");
        window.addEventListener('DOMContentLoaded', () => {
            const pipelineBtn = document.getElementById('pipelineBtn');
            pipelineBtn.addEventListener('click', () => {
                (0, renderPipeline_1.renderPipeline)();
            });
        });
    });
    //# sourceMappingURL=webmain.js.map
    'marker:resolver';

    function get_define(name) {
        if (defines[name]) {
            return defines[name];
        }
        else if (defines[name + '/index']) {
            return defines[name + '/index'];
        }
        else {
            const dependencies = ['exports'];
            const factory = (exports) => {
                try {
                    Object.defineProperty(exports, "__cjsModule", { value: true });
                    Object.defineProperty(exports, "default", { value: require(name) });
                }
                catch (_a) {
                    throw Error(['module "', name, '" not found.'].join(''));
                }
            };
            return { dependencies, factory };
        }
    }
    const instances = {};
    function resolve(name) {
        if (instances[name]) {
            return instances[name];
        }
        if (name === 'exports') {
            return {};
        }
        const define = get_define(name);
        if (typeof define.factory !== 'function') {
            return define.factory;
        }
        instances[name] = {};
        const dependencies = define.dependencies.map(name => resolve(name));
        define.factory(...dependencies);
        const exports = dependencies[define.dependencies.indexOf('exports')];
        instances[name] = (exports['__cjsModule']) ? exports.default : exports;
        return instances[name];
    }
    if (entry[0] !== null) {
        return resolve(entry[0]);
    }
})();