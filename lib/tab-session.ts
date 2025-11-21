// Sistema de sessões múltiplas por guia usando sessionStorage
// Permite ter sessões diferentes em guias diferentes do mesmo navegador

export interface TabSession {
  id: string;
  email: string;
  name: string;
  role: string;
  userId: string;
  createdAt: number;
}

const TAB_SESSION_KEY = "tabSession";

export function saveTabSession(session: Omit<TabSession, "createdAt">) {
  if (typeof window !== "undefined") {
    const tabSession: TabSession = {
      ...session,
      createdAt: Date.now(),
    };
    sessionStorage.setItem(TAB_SESSION_KEY, JSON.stringify(tabSession));
  }
}

export function getTabSession(): TabSession | null {
  if (typeof window !== "undefined") {
    const stored = sessionStorage.getItem(TAB_SESSION_KEY);
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

export function clearTabSession() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(TAB_SESSION_KEY);
  }
}

export function hasTabSession(): boolean {
  return getTabSession() !== null;
}

