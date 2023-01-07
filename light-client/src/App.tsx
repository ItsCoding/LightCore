import { Alert, AlertTitle, createTheme, Grid, LinearProgress, ThemeProvider } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { QuickPage } from './pages/QuickPage';
import { ClientMode, WebSocketClient } from './system/WebsocketClient';
import { Effekt } from './types/Effekt';
import _ from 'lodash';
import HeaderBar from './components/General/HeaderBar';
import { EffektsPage } from './pages/EffektsPage';
import { LightCoreConfig } from './types/LightCoreConfig';
import { HomePage } from './pages/HomePage';
import { ReturnType, WSApiKey } from './types/TopicReturnType';
// import { ColorsPage } from './pages/ColorsPage';
import { Composition } from './types/Composition';
import { SnackbarProvider } from 'notistack';
import { StagePage } from './pages/StagePage';
import { BoardEditor } from './pages/BoardEditor';
import { Board, JSON2Board, setAllCompositions } from './types/Board';
import { LedStrip } from './types/Strip';
import { parseStrips } from './system/Utils';

export const themeOptions = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#003566',
    },
    secondary: {
      main: '#ffd60a',
    },
    background: {
      default: '#000000',
      paper: '#181818',
    },
    text: {
      primary: '#d4d4d4',
    },
    divider: '#080808',
  },
});

// const darkTheme = createTheme({
//   palette: {
//     mode: 'dark',
//   },
// });
const wsClient = WebSocketClient.getInstance();

