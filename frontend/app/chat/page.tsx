'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles, Activity } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import PageContainer from '@/components/PageContainer';
import GlassCard from '@/components/GlassCard';

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    tokens?: number;
};

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hi there! I'm your AI productivity coach. I've analyzed your recent activity data. What would you like to know about your focus patterns?",
            timestamp: new Date(),
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Note: In a real app we'd get a real user_id from auth context
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/ai/chat`, {
                question: userMsg.content,
                user_id: 1 // Default test user
            });

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.data.answer,
                timestamp: new Date(),
                tokens: response.data.tokens_used
            };

            setMessages(prev => [...prev, aiMsg]);

        } catch (error: any) {
            console.error('Chat error:', error);
            
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: error.response?.data?.detail 
                    ? `⚠️ **Error**: ${error.response.data.detail}` 
                    : "⚠️ Sorry, I couldn't process your request right now. Please try again later.",
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageContainer title="AI Productivity Coach" description="Get personalized insights based on your recent activity">
            <div className="flex flex-col h-[calc(100vh-200px)] max-h-[800px] w-full max-w-4xl mx-auto">
                <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden relative">
                    
                    {/* Header */}
                    <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center gap-3 shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/20">
                            <Sparkles className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="font-medium text-white/90">Claude AI Coach</h2>
                            <p className="text-xs text-white/40 flex items-center gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                Connected to your data
                            </p>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                        <AnimatePresence initial={false}>
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    {/* Avatar */}
                                    <div className="shrink-0 mt-1">
                                        {message.role === 'assistant' ? (
                                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                                                <Bot className="w-4 h-4 text-indigo-300" />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-slate-700/50 border border-slate-600 flex items-center justify-center">
                                                <User className="w-4 h-4 text-slate-300" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Bubble */}
                                    <div className={`flex flex-col max-w-[85%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div 
                                            className={`
                                                px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed
                                                ${message.role === 'user' 
                                                    ? 'bg-indigo-600/80 text-white rounded-tr-sm shadow-[0_0_15px_rgba(79,70,229,0.15)]' 
                                                    : 'bg-slate-800/80 text-slate-200 border border-white/5 rounded-tl-sm'
                                                }
                                            `}
                                        >
                                            <div className="prose prose-invert prose-p:my-1 prose-ul:my-2 max-w-none">
                                                <ReactMarkdown>{message.content}</ReactMarkdown>
                                            </div>
                                        </div>
                                        
                                        {/* Meta (Time + Tokens) */}
                                        <div className="flex items-center gap-3 mt-1.5 px-1">
                                            <span className="text-[10px] text-white/30">
                                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {message.tokens && (
                                                <span className="text-[10px] text-indigo-400/60 flex items-center gap-1">
                                                    <Activity className="w-3 h-3" />
                                                    {message.tokens} tokens
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={messagesEndRef} className="h-4" />
                        </AnimatePresence>

                        {isLoading && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-4"
                            >
                                <div className="shrink-0 mt-1">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                                        <Bot className="w-4 h-4 text-indigo-300" />
                                    </div>
                                </div>
                                <div className="bg-slate-800/80 border border-white/5 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <motion.div className="w-2 h-2 rounded-full bg-indigo-400" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} />
                                        <motion.div className="w-2 h-2 rounded-full bg-indigo-400" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} />
                                        <motion.div className="w-2 h-2 rounded-full bg-indigo-400" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white/[0.02] border-t border-white/5 shrink-0 relative z-20">
                        <form onSubmit={handleSubmit} className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about your productivity patterns..."
                                disabled={isLoading}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-4 pr-12 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-white/30 disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-500 text-white transition-colors"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4 translate-x-[1px]" />
                                )}
                            </button>
                        </form>
                    </div>

                </GlassCard>
            </div>
        </PageContainer>
    );
}
