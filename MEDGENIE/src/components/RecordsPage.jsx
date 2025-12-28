import MedicalIndexer from "../components/MedicalIndexer";
import MedicalSearch from "../components/MedicalSearch";

export default function RecordsPage() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-8 text-center">🧠 Medical Knowledge Engine</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <MedicalIndexer />
        <MedicalSearch />
      </div>
    </div>
  );
}
