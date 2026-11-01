import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  User,
  Send,
  X,
  Sparkles,
  Clapperboard,
  Camera,
  Edit,
  Palette,
  RotateCcw,
  Cpu,
  ChevronDown,
  Copy,
  Check,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { ChatRole, ChatModel, ChatMessage, ScriptProject } from '../types';
import { apiService } from '../services/api';

interface DirectorChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  project: ScriptProject | null;
  onApplyPromptToShot?: (prompt: string) => void;
}

const ROLES: { id: ChatRole; label: string; icon: any; tagline: string; defaultGreeting: string }[] = [
  {
    id: 'director',
    label: 'Film Director',
    icon: Clapperboard,
    tagline: 'Visual storytelling, scene pacing, and dramatic beats',
    defaultGreeting:
      "Hello! I'm your AI Director. I can help orchestrate the visual rhythm, staging, and dramatic beats of your storyboard. What scene would you like to elevate?",
  },
  {
    id: 'cinematographer',
    label: 'Cinematographer (DP)',
    icon: Camera,
    tagline: 'Lenses, lighting setups, depth of field & color palette',
    defaultGreeting:
      'Greetings! As your Director of Photography, ask me about focal lengths (e.g., 35mm anamorphic vs 85mm prime), lighting contrast, volumetric haze, and dynamic camera moves.',
  },
  {
    id: 'script_doctor',
    label: 'Script Doctor',
    icon: Edit,
    tagline: 'Dialogue polish, pacing economy & narrative tension',
    defaultGreeting:
      'Script Doctor here. Send me any scene or dialogue snippet and I will tighten the subtext, sharpen character voice, and trim the fat.',
  },
  {
    id: 'storyboard_artist',
    label: 'Storyboard Artist',
    icon: Palette,
    tagline: 'Shot composition, 180° rule & image prompt engineering',
    defaultGreeting:
      'Storyboard Artist ready! I can help craft rich cinematic image prompts for your frames, ensure screen direction continuity, and frame iconic compositions.',
  },
];

const MODELS: { id: ChatModel; label: string; badge: string; desc: string }[] = [
  {
    id: 'gemini-3.8-flash',
    label: 'Gemini 3.8 Flash',
    badge: 'Recommended',
    desc: 'General director & cinematography consulting',
  },
  {
    id: 'gemini-4-argon',
    label: 'Gemini 4 Argon',
    badge: 'Deep Reasoning',
    desc: 'Particularly complex script analysis & shot architecture',
  },
  {
    id: 'gemini-3.1-flash-lite',
    label: 'Gemini 3.1 Flash Lite',
    badge: 'Fast',
    desc: 'Rapid ideation & fast prompt tweaks',
  },
];

const SUGGESTIONS = [
  'Suggest 3 more dynamic camera angles for the climax',
  'How can I improve visual continuity across the sequence?',
  'Recommend lighting & color palette for this scene',
  'Write a rich image prompt for an intense over-the-shoulder shot',
];

