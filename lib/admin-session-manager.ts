// Gerenciador de sessão única para admin
// Garante que apenas uma guia de admin possa estar ativa por vez

import { clearTabSession } from "./tab-session";
import { clearAdminSession } from "./multi-session";
import { signOut } from "next-auth/react";

const ADMIN_SESSION_LOCK_KEY = "admin_session_lock";
const ADMIN_SESSION_EVENT_KEY = "admin_session_changed";

export interface AdminSessionLock {
  tabId: string;
  userId: string;
  email: string;
  timestamp: number;
}

// Gerar um ID único para esta guia
export function getTabId(): string {
  if (typeof window === "undefined") return "";
  
  let tabId = sessionStorage.getItem("tab_id");
  if (!tabId) {
    tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("tab_id", tabId);
  }
  return tabId;
}

// Bloquear sessão de admin para esta guia
export function lockAdminSession(userId: string, email: string): void {
  if (typeof window === "undefined") return;
  
  const lock: AdminSessionLock = {
    tabId: getTabId(),
    userId,
    email,
    timestamp: Date.now(),
  };
  
  localStorage.setItem(ADMIN_SESSION_LOCK_KEY, JSON.stringify(lock));
  
  // Notificar outras guias que uma nova sessão de admin foi criada
  window.dispatchEvent(new StorageEvent("storage", {
    key: ADMIN_SESSION_EVENT_KEY,
    newValue: JSON.stringify(lock),
    storageArea: localStorage,
  }));
  
  // Também usar BroadcastChannel se disponível (mais confiável)
  if (typeof BroadcastChannel !== "undefined") {
    const channel = new BroadcastChannel("admin_session");
    channel.postMessage({ type: "admin_login", lock });
  }
}

// Verificar se esta guia tem o lock de admin
export function hasAdminLock(): boolean {
  if (typeof window === "undefined") return false;
  
  const lockStr = localStorage.getItem(ADMIN_SESSION_LOCK_KEY);
  if (!lockStr) return false;
  
  try {
    const lock: AdminSessionLock = JSON.parse(lockStr);
    return lock.tabId === getTabId();
  } catch {
    return false;
  }
}

// Obter o lock atual de admin
export function getAdminLock(): AdminSessionLock | null {
  if (typeof window === "undefined") return null;
  
  const lockStr = localStorage.getItem(ADMIN_SESSION_LOCK_KEY);
  if (!lockStr) return null;
  
  try {
    return JSON.parse(lockStr);
  } catch {
    return null;
  }
}

// Limpar o lock de admin (quando admin faz logout)
export function clearAdminLock(): void {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem(ADMIN_SESSION_LOCK_KEY);
  
  // Notificar outras guias
  if (typeof BroadcastChannel !== "undefined") {
    const channel = new BroadcastChannel("admin_session");
    channel.postMessage({ type: "admin_logout" });
  }
}

// Verificar se outra guia tem o lock de admin
export function isOtherTabAdmin(): boolean {
  if (typeof window === "undefined") return false;
  
  const lock = getAdminLock();
  if (!lock) return false;
  
  return lock.tabId !== getTabId();
}

// Limpar sessão de admin desta guia (chamado quando outra guia faz login como admin)
export async function clearCurrentAdminSession(): Promise<void> {
  if (typeof window === "undefined") return;
  
  // Limpar sessionStorage
  clearTabSession();
  
  // Limpar localStorage
  clearAdminSession();
  
  // Fazer logout do NextAuth
  await signOut({ redirect: false });
  
  // Redirecionar para login usando window.location para garantir que funcione
  // mesmo que o router não esteja disponível
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

// Inicializar listener para detectar quando outra guia faz login como admin
export function initAdminSessionListener(): () => void {
  if (typeof window === "undefined") return () => {};
  
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === ADMIN_SESSION_EVENT_KEY && e.newValue) {
      try {
        const lock: AdminSessionLock = JSON.parse(e.newValue);
        
        // IMPORTANTE: Só limpar sessão se esta guia também for admin
        // Não interferir com sessões de profissionais
        if (lock.tabId !== getTabId() && hasAdminLock()) {
          // Verificar se esta guia realmente é admin antes de limpar
          // Buscar sessão atual para verificar o role
          try {
            const { getTabSession } = require("./tab-session");
            const currentTabSession = getTabSession();
            
            // Só limpar se realmente for admin
            if (currentTabSession?.role === "ADMIN") {
              // Esta guia perdeu o lock, limpar sessão
              clearCurrentAdminSession();
            }
          } catch (error) {
            console.error("Erro ao verificar sessão da guia:", error);
          }
        }
      } catch (error) {
        console.error("Erro ao processar evento de sessão admin:", error);
      }
    }
  };
  
  const handleBroadcastMessage = (e: MessageEvent) => {
    if (e.data?.type === "admin_login") {
      const lock: AdminSessionLock = e.data.lock;
      
      // IMPORTANTE: Só limpar sessão se esta guia também for admin
      // Não interferir com sessões de profissionais
      if (lock.tabId !== getTabId() && hasAdminLock()) {
        // Verificar se esta guia realmente é admin antes de limpar
        const { getTabSession } = require("./tab-session");
        const currentTabSession = getTabSession();
        
        // Só limpar se realmente for admin
        if (currentTabSession?.role === "ADMIN") {
          // Esta guia perdeu o lock, limpar sessão
          clearCurrentAdminSession();
        }
      }
    } else if (e.data?.type === "admin_logout") {
      // Admin fez logout em outra guia, não fazer nada
      // (permitir que outras guias façam login como admin)
    }
  };
  
  // Listener para eventos de storage (funciona entre guias)
  window.addEventListener("storage", handleStorageChange);
  
  // Listener para BroadcastChannel (mais confiável)
  let channel: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== "undefined") {
    channel = new BroadcastChannel("admin_session");
    channel.addEventListener("message", handleBroadcastMessage);
  }
  
  // Retornar função de cleanup
  return () => {
    window.removeEventListener("storage", handleStorageChange);
    if (channel) {
      channel.removeEventListener("message", handleBroadcastMessage);
      channel.close();
    }
  };
}

