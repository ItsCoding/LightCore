import { Alert, AlertTitle, createTheme, Grid, LinearProgress, ThemeProvider, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { QuickPage } from './pages/QuickPage';
import { WebSocketClient } from './system/WebsocketClient';
import { Effekt } from './types/Effekt';
import _ from 'lodash';
import HeaderBar from './components/General/HeaderBar';
import { EffektsPage } from './pages/EffektsPage';
import { LightCoreConfig } from './types/LightCoreConfig';
import { HomePage } from './pages/HomePage';
import { ReturnType } from './types/TopicReturnType';
import { ColorsPage } from './pages/ColorsPage';

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
  const connectedToWs = React.useRef(false);
  const [touchCapable, setTouchCapable] = React.useState<Boolean>(window.touchToggle);

  //System
  const [lcConfig, setLcConfig] = React.useState<LightCoreConfig>();

  type RNDSpecificDict = {
    [key: number]: boolean
  }

  //Randomizer States
  const [randomEnabled, setRandomEnabled] = React.useState(true);
  const [randomSpecific, setRandomSpecific] = React.useState<RNDSpecificDict>({});


  const connectWS = async () => {
    if (connectedToWs.current) return;
    try {
      connectedToWs.current = true;
      await wsClient.connect(`ws://${window.location.hostname}:8000`);
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
      console.log("Get available effekts");
      wsClient.send("data.get.availableEffekts");
      wsClient.send("system.config.get")
    } catch (error) {
      console.error("WS-Error", error);
      setConnectionError(true);
    }

  }

  useEffect(() => {
    connectWS();
  }, [])

  const ConnectionError = () => (<Alert severity="error">
    <AlertTitle>Error</AlertTitle>
    There is an error in the — <strong>WebSocket connection</strong>
  </Alert>)

  type RouteProps = {
    element: JSX.Element
    path: string
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
      {connectionError ? <ConnectionError /> :

        <div>
          {lcConfig ? <>
            <div style={{
              paddingBottom: "6vh",
              margin: "10px"
            }}>
              <Route path="home" element={<HomePage />} />
              <Route path="quick" element={<QuickPage
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
              />} />
              <Route path="colors" element={<ColorsPage />} />
            </div>
            <HeaderBar setTouchCapable={setTouchCapable} changeTab={(key) => setActiveRoute(key)} />
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
    </ThemeProvider>
  );
}

export default App;
