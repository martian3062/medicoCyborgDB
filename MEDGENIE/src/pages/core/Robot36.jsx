import { useState, useEffect } from "react";

const Robot36Demo = () => {
  const [image, setImage] = useState(null);
  const [audioURL, setAudioURL] = useState("");
  const [encoderReady, setEncoderReady] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.Robot36Encoder) {
        setEncoderReady(true);
        clearInterval(interval);
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImage(URL.createObjectURL(file));
  };

  const generateAudio = () => {
    if (!encoderReady) {
      alert("Encoder not ready yet. Wait 1 second.");
      return;
    }
    if (!image) return;

    const img = new Image();
    img.src = image;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 240;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, 320, 240);

      const imgData = ctx.getImageData(0, 0, 320, 240);

      const wavBlob = window.Robot36Encoder.encode(imgData);
      const url = URL.createObjectURL(wavBlob);

      setAudioURL(url);
    };
  };

  return (
    <div className="p-10 text-white min-h-screen bg-black">
      <h1 className="text-3xl font-bold mb-4">📡 Robot36 SSTV Encoder</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="mb-4"
      />

      <button
        onClick={generateAudio}
        className="bg-purple-700 px-4 py-2 rounded"
      >
        Convert to Robot36 Audio
      </button>

      {image && (
        <div className="mt-6">
          <p className="mb-2">Preview:</p>
          <img src={image} alt="preview" className="h-40 border" />
        </div>
      )}

      {audioURL && (
        <div className="mt-6">
          <h2 className="mb-2 text-xl">Generated Audio:</h2>
          <audio controls src={audioURL}></audio>
          <a
            href={audioURL}
            download="robot36.wav"
            className="block mt-4 underline"
          >
            Download WAV
          </a>
        </div>
      )}
    </div>
  );
};

export default Robot36Demo;
