import { useState } from "react";

const MedicalUpload = () => {
  const [file, setFile] = useState(null);

  const uploadRecord = async () => {
    const token = localStorage.getItem("token");

    const form = new FormData();
    form.append("file", file);
    form.append("record_type", "ECG");

    const res = await fetch("http://127.0.0.1:8000/api/upload/", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    alert(res.status === 201 ? "Uploaded!" : "Upload failed");
  };

  return (
    <div className="pt-32 px-6 max-w-xl mx-auto">

      <h1 className="text-3xl font-bold mb-6 dark:text-white">
        Upload Medical Record
      </h1>

      <label
        className="block p-10 text-center border-2 border-dashed rounded-2xl 
        bg-white dark:bg-[#1e1b4b] shadow-lg dark:border-gray-700 cursor-pointer"
      >
        <input
          type="file"
          className="hidden"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <p className="text-lg dark:text-gray-200">
          {file ? file.name : "Click to select a file"}
        </p>
      </label>

      <button
        onClick={uploadRecord}
        className="mt-6 px-10 py-3 rounded-xl text-white font-bold shadow-lg"
        style={{
          background: "linear-gradient(135deg, #7c3aed, #2563eb)",
        }}
      >
        Upload →
      </button>
    </div>
  );
};

export default MedicalUpload;
