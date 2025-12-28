const Training = () => {
  return (
    <div className="pt-28 px-6 max-w-6xl mx-auto text-gray-900">
      <h1 className="text-4xl font-bold mb-4">🧠 Model Training</h1>
      <p className="mb-6 text-lg">
        Train or update the unified multi-task learning model (climate + crop + outbreak).
      </p>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold">📥 Upload Dataset</h2>

        <input
          type="file"
          className="mt-4 p-3 border rounded w-full"
        />

        <button className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg font-bold">
          Start Training
        </button>
      </div>

      <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">📊 Training Status</h2>
        
        <div className="p-4 border rounded-lg bg-gray-50">
          <p>Model Status: <span className="font-bold">Idle</span></p>
        </div>
      </div>
    </div>
  );
};

export default Training;
