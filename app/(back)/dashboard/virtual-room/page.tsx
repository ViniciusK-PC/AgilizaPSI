import VirtualRoom from "@/components/Dashboard/VirtualRoom/VirtualRoom";

export default function VirtualRoomPage() {
  return (
    <div className="p-6">
      <VirtualRoom 
        appointmentId="demo-123" 
        patientName="João da Silva"
        psychologistName="Dra. Maria Santos"
      />
    </div>
  );
}

