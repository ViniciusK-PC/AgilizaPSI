// Utilitário para gerenciar múltiplas sessões simultâneas
// Permite manter sessões de admin e profissional ao mesmo tempo

export interface SavedSession {
  email: string;
  name: string;
  role: string;
  id: string;
  savedAt: number;
}

const ADMIN_SESSION_KEY = "adminSession";
const PROFESSIONAL_SESSION_KEY = "professionalSession";

export function saveAdminSession(session: Omit<SavedSession, "savedAt">) {
  if (typeof window !== "undefined") {
    const savedSession: SavedSession = {
      ...session,
      savedAt: Date.now(),
    };
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(savedSession));
  }
}

export function saveProfessionalSession(session: Omit<SavedSession, "savedAt">) {
  if (typeof window !== "undefined") {
    const savedSession: SavedSession = {
      ...session,
      savedAt: Date.now(),
    };
    localStorage.setItem(PROFESSIONAL_SESSION_KEY, JSON.stringify(savedSession));
  }
}

export function getAdminSession(): SavedSession | null {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(ADMIN_SESSION_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function getProfessionalSession(): SavedSession | null {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(PROFESSIONAL_SESSION_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function clearAdminSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }
}

export function clearProfessionalSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(PROFESSIONAL_SESSION_KEY);
  }
}

