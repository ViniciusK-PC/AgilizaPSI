"use client";

import { Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useTabSession } from "@/hooks/useTabSession";

type Props = {
  appointmentId: string;
  patientName?: string;
  psychologistName?: string;
};

// Função para gerar link Jitsi Meet
const generateJitsiLink = (roomName: string, userName: string, isHost: boolean = false): string => {
  // Usar o servidor público do Jitsi Meet
  const jitsiDomain = "meet.jit.si";
  // Criar nome da sala mais discreto (sem prefixo visível)
  const roomId = `${Date.now()}-${Math.random().toString(36).substring(7)}`.toLowerCase().replace(/[^a-z0-9]/g, "");
  
  // Configuração base
  const baseConfig: any = {
    startWithAudioMuted: false,
    startWithVideoMuted: false,
    enableWelcomePage: false,
    enableClosePage: false,
    defaultLanguage: "pt",
    lang: "pt",
    disableThirdPartyRequests: false,
    enableLayerSuspension: true,
    // Ocultar informações da sala
    hideDisplayName: false,
    disableDeepLinking: true,
    // Ocultar nome da sala na interface
    subject: "",
    p2p: {
      enabled: true,
      stunServers: [
        { urls: "stun:stun.l.google.com:19302" },
      ],
    },
    // Configurações de moderação
    enableNoAudioDetection: true,
    enableNoisyMicDetection: true,
    enableTalkWhileMuted: false,
    // Configurações de segurança
    requireDisplayName: true,
    enableInsecureRoomNameWarning: false,
    // Ocultar branding do Jitsi
    disableDeepLinking: true,
    disableInviteFunctions: false,
    // Se for anfitrião, configurar como moderador
    ...(isHost && {
      startAudioOnly: false,
      enableRemb: true,
      enableTcc: true,
      useStunTurn: true,
    }),
  };

  // Parâmetros para configurar a sala
  const params = new URLSearchParams({
    userInfo: JSON.stringify({
      displayName: userName,
      ...(isHost && { moderator: true }),
    }),
    lang: "pt", // Idioma português
    config: JSON.stringify(baseConfig),
    interfaceConfig: JSON.stringify({
      SHOW_JITSI_WATERMARK: false,
      SHOW_WATERMARK_FOR_GUESTS: false,
      DEFAULT_LANGUAGE: "pt",
      LANG_DETECTION: false,
      TOOLBAR_BUTTONS: [
        "microphone",
        "camera",
        "closedcaptions",
        "desktop",
        "fullscreen",
        "fodeviceselection",
        "hangup",
        "profile",
        "chat",
        "recording",
        "livestreaming",
        "settings",
        "raisehand",
        "videoquality",
        "filmstrip",
        "invite",
        "feedback",
        "stats",
        "shortcuts",
        "tileview",
        "videobackgroundblur",
        "download",
        "help",
        "mute-everyone",
      ],
      // Traduções personalizadas em português
      APP_NAME: "Sala Virtual",
      // Ocultar nome da sala
      DISPLAY_WELCOME_PAGE_CONTENT: false,
      DISPLAY_WELCOME_FOOTER: false,
      CONNECTION_INDICATOR_AUTO_HIDE_ENABLED: true,
      CONNECTION_INDICATOR_AUTO_HIDE_TIMEOUT: 5000,
      DISABLE_DOMINANT_SPEAKER_INDICATOR: false,
      DISABLE_FOCUS_INDICATOR: false,
      DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
      DISABLE_PRESENCE_STATUS: false,
      DISABLE_RINGING: false,
      DISABLE_TRANSCRIPTION_SUBTITLES: false,
      DISABLE_VIDEO_BACKGROUND: false,
      ENABLE_DIAL_OUT: false,
      FILM_STRIP_MAX_HEIGHT: 90,
      FILM_STRIP_ONLY: false,
      INITIAL_TOOLBAR_TIMEOUT: 20000,
      TOOLBAR_TIMEOUT: 4000,
      TOOLBAR_ALWAYS_VISIBLE: false,
      SETTINGS_SECTIONS: ["devices", "language", "moderator", "profile"],
      SHOW_BRAND_WATERMARK: false,
      SHOW_CONTACTLIST_HEADER: false,
      SHOW_DEEP_LINKING_IMAGE: false,
      SHOW_JITSI_WATERMARK: false,
      SHOW_POWERED_BY: false,
      SHOW_PROMOTIONAL_CLOSE_PAGE: false,
      SHOW_WATERMARK_FOR_GUESTS: false,
      SUPPORT_URL: "",
      VERTICAL_FILMSTRIP: true,
      VIDEO_LAYOUT_FIT: "both",
      HIDE_INVITE_MORE_HEADER: false,
      // Ocultar logo do Jitsi completamente
      DISABLE_VIDEO_BACKGROUND_BLUR: true,
      DISABLE_VIDEO_BACKGROUND_REPLACEMENT: true,
      MOBILE_APP_PROMO: false,
      NATIVE_APP_NAME: "AgilizaPSI",
      PROVIDER_NAME: "AgilizaPSI",
      DEFAULT_BACKGROUND: "#000000",
      // Ocultar elementos de branding
      DISABLE_FOCUS_INDICATOR: true,
      DISABLE_DOMINANT_SPEAKER_INDICATOR: true,
    }),
  });
  
  return `https://${jitsiDomain}/${roomId}?${params.toString()}`;
};