export const DirectorChatbot: React.FC<DirectorChatbotProps> = ({
  isOpen,
  onClose,
  project,
  onApplyPromptToShot,
}) => {
  const [selectedRole, setSelectedRole] = useState<ChatRole>('director');
  const [selectedModel, setSelectedModel] = useState<ChatModel>('gemini-3.8-flash');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Initialize messages with default greeting
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      content: ROLES[0].defaultGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      botRole: 'director',
      modelUsed: 'gemini-3.8-flash',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // When role changes, add intro note if conversation is fresh
  const handleRoleChange = (newRole: ChatRole) => {
    setSelectedRole(newRole);
    const roleConfig = ROLES.find((r) => r.id === newRole);
    if (roleConfig) {
      setMessages((prev) => [
        ...prev,
        {
          id: `role-switch-${Date.now()}`,
          role: 'model',
          content: `Switched role to **${roleConfig.label}**.\n${roleConfig.defaultGreeting}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          botRole: newRole,
          modelUsed: selectedModel,
        },
      ]);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build conversation history for API
      const conversationHistory = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const contextData = project
        ? {
            scriptTitle: project.title,
            currentShotCount: project.scenes.flatMap((s) => s.shots).length,
            stylePreset: project.stylePreset,
            currentScriptSnippet: project.rawScript.slice(0, 1000),
          }
        : {};

      const response = await apiService.sendChatMessage({
        messages: conversationHistory,
        role: selectedRole,
        modelChoice: selectedModel,
        context: contextData,
      });

      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        botRole: selectedRole,
        modelUsed: response.modelUsed || selectedModel,
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `I encountered an issue connecting to Gemini: ${err.message || 'Please check your connection and try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        botRole: selectedRole,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    const roleConfig = ROLES.find((r) => r.id === selectedRole) || ROLES[0];
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'model',
        content: roleConfig.defaultGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        botRole: selectedRole,
        modelUsed: selectedModel,
      },
    ]);
  };

  if (!isOpen) return null;

  const currentRoleConfig = ROLES.find((r) => r.id === selectedRole) || ROLES[0];
  const CurrentIcon = currentRoleConfig.icon;

  return (
    <div className="fixed bottom-4 right-4 z-40 w-full sm:w-[480px] max-w-[calc(100vw-2rem)] h-[620px] max-h-[85vh] bg-[#0d0f17] border border-indigo-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl">
      {/* Chatbot Header */}
      <div className="bg-[#121526] border-b border-zinc-800 p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md">
            <CurrentIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">{currentRoleConfig.label}</h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                {selectedModel.replace('gemini-', '')}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 truncate max-w-[220px]">
              {currentRoleConfig.tagline}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleResetChat}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Reset Chat History"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Close Chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Role & Model Switchers Strip */}
      <div className="bg-[#0a0c13] px-3 py-2 border-b border-zinc-800/80 flex items-center justify-between gap-2 overflow-x-auto text-xs">
        {/* Role Pills */}
        <div className="flex items-center gap-1 shrink-0">
          {ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => handleRoleChange(role.id)}
              className={`px-2 py-1 rounded-lg font-medium transition-all text-[11px] flex items-center gap-1 ${
                selectedRole === role.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
              }`}
            >
              <span>{role.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Model Selector Dropdown */}
        <div className="flex items-center gap-1 shrink-0">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as ChatModel)}
            className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg px-2 py-1 text-[11px] font-mono focus:outline-none focus:border-indigo-500"
            title="Select Gemini model"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} ({m.badge})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scrollable Chat Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                  isUser
                    ? 'bg-amber-500 text-zinc-950 shadow-sm'
                    : 'bg-indigo-600 text-white shadow-sm'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`group relative max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-zinc-950 font-medium rounded-tr-none'
                    : 'bg-[#151827] text-zinc-200 border border-zinc-800/80 rounded-tl-none shadow-md'
                }`}
              >
                {/* Text Content */}
                <div className="whitespace-pre-wrap font-sans space-y-1">
                  {msg.content}
                </div>

                {/* Footer Bar: Timestamp & Copy */}
                <div
                  className={`mt-1.5 flex items-center justify-between text-[10px] ${
                    isUser ? 'text-zinc-900/70' : 'text-zinc-500'
                  }`}
                >
                  <span className="font-mono">{msg.timestamp}</span>

                  {!isUser && (
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:text-white"
                      title="Copy advice"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white shrink-0 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="bg-[#151827] border border-zinc-800 rounded-2xl rounded-tl-none p-3 text-xs text-zinc-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span>{currentRoleConfig.label} is analyzing ({selectedModel})...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="p-2 bg-[#090b12] border-t border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto">
        {SUGGESTIONS.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(suggestion)}
            disabled={isLoading}
            className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Input Message Box */}
      <div className="p-3 bg-[#0d0f17] border-t border-zinc-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Ask the ${currentRoleConfig.label} (e.g. framing ideas, scene tension)...`}
            disabled={isLoading}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="w-9 h-9 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white flex items-center justify-center shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
