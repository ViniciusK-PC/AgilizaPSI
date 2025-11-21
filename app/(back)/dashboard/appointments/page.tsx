import AppointmentsList from "@/components/Dashboard/Appointments/AppointmentsList";

export const dynamic = 'force-dynamic';

export default function AppointmentsPage() {
  return (
    <div className="p-6">
      <AppointmentsList />
    </div>
  );
}