export default function VirtualRoom({ appointmentId, patientName, psychologistName }: Props) {
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [inCall, setInCall] = useState(false);
  const [meetingLink, setMeetingLink] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { session: tabSession } = useTabSession();
  const activeSession = tabSession || session;
  const userName = activeSession?.user?.name || psychologistName || patientName || "Usuário";
  
  // Verificar se o usuário é psicólogo (anfitrião)
  const isPsychologist = activeSession?.user?.role === "PSICOLOGO" || 
                         activeSession?.user?.role === "PSYCHOLOGIST" ||
                         !!psychologistName && !patientName;
  const isHost = isPsychologist;

  // Buscar informações do agendamento
  const { data: appointment, isLoading } = useQuery({
    queryKey: ["appointment", appointmentId],
    queryFn: async () => {
      const response = await fetch(`/api/appointments/${appointmentId}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.data;
    },
    enabled: !!appointmentId && appointmentId !== "demo-123",
  });

  // Mutação para atualizar meetingLink
  const updateMeetingLink = useMutation({
    mutationFn: async ({ appointmentId, meetingLink }: { appointmentId: string; meetingLink: string }) => {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingLink }),
      });
      if (!response.ok) throw new Error("Erro ao salvar link da reunião");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointment", appointmentId] });
    },
  });

  // Gerar ou buscar meetingLink
  useEffect(() => {
    if (appointment?.meetingLink) {
      // Se já existe link, usar ele
      // Se for psicólogo, adicionar parâmetros de anfitrião
      let link = appointment.meetingLink;
      if (isHost) {
        try {
          const url = new URL(link);
          const userInfo = JSON.parse(url.searchParams.get("userInfo") || "{}");
          userInfo.moderator = true;
          userInfo.displayName = userName;
          url.searchParams.set("userInfo", JSON.stringify(userInfo));
          link = url.toString();
        } catch (e) {
          // Se falhar ao parsear, usar link original
        }
      }
      setMeetingLink(link);
    } else if (appointmentId && appointmentId !== "demo-123" && appointment?.type === "ONLINE") {
      // Gerar link se não existir e for consulta online
      // Apenas psicólogo pode gerar link (será anfitrião)
      if (isHost) {
        const link = generateJitsiLink(appointmentId, userName, true);
        setMeetingLink(link);
        // Salvar o link no agendamento
        updateMeetingLink.mutate({ appointmentId, meetingLink: link });
      } else {
        // Paciente não pode gerar link, precisa aguardar psicólogo
        setMeetingLink(null);
      }
    } else if (appointmentId === "demo-123") {
      // Para demo, gerar link temporário (apenas se for psicólogo)
      if (isHost) {
        const link = generateJitsiLink("demo-123", userName, true);
        setMeetingLink(link);
      } else {
        setMeetingLink(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointment, appointmentId, userName, isHost]);

  // Copiar link para área de transferência
  const copyLink = () => {
    if (meetingLink) {
      navigator.clipboard.writeText(meetingLink);
      toast.success("Link copiado para a área de transferência!");
    }
  };

  // Abrir link em nova aba
  const openInNewTab = () => {
    if (meetingLink) {
      window.open(meetingLink, "_blank");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Carregando sala virtual...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Sala Virtual de Atendimento</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {appointment ? (
                  <>
                    Atendimento: {(appointment as any)?.patient?.name || patientName || "Sem paciente"} com{" "}
                    {(appointment as any)?.psychologist?.name || psychologistName}
                  </>
                ) : (
                  <>Atendimento ID: {appointmentId}</>
                )}
              </p>
            </div>
            <Badge variant={inCall ? "default" : "outline"}>
              {inCall ? "Em Atendimento" : "Aguardando"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Link da Reunião */}
          {meetingLink && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="text-sm font-medium mb-2 block">Link da Reunião</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={meetingLink}
                      readOnly
                      className="flex-1 font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyLink}
                      title="Copiar link"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={openInNewTab}
                      title="Abrir em nova aba"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {isHost 
                  ? "Compartilhe este link com o paciente após você entrar na reunião como anfitrião."
                  : "Este é o link da reunião. Aguarde o profissional entrar antes de acessar."}
              </p>
            </div>
          )}

          {/* Área de Vídeo - Jitsi Meet */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden border">
            {inCall && meetingLink ? (
              <>
                <iframe
                  ref={iframeRef}
                  src={meetingLink}
                  allow="camera; microphone; fullscreen; speaker; display-capture"
                  className="w-full h-full"
                  style={{ border: "none" }}
                  title="Sala Virtual"
                />
                {/* Overlay para ocultar logo e nome da sala do Jitsi (canto inferior esquerdo) */}
                <div 
                  className="absolute bottom-0 left-0 z-10 pointer-events-none"
                  style={{ 
                    background: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 50%, rgba(0,0,0,0.8) 70%, transparent 100%)',
                    height: '70px',
                    width: '300px',
                    borderRadius: '0 8px 0 0'
                  }}
                />
                {/* Overlay adicional para cobrir área superior onde pode aparecer nome da sala */}
                <div 
                  className="absolute top-0 left-0 z-10 pointer-events-none"
                  style={{ 
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
                    height: '100px',
                    width: '100%'
                  }}
                />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-900">
                <div className="text-center text-white">
                  <p className="text-2xl font-medium">Sala Virtual Pronta</p>
                </div>
              </div>
            )}
          </div>

          {/* Controles */}
          <div className="flex items-center justify-center gap-4">
            {inCall ? (
              <>
                <Button
                  type="button"
                  variant={videoEnabled ? "default" : "destructive"}
                  size="lg"
                  className="rounded-full w-14 h-14"
                  onClick={() => setVideoEnabled(!videoEnabled)}
                  title={videoEnabled ? "Desativar vídeo" : "Ativar vídeo"}
                >
                  {videoEnabled ? (
                    <Video className="w-6 h-6" />
                  ) : (
                    <VideoOff className="w-6 h-6" />
                  )}
                </Button>

                <Button
                  type="button"
                  variant={audioEnabled ? "default" : "destructive"}
                  size="lg"
                  className="rounded-full w-14 h-14"
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  title={audioEnabled ? "Desativar áudio" : "Ativar áudio"}
                >
                  {audioEnabled ? (
                    <Mic className="w-6 h-6" />
                  ) : (
                    <MicOff className="w-6 h-6" />
                  )}
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  size="lg"
                  className="rounded-full px-8"
                  onClick={() => {
                    setInCall(false);
                    if (iframeRef.current) {
                      iframeRef.current.src = "";
                    }
                  }}
                >
                  <PhoneOff className="w-5 h-5 mr-2" />
                  Encerrar Chamada
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="default"
                size="lg"
                className="rounded-full px-8"
                onClick={() => {
                  if (meetingLink) {
                    setInCall(true);
                    if (isHost) {
                      toast.success("Você entrou como anfitrião da reunião!");
                    }
                  } else {
                    if (isHost) {
                      toast.error("Link da reunião não disponível");
                    } else {
                      toast.error("Aguarde o profissional iniciar a reunião");
                    }
                  }
                }}
                disabled={!meetingLink || (!isHost && !inCall)}
              >
                <Video className="w-5 h-5 mr-2" />
                {isHost ? "Entrar como Anfitrião" : "Aguardando Anfitrião"}
              </Button>
            )}
          </div>

          {/* Informações */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Status da Reunião</p>
              <p className="font-medium">
                {inCall ? "Conectado" : "Desconectado"}
              </p>
            </div>
          </div>

          {/* Instruções */}
          {isHost ? (
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-sm font-medium mb-2 text-green-800 dark:text-green-200">
                ✅ Você é o Anfitrião desta Reunião
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Como anfitrião, você tem controle total da sala virtual. A reunião só ficará disponível
                para o paciente após você entrar. Compartilhe o link acima com o paciente após iniciar a reunião.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <p className="text-sm font-medium mb-2 text-yellow-800 dark:text-yellow-200">
                ⏳ Aguardando Anfitrião
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                A sala virtual só ficará disponível quando o profissional (psicólogo) entrar como anfitrião.
                Por favor, aguarde o início da reunião.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

