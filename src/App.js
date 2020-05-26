import React, { createContext, useState } from 'react';
import './App.css';
import ConnectionStatus from './components/ConnectionStatus';
import PresetList from './components/Presets';

const defaultContext = {
  "dev-socket-config-url": "http://localhost:3000/dev-socket.json",
  "dev-socket-server-url": "http://localhost:3100",
  "messages": [{
    "label": "Basic button",
    "payload": { "type": "basic-button", "data": "lorem-ipsum" }
  }],
  startProcess: () => {},
  stopProcess: () => {}
};

export const ConfigContext = new createContext(defaultContext);


function App() {
  const [processes, setProcesses] = useState([]);
  const [status, setStatus] = useState(null);

  const appContext = {
    ...defaultContext,
    status,
    setStatus,
    processes,
    startProcess: (processName) => {
      if (processes.includes(processName)) {
        return false;
      }
      setProcesses([...processes, processName]);
    },
    stopProcess: (processName) => {
      setProcesses(
        processes.filter((process) => process !== processName)
      );
    }
  }

  return (
    <ConfigContext.Provider value={appContext}>
      <ConnectionStatus></ConnectionStatus>
      <PresetList></PresetList>
    </ConfigContext.Provider>
  );
}



export default App;
