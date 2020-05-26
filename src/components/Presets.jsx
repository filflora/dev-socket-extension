import React, { useContext, useRef, useState, Fragment } from "react";
import { ConfigContext } from "../App";
import { useEffect } from "react";
import { useCallback } from "react";
import toastr from "toastr";

function PresetList() {
  const {
    startProcess,
    stopProcess,
    "dev-socket-config-url": configUrl,
    "dev-socket-server-url": serverUrl
  } = useContext(ConfigContext);
  const [presets, setPresets] = useState([]);
  let initialised = useRef(false);

  const loadPresets = useCallback(() => {
    if (initialised.current) {
      return;
    }
    initialised.current = true;
    startProcess("load-presets");

    fetch(`${configUrl}`)
      .then((response) => response.json())
      .then((response) => {
        debugger;
        setPresets(response.messages);
        toastr.success("DevSocket presets loaded");
      })
      .catch((e) => {
        toastr.error("Failed to load DevSocket presets");
        debugger;
      })
      .finally(() => {
        stopProcess("load-presets");
      });
  }, [startProcess, stopProcess, configUrl]);

  useEffect(() => {
    loadPresets();
  });

  const onPresetClick = (payload) => {
    debugger;
    fetch(`${serverUrl}/send-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(payload)
    })
      .then((response) => response.json())
      .then((response) => {
        debugger;
        
        toastr.success('Message sent');
      })
      .catch((e) => {
        
        debugger;
        toastr.error('Could not send message');
      })
      .finally(() => {
        
      });
  }

  return <>{presets.length && presets.map((preset, idx) => (<Fragment key={idx}>
      <button onClick={() => onPresetClick(preset.payload)}>{preset.label}</button><br/>
      </Fragment>
  ))}</>;
}

export default PresetList;
