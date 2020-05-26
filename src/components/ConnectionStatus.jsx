import React, { useContext, useState } from "react";
import { ConfigContext } from "../App";
import { useEffect } from "react";
import { useCallback } from "react";
import toastr from 'toastr';

const SERVER_STATUS = {
  checking: "checking",
  available: "available",
  unavailable: "unavailable",
};

function ConnectionStatus() {
  const {
    status,
    setStatus,
    processes,
    startProcess,
    stopProcess,
    "dev-socket-server-url": serverUrl,
  } = useContext(ConfigContext);

  const [serverStatusLastChecked, setServerStatusLastChecked] = useState(null);

  const checkServerStatus = useCallback(() => {
    if (serverStatusLastChecked > Date.now() - 2 * 60 * 1000) {
      return;
    }

    setServerStatusLastChecked(Date.now());
    setStatus(SERVER_STATUS.checking);
    startProcess("checking-server");

    fetch(`${serverUrl}/health`)
      .then((response) => response.json())
      .then((response) => {
        setStatus(SERVER_STATUS.available);
        toastr.success('DevSocket server available');
      })
      .catch((e) => {
        setStatus(SERVER_STATUS.unavailable);
        toastr.error('DevSocket server unavailable');
      })
      .finally(() => {
        stopProcess("checking-server");
      });
  }, [
    startProcess,
    stopProcess,
    serverUrl,
    setStatus,
    serverStatusLastChecked,
    setServerStatusLastChecked,
  ]);

  useEffect(() => {
    checkServerStatus();
  });

  const onStatusClick = () => setServerStatusLastChecked(null);

  return (
    <>
      <div className={"server-status " + status} onClick={onStatusClick}>
        <div className={"server-status__value"}>
          Server status: {status}
        </div>
        <div className={"server-status__processes"}>
          {processes.join(", ")}
        </div>
      </div>
    </>
  );
}

export default ConnectionStatus;
