/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { X, Send, Cpu, User, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { Store } from "../types";

interface UmojaScoutProps {
  isOpen: boolean;
  onClose: () => void;
  stores: Store[];
  onOpenStore: (storeId: string) => void;
  onAddProductToCart: (product: any, storeId: string, storeName: string) => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const PRESET_QUERIES = [
  { label: "🎁 Skincare gift under $30", prompt: "Recommend some skincare or bath items on the marketplace that cost $30 or less. Tell me about the founders!" },
  { label: "☕ Find high-quality coffees", prompt: "What specialty single-origin coffees do we have here? Please compare their flavor notes and pricing." },
  { label: "📖 Discover Diaspora Literature", prompt: "Tell me about the books available in the bookstore and how the authors contribute to the community." },
  { label: "🎨 Tell me about Kente fashion", prompt: "I am interested in premium West African style. Suggest a fashion item and tell me about the weavers." }
];

export default function UmojaScout({
  isOpen,
  onClose,
  stores,
  onOpenStore,
  onAddProductToCart
}: UmojaScoutProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: "Abibifahodie! Warm greetings! I am **Umoja Scout**, your dedicated cultural shopper. ✊🏿✨\n\nI can search our directory, compare product prices, share the remarkable stories of our Black founders, and help you find exactly what you're looking for. \n\nHow may I support your conscious shopping journey today?"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (!isOpen) return null;

  async function handleSendMessage(queryText: string) {
    if (!queryText.trim()) return;
    setErrorText(null);

    const userMessage = queryText.trim();
    setInputValue("");
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: userMessage,
          chatHistory: messages.slice(-10), // Pass recent context for continuity
          stores: stores
        })
      });

      if (!response.ok) {
        throw new Error("Our AI network is taking a short rest. Please try again soon!");
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'model', text: data.text }]);
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "Failed to communicate with AI Scout.");
    } finally {
      setIsLoading(false);
    }
  }

  // Parse markdown bold and links roughly for presentation
  function formatReply(text: string) {
    // Basic formatting replacement to avoid heavy dependencies
    return text.split('\n').map((line, idx) => {
      let enriched = line;
      
      // Inline bold: **text**
      enriched = enriched.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
      
      // Bullet points
      if (line.startsWith('* ') || line.startsWith('- ')) {
        return (
          <li key={idx} className="ml-4 list-disc pl-1 mb-1 text-warm-gray/90 leading-relaxed" 
              dangerouslySetInnerHTML={{ __html: enriched.substring(2) }} />
        );
      }
      
      return (
        <p key={idx} className="mb-2.5 leading-relaxed text-sm text-warm-gray/90" 
           dangerouslySetInnerHTML={{ __html: enriched }} />
      );
    });
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-modal="true" role="dialog">
      {/* Background Overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-[#0C0908]/70 backdrop-blur-sm transition-opacity" 
      />

      {/* Drawer content */}
      <div className="absolute inset-y-0 right-0 max-w-full pl-10 flex">
        <div className="w-screen max-w-md bg-[#1B1412] text-warm-gray border-l border-gold-base/20 flex flex-col shadow-2xl relative">
          
          {/* Header */}
          <div className="px-6 py-5 bg-[#251B18] border-b border-gold-base/15 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-clay rounded-xl text-gold-light shadow-inner">
                <Cpu className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                  AI Umoja Scout
                  <Sparkles className="w-3.5 h-3.5 text-gold-base fill-gold-base" />
                </h3>
                <p className="text-[10px] font-mono uppercase tracking-widest text-gold-base">
                  Concierge & Storyteller
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1 px-2 text-gold-light/40 hover:text-gold-light hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div 
            ref={listRef}
            className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gradient-to-b from-[#18110F] to-[#140E0C]"
          >
            {messages.map((msg, idx) => (
              <div 
                key={idx}
                className={`flex gap-3 max-w-[85%] ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div className={`p-2 rounded-lg text-bazaar-dark shrink-0 h-9 w-9 flex items-center justify-center ${
                  msg.role === 'user' ? 'bg-[#98847E]' : 'bg-gold-base'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Cpu className="w-5 h-5" />}
                </div>

                {/* Bubble */}
                <div className={`p-4 rounded-2xl shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-[#3b2a26] text-white rounded-tr-sm border border-gold-light/10 text-right' 
                    : 'bg-[#291F1C] border border-gold-base/10 text-left'
                }`}>
                  <div className="text-xs">
                    {formatReply(msg.text)}
                  </div>
                </div>
              </div>
            ))}

            {/* AI Loading state */}
            {isLoading && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="p-2 rounded-lg bg-gold-base text-bazaar-dark h-9 w-9 flex items-center justify-center animate-bounce">
                  <Cpu className="w-5 h-5" />
                </div>
                <div className="p-4 rounded-2xl bg-[#291F1C] border border-gold-base/10 shadow-sm">
                  <div className="flex items-center gap-2 text-xs text-gold-base font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-base animate-ping"></span>
                    Umoja Scout is looking through our apothecary, weaving patterns, and blending roasts...
                  </div>
                </div>
              </div>
            )}

            {/* Error alerts */}
            {errorText && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-clay/20 border border-clay/40 text-[#FFA382]">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="text-xs font-mono">{errorText}</span>
              </div>
            )}
          </div>

          {/* Quick recommendations presets */}
          <div className="px-6 py-3 bg-[#1F1715] border-t border-gold-base/5 space-y-2">
            <span className="text-[10px] font-mono text-gold-light/40 uppercase tracking-wider block">
              💡 Quick scouting topics:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_QUERIES.map((preset, i) => (
                <button
                  key={i}
                  disabled={isLoading}
                  onClick={() => handleSendMessage(preset.prompt)}
                  className="p-2 text-left bg-[#1B1412] hover:bg-clay/20 hover:text-white border border-gold-base/10 hover:border-gold-base/30 rounded-lg text-xs leading-tight transition-all text-gold-light font-medium"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Directory Lookup Links inside Umoja */}
          <div className="px-6 py-2.5 bg-[#1B1412] border-t border-gold-base/5 flex items-center justify-between">
            <span className="text-[10px] font-mono text-gold-base uppercase">Available Stores:</span>
            <div className="flex flex-wrap gap-1.5">
              {stores.slice(0, 3).map(store => (
                <button
                  key={store.id}
                  onClick={() => {
                    onOpenStore(store.id);
                    onClose();
                  }}
                  className="text-[10px] bg-clay/15 rounded-md px-2 py-0.5 text-gold-light hover:bg-clay/50 border border-gold-base/10"
                >
                  {store.name}
                </button>
              ))}
            </div>
          </div>

          {/* Form Input Footer */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="p-4 bg-[#231A18] border-t border-gold-base/20 flex gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              placeholder="Ask me: What's the story behind the single-origin Ethiopia roast?"
              className="flex-1 bg-[#16100E] border border-gold-base/20 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-gold-base font-sans"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="p-2.5 bg-gold-base hover:bg-gold-dark text-bazaar-dark rounded-xl font-semibold transition-colors disabled:opacity-30 disabled:hover:bg-gold-base cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
