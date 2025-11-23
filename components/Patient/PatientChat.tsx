"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Send, Loader2, Smile } from "lucide-react";
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

type Props = {
  psychologistId?: string | null;
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

export default function PatientChat({ psychologistId }: Props) {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [selectedPsychologistId, setSelectedPsychologistId] = useState<string | null>(psychologistId || null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Buscar psicólogos com quem o paciente tem agendamentos
  const { data: psychologists } = useQuery({
    queryKey: ["patient-psychologists", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const response = await fetch(`/api/appointments?patientId=${session.user.id}`);
      if (!response.ok) return [];
      const data = await response.json();
      const appointments = data.data || [];
      // Extrair psicólogos únicos
      const uniquePsychologists = new Map();
      appointments.forEach((apt: any) => {
        if (apt.psychologist && !uniquePsychologists.has(apt.psychologist.id)) {
          uniquePsychologists.set(apt.psychologist.id, apt.psychologist);
        }
      });
      return Array.from(uniquePsychologists.values());
    },
    enabled: !!session?.user?.id,
  });

  // Selecionar primeiro psicólogo se nenhum estiver selecionado
  useEffect(() => {
    if (!selectedPsychologistId && psychologists && psychologists.length > 0) {
      setSelectedPsychologistId(psychologists[0].id);
    }
  }, [psychologists, selectedPsychologistId]);

  // Buscar mensagens
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["chat-messages", session?.user?.id, selectedPsychologistId],
    queryFn: async () => {
      if (!session?.user?.id || !selectedPsychologistId) return [];
      const response = await fetch(
        `/api/chat?patientId=${session.user.id}&psychologistId=${selectedPsychologistId}`
      );
      if (!response.ok) return [];
      const data = await response.json();
      return data.data || [];
    },
    enabled: !!session?.user?.id && !!selectedPsychologistId,
    refetchInterval: 3000, // Atualizar a cada 3 segundos
  });

  // Scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Enviar mensagem
  const sendMessage = useMutation({
    mutationFn: async (text: string) => {
      if (!session?.user?.id || !selectedPsychologistId) {
        throw new Error("Usuário ou psicólogo não selecionado");
      }
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: session.user.id,
          receiverId: selectedPsychologistId,
          message: text,
        }),
      });
      if (!response.ok) throw new Error("Erro ao enviar mensagem");
      return response.json();
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
      toast.success("Mensagem enviada!");
    },
    onError: () => {
      toast.error("Erro ao enviar mensagem");
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedPsychologistId) return;
    sendMessage.mutate(message.trim());
  };

  // Adicionar emoji à mensagem
  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setEmojiPickerOpen(false);
  };

  const selectedPsychologist = psychologists?.find(
    (p: any) => p.id === selectedPsychologistId
  );

  if (!psychologists || psychologists.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-lg font-medium mb-2">Nenhum profissional disponível</p>
            <p className="text-sm text-muted-foreground">
              Agende uma consulta para poder conversar com seu psicólogo
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Lista de Psicólogos */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Profissionais</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1">
            {psychologists.map((psychologist: any) => (
              <button
                key={psychologist.id}
                type="button"
                onClick={() => setSelectedPsychologistId(psychologist.id)}
                className={`w-full text-left p-4 hover:bg-accent transition-colors ${
                  selectedPsychologistId === psychologist.id ? "bg-accent" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {psychologist.image && (
                      <AvatarImage src={psychologist.image} alt={psychologist.name} />
                    )}
                    <AvatarFallback>
                      {psychologist.name?.charAt(0) || "P"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{psychologist.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {psychologist.email}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Área de Chat */}
      <Card className="lg:col-span-3 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {selectedPsychologist && (
              <>
                <Avatar className="h-8 w-8">
                  {selectedPsychologist.image && (
                    <AvatarImage src={selectedPsychologist.image} alt={selectedPsychologist.name} />
                  )}
                  <AvatarFallback>
                    {selectedPsychologist.name?.charAt(0) || "P"}
                  </AvatarFallback>
                </Avatar>
                <span>{selectedPsychologist.name}</span>
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
                  <p className="text-muted-foreground mb-2">Nenhuma mensagem ainda</p>
                  <p className="text-sm text-muted-foreground">
                    Envie uma mensagem para iniciar a conversa
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg: ChatMessage) => {
                const isOwn = msg.senderId === session?.user?.id;
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
                      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            isOwn
                              ? "bg-blue-600 text-white"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                        </div>
                        <span className="text-xs text-muted-foreground mt-1">
                          {format(new Date(msg.createdAt), "HH:mm", { locale: ptBR })}
                        </span>
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
                disabled={!selectedPsychologistId || sendMessage.isPending}
                className="flex-1"
              />
              <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={!selectedPsychologistId || sendMessage.isPending}
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
                disabled={!message.trim() || !selectedPsychologistId || sendMessage.isPending}
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

