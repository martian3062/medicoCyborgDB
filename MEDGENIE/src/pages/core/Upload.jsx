import { useState } from "react";
import { FiUploadCloud } from "react-icons/fi";

const Upload = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  const uploadFile = async () => {
    if (!file) {
      alert("Select a file first!");
      return;
    }

    const form = new FormData();
    form.append("file", file);
    form.append("record_type", "AIMedical");

    const res = await fetch("http://127.0.0.1:8000/api/upload/", {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: form,
    });

    if (res.status === 201) setStatus("Uploaded Successfully ✔");
    else setStatus("Upload Failed ❌");
  };

  return (
    <div className="min-h-screen pt-24 px-8 bg-gradient-to-br from-gray-900 via-black to-gray-950 text-white">

      <h1 className="text-4xl font-bold mb-6">📤 Upload Medical File</h1>
      <p className="text-gray-300 mb-8">Upload reports, ECG, scans or labs for instant AI analysis.</p>

      <div className="bg-white/10 p-8 rounded-2xl border border-white/20 max-w-xl">
        <div className="flex flex-col items-center gap-4">

          <FiUploadCloud className="text-6xl text-blue-400" />

          <input
            type="file"
            className="w-full border border-gray-500 bg-white/10 p-3 rounded text-white"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button
            onClick={uploadFile}
            className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg w-full font-semibold"
          >
            Upload
          </button>
        </div>

        {status && (
          <p className="mt-4 text-center text-lg font-semibold text-green-400">{status}</p>
        )}
      </div>

    </div>
  );
};

export default Upload;
