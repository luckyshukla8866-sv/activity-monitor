'use client';

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Bot, User, Sparkles, Activity, Zap,
    Brain, Target, TrendingUp, RotateCcw,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import apiClient from '@/lib/api';
import { getUserStorageKey } from '@/lib/auth-utils';

/* ── Types ─────────────────────────────────────────────────────────── */

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    tokens?: number;
};

/* ── Quick-prompt suggestions ──────────────────────────────────────── */

const SUGGESTIONS = [
    { icon: TrendingUp, label: 'Why was my productivity low this week?', color: 'from-rose-500/10 to-pink-500/10 border-rose-500/20 text-rose-700' },
    { icon: Target, label: 'When am I most focused?', color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-700' },
    { icon: Brain, label: 'Am I at risk of burnout?', color: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-700' },
    { icon: Zap, label: 'What apps are hurting my focus?', color: 'from-violet-500/10 to-purple-500/10 border-violet-500/20 text-violet-700' },
];

/* ── Typing indicator ──────────────────────────────────────────────── */

function TypingIndicator() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex gap-3 items-start"
        >
            {/* Avatar */}
            <div className="shrink-0 mt-1">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[18px] text-indigo-600">smart_toy</span>
                </div>
            </div>
            {/* Dots */}
            <div className="extrusion rounded-2xl rounded-tl-sm px-5 py-4">
                <div className="flex gap-1.5 items-center">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-indigo-400"
                            animate={{
                                y: [0, -6, 0],
                                opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 0.8,
                                delay: i * 0.15,
                                ease: 'easeInOut',
                            }}
                        />
                    ))}
                    <span className="text-xs text-slate-400 ml-2 font-mono">analyzing...</span>
                </div>
            </div>
        </motion.div>
    );
}

/* ── Message bubble ────────────────────────────────────────────────── */

