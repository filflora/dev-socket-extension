import React, { createContext, useState, useEffect, useCallback } from 'react';
import './App.css';
import ConnectionStatus from './components/ConnectionStatus';
import PresetList from './components/Presets';
import MessageEditor from './components/MessageEditor';
import toastr from "toastr";
import useLocalstorage from './utils/hooks/use-localstorage';

const defaultContext = {
  "dev-socket-server-url": "http://localhost:3100",
  "messages": [],
  startProcess: () => { },
  stopProcess: () => { }
};

export const ConfigContext = new createContext(defaultContext);


function App() {
  const [processes, setProcesses] = useState([]);
  const [editedPresetId, setEditedPresetId] = useState(null);
  const [status, setStatus] = useState(null);
  const [localPresets, setLocalPresets] = useLocalstorage('presets', null);
  const [presets, setPresets] = useState(localPresets);
  const [presetConfigUrl, setPresetConfigUrl] = useLocalstorage('presetConfigUrl', null);


  useEffect(() => {
    if (!!localPresets ) {
      setPresets(localPresets);
    }
  }, [localPresets])

  const startProcess = useCallback((processName) => {
    if (processes.includes(processName)) {
      return false;
    }
    setProcesses([...processes, processName]);
  }, [processes]);
  const stopProcess = useCallback((processName) => {
    setProcesses(
      processes.filter((process) => process !== processName)
    );
  }, [processes]);

  const loadPresets = useCallback(() => {
    if (presets !== null) {
      return false;
    }

    setPresets([]);
    startProcess("load-presets");

    fetch(`${presetConfigUrl}`)
      .then((response) => response.json())
      .then((response) => {
        const presets = response.messages.map((preset) => {
          // make sure the payload is a string (so devs can send invalid JSON objects as a payload and emulate an error)
          if(preset && preset.payload && typeof preset.payload !== 'string') {
            preset.payload = JSON.stringify(preset.payload);
          }
          return preset;
        });
        
        setPresets(presets);
      })
      .catch((e) => {
        toastr.error("Failed to load DevSocket presets");
      })
      .finally(() => {
        stopProcess("load-presets");
      });
  }, [presetConfigUrl, startProcess, stopProcess, presets]);

  const sendMessage = useCallback((payload) => {
    
    startProcess("sending-message");

    fetch(`${defaultContext['dev-socket-server-url']}/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
    })
      .then((response) => response.json())
      .then((response) => {
        if(response.error) {
          throw new Error(response.error.message);
        }

        toastr.success("Message sent");
      })
      .catch((error) => {
        let message = `Could not send message. ${error}`;
        
        toastr.error(message);
        console.error(error);
      })
      .finally(() => {
        stopProcess('sending-message');
      });
    

  }, [startProcess, stopProcess]);

  
  useEffect(() => {
    loadPresets();
  }, [presetConfigUrl, loadPresets]);


  const appContext = {
    ...defaultContext,
    status,
    setStatus,
    editedPresetId,
    setEditedPresetId,
    processes,
    loadPresets,
    localPresets,
    setLocalPresets,
    presets,
    setPresets,
    startProcess,
    stopProcess,
    sendMessage,
    presetConfigUrl,
    setPresetConfigUrl
  }


  return (
    <ConfigContext.Provider value={appContext}>
      <div className='wrapper'>
        <div className='panelContainer'>
          <PresetList></PresetList>
        </div>
        <div className='contentContainer'>
          <ConnectionStatus></ConnectionStatus>
          <MessageEditor></MessageEditor>
        </div>
      </div>
    </ConfigContext.Provider>
  );
}



export default App;
