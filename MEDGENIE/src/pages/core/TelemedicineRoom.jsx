import { useState, useRef } from "react";

const TelemedicineRoom = () => {
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);

  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState("");

  // Fake WebRTC starter (placeholder)
  const joinRoom = () => {
    if (!roomId.trim()) {
      alert("Enter room ID");
      return;
    }
    setJoined(true);

    // Placeholder: In real WebRTC you attach local/remote streams
    if (localVideo.current) {
      localVideo.current.srcObject = null;
    }
    if (remoteVideo.current) {
      remoteVideo.current.srcObject = null;
    }

    console.log("Joined room:", roomId);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-4xl font-bold mb-6">Telemedicine Room</h1>
      <p className="text-gray-300 mb-10">
        Connect rural patients with urban doctors using live video + real-time translation (Groq).
      </p>

      {/* Join Room UI */}
      {!joined && (
        <div className="bg-gray-800 p-6 rounded-xl w-full max-w-lg">
          <h2 className="text-xl mb-4">Enter Room Code</h2>

          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Example: room123"
            className="w-full p-3 rounded bg-gray-700 text-white outline-none"
          />

          <button
            onClick={joinRoom}
            className="w-full mt-4 bg-purple-600 px-4 py-3 rounded-lg hover:bg-purple-700"
          >
            Join Telemedicine Call
          </button>
        </div>
      )}

      {/* Video Call UI */}
      {joined && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">

          {/* Local Video */}
          <div className="bg-gray-800 p-4 rounded-xl">
            <h2 className="mb-2 font-semibold">Your Camera</h2>
            <video
              ref={localVideo}
              autoPlay
              playsInline
              className="w-full h-72 bg-black rounded-lg"
            />
          </div>

          {/* Remote Video */}
          <div className="bg-gray-800 p-4 rounded-xl">
            <h2 className="mb-2 font-semibold">Doctor / Patient</h2>
            <video
              ref={remoteVideo}
              autoPlay
              playsInline
              className="w-full h-72 bg-black rounded-lg"
            />
          </div>

        </div>
      )}

      {/* Translation Panel */}
      {joined && (
        <div className="mt-10 bg-gray-800 p-6 rounded-xl">
          <h2 className="mb-3 font-semibold">Live Translation (Coming Soon)</h2>
          <p className="text-gray-400">
            This will use Groq Realtime API to translate Punjabi ↔ Hindi ↔ English in real time.
          </p>
        </div>
      )}
    </div>
  );
};

export default TelemedicineRoom;
