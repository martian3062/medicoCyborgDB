import { useEffect, useRef, useState } from "react";

const VideoConference = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [ws, setWs] = useState(null);
  const [peer, setPeer] = useState(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3001");
    setWs(socket);

    let rtcPeer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
      ]
    });
    setPeer(rtcPeer);

    // Get user camera
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach(track => rtcPeer.addTrack(track, stream));
      });

    // When receiving ICE candidates
    rtcPeer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(JSON.stringify({ type: "candidate", candidate: event.candidate }));
      }
    };

    // When receiving remote stream
    rtcPeer.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    // WebSocket message listener
    socket.onmessage = async (msg) => {
      const data = JSON.parse(msg.data);

      if (data.type === "offer") {
        await rtcPeer.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await rtcPeer.createAnswer();
        await rtcPeer.setLocalDescription(answer);

        socket.send(JSON.stringify({ type: "answer", answer })); 
      }

      else if (data.type === "answer") {
        await rtcPeer.setRemoteDescription(new RTCSessionDescription(data.answer));
      }

      else if (data.type === "candidate" && data.candidate) {
        try {
          await rtcPeer.addIceCandidate(data.candidate);
        } catch (e) {
          console.error("Error adding ICE:", e);
        }
      }
    };
  }, []);

  // Start Call
  const startCall = async () => {
    if (!peer || !ws) return;

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    ws.send(JSON.stringify({ type: "offer", offer }));
  };

  return (
    <div className="p-10 text-center">
      <h2 className="text-3xl font-semibold mb-4">Video Consultation</h2>

      <div className="grid grid-cols-2 gap-6 justify-center">
        <div>
          <h3 className="mb-2 font-semibold">Your Camera</h3>
          <video ref={localVideoRef} autoPlay playsInline className="w-full border rounded" />
        </div>

        <div>
          <h3 className="mb-2 font-semibold">Remote Doctor</h3>
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full border rounded" />
        </div>
      </div>

      <button
        onClick={startCall}
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg"
      >
        Start Call
      </button>
    </div>
  );
};

export default VideoConference;
