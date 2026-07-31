import React, { useState } from 'react';
import { Sparkles, Send, X, Bot, User, Dumbbell, RefreshCw } from 'lucide-react';

interface AiCoachModalProps {
  currentProgram: string;
  sessionName?: string;
  recentSummary?: string;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

export const AiCoachModal: React.FC<AiCoachModalProps> = ({
  currentProgram,
  sessionName,
  recentSummary,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Salut ! Je suis **GymTrack AI Coach**. 🏋️‍♂️\n\nQue tu cherches à valider la technique d'un exercice, surmonter un plateau sur ton développé couché ou ton squat, ou optimiser ta récupération, je suis là pour t'aider !\n\nPose-moi ta question !`,
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickPrompts = [
    'Comment passer un palier sur le développé couché ?',
    'Quelle est la bonne trajectoire au squat barre ?',
    'Conseils pour éviter les douleurs aux épaules en poussée',
    'Comment gérer la fatigue entre mes séances PPL ?',
  ];

  const handleSendPrompt = async (promptToSend?: string) => {
    const text = promptToSend || inputPrompt;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          userContext: {
            currentProgram,
            sessionName,
            recentSummary,
          },
        }),
      });

      const data = await response.json();

      if (data.text) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: data.text,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai_err_${Date.now()}`,
            sender: 'ai',
            text: `⚠️ Erreur : ${data.message || "Impossible d'obtenir une réponse d'IA pour le moment."}`,
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          sender: 'ai',
          text: "⚠️ Erreur réseau. Assurez-vous d'avoir une connexion active.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl w-full max-w-lg h-[80vh] flex flex-col text-zinc-100 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#bbff00] flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-[#0a0a0a]" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-wide text-white flex items-center gap-1.5 font-heading">
                <span>Coach IA GymTrack</span>
              </h3>
              <span className="text-[10px] text-[#bbff00] font-mono font-bold">
                Propulsé par Gemini 2.5
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestions Chips */}
        <div className="px-4 py-2 bg-zinc-950/40 border-b border-zinc-800/60 overflow-x-auto no-scrollbar flex gap-2">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSendPrompt(p)}
              disabled={isLoading}
              className="text-[11px] font-medium bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 px-3 py-1 rounded-full whitespace-nowrap active:scale-95 transition-all"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  m.sender === 'user'
                    ? 'bg-zinc-800 text-white'
                    : 'bg-[#bbff00] text-[#0a0a0a] shadow-md'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-[#0a0a0a]" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#bbff00] text-[#0a0a0a] font-medium rounded-tr-none shadow'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-tl-none whitespace-pre-line'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2.5 items-center text-zinc-400 text-xs font-mono animate-pulse">
              <Bot className="w-4 h-4 text-[#bbff00]" />
              <span>Analyse biomécanique en cours par le Coach IA...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950/90 rounded-b-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ex: Comment bien régler le banc pour l'incliné..."
              disabled={isLoading}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#bbff00]"
            />

            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="p-2.5 bg-[#bbff00] hover:bg-[#a6e600] disabled:opacity-40 text-[#0a0a0a] rounded-xl shadow-md transition-all active:scale-95"
            >
              <Send className="w-4 h-4 text-[#0a0a0a]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