function App() {
  const isPhone = window.innerWidth < 800;

  const [activeRoute, setActiveRoute] = React.useState("home");
  const [availableEffekts, setAvailableEffekts] = React.useState<Array<Effekt>>([]);
  const [connectionError, setConnectionError] = React.useState<boolean>(false);
  const [compositionStore, setCompositionStore] = React.useState<Array<Composition>>([]);
  const connectedToWs = React.useRef(false);
  const [touchCapable, setTouchCapable] = React.useState<Boolean>(window.touchToggle);
  const [availableBoards, setAvailableBoards] = React.useState<Array<Board>>([]);
  const [stripConfig, setStripConfig] = useState<LedStrip[]>([]);

  const [loadedInfos, setLoadedInfos] = useState<{ [key: string]: boolean }>({})



  //System
  const [lcConfig, setLcConfig] = React.useState<LightCoreConfig>();

  type RNDSpecificDict = {
    [key: number]: boolean
  }

  //Randomizer States
  const [randomEnabled, setRandomEnabled] = React.useState(true);
  const [randomSpecific, setRandomSpecific] = React.useState<RNDSpecificDict>({});

  const changeCompositionStore = (comps: Array<Composition>) => {
    setCompositionStore(comps);
    const compJSON = comps.map((comp) => comp.toJSON());
    wsClient.issueKeySet("compositionStore", JSON.stringify(compJSON));
  }

  const initEventHandler = (override = false) => {

    if (!loadedInfos["AVAILABLE_EFFEKTS"]) {
      console.log("Requesting AVAILABLE_EFFEKTS");
      wsClient.addEventHandler(ReturnType.DATA.AVAILABLE_EFFEKTS, topic => {
        const effekts = Effekt.fromJSONArray(topic.message);
        console.log("Available Effekts: ", effekts);
        setAvailableEffekts(effekts);
        setLoadedInfos((prev) => {
          return {
            ...prev,
            "AVAILABLE_EFFEKTS": true
          }
        });
      })
      wsClient.send("data.get.availableEffekts");
    }

    if (!loadedInfos["stripConfig"]) {
      const handlerIDConfig = wsClient.addEventHandler("return.wsapi.ledconfig", topic => {
        const data = topic.message;
        const strips = parseStrips(data);
        setStripConfig(strips)
        setLoadedInfos((prev) => {
          return {
            ...prev,
            "stripConfig": true
          }
        });
        wsClient.removeEventHandler(handlerIDConfig);
      })
      wsClient.send("wsapi.requestConfig", {});
    }

    if (!loadedInfos["SYSTEM_CONFIG"]) {
      const sysConfigHandlerID = wsClient.addEventHandler(ReturnType.SYSTEM.CONFIG, topic => {
        const conf = LightCoreConfig.fromJSON(topic.message);
        console.log("System Config: ", conf);
        setLcConfig((prev) => {
          if (prev === undefined) {
            return conf;
          }
        });
        setLoadedInfos((prev) => {
          return {
            ...prev,
            "SYSTEM_CONFIG": true
          }
        });
        wsClient.removeEventHandler(sysConfigHandlerID);
      })
      wsClient.send("system.config.get")
    }

    if (!loadedInfos["compositionStore"] || override) {
      const compStoreHandlerID = wsClient.addEventHandler(ReturnType.WSAPI.GET_KEY_VALUE, topic => {
        if (topic.message === null) return;
        const msg: WSApiKey = topic.message;
        if (msg.key === "compositionStore" && msg.value) {
          const comps = Composition.fromJSONArray(JSON.parse(msg.value));
          setAllCompositions(comps)
          setCompositionStore(comps);
          setLoadedInfos((prev) => {
            return {
              ...prev,
              "compositionStore": true
            }
          });
          wsClient.removeEventHandler(compStoreHandlerID);
        }
      });
      wsClient.issueKeyGet("compositionStore");
    }

    if (!loadedInfos["boards"]) {
      const boardHandlerID = wsClient.addEventHandler(ReturnType.WSAPI.GET_KEY_VALUE, topic => {
        if (topic.message === null) return;
        const msg: WSApiKey = topic.message;
        if (msg.key === "boards" && msg.value) {
          const boards: Board[] = JSON.parse(msg.value).map((b: any) => JSON2Board(b));
          setAvailableBoards(boards);
          setLoadedInfos((prev) => {
            return {
              ...prev,
              "boards": true
            }
          });
          wsClient.removeEventHandler(boardHandlerID);
        }
      });
      wsClient.issueKeyGet("boards");
    }

  }
  const connectWS = async () => {
    if (connectedToWs.current) return;
    try {
      connectedToWs.current = true;
      await wsClient.connect(`ws://${window.location.hostname}:8000`);
      initEventHandler();
    } catch (error) {
      console.error("WS-Error", error);
      setConnectionError(true);
    }

  }

  useEffect(() => {
    connectWS();

  }, [])
  // console.log("Reload")
  useEffect(() => {
    if (activeRoute !== "stage" && wsClient.mode === ClientMode.STAGE && wsClient.connected) {
      wsClient.mode = ClientMode.EDITOR;
      initEventHandler(true);
      console.log("🌈 Switched to Editor Mode");
    } else if (activeRoute === "stage" && wsClient.mode === ClientMode.EDITOR) {
      wsClient.mode = ClientMode.STAGE;
      wsClient.unsubscribeAll();
      console.log("⚠️ Switched to Stage Mode");
    }
  }, [activeRoute])

  const ConnectionError = () => (<Alert severity="error">
    <AlertTitle>Error</AlertTitle>
    There is an error in the — <strong>WebSocket connection</strong>
  </Alert>)

  type RouteProps = {
    element: JSX.Element
    path: string,
  }

  const Route = ({ element, path }: RouteProps) => {
    let displayType = "none";
    if (path === "quick" && isPhone) {
      displayType = "block";
    }
    if (path === activeRoute && !isPhone) {
      displayType = "block";
    }
    return (<div key={path} style={{
      display: displayType,
    }}>
      {element}
    </div>)
  }

  return (
    <ThemeProvider theme={themeOptions}>
      <SnackbarProvider anchorOrigin={{ vertical: "top", horizontal: "right" }} maxSnack={8}>
        {connectionError ? <ConnectionError /> :

          <div>
            {lcConfig && stripConfig.length > 0 ? <>
              {
                activeRoute !== "stage" ?
                  <>
                    {!isPhone && <HeaderBar setCompositionStore={changeCompositionStore} compositionStore={compositionStore} setTouchCapable={setTouchCapable} changeTab={(key) => setActiveRoute(key)} />}
                    <div style={{
                      paddingBottom: "8vh",
                      margin: "10px"
                    }}>
                      <Route path="quick" element={<QuickPage
                        compositions={compositionStore}
                        strips={stripConfig}
                        availableEffekts={availableEffekts}
                        randomEnabled={randomEnabled}
                        randomSpecific={randomSpecific}
                        setRandomEnabled={setRandomEnabled}
                        setRandomSpecific={setRandomSpecific}
                        lightConfig={lcConfig}
                        setLCConfig={setLcConfig}
                      />} />
                      {!isPhone && <>
                        <Route path="home" element={<HomePage />} />
                        <Route path="effekts" element={<EffektsPage
                          activeRoute={activeRoute}
                          stripConfig={stripConfig}
                          availableEffekts={availableEffekts}
                          isRandomizerActive={randomEnabled}
                          setRandomizerActive={setRandomEnabled}
                          compositionStore={compositionStore}
                          setCompositionStore={changeCompositionStore}
                        />} />
                        <Route path="boardeditor" element={<BoardEditor
                          strips={stripConfig}
                          compositions={compositionStore}
                          availableBoards={availableBoards}
                          setAvailableBoards={setAvailableBoards}
                        />} />
                      </>}
                      {/* <Route path="colors" element={<ColorsPage />} /> */}
                    </div>
                  </> : <StagePage setActiveRoute={setActiveRoute} />
              }
            </> : <div>
              <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                justifyContent="center"
                style={{ minHeight: '80vh' }}
              >
                <Grid item xs={3}>
                  <h2>Connecting...</h2>
                  <LinearProgress />
                </Grid>
              </Grid>
            </div>}
          </div>

        }
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
