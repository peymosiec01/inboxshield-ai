# Frontend Setup

The React app is built once and then served by the backend on port `3001`. For the Outlook add-in flow, tunnel the backend host, not the React dev server.

## Local Build

```powershell
npm install
npm run build
```

The task pane reads the API base URL from `REACT_APP_BACKEND_URL`.

Default:

```env
REACT_APP_BACKEND_URL=http://localhost:3001
```

Override it in `.env.development.local` if needed before building.

## Manifest

- [manifest.template.xml](c:/Users/Moses.Babalola/Documents/inboxshield-ai/frontend/manifest.template.xml) is the source template for the command manifest.
- [manifest.xml](c:/Users/Moses.Babalola/Documents/inboxshield-ai/frontend/manifest.xml) is the generated file you install in Outlook.

Stamp your public HTTPS tunnel URL into `manifest.xml`:

```powershell
npm run manifest:tunnel -- https://your-ngrok-domain.ngrok-free.app
```

After that, install [manifest.xml](c:/Users/Moses.Babalola/Documents/inboxshield-ai/frontend/manifest.xml) in Outlook.

## ngrok

Expose the backend because it serves both the API and the built task pane:

```powershell
ngrok http 3001
```

Use the HTTPS forwarding URL from ngrok with `npm run manifest:tunnel`.

## Outlook on Windows Loopback

If Outlook cannot open `localhost`, add the WebView loopback exemption:

```powershell
CheckNetIsolation LoopbackExempt -a -n="microsoft.win32webviewhost_cw5n1h2txyewy"
```
