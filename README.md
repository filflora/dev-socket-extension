This project is created to make development with WebSocket easier. Its main purpose is to send WebSocket messages through a development server on localhost with predefined message presets that can be edited.

NOTE: This extension can only be used with [dev-socket-server](https://www.npmjs.com/package/dev-socket-server).



## Prepare the Server
Install [dev-socket-server](https://www.npmjs.com/package/dev-socket-server) on your local machine with `npm` or `yarn`. You can choose to install it globally so you can use the `dev-socket` command anywhere.

```
> npm install dev-socket-server --global

// OR

> yarn global add dev-socket-server
```

Start up the server with the `dev-socket` command in your terminal. The default PORT is `3100` which you can change with the `--port` flag in case it is already used:

```
> dev-socket
```

## Prepare the Extension

Use the [dev-socket-extension.crx](https://github.com/filflora/dev-socket-extension/blob/master/dev-socket-extension.crx) file to load the extension to Chrome.

NOTE: Chrome Store publication is pending. Until then the direct file method needs to be used.

Once the extension is loaded open up dev-tools and look for the "DevSocket" tab in the top.

When the tab is activated an automatic connection attempt is requested to the `dev-socket-server` on `http://localhost:3100/health` (PORT might differ if you changed that when starting the server).

## Presets from file
Presets can be loaded from a `dev-socket.json` configuration file served on `http://localhost:3000/dev-socket.json`. The content should be following this pattern:

```json
{
    "messages": [{
        "id": 1,
        "label": "Win game",
        "payload": { "type": "update-status", "status": "won" }
    }, {
        "id": 2,
        "label": "Update score - invalid",

        // Note: the payload can be a string 
        // so invalid JSON messages can be tested too.
        "payload": "{ \"type\": \"update-score\", \"score\": undefined }"
    }]
}
```

## Local presets

If you click `Use local presets` all the presets are stored in localStorage and the list becomes editable. You can rename it, change the message content (even to an invalid JSON), delete it and send it through the server.

## Export

There is an `Export presets` button on the right-bottom corner where you can copy the current preset configuration to your clipboard. Optionally you can copy it from the localStorage directly just open the dev-tools of the Extension and go to Application > localStorage.


