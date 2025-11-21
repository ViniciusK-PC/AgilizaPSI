"use client";

import { Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

type Props = {
  appointmentId: string;
  patientName?: string;
  psychologistName?: string;
};

export default function VirtualRoom({ appointmentId, patientName, psychologistName }: Props) {
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [inCall, setInCall] = useState(false);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Sala Virtual de Atendimento</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Atendimento ID: {appointmentId}
              </p>
            </div>
            <Badge variant={inCall ? "default" : "outline"}>
              {inCall ? "Em Atendimento" : "Aguardando"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Área de Vídeo */}
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              {inCall ? (
                <div className="text-center">
                  <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Vídeo em andamento</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {patientName || psychologistName}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <VideoOff className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Aguardando conexão</p>
                </div>
              )}
            </div>

            {/* Participante */}
            {patientName && (
              <div className="absolute top-4 right-4">
                <div className="bg-background/80 px-3 py-2 rounded-lg">
                  <p className="text-sm font-medium">Paciente: {patientName}</p>
                </div>
              </div>
            )}
          </div>

          {/* Controles */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={videoEnabled ? "default" : "destructive"}
              size="lg"
              className="rounded-full w-14 h-14"
              onClick={() => setVideoEnabled(!videoEnabled)}
            >
              {videoEnabled ? (
                <Video className="w-6 h-6" />
              ) : (
                <VideoOff className="w-6 h-6" />
              )}
            </Button>

            <Button
              variant={audioEnabled ? "default" : "destructive"}
              size="lg"
              className="rounded-full w-14 h-14"
              onClick={() => setAudioEnabled(!audioEnabled)}
            >
              {audioEnabled ? (
                <Mic className="w-6 h-6" />
              ) : (
                <MicOff className="w-6 h-6" />
              )}
            </Button>

            {inCall ? (
              <Button
                variant="destructive"
                size="lg"
                className="rounded-full w-14 h-14"
                onClick={() => setInCall(false)}
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
            ) : (
              <Button
                variant="default"
                size="lg"
                className="rounded-full px-8"
                onClick={() => setInCall(true)}
              >
                Iniciar Chamada
              </Button>
            )}

            <Button
              variant="outline"
              size="lg"
              className="rounded-full w-14 h-14"
            >
              <MessageSquare className="w-6 h-6" />
            </Button>
          </div>

          {/* Informações */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Status do Vídeo</p>
              <p className="font-medium">
                {videoEnabled ? "Ativado" : "Desativado"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status do Áudio</p>
              <p className="font-medium">
                {audioEnabled ? "Ativado" : "Desativado"}
              </p>
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm font-medium mb-2">💡 Recurso em Desenvolvimento</p>
            <p className="text-sm text-muted-foreground">
              A integração com plataforma de vídeo (Jitsi, Daily.co, ou WebRTC) será implementada em breve.
              Esta é uma visualização de como a interface funcionará.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

