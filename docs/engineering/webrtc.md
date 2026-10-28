# WebRTC Signaling

IntellMeet uses Socket.io only as the signaling/control plane. Audio/video media is peer-to-peer WebRTC media and is never proxied through the Express process.

## Signaling events

Client -> server and relayed server -> target client:
- `webrtc:offer`
- `webrtc:answer`
- `webrtc:ice-candidate`

Media UI state:
- `media:state` with bounded boolean fields for audio/video/screen-sharing.

## Security rules

- A client must join and be authorized for the meeting before signaling.
- A target socket must currently belong to the same meeting room.
- A client cannot signal itself.
- SDP and ICE payload sizes are bounded.
- Signaling events are rate limited.
- SDP and ICE candidates are transient and are never persisted.

## Production NAT traversal

Peer-to-peer WebRTC still requires configured ICE servers (STUN/TURN) for reliable connectivity across restrictive networks. TURN credentials must be provided through a short-lived server-issued configuration in a later deployment/infrastructure phase; static TURN secrets must never be committed to the frontend.
