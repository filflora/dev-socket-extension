import React, {
  useState,
  useRef,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { ConfigContext } from "../App";
import toastr from "toastr";
import copyToClipboard from "clipboard-copy";

function MessageEditor(props) {
  const {
    editedPresetId,
    setEditedPresetId,
    sendMessage,
    localPresets,
    setLocalPresets,
  } = useContext(ConfigContext);
  const textareaRef = useRef();
  const inputRef = useRef();

  const [validatorOutput, setValidatorOutput] = useState("");

  const [editorValue, setEditorValue] = useState("");

  const validateValue = useCallback(() => {
    try {
      const message = JSON.parse(textareaRef.current.value);
      setValidatorOutput(null);
      setEditorValue(JSON.stringify(message, null, 4));
    } catch (e) {
      setValidatorOutput(e.toString());
    }
  }, [textareaRef, setValidatorOutput]);

  useEffect(() => {
    const editedPreset =
      localPresets &&
      localPresets.find((preset) => preset.id === editedPresetId);
    if (editedPreset) {
      let newValue = "";
      try {
        const payload = JSON.parse(editedPreset.payload);
        newValue = payload && JSON.stringify(payload, null, 4);
      } catch (e) {
        // we have an error so we cant format object. Show it as-is.
        newValue = editedPreset.payload;
      }

      inputRef.current.value = editedPreset.label;
      textareaRef.current.value = newValue;
      validateValue();
    } else {
      // no edited preset available, prepare to add one
      inputRef.current.value = "";
      textareaRef.current.value = "";
      validateValue();
    }
  }, [localPresets, editedPresetId, validateValue]);

  const onEditorInput = () => {
    validateValue();
  };

  const onEditorBlur = () => {
    try {
      const message = JSON.parse(textareaRef.current.value);
      textareaRef.current.value = JSON.stringify(message, null, 4);
    } catch (e) {}
  };

  const onSaveClick = () => {
    if (
      !validatorOutput ||
      (validatorOutput &&
        // eslint-disable-next-line no-restricted-globals
        confirm(
          "The current message is invalid. Are you sure you want to save it?"
        ))
    ) {
      const editedPreset = {
        ...localPresets.find((preset) => preset.id === editedPresetId),
        label: inputRef.current.value,
        payload: textareaRef.current.value,
      };
      const newPresets = [
        ...localPresets.filter((preset) => preset.id !== editedPresetId),
        editedPreset,
      ];
      setLocalPresets(newPresets);
      toastr.success("Saved");
    }
  };

  const onDeleteClick = () => {
    if (
      // eslint-disable-next-line no-restricted-globals
      confirm("Are you sure you want to remove this preset?")
    ) {
      const newPresets = [
        ...localPresets.filter((preset) => preset.id !== editedPresetId),
      ];
      setLocalPresets(newPresets);
      setEditedPresetId(null);
      toastr.success("Deleted");
    }
  };

  const onSaveNewClick = () => {
    if (!inputRef.current.value) {
      alert("Please add a preset label name");
      return false;
    }

    if (
      !validatorOutput ||
      (validatorOutput &&
        // eslint-disable-next-line no-restricted-globals
        confirm(
          "The current message is invalid. Are you sure you want to save it?"
        ))
    ) {
      const newPreset = {
        id:
          Math.max.apply(
            null,
            localPresets.map((preset) => preset.id)
          ) + 1,
        label: inputRef.current.value,
        payload: textareaRef.current.value,
      };

      const newPresets = [...localPresets, newPreset];
      setLocalPresets(newPresets);
      setEditedPresetId(newPreset.id);
    }
  };

  const onSendMessageClick = () => {
    if (
      !validatorOutput ||
      (validatorOutput &&
        // eslint-disable-next-line no-restricted-globals
        confirm(
          "The current message is invalid. Are you sure you want to send it?"
        ))
    ) {
      sendMessage(textareaRef.current.value);
    }
  };

  const onExportClick = () => {
    const output = JSON.stringify(localPresets, null, 4);
    copyToClipboard(output)
      .then(() => toastr.success("Presets copied to clipboard"))
      .catch((e) =>
        toastr.error(
          'Could not copy presets to clipboard. Try again or look for "presets" in dev-tools localStorage.'
        )
      );
  };

  return (
    <div className="editor-container">
      <div className="editor-workarea">
        <input type="text" ref={inputRef} />
        <textarea
          ref={textareaRef}
          className={validatorOutput ? "invalid" : "valid"}
          defaultValue={editorValue}
          onInput={() => onEditorInput()}
          onBlur={() => onEditorBlur()}
        ></textarea>
        <div id="validator-output">
          <div
            className={"indicator " + (validatorOutput ? "invalid" : "valid")}
          ></div>
          <div className="message">
            {validatorOutput ? validatorOutput : "Valid JSON structure"}
          </div>
        </div>
      </div>
      <div className="editor-panel">
        <button
          className="send-message-btn"
          onClick={() => onSendMessageClick()}
        >
          Send message
        </button>

        {editedPresetId && !!localPresets && (
          <button onClick={() => onSaveClick()}>Save preset</button>
        )}
        {!editedPresetId && !!localPresets && (
          <button onClick={() => onSaveNewClick()}>Create preset</button>
        )}

        <div className="stretch"></div>

        {editedPresetId && !!localPresets && (
          <button className='delete-preset-btn' onClick={() => onDeleteClick()}>Delete preset</button>
        )}

        {!!localPresets && (
          <button onClick={() => onExportClick()}>Export presets</button>
        )}
      </div>
    </div>
  );
}

// MessageEditor.props = {
//     message: ReactProps
// }

export default MessageEditor;
