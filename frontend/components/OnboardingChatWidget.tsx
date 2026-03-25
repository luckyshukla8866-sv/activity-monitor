'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, Bot, User, ChevronDown } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://activity-monitor-qmx3.onrender.com';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const SUGGESTIONS = [
    'What does this app do?',
    'How do I upload data?',
    'What CSV format is needed?',
    'What insights will I get?',
];

export default function OnboardingChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content:
                "Hi there! 👋 I'm your **Activity Monitor assistant**.\n\nAsk me anything about the app — how it works, what data you need, or what insights you'll get!",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPulse, setShowPulse] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, scrollToBottom]);

    useEffect(() => {
        if (isOpen) {
            setShowPulse(false);
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_BASE}/api/ai/onboarding`, {
                question: userMsg.content,
            });

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.data.answer,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiMsg]);
        } catch (error: any) {
            const detail = error.response?.data?.detail;
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: detail
                    ? `Sorry, there was an issue: ${detail}`
                    : "I'm having trouble connecting right now. The server might be starting up — please try again in 30 seconds! 🔄",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMsg]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const showSuggestions = messages.length <= 1 && !isLoading;

    return (
        <>
            {/* ── Floating Button ──────────────────────────────────────── */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl
                                   bg-gradient-to-br from-indigo-500 to-purple-600
                                   shadow-lg shadow-indigo-500/30
                                   flex items-center justify-center
                                   hover:shadow-xl hover:shadow-indigo-500/40
                                   hover:scale-105 transition-all duration-200 cursor-pointer group"
                        aria-label="Open chat"
                    >
                        <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                        {showPulse && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#0a0a16] animate-pulse" />
                        )}
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ── Chat Panel ───────────────────────────────────────────── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="fixed bottom-6 right-6 z-50
                                   w-[380px] h-[520px] max-h-[80vh]
                                   flex flex-col
                                   rounded-2xl overflow-hidden
                                   border border-white/[0.08]
                                   bg-[#0c0c1a]/95 backdrop-blur-xl
                                   shadow-2xl shadow-black/40"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20">
                                    <Sparkles className="w-4 h-4 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-white/90">Ask me anything</h3>
                                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-medium">App Guide • AI Powered</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-white/40 hover:text-white/70 cursor-pointer"
                                aria-label="Close chat"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    {/* Avatar */}
                                    <div
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                            msg.role === 'assistant'
                                                ? 'bg-indigo-500/15 border border-indigo-500/20'
                                                : 'bg-emerald-500/15 border border-emerald-500/20'
                                        }`}
                                    >
                                        {msg.role === 'assistant' ? (
                                            <Bot className="w-3.5 h-3.5 text-indigo-400" />
                                        ) : (
                                            <User className="w-3.5 h-3.5 text-emerald-400" />
                                        )}
                                    </div>

                                    {/* Bubble */}
                                    <div
                                        className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                                            msg.role === 'user'
                                                ? 'bg-indigo-500/15 text-white/85 rounded-tr-md border border-indigo-500/10'
                                                : 'bg-white/[0.04] text-white/70 rounded-tl-md border border-white/[0.06]'
                                        }`}
                                    >
                                        <ReactMarkdown
                                            components={{
                                                p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                                                strong: ({ children }) => <strong className="text-white/90 font-semibold">{children}</strong>,
                                                ul: ({ children }) => <ul className="list-disc pl-4 space-y-0.5">{children}</ul>,
                                                li: ({ children }) => <li className="text-[13px]">{children}</li>,
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Typing indicator */}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex gap-2.5"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center shrink-0">
                                        <Bot className="w-3.5 h-3.5 text-indigo-400" />
                                    </div>
                                    <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-white/[0.04] border border-white/[0.06] flex gap-1 items-center">
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0ms]" />
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:150ms]" />
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:300ms]" />
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggestion chips */}
                        <AnimatePresence>
                            {showSuggestions && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="px-4 pb-2 flex flex-wrap gap-1.5"
                                >
                                    {SUGGESTIONS.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => sendMessage(s)}
                                            className="text-[11px] px-3 py-1.5 rounded-full
                                                       bg-indigo-500/8 border border-indigo-500/15
                                                       text-indigo-300/70 hover:text-indigo-200 hover:bg-indigo-500/15
                                                       transition-all cursor-pointer whitespace-nowrap"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Input */}
                        <form
                            onSubmit={handleSubmit}
                            className="px-4 py-3 border-t border-white/[0.06] bg-white/[0.02]"
                        >
                            <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 focus-within:border-indigo-500/30 transition-colors">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about this app..."
                                    disabled={isLoading}
                                    className="flex-1 bg-transparent text-sm text-white/80 placeholder:text-white/25
                                               outline-none disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="p-1.5 rounded-lg
                                               bg-indigo-500/20 text-indigo-400
                                               hover:bg-indigo-500/30 disabled:opacity-30
                                               transition-all cursor-pointer"
                                    aria-label="Send message"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
