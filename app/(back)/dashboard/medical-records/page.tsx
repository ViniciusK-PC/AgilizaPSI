import MedicalRecordsList from "@/components/Dashboard/MedicalRecords/MedicalRecordsList";

export const dynamic = 'force-dynamic';

export default function MedicalRecordsPage() {
  return (
    <div className="p-6">
      <MedicalRecordsList />
    </div>
  );
}

