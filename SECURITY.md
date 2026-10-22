# Security and authority boundary

This is an **untrusted, unprivileged browser shell**. It is not an OS, operator console, or privileged agent runtime.

## Edition 01 guarantees and non-guarantees

- There are no outbound API calls to the local PhiOS runtime, no tokens or secret storage, and no WebSocket bridge.
- Project navigation uses human-clicked links with `target="_blank"` and `rel="noopener noreferrer"`. Links are static and HTTPS.
- The portal catalog is local data, not executable code or a trusted record of the remote projects' state.
- WebXR feature detection and session requests use browser permission flows. Optional hand input may not be available.
- This preview **does not prove headset compatibility** until it is tested on real Quest hardware.
- Browser WebXR capabilities vary; passthrough pixels are not exposed to the app by the AR background.
- Nothing in the scene should be interpreted as a security boundary or a machine-generated operator approval.

## Bridge prerequisites (not implemented)

A future host bridge **must not** simply expose Python MCP tools over a public endpoint. Before any runtime connection:

1. Threat-model untrusted browser origin, CSRF, CORS, WebSocket origin spoofing, physical device theft and compromised links.
2. Bind authenticated requests to a named paired device/session and explicit, revocable operator approval.
3. Keep read-only telemetry separate from any actions; a UI click is not an effect grant.
4. Bind capability, parameters, scope, expiry, and use count; refuse unknown commands by default.
5. Revalidate and receipt effects server-side. Do not place PhiOS authority secrets in the headset JavaScript bundle or localStorage.
6. Add CI tests for denial, expiry, replay, disconnect, and audit-record integrity before enabling a privileged adapter.

Safety: Always use immersive software in a cleared play area and follow headset boundary guidance. This preview does not implement guardian or real-world obstacle detection.

Report security issues privately to the maintainers rather than posting exploit details in a public issue.
