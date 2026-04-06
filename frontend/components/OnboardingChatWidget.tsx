'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
                "Hi there! 👋 I'm your **Ethereal Analytics assistant**.\n\nAsk me anything about the app — how it works, what data you need, or what insights you'll get!",
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
                                   bg-gradient-to-br from-[#2444eb] to-[#8999ff]
                                   shadow-lg shadow-[#2444eb]/30
                                   flex items-center justify-center
                                   hover:shadow-xl hover:shadow-[#2444eb]/40
                                   hover:scale-105 transition-all duration-200 cursor-pointer group"
                        aria-label="Open chat"
                    >
                        <span className="material-symbols-outlined text-white text-[24px] group-hover:scale-110 transition-transform">chat</span>
                        {showPulse && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#f5f7f9] animate-pulse" />
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
                                   rounded-[2rem] overflow-hidden
                                   extrusion bg-white
                                   shadow-2xl shadow-[#2c2f31]/10"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e9eb] bg-[#eef1f3]">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-[#2444eb] to-[#8999ff] shadow-sm shadow-[#2444eb]/20">
                                    <span className="material-symbols-outlined text-white text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[#2c2f31]" style={{fontFamily: 'Manrope, sans-serif'}}>Ask me anything</h3>
                                    <p className="text-[10px] text-[#747779] uppercase tracking-widest font-bold">App Guide • AI Powered</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-lg hover:bg-[#e5e9eb] transition-colors text-[#747779] hover:text-[#2c2f31] cursor-pointer"
                                aria-label="Close chat"
                            >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-white">
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
                                                ? 'bg-gradient-to-br from-[#2444eb] to-[#8999ff] shadow-sm shadow-[#2444eb]/20'
                                                : 'recessed'
                                        }`}
                                    >
                                        {msg.role === 'assistant' ? (
                                            <span className="material-symbols-outlined text-white text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>smart_toy</span>
                                        ) : (
                                            <span className="material-symbols-outlined text-[#595c5e] text-[14px]">person</span>
                                        )}
                                    </div>

                                    {/* Bubble */}
                                    <div
                                        className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                                            msg.role === 'user'
                                                ? 'cta-gradient text-white rounded-tr-md'
                                                : 'recessed text-[#2c2f31] rounded-tl-md'
                                        }`}
                                    >
                                        <ReactMarkdown
                                            components={{
                                                p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                                                strong: ({ children }) => <strong className={`font-bold ${msg.role === 'user' ? 'text-white' : 'text-[#2c2f31]'}`}>{children}</strong>,
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
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2444eb] to-[#8999ff] flex items-center justify-center shrink-0 shadow-sm shadow-[#2444eb]/20">
                                        <span className="material-symbols-outlined text-white text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>smart_toy</span>
                                    </div>
                                    <div className="px-4 py-3 rounded-2xl rounded-tl-md recessed flex gap-1 items-center">
                                        <span className="w-1.5 h-1.5 bg-[#2444eb] rounded-full animate-bounce [animation-delay:0ms]" />
                                        <span className="w-1.5 h-1.5 bg-[#2444eb] rounded-full animate-bounce [animation-delay:150ms]" />
                                        <span className="w-1.5 h-1.5 bg-[#2444eb] rounded-full animate-bounce [animation-delay:300ms]" />
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
                                    className="px-4 pb-2 flex flex-wrap gap-1.5 bg-white"
                                >
                                    {SUGGESTIONS.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => sendMessage(s)}
                                            className="text-[11px] px-3 py-1.5 rounded-full
                                                       recessed
                                                       text-[#2444eb] hover:text-[#0934e0] hover:bg-[#e5e9eb]
                                                       transition-all cursor-pointer whitespace-nowrap font-medium"
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
                            className="px-4 py-3 border-t border-[#e5e9eb] bg-[#eef1f3]"
                        >
                            <div className="flex items-center gap-2 rounded-xl bg-white border border-[#e5e9eb] px-3 py-1.5 focus-within:border-[#2444eb]/30 transition-colors shadow-sm">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about this app..."
                                    disabled={isLoading}
                                    className="flex-1 bg-transparent text-sm text-[#2c2f31] placeholder:text-[#abadaf]
                                               outline-none disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="p-1.5 rounded-lg
                                               bg-[#2444eb]/10 text-[#2444eb]
                                               hover:bg-[#2444eb]/20 disabled:opacity-30
                                               transition-all cursor-pointer"
                                    aria-label="Send message"
                                >
                                    <span className="material-symbols-outlined text-[14px]">send</span>
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
