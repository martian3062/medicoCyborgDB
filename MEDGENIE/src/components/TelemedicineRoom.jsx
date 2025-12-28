import { useRef, useState } from "react";

const TelemedicineRoom = () => {
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peerConnection = useRef(null);

  const [inCall, setInCall] = useState(false);
  const [doctorConnected, setDoctorConnected] = useState(false);
  const [translation, setTranslation] = useState("");

  const servers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:global.stun.twilio.com:3478?transport=udp" }
    ]
  };

  // -----------------------------
  // START CALL
  // -----------------------------
  const startCall = async () => {
    setInCall(true);
    peerConnection.current = new RTCPeerConnection(servers);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    localVideo.current.srcObject = stream;
    stream.getTracks().forEach((track) =>
      peerConnection.current.addTrack(track, stream)
    );

    peerConnection.current.ontrack = (event) => {
      remoteVideo.current.srcObject = event.streams[0];
      setDoctorConnected(true);
    };

    console.log("WebRTC call initialized.");
  };

  // -----------------------------
  // END CALL
  // -----------------------------
  const endCall = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    setInCall(false);
    setDoctorConnected(false);
  };

  return (
    <div className="p-10 text-white min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950">

      <h1 className="text-4xl font-bold mb-2">💬 Telemedicine Room</h1>
      <p className="text-gray-400 mb-10 max-w-3xl">
        Connect doctors to rural patients using WebRTC video + Groq-powered translation.  
        Assist ASHA workers and remote villages with real-time medical communication.
      </p>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Local User */}
        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/20">
          <h2 className="text-xl font-semibold mb-2">👤 Your Video</h2>
          <video
            ref={localVideo}
            autoPlay
            playsInline
            muted
            className="w-full h-64 bg-black rounded-lg"
          ></video>
        </div>

        {/* Remote Doctor */}
        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/20">
          <h2 className="text-xl font-semibold mb-2">👨‍⚕️ Doctor</h2>
          {!doctorConnected && (
            <p className="text-gray-400 text-sm mb-2">Waiting for doctor to join...</p>
          )}
          <video
            ref={remoteVideo}
            autoPlay
            playsInline
            className="w-full h-64 bg-black rounded-lg"
          ></video>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4 mb-10">
        {!inCall ? (
          <button
            onClick={startCall}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold text-white"
          >
            ▶ Start Call
          </button>
        ) : (
          <button
            onClick={endCall}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold text-white"
          >
            🔴 End Call
          </button>
        )}
      </div>

      {/* Live Translation Box */}
      <div className="bg-white/10 p-6 rounded-xl border border-white/20 max-w-3xl backdrop-blur-md">
        <h2 className="text-xl font-semibold mb-3">🌍 Real-Time Translation (Groq)</h2>

        <textarea
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
          placeholder="Speak or type — will translate to patient language..."
          className="w-full p-3 rounded-lg bg-black/40 border border-white/20 text-white h-32"
        />

        <button
          className="mt-3 bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg font-semibold"
        >
          Translate (Coming Soon)
        </button>
      </div>

    </div>
  );
};

export default TelemedicineRoom;
