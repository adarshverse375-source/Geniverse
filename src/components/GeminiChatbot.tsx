import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Trash2, 
  Copy, 
  Check, 
  Zap, 
  Brain, 
  FileText, 
  HelpCircle, 
  GraduationCap, 
  Atom, 
  BookOpen, 
  ChevronDown,
  RefreshCw,
  AlertTriangle,
  Palette,
  Download
} from 'lucide-react';
import { ChatMessage, ChatModelChoice, ChatRoleChoice, SubjectType } from '../types';
import { FormattedMessage, cleanLatexMath } from './FormattedMessage';
import { ImageGenerationModal } from './ImageGenerationModal';

interface GeminiChatbotProps {
  isMidnight: boolean;
  activeSubject: SubjectType;
  activeChapterName: string;
  onRewardXP: (amount: number, reason: string) => void;
}

const ROLES_CONFIG: Record<ChatRoleChoice, { title: string; subtitle: string; icon: React.ElementType; badgeColor: string }> = {
  general: {
    title: 'CBSE Study Mentor',
    subtitle: 'Warm, comprehensive syllabus guide',
    icon: GraduationCap,
    badgeColor: 'bg-indigo-500/15 text-indigo-500 border-indigo-500/30'
  },
  examiner: {
    title: 'Board Exam Evaluator',
    subtitle: 'Marking schemes, key phrases & traps',
    icon: FileText,
    badgeColor: 'bg-amber-500/15 text-amber-500 border-amber-500/30'
  },
  stem: {
    title: 'STEM & Derivations Master',
    subtitle: 'Step-by-step math proofs & physics numerics',
    icon: Atom,
    badgeColor: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
  },
  speed_drill: {
    title: 'Rapid Recall Drill',
    subtitle: 'Fast questions & active recall testing',
    icon: Zap,
    badgeColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30'
  },
  humanities: {
    title: 'Social Science & English Guru',
    subtitle: 'Timelines, maps, quotes & literary devices',
    icon: BookOpen,
    badgeColor: 'bg-rose-500/15 text-rose-500 border-rose-500/30'
  }
};

