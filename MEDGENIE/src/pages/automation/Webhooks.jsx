const Webhooks = () => {
  return (
    <div className="pt-28 px-6 max-w-6xl mx-auto text-gray-900">
      <h1 className="text-4xl font-bold mb-4">🔗 Webhook Integrations</h1>
      <p className="mb-6 text-lg">
        Connect MedGenie’s forecasting and AI systems with your preferred automation tools.
      </p>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">📡 Available Webhooks</h2>

        <div className="mt-4 space-y-4">

          <div className="bg-gray-50 p-4 rounded-lg border">
            <p className="font-semibold">🌦 Climate Forecast Webhook</p>
            <p className="text-sm text-gray-600">Triggers every 6 hours with IMD updates.</p>
            <code className="text-purple-700">
              https://your-backend/api/webhook/climate-update/
            </code>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border">
            <p className="font-semibold">🌾 Crop Recommendation Webhook</p>
            <p className="text-sm text-gray-600">Runs when IMD rainfall forecast changes.</p>
            <code className="text-purple-700">
              https://your-backend/api/webhook/crop-update/
            </code>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border">
            <p className="font-semibold">🦠 Outbreak Detection Webhook</p>
            <p className="text-sm text-gray-600">Triggers when humidity spikes + IMD signals risk.</p>
            <code className="text-purple-700">
              https://your-backend/api/webhook/disease-update/
            </code>
          </div>

        </div>
      </div>

      <div className="mt-8 p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">🔧 Connect with n8n</h2>
        <p>Create an HTTP Trigger node and paste the above URLs.</p>
      </div>
    </div>
  );
};

export default Webhooks;
