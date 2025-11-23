"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, MessageSquare, Edit2, X, Check, Smile } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type ChatMessage = {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  read: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    image?: string | null;
  };
};

type Patient = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  unreadCount?: number;
};

// Emojis comuns organizados por categoria
const EMOJI_CATEGORIES = {
  faces: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕"],
  gestures: ["👋", "🤚", "🖐", "✋", "🖖", "👌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏"],
  hearts: ["💋", "💌", "💘", "💝", "💖", "💗", "💓", "💞", "💕", "💟", "❣️", "💔", "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💯"],
  objects: ["👓", "🕶️", "🥽", "🎩", "🎓", "🧢", "⛑️", "📿", "💄", "💍", "💎"],
  symbols: ["✅", "❌", "❓", "❔", "❗", "❕", "➕", "➖", "➗", "✖️", "💯", "🔢", "🔣", "🔤", "🔡", "🔠", "🔟", "🔜", "🔝", "🔛", "🔚", "🔙", "🔃", "🔄", "🔂", "🔁", "🔀", "🔉", "🔊", "🔈", "🔇", "📢", "📣", "🔔", "🔕", "🎵", "🎶", "💹", "🛑", "🚧", "⚠️", "🚸", "⛔", "🚫", "🚳", "🚭", "🚯", "🚱", "🚷", "📵", "🔞", "☢️", "☣️", "⬆️", "↗️", "➡️", "↘️", "⬇️", "↙️", "⬅️", "↖️", "↕️", "↔️", "↩️", "↪️", "⤴️", "⤵️", "🔃", "🔄", "🔙", "🔚", "🔛", "🔜", "🔝", "🛐", "⚛️", "🕉️", "✡️", "☸️", "☯️", "☦️", "☮️", "🕎", "🔯", "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓", "⛎", "🔀", "🔁", "🔂", "▶️", "⏩", "⏭️", "⏯️", "◀️", "⏪", "⏮️", "🔼", "⏫", "🔽", "⏬", "⏸️", "⏹️", "⏺️", "⏏️", "🎦", "🔅", "🔆", "📶", "📳", "📴", "♻️", "📛", "⚜️", "🔰", "🔱", "⭕", "✅", "☑️", "✔️", "❌", "❎", "➰", "➿", "〽️", "✳️", "✴️", "❇️", "©️", "®️", "™️", "#️⃣", "*️⃣", "0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟", "🔠", "🔡", "🔢", "🔣", "🔤", "🅰️", "🆎", "🅱️", "🆑", "🆒", "🆓", "ℹ️", "🆔", "Ⓜ️", "🆕", "🆖", "🅾️", "🆗", "🆘", "🆙", "🆚", "🈁", "🈂️", "🈷️", "🈶", "🈯", "🉐", "🈹", "🈲", "🉑", "🈸", "🈴", "🈳", "㊗️", "㊙️", "🈺", "🈵", "🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "⚫", "⚪", "🟤", "🔶", "🔷", "🔸", "🔹", "🔺", "🔻", "💠", "🔘", "🔳", "🔲"],
};

// Componente de Emoji Picker
function EmojiPicker({ onEmojiSelect }: { onEmojiSelect: (emoji: string) => void }) {
  return (
    <div className="w-80">
      {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
        <div key={category} className="mb-4">
          <h4 className="text-xs font-semibold text-muted-foreground mb-2 px-2 capitalize">
            {category === "faces" ? "Rostos" : category === "gestures" ? "Gestos" : category === "hearts" ? "Corações" : category === "objects" ? "Objetos" : "Símbolos"}
          </h4>
          <div className="grid grid-cols-8 gap-1 px-2">
            {emojis.map((emoji, index) => (
              <button
                key={`${category}-${index}`}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEmojiSelect(emoji);
                }}
                className="text-2xl hover:bg-muted rounded p-1 transition-colors cursor-pointer flex items-center justify-center"
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PsychologistChat() {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [editingEmojiPickerOpen, setEditingEmojiPickerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Buscar pacientes com quem o psicólogo tem agendamentos
  const { data: patients } = useQuery({
    queryKey: ["psychologist-patients", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const response = await fetch(`/api/appointments?psychologistId=${session.user.id}`);
      if (!response.ok) return [];
      const data = await response.json();
      const appointments = data.data || [];
      // Extrair pacientes únicos
      const uniquePatients = new Map();
      appointments.forEach((apt: any) => {
        if (apt.patient && !uniquePatients.has(apt.patient.id)) {
          uniquePatients.set(apt.patient.id, apt.patient);
        }
      });
      return Array.from(uniquePatients.values());
    },
    enabled: !!session?.user?.id,
  });

  // Buscar contagens de mensagens não lidas para cada paciente
  const { data: unreadCounts } = useQuery({
    queryKey: ["unread-messages-count", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return {};
      const response = await fetch(`/api/chat/unread?psychologistId=${session.user.id}`);
      if (!response.ok) return {};
      const data = await response.json();
      return data.data || {};
    },
    enabled: !!session?.user?.id,
    refetchInterval: 5000, // Atualizar a cada 5 segundos
  });

  // Selecionar primeiro paciente se nenhum estiver selecionado
  useEffect(() => {
    if (!selectedPatientId && patients && patients.length > 0) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients, selectedPatientId]);

  // Buscar mensagens
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["chat-messages", session?.user?.id, selectedPatientId],
    queryFn: async () => {
      if (!session?.user?.id || !selectedPatientId) return [];
      const response = await fetch(
        `/api/chat?patientId=${selectedPatientId}&psychologistId=${session.user.id}`
      );
      if (!response.ok) return [];
      const data = await response.json();
      return data.data || [];
    },
    enabled: !!session?.user?.id && !!selectedPatientId,
    refetchInterval: 3000, // Atualizar a cada 3 segundos
  });

  // Scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Enviar mensagem
  const sendMessage = useMutation({
    mutationFn: async (text: string) => {
      if (!session?.user?.id || !selectedPatientId) {
        throw new Error("Usuário ou paciente não selecionado");
      }
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: session.user.id,
          receiverId: selectedPatientId,
          message: text,
        }),
      });
      if (!response.ok) throw new Error("Erro ao enviar mensagem");
      return response.json();
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
      queryClient.invalidateQueries({ queryKey: ["unread-messages-count"] });
      toast.success("Mensagem enviada!");
    },
    onError: () => {
      toast.error("Erro ao enviar mensagem");
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedPatientId) return;
    sendMessage.mutate(message.trim());
  };

  // Iniciar edição de mensagem
  const handleStartEdit = (msg: ChatMessage) => {
    if (msg.senderId === session?.user?.id) {
      setEditingMessageId(msg.id);
      setEditingText(msg.message);
    }
  };

  // Cancelar edição
  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  // Salvar edição
  const updateMessage = useMutation({
    mutationFn: async ({ messageId, newText }: { messageId: string; newText: string }) => {
      const response = await fetch(`/api/chat/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newText.trim() }),
      });
      if (!response.ok) throw new Error("Erro ao editar mensagem");
      return response.json();
    },
    onSuccess: () => {
      setEditingMessageId(null);
      setEditingText("");
      queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
      toast.success("Mensagem editada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao editar mensagem");
    },
  });

  const handleSaveEdit = () => {
    if (!editingMessageId || !editingText.trim()) return;
    updateMessage.mutate({ messageId: editingMessageId, newText: editingText.trim() });
  };

  // Adicionar emoji à mensagem
  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setEmojiPickerOpen(false);
  };

  // Adicionar emoji à edição
  const handleEditingEmojiSelect = (emoji: string) => {
    setEditingText((prev) => prev + emoji);
    setEditingEmojiPickerOpen(false);
  };

  const selectedPatient = patients?.find(
    (p: any) => p.id === selectedPatientId
  );

  // Adicionar contagem de não lidas aos pacientes
  const patientsWithUnread = patients?.map((patient: any) => ({
    ...patient,
    unreadCount: unreadCounts?.[patient.id] || 0,
  })) || [];

  if (!patients || patients.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium mb-2">Nenhum paciente disponível</p>
            <p className="text-sm text-muted-foreground">
              Você receberá mensagens aqui quando pacientes agendarem consultas com você
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Lista de Pacientes */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Pacientes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1 max-h-[600px] overflow-y-auto">
            {patientsWithUnread.map((patient: Patient) => {
              const unreadCount = patient.unreadCount || 0;
              return (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => setSelectedPatientId(patient.id)}
                  className={`w-full text-left p-4 hover:bg-accent transition-colors relative ${
                    selectedPatientId === patient.id ? "bg-accent" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {patient.image && (
                        <AvatarImage src={patient.image} alt={patient.name} />
                      )}
                      <AvatarFallback>
                        {patient.name?.charAt(0) || "P"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{patient.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {patient.email}
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {unreadCount}
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Área de Chat */}
      <Card className="lg:col-span-3 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {selectedPatient && (
              <>
                <Avatar className="h-8 w-8">
                  {selectedPatient.image && (
                    <AvatarImage src={selectedPatient.image} alt={selectedPatient.name} />
                  )}
                  <AvatarFallback>
                    {selectedPatient.name?.charAt(0) || "P"}
                  </AvatarFallback>
                </Avatar>
                <span>{selectedPatient.name}</span>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] max-h-[600px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-2">Nenhuma mensagem ainda</p>
                  <p className="text-sm text-muted-foreground">
                    Envie uma mensagem para iniciar a conversa
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg: ChatMessage) => {
                const isOwn = msg.senderId === session?.user?.id;
                const isEditing = editingMessageId === msg.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex gap-2 max-w-[70%] ${
                        isOwn ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <Avatar className="h-8 w-8">
                        {msg.sender.image && (
                          <AvatarImage src={msg.sender.image} alt={msg.sender.name} />
                        )}
                        <AvatarFallback>
                          {msg.sender.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} group relative`}>
                        {isEditing ? (
                          <div className="flex flex-col gap-2 w-full">
                            <div className="flex gap-2">
                              <Input
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="flex-1"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSaveEdit();
                                  }
                                  if (e.key === "Escape") {
                                    handleCancelEdit();
                                  }
                                }}
                                autoFocus
                              />
                              <Popover open={editingEmojiPickerOpen} onOpenChange={setEditingEmojiPickerOpen}>
                                <PopoverTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10"
                                  >
                                    <Smile className="w-4 h-4" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent 
                                  className="w-auto p-2 max-h-96 overflow-y-auto" 
                                  align="end" 
                                  side="top"
                                  sideOffset={8}
                                >
                                  <EmojiPicker onEmojiSelect={handleEditingEmojiSelect} />
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleCancelEdit}
                                disabled={updateMessage.isPending}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="default"
                                size="sm"
                                onClick={handleSaveEdit}
                                disabled={!editingText.trim() || updateMessage.isPending}
                              >
                                {updateMessage.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div
                              className={`rounded-lg px-4 py-2 ${
                                isOwn
                                  ? "bg-blue-600 text-white"
                                  : "bg-muted text-foreground"
                              }`}
                            >
                              <p className="text-sm">{msg.message}</p>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(msg.createdAt), "HH:mm", { locale: ptBR })}
                              </span>
                              {isOwn && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleStartEdit(msg)}
                                  title="Editar mensagem"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input de Mensagem */}
          <form onSubmit={handleSend} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                disabled={!selectedPatientId || sendMessage.isPending}
                className="flex-1"
              />
              <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={!selectedPatientId || sendMessage.isPending}
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-auto p-2 max-h-96 overflow-y-auto" 
                  align="end" 
                  side="top"
                  sideOffset={8}
                >
                  <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                </PopoverContent>
              </Popover>
              <Button
                type="submit"
                disabled={!message.trim() || !selectedPatientId || sendMessage.isPending}
                size="icon"
              >
                {sendMessage.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