function MessageBubble({ message }: { message: Message }) {
    const isUser = message.role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
        >
            {/* Avatar */}
            <div className="shrink-0 mt-1">
                {isUser ? (
                    <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-[18px] text-slate-500">person</span>
                    </div>
                ) : (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-[18px] text-indigo-600">smart_toy</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className={`flex flex-col max-w-[82%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                    className={`
                        px-5 py-3.5 rounded-2xl text-[14.5px] leading-relaxed
                        ${isUser
                            ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md shadow-indigo-600/20'
                            : 'extrusion text-slate-700 rounded-tl-sm'
                        }
                    `}
                >
                    <div className={`prose prose-sm prose-p:my-1.5 prose-ul:my-2 prose-li:my-0.5 max-w-none ${isUser ? 'prose-invert prose-headings:text-white prose-strong:text-white prose-code:text-indigo-100 prose-code:bg-indigo-500/20' : 'prose-headings:text-slate-900 prose-strong:text-slate-900 prose-code:text-indigo-600 prose-code:bg-indigo-50' } prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-[13px]`}>
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                </div>

                {/* Meta: time + tokens */}
                <div className="flex items-center gap-3 mt-1.5 px-1">
                    <span className="text-[10px] text-slate-400 font-mono">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {message.tokens && (
                        <span className="text-[10px] text-indigo-400 flex items-center gap-1 font-mono">
                            <span className="material-symbols-outlined text-[10px]">analytics</span>
                            {message.tokens.toLocaleString()} tokens
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

/* ── Main page ─────────────────────────────────────────────────────── */

export default function CoachPage() {
    const DEFAULT_MESSAGE: Message = {
        id: 'welcome',
        role: 'assistant',
        content:
            "Hey! I'm your **AI productivity coach** powered by Claude.\n\nI've got access to your recent activity data — ask me anything about your focus patterns, app usage, deep work ratio, or burnout risk.\n\nTry one of the suggestions below, or ask your own question!",
        timestamp: new Date(),
    };

    const [messages, setMessages] = useState<Message[]>([DEFAULT_MESSAGE]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount (namespaced by user)
    useEffect(() => {
        const storageKey = getUserStorageKey('coach_messages');
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const withDates = parsed.map((m: any) => ({
                    ...m,
                    timestamp: new Date(m.timestamp)
                }));
                if (withDates.length > 0) {
                    setMessages(withDates);
                }
            } catch (e) {
                console.error("Failed to parse saved chat messages");
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage whenever messages change (namespaced by user)
    useEffect(() => {
        if (isLoaded) {
            const storageKey = getUserStorageKey('coach_messages');
            localStorage.setItem(storageKey, JSON.stringify(messages));
        }
    }, [messages, isLoaded]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    /* Auto-scroll */
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, scrollToBottom]);

    /* Auto-resize textarea */
    useEffect(() => {
        const ta = textareaRef.current;
        if (ta) {
            ta.style.height = 'auto';
            ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
        }
    }, [input]);

    /* ── Send message ──────────────────────────────────────────────── */

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

        // Reset textarea height
        if (textareaRef.current) textareaRef.current.style.height = 'auto';

        try {
            const response = await apiClient.post('/api/ai/chat', {
                question: userMsg.content,
            });

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.data.answer,
                timestamp: new Date(),
                tokens: response.data.tokens_used,
            };

            setMessages((prev) => [...prev, aiMsg]);
        } catch (error: any) {
            const detail = error.response?.data?.detail;
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: detail
                    ? `**Error:** ${detail}`
                    : "Sorry, I couldn't process your request right now. Please check that the backend is running and the Anthropic API key is configured.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMsg]);
        } finally {
            setIsLoading(false);
            textareaRef.current?.focus();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    const clearChat = () => {
        setMessages([
            {
                id: 'welcome-' + Date.now(),
                role: 'assistant',
                content: "Chat cleared. What would you like to know about your productivity?",
                timestamp: new Date(),
            },
        ]);
    };

    const showSuggestions = messages.length <= 1 && !isLoading;

    return (
        <div className="pb-10 font-sans max-w-[1200px] w-full mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8 flex items-center justify-between"
            >
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-3 font-manrope">
                        <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-sm">
                            <span className="material-symbols-outlined text-[24px] text-indigo-600">auto_awesome</span>
                        </div>
                        AI Coach
                    </h1>
                    <p className="text-sm text-slate-500 mt-2 font-inter">
                        Personalized productivity insights from your activity data
                    </p>
                </div>
                {messages.length > 1 && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={clearChat}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent shadow-sm transition-all"
                    >
                        <span className="material-symbols-outlined text-[18px]">refresh</span>
                        New Chat
                    </motion.button>
                )}
            </motion.div>

            {/* Chat Container */}
            <div className="extrusion flex flex-col h-[calc(100vh-250px)] min-h-[500px] max-h-[800px] p-0 overflow-hidden relative rounded-[2rem]">

                {/* Status bar */}
                <div className="px-6 py-4 border-b border-slate-200/50 bg-[#eef1f3]/50 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                            </span>
                            <span className="text-xs text-slate-600 font-medium">Claude Sonnet 4</span>
                        </div>
                        <span className="text-slate-300">|</span>
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                            Last 30 days context
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                        <span className="material-symbols-outlined text-[14px]">psychology</span>
                        {messages.filter((m) => m.role === 'assistant' && m.tokens).reduce((sum, m) => sum + (m.tokens || 0), 0).toLocaleString()} total tokens
                    </div>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-white" id="coach-messages">
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <MessageBubble key={msg.id} message={msg} />
                        ))}
                    </AnimatePresence>

                    {/* Typing indicator */}
                    <AnimatePresence>
                        {isLoading && <TypingIndicator />}
                    </AnimatePresence>

                    <div ref={messagesEndRef} className="h-2" />
                </div>

                {/* Suggestion chips */}
                <AnimatePresence>
                    {showSuggestions && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="px-6 pb-4 shrink-0 bg-white"
                        >
                            <div className="flex flex-wrap gap-2">
                                {SUGGESTIONS.map((s) => (
                                    <button
                                        key={s.label}
                                        onClick={() => sendMessage(s.label)}
                                        className={`
                                            group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium
                                            bg-gradient-to-r ${s.color} border transition-all duration-200
                                            hover:scale-[1.02] shadow-sm hover:shadow-md
                                        `}
                                    >
                                        <s.icon className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Input area */}
                <div className="px-6 py-4 bg-[#f5f7f9] border-t border-slate-200/50 shrink-0">
                    <form onSubmit={handleSubmit} className="relative flex items-end gap-3">
                        <div className="flex-1 relative">
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about your productivity patterns..."
                                disabled={isLoading}
                                rows={1}
                                className="
                                    w-full recessed rounded-2xl
                                    px-5 py-4 pr-4 text-[14px] text-slate-800 resize-none
                                    border-none
                                    focus:outline-none focus:ring-2 focus:ring-indigo-500/30
                                    transition-all placeholder:text-slate-400
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    min-h-[52px] max-h-[160px]
                                "
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="
                                shrink-0 p-4 rounded-2xl transition-all duration-200
                                bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20
                                disabled:bg-slate-200 disabled:shadow-none
                                disabled:text-slate-400 text-white
                                hover:shadow-indigo-600/30 hover:scale-[1.02]
                                active:scale-95 flex items-center justify-center
                            "
                        >
                            <span className="material-symbols-outlined text-[20px]">send</span>
                        </button>
                    </form>
                    <p className="text-[11px] text-slate-500 mt-2 text-center font-mono">
                        Press Enter to send &middot; Shift+Enter for new line
                    </p>
                </div>
            </div>
        </div>
    );
}

