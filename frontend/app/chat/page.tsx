'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import apiClient from '@/lib/api';
import PageContainer from '@/components/PageContainer';


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
            const response = await apiClient.post('/api/ai/chat', {
                question: userMsg.content,
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
                <div className="bg-surface extrusion rounded-[2rem] flex-1 flex flex-col p-0 overflow-hidden relative">
                    
                    {/* Header */}
                    <div className="p-4 border-b border-[#e5e9eb] bg-[#eef1f3] flex items-center gap-3 shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2444eb] to-[#8999ff] flex items-center justify-center shadow-md shadow-[#2444eb]/20">
                            <span className="material-symbols-outlined text-white text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
                        </div>
                        <div>
                            <h2 className="font-bold text-[#2c2f31]" style={{fontFamily: 'Manrope, sans-serif'}}>Claude AI Coach</h2>
                            <p className="text-xs text-[#595c5e] flex items-center gap-1.5 mt-0.5">
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
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2444eb] to-[#8999ff] flex items-center justify-center shadow-sm shadow-[#2444eb]/20">
                                                <span className="material-symbols-outlined text-white text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>smart_toy</span>
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full recessed flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[#595c5e] text-[14px]">person</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bubble */}
                                    <div className={`flex flex-col max-w-[85%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div 
                                            className={`
                                                px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed
                                                ${message.role === 'user' 
                                                    ? 'cta-gradient text-white rounded-tr-sm' 
                                                    : 'extrusion text-[#2c2f31] rounded-tl-sm'
                                                }
                                            `}
                                        >
                                            <div className={`prose max-w-none ${message.role === 'user' ? 'prose-invert' : 'prose-slate'} prose-p:my-1 prose-ul:my-2`}>
                                                <ReactMarkdown>{message.content}</ReactMarkdown>
                                            </div>
                                        </div>
                                        
                                        {/* Meta (Time + Tokens) */}
                                        <div className="flex items-center gap-3 mt-1.5 px-1">
                                            <span className="text-[10px] text-[#747779]">
                                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {message.tokens && (
                                                <span className="text-[10px] text-[#2444eb]/60 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[12px]">monitoring</span>
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
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2444eb] to-[#8999ff] flex items-center justify-center shadow-sm shadow-[#2444eb]/20">
                                        <span className="material-symbols-outlined text-white text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>smart_toy</span>
                                    </div>
                                </div>
                                <div className="extrusion rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <motion.div className="w-2 h-2 rounded-full bg-[#2444eb]" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} />
                                        <motion.div className="w-2 h-2 rounded-full bg-[#2444eb]" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} />
                                        <motion.div className="w-2 h-2 rounded-full bg-[#2444eb]" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-[#eef1f3] border-t border-[#e5e9eb] shrink-0 relative z-20">
                        <form onSubmit={handleSubmit} className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about your productivity patterns..."
                                disabled={isLoading}
                                className="w-full bg-white border border-[#e5e9eb] rounded-xl pl-4 pr-12 py-3.5 text-sm text-[#2c2f31] focus:outline-none focus:border-[#2444eb]/50 focus:ring-1 focus:ring-[#2444eb]/50 transition-all placeholder:text-[#abadaf] disabled:opacity-50 shadow-sm"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-[#2444eb] hover:bg-[#0934e0] disabled:bg-[#e5e9eb] disabled:text-[#abadaf] text-white transition-colors cursor-pointer"
                            >
                                {isLoading ? (
                                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                                ) : (
                                    <span className="material-symbols-outlined text-[16px]">send</span>
                                )}
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </PageContainer>
    );
}
