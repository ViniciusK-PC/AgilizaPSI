"use client";

import PsychologistChat from "@/components/Dashboard/Chat/PsychologistChat";

export const dynamic = 'force-dynamic';

export default function MessagesPage() {
  return (
    <div className="p-6">
      <PsychologistChat />
    </div>
  );
}

