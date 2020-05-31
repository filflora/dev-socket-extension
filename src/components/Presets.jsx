import React, { useContext, useRef, Fragment, useCallback } from "react";
import { ConfigContext } from "../App";
import toastr from "toastr";

function PresetList() {
  const {
    presets,
    setPresets,
    setPresetConfigUrl,
    editedPresetId,
    setEditedPresetId,
    localPresets,
    setLocalPresets,
    sendMessage,
  } = useContext(ConfigContext);

  let initialised = useRef(false);

  const onPresetClick = (payload) => {
    sendMessage(payload);
  };

  const onPresetConfigLoadClick = () => {
    const input = document.getElementById("preset-config-url");
    if (input.value) {
      setPresetConfigUrl(input.value);
      setPresets(null);
      initialised.current = false;
    } else {
      toastr.warning("Could not load preset config as no URL is defined");
    }
  };

  const onPresetEditClick = (e, presetId) => {
    setEditedPresetId(presetId);

    e.preventDefault();
    e.stopPropagation();
  };

  const onLocalPresetOverride = () => {
    setLocalPresets(presets);
  };

  const onClearLocalPresets = () => {
    if (
      // eslint-disable-next-line no-restricted-globals
      confirm(
        "Are you sure you want to remove all local overrides? This can not be undone."
      )
    ) {
      setLocalPresets(null);
    }
  };

  const orderedPresets = useCallback(() => {
    const base = !!localPresets ? localPresets : presets;
    return base
      ? base.sort((a, b) =>
          a.label === b.label ? 0 : a.label < b.label ? -1 : 1
        )
      : [];
  }, [presets, localPresets]);

  const onAddNewPresetClick = () => {
    setEditedPresetId(null);
  };

  return (
    <Fragment>
      <div className="box">
        <label htmlFor="preset-config-url">Preset config URL</label>
        <div className="input-group">
          <input
            type="text"
            id="preset-config-url"
            defaultValue="http://localhost:3000/dev-socket.json"
          />
          <button onClick={() => onPresetConfigLoadClick()}>Load</button>
        </div>
        {!!localPresets && <div className="overlay"></div>}
      </div>

      <div className="hr"></div>

      {!!localPresets ? (
        <button onClick={() => onClearLocalPresets()}>
          Clear local overrides
        </button>
      ) : (
        <button onClick={() => onLocalPresetOverride()}>
          Use local presets
        </button>
      )}

      <div className="hr"></div>

      <ul className="preset-button-wrapper">
        {orderedPresets().map((preset, idx) => (
          <Fragment key={idx}>
            <li
              className={preset.id === editedPresetId ? "active" : ""}
              onClick={() => onPresetClick(preset.payload)}
            >
              {preset.label}
              {!!localPresets && (
                <button onClick={(e) => onPresetEditClick(e, preset.id)}>
                  Edit
                </button>
              )}
            </li>
          </Fragment>
        ))}
        {!!localPresets && (
          <li onClick={() => onAddNewPresetClick()}>Add new</li>
        )}
      </ul>
    </Fragment>
  );
}

export default PresetList;