const MODELS_CONFIG: Record<ChatModelChoice, { name: string; tag: string; icon: React.ElementType }> = {
  'gemini-3.5-flash': {
    name: 'Bright AI 2.0',
    tag: 'General Tasks (Default)',
    icon: Sparkles
  },
  'gemini-3.1-flash-lite': {
    name: 'Bright AI Lite',
    tag: 'Ultra-Fast Tasks',
    icon: Zap
  },
  'gemini-3.1-pro-preview': {
    name: 'Bright AI Pro',
    tag: 'Complex Multi-step Reasoning',
    icon: Brain
  }
};

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  isMidnight,
  activeSubject,
  activeChapterName,
  onRewardXP,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('cbse_brights_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        id: 'welcome-1',
        sender: 'ai',
        text: `Namaste! 👋 I'm your CBSE Class 10 study companion powered by **Bright AI 2.0**.\n\nWe're currently focusing on **${activeSubject}: ${activeChapterName}**. How can I help you today? You can ask for step-by-step mathematical proofs, key NCERT concepts, high-yield board marking rubrics, take a rapid-fire drill, or use **Image Generation** to visualize diagrams!`,
        timestamp: Date.now(),
        modelUsed: 'gemini-3.5-flash',
        roleUsed: 'general'
      }
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ChatModelChoice>('gemini-3.5-flash');
  const [selectedRole, setSelectedRole] = useState<ChatRoleChoice>('general');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInsertGeneratedImage = (imagePrompt: string, imageUrl?: string, svgContent?: string) => {
    const newMsg: ChatMessage = {
      id: `img-${Date.now()}`,
      sender: 'ai',
      text: `Here is the requested diagram for **"${imagePrompt}"**:`,
      timestamp: Date.now(),
      modelUsed: selectedModel,
      roleUsed: selectedRole,
      imageUrl,
      svgContent,
      imagePrompt
    };
    setMessages(prev => [...prev, newMsg]);
    onRewardXP(20, 'Generated educational visual diagram');
  };

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('cbse_brights_chat_history', JSON.stringify(messages));
  }, [messages]);

  // Auto scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (overridePrompt?: string) => {
    const query = (overridePrompt || input).trim();
    if (!query || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const newUserMsg: ChatMessage = {
      id: userMessageId,
      sender: 'user',
      text: query,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Build multi-turn history
      // Exclude initial welcome if it's the only one, format as user / model turns
      const formattedHistory = updatedMessages
        .slice(-10) // keep last 10 turns for good context window
        .filter(m => m.id !== 'welcome-1')
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }));

      // Note: the last user message will be sent in `message`, so pass previous turns in history
      const historyWithoutCurrent = formattedHistory.slice(0, -1);

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: historyWithoutCurrent,
          model: selectedModel,
          role: selectedRole,
          subject: activeSubject,
          chapter: activeChapterName,
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.text || 'No response generated.',
        timestamp: Date.now(),
        modelUsed: data.modelUsed || selectedModel,
        roleUsed: data.roleUsed || selectedRole,
        imageUrl: data.generatedImage?.imageUrl,
        svgContent: data.generatedImage?.svgContent,
        imagePrompt: data.generatedImage?.prompt
      };

      setMessages(prev => [...prev, aiMsg]);
      onRewardXP(5, 'Consulted Gemini Study Companion');
    } catch (err: any) {
      console.error('[GeminiChatbot] Error:', err);
      setErrorMessage(err.message || 'Unable to connect to Gemini. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    const freshWelcome: ChatMessage = {
      id: `welcome-${Date.now()}`,
      sender: 'ai',
      text: `Chat cleared! Ready to assist you on **${activeSubject}: ${activeChapterName}**. Choose your preferred role and ask anything!`,
      timestamp: Date.now(),
      modelUsed: selectedModel,
      roleUsed: selectedRole
    };
    setMessages([freshWelcome]);
    localStorage.removeItem('cbse_brights_chat_history');
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(cleanLatexMath(text));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeRoleData = ROLES_CONFIG[selectedRole];
  const activeModelData = MODELS_CONFIG[selectedModel];
  const RoleIcon = activeRoleData.icon;
  const ModelIcon = activeModelData.icon;

  // Contextual prompt suggestions based on subject and chapter
  const promptSuggestions = [
    `Generate image of stomata with open and closed pores`,
    `Summarize the key board exam points of "${activeChapterName}"`,
    `Explain the most repeated 5-mark question in ${activeSubject}`,
    `Give me a rapid 3-question active recall drill on "${activeChapterName}"`
  ];

  return (
    <div 
      className={`flex flex-col h-[740px] rounded-3xl overflow-hidden transition-all border ${
        isMidnight 
          ? 'glass-panel border-slate-700/80 shadow-[0_15px_40px_rgba(0,0,0,0.5)]' 
          : 'bg-white border-2 border-slate-200 shadow-[6px_6px_0px_0px_rgba(226,232,240,1)]'
      }`}
    >
      {/* Top Header Bar */}
      <div className="p-4 border-b border-slate-200/50 bg-slate-500/5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-md relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-white dark:ring-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm md:text-base font-extrabold text-slate-900 dark:text-white">
                CBSE Bright AI Mentor
              </h3>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                Multi-Turn Active
              </span>
            </div>
            <p className="text-xs opacity-65 font-medium">
              Studying: <span className="font-bold text-indigo-500">{activeSubject}</span> &bull; {activeChapterName}
            </p>
          </div>
        </div>

        {/* Utility Actions */}
        <div className="flex items-center gap-2">
          {/* Image Generation Studio Button */}
          <button
            onClick={() => setIsImageModalOpen(true)}
            className={`py-1.5 px-3 rounded-xl border font-bold flex items-center gap-1.5 transition-all shadow-xs ${
              isMidnight 
                ? 'bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-purple-500/20 border-sky-500/40 text-sky-300 hover:brightness-110' 
                : 'bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 border-sky-300 text-sky-800 hover:border-sky-400'
            }`}
            title="Open AI Image Generation Studio"
          >
            <Palette className="w-3.5 h-3.5 text-sky-500" />
            <span className="text-xs font-black">Image Generation</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sky-500 text-white font-black">AI</span>
          </button>

          {/* Clear history */}
          <button
            onClick={handleClearHistory}
            className="p-2 rounded-xl opacity-60 hover:opacity-100 hover:bg-slate-500/10 text-xs transition-all flex items-center gap-1.5"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-xs">Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Role & Model Controls Selector Row */}
      <div className="px-4 py-2.5 border-b border-slate-200/40 bg-slate-500/5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Role Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsRoleDropdownOpen(!isRoleDropdownOpen);
                setIsModelDropdownOpen(false);
              }}
              className={`py-1.5 px-3 rounded-xl border font-bold flex items-center gap-2 transition-all ${
                isMidnight 
                  ? 'bg-slate-900/80 border-slate-700 hover:border-slate-600 text-slate-200' 
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-xs'
              }`}
            >
              <RoleIcon className="w-3.5 h-3.5 text-indigo-400" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold leading-none">AI Role</span>
                <span className="text-xs">{activeRoleData.title}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-1" />
            </button>

            {isRoleDropdownOpen && (
              <div 
                className={`absolute left-0 top-full mt-1.5 w-64 rounded-2xl p-2 z-20 border shadow-xl ${
                  isMidnight ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-1">
                  Choose System Role Instruction
                </div>
                {(Object.keys(ROLES_CONFIG) as ChatRoleChoice[]).map((rKey) => {
                  const r = ROLES_CONFIG[rKey];
                  const Icon = r.icon;
                  const isSelected = selectedRole === rKey;
                  return (
                    <button
                      key={rKey}
                      onClick={() => {
                        setSelectedRole(rKey);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                        isSelected 
                          ? isMidnight ? 'bg-indigo-500/20 text-indigo-400 font-bold' : 'bg-indigo-50 text-indigo-900 font-bold'
                          : 'hover:bg-slate-500/10 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <div>
                        <div className="font-bold">{r.title}</div>
                        <div className="text-[10px] opacity-60 leading-tight">{r.subtitle}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Model Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsModelDropdownOpen(!isModelDropdownOpen);
                setIsRoleDropdownOpen(false);
              }}
              className={`py-1.5 px-3 rounded-xl border font-bold flex items-center gap-2 transition-all ${
                isMidnight 
                  ? 'bg-slate-900/80 border-slate-700 hover:border-slate-600 text-slate-200' 
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-xs'
              }`}
            >
              <ModelIcon className="w-3.5 h-3.5 text-pink-400" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold leading-none">Model</span>
                <span className="text-xs">{activeModelData.name}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-1" />
            </button>

            {isModelDropdownOpen && (
              <div 
                className={`absolute left-0 top-full mt-1.5 w-64 rounded-2xl p-2 z-20 border shadow-xl ${
                  isMidnight ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-1">
                  Select Bright AI Model Tier
                </div>
                {(Object.keys(MODELS_CONFIG) as ChatModelChoice[]).map((mKey) => {
                  const m = MODELS_CONFIG[mKey];
                  const Icon = m.icon;
                  const isSelected = selectedModel === mKey;
                  return (
                    <button
                      key={mKey}
                      onClick={() => {
                        setSelectedModel(mKey);
                        setIsModelDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                        isSelected 
                          ? isMidnight ? 'bg-pink-500/20 text-pink-300 font-bold' : 'bg-pink-50 text-pink-900 font-bold'
                          : 'hover:bg-slate-500/10 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0 text-pink-400" />
                      <div>
                        <div className="font-bold">{m.name}</div>
                        <div className="text-[10px] opacity-60 leading-tight">{m.tag}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Current Active Role Badge */}
        <span className={`text-[10px] font-black uppercase tracking-wider py-1 px-2.5 rounded-full border ${activeRoleData.badgeColor}`}>
          Active: {activeRoleData.title}
        </span>
      </div>

      {/* Scrollable Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          const roleInfo = msg.roleUsed ? ROLES_CONFIG[msg.roleUsed] : null;

          return (
            <div 
              key={msg.id} 
              className={`flex ${isAi ? 'justify-start' : 'justify-end'} items-start gap-2.5 group`}
            >
              {isAi && (
                <div className="w-7 h-7 rounded-xl bg-violet-500/20 text-violet-400 font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[78%] flex flex-col ${isAi ? 'items-start' : 'items-end'}`}>
                {/* Message Bubble */}
                <div 
                  className={`p-3.5 md:p-4 rounded-2xl text-xs md:text-sm leading-relaxed ${
                    isAi
                      ? isMidnight
                        ? 'bg-slate-800/85 text-slate-100 border border-slate-700/70 rounded-tl-none shadow-sm'
                        : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none shadow-xs'
                      : isMidnight
                        ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-tr-none font-medium shadow-md whitespace-pre-wrap'
                        : 'bg-[#0058be] text-white rounded-tr-none font-medium shadow-sm whitespace-pre-wrap'
                  }`}
                >
                  {isAi ? (
                    <>
                      <FormattedMessage content={msg.text} isMidnight={isMidnight} />
                      
                      {/* Generated Raster Image View */}
                      {msg.imageUrl && (
                        <div className={`mt-3 rounded-2xl overflow-hidden border p-2 flex flex-col items-center ${
                          isMidnight ? 'bg-slate-900/90 border-slate-700' : 'bg-white border-slate-200 shadow-xs'
                        }`}>
                          <div className={`w-full flex items-center justify-between px-2 py-1 text-[11px] font-bold text-sky-500 border-b mb-2 ${
                            isMidnight ? 'border-slate-800' : 'border-slate-100'
                          }`}>
                            <span className="flex items-center gap-1.5">
                              <Palette className="w-3.5 h-3.5 text-sky-400" />
                              <span className="font-extrabold">Image Generation</span>
                            </span>
                            <a
                              href={msg.imageUrl}
                              download={`CBSE-Image-${msg.id}.png`}
                              className="text-[10px] text-slate-500 hover:text-sky-500 flex items-center gap-1 font-semibold"
                            >
                              <Download className="w-3 h-3" /> Download
                            </a>
                          </div>
                          <img
                            src={msg.imageUrl}
                            alt={msg.imagePrompt || 'Generated diagram'}
                            className="rounded-xl max-h-[360px] w-auto object-contain shadow-xs"
                          />
                        </div>
                      )}

                      {/* Generated SVG Diagram View */}
                      {msg.svgContent && (
                        <div className={`mt-3 rounded-2xl overflow-hidden border p-2 flex flex-col items-center ${
                          isMidnight ? 'bg-slate-900/90 border-slate-700' : 'bg-white border-slate-200 shadow-xs'
                        }`}>
                          <div className={`w-full flex items-center justify-between px-2 py-1 text-[11px] font-bold text-sky-500 border-b mb-2 ${
                            isMidnight ? 'border-slate-800' : 'border-slate-100'
                          }`}>
                            <span className="flex items-center gap-1.5">
                              <Palette className="w-3.5 h-3.5 text-sky-400" />
                              <span className="font-extrabold">Image Generation</span>
                            </span>
                            <button
                              onClick={() => {
                                const blob = new Blob([msg.svgContent!], { type: 'image/svg+xml;charset=utf-8' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `CBSE-Diagram-${msg.id}.svg`;
                                a.click();
                                URL.revokeObjectURL(url);
                              }}
                              className="text-[10px] text-slate-500 hover:text-sky-500 flex items-center gap-1 font-semibold"
                            >
                              <Download className="w-3 h-3" /> Download SVG
                            </button>
                          </div>
                          <div
                            className="w-full flex items-center justify-center p-1 overflow-x-auto"
                            dangerouslySetInnerHTML={{ __html: msg.svgContent }}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    msg.text
                  )}
                </div>

                {/* Footer metadata & copy action */}
                <div className="flex items-center gap-2 mt-1 px-1 text-[10px] opacity-60">
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isAi && msg.modelUsed && (
                    <>
                      <span>&bull;</span>
                      <span className="font-semibold text-indigo-400">{MODELS_CONFIG[msg.modelUsed]?.name || msg.modelUsed}</span>
                    </>
                  )}
                  {isAi && roleInfo && (
                    <>
                      <span>&bull;</span>
                      <span className="font-semibold">{roleInfo.title}</span>
                    </>
                  )}
                  <button
                    onClick={() => handleCopy(msg.text, msg.id)}
                    className="opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-slate-500/10"
                    title="Copy message"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              {!isAi && (
                <div className="w-7 h-7 rounded-xl bg-sky-500/20 text-sky-400 font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex justify-start items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-violet-500/20 text-violet-400 font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div 
              className={`p-3.5 rounded-2xl rounded-tl-none text-xs flex items-center gap-2 ${
                isMidnight ? 'bg-slate-800/80 text-slate-300' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Sparkles className="w-4 h-4 text-violet-500 animate-spin" />
              <span className="font-bold">
                {selectedModel === 'gemini-3.1-pro-preview' 
                  ? 'Bright AI Pro is computing deep multi-step reasoning...' 
                  : selectedModel === 'gemini-3.1-flash-lite'
                    ? 'Bright AI Lite is firing rapid answer...'
                    : 'Bright AI 2.0 is formulating comprehensive response...'}
              </span>
            </div>
          </div>
        )}

        {/* Error Notice */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-4 py-2 border-t border-slate-200/40 bg-slate-500/5 overflow-x-auto flex items-center gap-2">
        {/* Quick Image Generation Chip */}
        <button
          onClick={() => setIsImageModalOpen(true)}
          className={`text-[11px] py-1 px-3 rounded-full shrink-0 border transition-all font-black flex items-center gap-1.5 shadow-xs ${
            isMidnight 
              ? 'bg-gradient-to-r from-sky-500/20 to-purple-500/20 border-sky-500/40 text-sky-300 hover:brightness-110' 
              : 'bg-gradient-to-r from-sky-50 to-purple-50 border-sky-300 text-sky-800 hover:border-sky-400'
          }`}
        >
          <Palette className="w-3.5 h-3.5 text-sky-500" />
          <span>Image Generation</span>
        </button>

        {promptSuggestions.map((chip, i) => (
          <button
            key={i}
            onClick={() => handleSend(chip)}
            disabled={isLoading}
            className={`text-[11px] py-1 px-3 rounded-full shrink-0 border transition-all font-semibold ${
              isMidnight 
                ? 'bg-slate-900/60 border-slate-800 hover:bg-slate-800 text-sky-400' 
                : 'bg-white border-slate-200 hover:bg-sky-50 text-slate-700'
            }`}
          >
            {chip.length > 42 ? chip.substring(0, 40) + '...' : chip}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-slate-200/50 bg-slate-500/5 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() => setIsImageModalOpen(true)}
          className={`p-3 rounded-xl border transition-all shrink-0 ${
            isMidnight 
              ? 'bg-slate-900 border-slate-800 text-sky-400 hover:bg-slate-800' 
              : 'bg-white border-slate-200 text-sky-600 hover:bg-sky-50 shadow-xs'
          }`}
          title="Open AI Image Generation"
        >
          <Palette className="w-4 h-4" />
        </button>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask ${activeRoleData.title} or type "Generate image of stomata", "Draw BPT diagram"...`}
          className={`flex-1 text-xs md:text-sm font-semibold outline-none py-3 px-4 rounded-xl border ${
            isMidnight 
              ? 'bg-slate-950 border-slate-800 text-white focus:border-sky-400' 
              : 'bg-white border-slate-200 focus:border-[#0058be]'
          }`}
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={`p-3 rounded-xl text-white transition-all shrink-0 ${
            !input.trim() || isLoading
              ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
              : isMidnight
                ? 'bg-gradient-to-r from-sky-400 to-indigo-500 text-slate-950 shadow-[0_0_10px_rgba(56,189,248,0.3)] hover:opacity-90'
                : 'bg-[#0058be] hover:opacity-90 border-b-4 border-[#004395] hover:translate-y-[1px]'
          }`}
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Image Generation Studio Modal */}
      <ImageGenerationModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        isMidnight={isMidnight}
        activeSubject={activeSubject}
        activeChapterName={activeChapterName}
        onSendToChat={handleInsertGeneratedImage}
      />
    </div>
  );
};
