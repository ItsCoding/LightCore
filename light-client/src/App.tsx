import { Alert, AlertTitle, createTheme, Grid, LinearProgress, ThemeProvider, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { QuickPage } from './pages/QuickPage';
import { ClientMode, WebSocketClient } from './system/WebsocketClient';
import { Effekt } from './types/Effekt';
import _ from 'lodash';
import HeaderBar from './components/General/HeaderBar';
import { EffektsPage } from './pages/EffektsPage';
import { LightCoreConfig } from './types/LightCoreConfig';
import { HomePage } from './pages/HomePage';
import { ReturnType, WSApiKey } from './types/TopicReturnType';
import { ColorsPage } from './pages/ColorsPage';
import { Composition } from './types/Composition';
import { SnackbarProvider } from 'notistack';
import { StagePage } from './pages/StagePage';
import { BoardEditor } from './pages/BoardEditor';
import { Board, JSON2Board, setAllCompositions } from './types/Board';

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
  const [activeRoute, setActiveRoute] = React.useState("home");
  const [availableEffekts, setAvailableEffekts] = React.useState<Array<Effekt>>([]);
  const [connectionError, setConnectionError] = React.useState<boolean>(false);
  const [compositionStore, setCompositionStore] = React.useState<Array<Composition>>([]);
  const connectedToWs = React.useRef(false);
  const [touchCapable, setTouchCapable] = React.useState<Boolean>(window.touchToggle);
  const [availableBoards, setAvailableBoards] = React.useState<Array<Board>>([]);

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

  const initEventHandler = () => {
    wsClient.addEventHandler(ReturnType.DATA.AVAILABLE_EFFEKTS, topic => {
      const effekts = Effekt.fromJSONArray(topic.message);
      console.log("Available Effekts: ", effekts);
      setAvailableEffekts(effekts);
    })

    wsClient.addEventHandler(ReturnType.SYSTEM.CONFIG, topic => {
      const conf = LightCoreConfig.fromJSON(topic.message);
      console.log("System Config: ", conf);
      setLcConfig(conf);
    })

    wsClient.addEventHandler(ReturnType.WSAPI.GET_KEY_VALUE, topic => {
      console.log("Got Key Value: ", topic);
      if (topic.message === null) return;
      const msg: WSApiKey = topic.message;
      if (msg.key === "compositionStore" && msg.value) {
        const comps = Composition.fromJSONArray(JSON.parse(msg.value));
        setAllCompositions(comps)
        setCompositionStore(comps);
      } else if (msg.key === "boards" && msg.value) {
        const boards: Board[] = JSON.parse(msg.value).map((b: any) => JSON2Board(b));
        setAvailableBoards(boards);
      }
    });
    console.log("Get available effekts");
    wsClient.send("data.get.availableEffekts");
    wsClient.send("system.config.get")
    wsClient.issueKeyGet("compositionStore");
    wsClient.issueKeyGet("boards");
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

  useEffect(() => {
    if (activeRoute !== "stage" && wsClient.mode === ClientMode.STAGE && wsClient.connected) {
      wsClient.mode = ClientMode.EDITOR;
      initEventHandler();
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
    return (<div key={path} style={{
      display: activeRoute === path ? "block" : "none",
    }}>
      {element}
    </div>)
  }

  return (
    <ThemeProvider theme={themeOptions}>
      <SnackbarProvider maxSnack={8}>
        {connectionError ? <ConnectionError /> :

          <div>
            {lcConfig ? <>
              {
                activeRoute !== "stage" ?
                  <>
                    <HeaderBar setTouchCapable={setTouchCapable} changeTab={(key) => setActiveRoute(key)} />
                    <div style={{
                      paddingBottom: "8vh",
                      margin: "10px"
                    }}>
                      <Route path="home" element={<HomePage />} />
                      <Route path="quick" element={<QuickPage
                        availableEffekts={availableEffekts}
                        randomEnabled={randomEnabled}
                        randomSpecific={randomSpecific}
                        setRandomEnabled={setRandomEnabled}
                        setRandomSpecific={setRandomSpecific}
                        lightConfig={lcConfig}
                        setLCConfig={setLcConfig}
                      />} />
                      <Route path="effekts" element={<EffektsPage
                        availableEffekts={availableEffekts}
                        isRandomizerActive={randomEnabled}
                        setRandomizerActive={setRandomEnabled}
                        compositionStore={compositionStore}
                        setCompositionStore={changeCompositionStore}
                      />} />
                      <Route path="boardeditor" element={<BoardEditor
                        compositions={compositionStore}
                        availableBoards={availableBoards}
                        setAvailableBoards={setAvailableBoards}
                      />} />
                      <Route path="colors" element={<ColorsPage />} />
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
