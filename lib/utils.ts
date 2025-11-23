import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Validar ObjectId do MongoDB
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

// Formatar horário para exibição no fuso horário de Brasília (formato brasileiro 24h)
export function formatTimeBrasilia(time: string): string {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const mins = parseInt(minutes);
  
  // Criar data no fuso horário de Brasília
  const today = new Date();
  const brasiliaDate = new Date(today.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const timeDate = new Date(brasiliaDate);
  timeDate.setHours(hour, mins, 0, 0);
  
  // Formatar no formato brasileiro (24 horas) no fuso de Brasília
  return timeDate.toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // Formato 24 horas (padrão brasileiro)
  });
}

// Filtrar horários que já passaram quando a data é hoje (fuso horário de Brasília)
export function filterPastSlots(
  slots: { startTime: string; endTime: string }[],
  selectedDate: string
): { startTime: string; endTime: string }[] {
  // Verificar se slots é um array válido
  if (!slots || !Array.isArray(slots) || slots.length === 0) return [];
  
  // Obter data e hora atual no fuso horário de Brasília
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  
  const parts = formatter.formatToParts(now);
  const year = parts.find(p => p.type === "year")?.value || "";
  const month = parts.find(p => p.type === "month")?.value || "";
  const day = parts.find(p => p.type === "day")?.value || "";
  const hour = parts.find(p => p.type === "hour")?.value || "0";
  const minute = parts.find(p => p.type === "minute")?.value || "0";
  
  const todayBrasilia = `${year}-${month}-${day}`;
  
  // Se a data selecionada não for hoje, retornar todos os slots
  if (selectedDate !== todayBrasilia) {
    return slots;
  }
  
  // Se for hoje, filtrar horários que já passaram
  const currentHour = parseInt(hour) || 0;
  const currentMinute = parseInt(minute) || 0;
  const currentTimeMinutes = currentHour * 60 + currentMinute;
  
  return slots.filter((slot) => {
    if (!slot || !slot.startTime) return false;
    
    const timeParts = slot.startTime.split(":");
    if (timeParts.length !== 2) return false;
    
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);
    
    if (isNaN(hours) || isNaN(minutes)) return false;
    
    const slotTimeMinutes = hours * 60 + minutes;
    
    // Manter apenas horários futuros (com pelo menos 1 minuto de diferença)
    return slotTimeMinutes > currentTimeMinutes;
  });
}