import { Alert, AlertTitle, createTheme, ThemeProvider } from '@mui/material';
import React, { useEffect } from 'react';
import { EffektsPanel } from './components/EffektsPanel';
import { QuickPanel } from './components/QuickPanel';
import { WebSocketClient } from './system/WebsocketClient';
import { Effekt } from './types/Effekt';
import _ from 'lodash';
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const wsClient = WebSocketClient.getInstance();
  const [availableEffekts, setAvailableEffekts] = React.useState<Array<Effekt>>([]);
  const [connectionError, setConnectionError] = React.useState<boolean>(false);
  const connectWS = async () => {
    try {
      await wsClient.connect(`ws://192.168.178.48:8000`);
      console.log("Get available effekts");
      wsClient.send("get.availableEffekts");
      wsClient.addEventHandler(topic => {
        console.log("TOPIC: ",topic)
        if (topic.type === "return.availableEffekts") {
          const effekts = Effekt.fromJSONArray(topic.message);
          console.log("Available Effekts: ", effekts);
          setAvailableEffekts(effekts);
        }
      })
    } catch (error) {
      console.error("WS-Error", error);
      setConnectionError(true);
    }

  }

  useEffect(() => {
    _.debounce(connectWS, 1000)();
    const interval = setInterval(() => {
      wsClient.send("system.queue.echo");
    }, 1000);
    return () => {
      clearInterval(interval);
      // wsClient.disconnect();
    }
  }, [])

  const ConnectionError = () => (<Alert severity="error">
    <AlertTitle>Error</AlertTitle>
    There is an error in the — <strong>WebSocket connection</strong>
  </Alert>)

  return (
    <ThemeProvider theme={darkTheme}>
      {connectionError ? <ConnectionError /> :
        <div>
          <QuickPanel />
          <EffektsPanel availableEffekts={availableEffekts} />
        </div>}

    </ThemeProvider>

  );
}

export default App;
