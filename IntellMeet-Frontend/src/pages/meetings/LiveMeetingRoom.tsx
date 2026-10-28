
import { useCallback, useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  PhoneOff,
  Users,
  Video,
} from 'lucide-react'
import { getAccessToken } from '../../api/client'

type Props = {
  meetingId: string
  title: string
  onLeave: () => void
}

type Participant = {
  socketId: string
  name: string
  stream?: MediaStream
}

const SOCKET_URL = (
  import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
).replace(/\/$/, '')

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
  ],
}

export default function LiveMeetingRoom({
  meetingId,
  title,
  onLeave,
}: Props) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [micEnabled, setMicEnabled] = useState(true)
  const [error, setError] = useState('')
  const [connecting, setConnecting] = useState(true)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map())
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map())
  const joinedRef = useRef(false)

  const closeConnections = useCallback(() => {
    peersRef.current.forEach(peer => peer.close())
    peersRef.current.clear()
    remoteStreamsRef.current.clear()

    localStreamRef.current?.getTracks().forEach(track => track.stop())
    localStreamRef.current = null

    socketRef.current?.disconnect()
    socketRef.current = null
    joinedRef.current = false
  }, [])

  useEffect(() => {
    let cancelled = false

    async function startMeeting() {
      try {
        const token = getAccessToken()

        if (!token) {
          throw new Error('Your login session has expired. Please sign in again.')
        }

        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Camera access requires localhost or a secure HTTPS connection.')
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        })

        if (cancelled) {
          stream.getTracks().forEach(track => track.stop())
          return
        }

        localStreamRef.current = stream

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }

        const socket = io(SOCKET_URL, {
          auth: { token },
          transports: ['websocket', 'polling'],
        })

        socketRef.current = socket

        function getPeer(socketId: string) {
          let peer = peersRef.current.get(socketId)

          if (!peer) {
            peer = new RTCPeerConnection(ICE_SERVERS)

            stream.getTracks().forEach(track => {
              peer!.addTrack(track, stream)
            })

            peer.ontrack = event => {
              const remoteStream = event.streams[0]
              if (!remoteStream) return

              remoteStreamsRef.current.set(socketId, remoteStream)

              setParticipants(current =>
                current.map(person =>
                  person.socketId === socketId
                    ? { ...person, stream: remoteStream }
                    : person,
                ),
              )
            }

            peer.onicecandidate = event => {
              if (!event.candidate || !socket.connected) return

              socket.emit('webrtc:ice-candidate', {
                meetingId,
                targetSocketId: socketId,
                candidate: event.candidate.toJSON(),
              })
            }

            peersRef.current.set(socketId, peer)
          }

          return peer
        }

        function sendOffer(socketId: string) {
          void (async () => {
            try {
              const peer = getPeer(socketId)
              const offer = await peer.createOffer()
              await peer.setLocalDescription(offer)

              socket.emit(
                'webrtc:offer',
                {
                  meetingId,
                  targetSocketId: socketId,
                  description: peer.localDescription,
                },
                (result: { ok?: boolean; error?: string }) => {
                  if (result?.ok === false) {
                    setError(result.error || 'Could not start the video connection.')
                  }
                },
              )
            } catch {
              setError('Could not establish a participant connection.')
            }
          })()
        }

        socket.on('connect', () => {
          socket.emit(
            'meeting:join',
            { meetingId },
            (result: {
              ok?: boolean
              error?: string
              peers?: Array<{ socketId: string; userId: string }>
            }) => {
              if (!result?.ok) {
                setError(result?.error || 'You could not join this meeting.')
                setConnecting(false)
                return
              }

              joinedRef.current = true
              setConnecting(false)

              const existingPeers = result.peers || []

              setParticipants(current => {
                const next = [...current]

                existingPeers.forEach(person => {
                  if (!next.some(item => item.socketId === person.socketId)) {
                    next.push({
                      socketId: person.socketId,
                      name: `Participant ${person.userId.slice(-4)}`,
                    })
                  }
                })

                return next
              })

              existingPeers.forEach(person => sendOffer(person.socketId))
            },
          )
        })

        socket.on('connect_error', () => {
          setError('Could not connect to the meeting server. Check that the backend is running and sign in again if needed.')
          setConnecting(false)
        })

        socket.on(
          'participant:joined',
          (event: {
            socketId: string
            user?: { name?: string }
            meetingId: string
          }) => {
            if (event.meetingId !== meetingId) return

            setParticipants(current => {
              if (current.some(person => person.socketId === event.socketId)) {
                return current
              }

              return [
                ...current,
                {
                  socketId: event.socketId,
                  name: event.user?.name || 'Participant',
                },
              ]
            })
          },
        )

        socket.on(
          'participant:left',
          (event: { socketId: string; meetingId: string }) => {
            if (event.meetingId !== meetingId) return

            peersRef.current.get(event.socketId)?.close()
            peersRef.current.delete(event.socketId)
            remoteStreamsRef.current.delete(event.socketId)

            setParticipants(current =>
              current.filter(person => person.socketId !== event.socketId),
            )
          },
        )

        socket.on(
          'webrtc:offer',
          async (event: {
            fromSocketId: string
            meetingId: string
            description: RTCSessionDescriptionInit
          }) => {
            if (event.meetingId !== meetingId) return

            try {
              const peer = getPeer(event.fromSocketId)
              await peer.setRemoteDescription(event.description)

              const answer = await peer.createAnswer()
              await peer.setLocalDescription(answer)

              socket.emit('webrtc:answer', {
                meetingId,
                targetSocketId: event.fromSocketId,
                description: peer.localDescription,
              })
            } catch {
              setError('Could not accept a participant video connection.')
            }
          },
        )

        socket.on(
          'webrtc:answer',
          async (event: {
            fromSocketId: string
            meetingId: string
            description: RTCSessionDescriptionInit
          }) => {
            if (event.meetingId !== meetingId) return

            try {
              const peer = peersRef.current.get(event.fromSocketId)
              if (peer && peer.signalingState === 'have-local-offer') {
                await peer.setRemoteDescription(event.description)
              }
            } catch {
              setError('Could not complete a participant video connection.')
            }
          },
        )

        socket.on(
          'webrtc:ice-candidate',
          async (event: {
            fromSocketId: string
            meetingId: string
            candidate: RTCIceCandidateInit
          }) => {
            if (event.meetingId !== meetingId) return

            try {
              const peer = peersRef.current.get(event.fromSocketId)
              if (peer && event.candidate) {
                await peer.addIceCandidate(event.candidate)
              }
            } catch {
              // An ICE candidate may arrive before its peer is ready.
            }
          },
        )
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Could not start your camera and microphone.',
          )
          setConnecting(false)
        }
      }
    }

    void startMeeting()

    return () => {
      cancelled = true

      if (socketRef.current && joinedRef.current) {
        socketRef.current.emit('meeting:leave', { meetingId })
      }

      closeConnections()
    }
  }, [meetingId, closeConnections])

  function toggleCamera() {
    const next = !cameraEnabled
    localStreamRef.current?.getVideoTracks().forEach(track => {
      track.enabled = next
    })
    setCameraEnabled(next)
  }

  function toggleMicrophone() {
    const next = !micEnabled
    localStreamRef.current?.getAudioTracks().forEach(track => {
      track.enabled = next
    })
    setMicEnabled(next)
  }

  function leaveMeeting() {
    if (socketRef.current && joinedRef.current) {
      socketRef.current.emit('meeting:leave', { meetingId })
    }

    closeConnections()
    onLeave()
  }

  return (
    <section className="live-meeting">
      <header className="live-meeting-header">
        <div>
          <span className="live-indicator">LIVE ROOM</span>
          <h2>{title}</h2>
          <p>{participants.length + 1} connected participant(s)</p>
        </div>
        <button className="button button-secondary" onClick={leaveMeeting}>
          <PhoneOff size={16} /> Leave meeting
        </button>
      </header>

      {error && <div className="live-meeting-error">{error}</div>}

      {connecting && (
        <div className="live-meeting-message">
          Connecting to the meeting…
        </div>
      )}

      <div className="live-video-grid">
        <article className="live-video-tile">
          <video ref={localVideoRef} autoPlay muted playsInline />
          <span className="live-video-name">You</span>
          {!cameraEnabled && (
            <div className="live-video-overlay">
              <CameraOff size={30} />
              <span>Camera off</span>
            </div>
          )}
        </article>

        {participants.map(person => (
          <article className="live-video-tile" key={person.socketId}>
            {person.stream ? (
              <video
                autoPlay
                playsInline
                ref={element => {
                  if (element && person.stream && element.srcObject !== person.stream) {
                    element.srcObject = person.stream
                  }
                }}
              />
            ) : (
              <div className="live-video-placeholder">
                <Users size={32} />
                <span>Waiting for video…</span>
              </div>
            )}
            <span className="live-video-name">{person.name}</span>
          </article>
        ))}
      </div>

      <footer className="live-meeting-controls">
        <button
          className={`live-control ${!micEnabled ? 'is-off' : ''}`}
          onClick={toggleMicrophone}
        >
          {micEnabled ? <Mic size={19} /> : <MicOff size={19} />}
          {micEnabled ? 'Mute' : 'Unmute'}
        </button>

        <button
          className={`live-control ${!cameraEnabled ? 'is-off' : ''}`}
          onClick={toggleCamera}
        >
          {cameraEnabled ? <Camera size={19} /> : <CameraOff size={19} />}
          {cameraEnabled ? 'Stop video' : 'Start video'}
        </button>

        <button className="live-control leave-control" onClick={leaveMeeting}>
          <PhoneOff size={19} /> Leave
        </button>
      </footer>

      {!error && !connecting && participants.length === 0 && (
        <p className="live-meeting-message">
          You are the first participant here. Share this meeting with another
          authorized participant to test live video.
        </p>
      )}
    </section>
  )
}
