'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';

/* ── Staggered Reveal Component ───────────────── */
function Reveal({ children, className = '', id, delay = 0 }: { children: React.ReactNode, className?: string, id?: string, delay?: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "0px 0px -80px 0px" });

    return (
        <motion.div
            ref={ref}
            id={id}
            className={className}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            {children}
        </motion.div>
    );
}

/* ── Floating Particle System ─────────────────── */
function ParticleField() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        width: `${Math.random() * 4 + 2}px`,
                        height: `${Math.random() * 4 + 2}px`,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        background: `rgba(79, 70, 229, ${Math.random() * 0.3 + 0.1})`,
                        animation: `particleDrift ${Math.random() * 15 + 10}s linear infinite`,
                        animationDelay: `${Math.random() * 10}s`,
                    }}
                />
            ))}
        </div>
    );
}

/* ── Animated Counter ─────────────────────────── */
function AnimatedCounter({ value, suffix = '' }: { value: string, suffix?: string }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const [display, setDisplay] = useState('0');

    useEffect(() => {
        if (!isInView) return;
        const numericPart = parseFloat(value.replace(/[^0-9.]/g, ''));
        if (isNaN(numericPart)) {
            setDisplay(value);
            return;
        }
        let start = 0;
        const duration = 2000;
        const startTime = Date.now();
        const timer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            start = numericPart * eased;
            if (value.includes('.')) {
                setDisplay(start.toFixed(1));
            } else {
                setDisplay(Math.round(start).toLocaleString());
            }
            if (progress >= 1) clearInterval(timer);
        }, 16);
        return () => clearInterval(timer);
    }, [isInView, value]);

    return <span ref={ref}>{display}{suffix}</span>;
}

/* ── Feature Card ─────────────────────────────── */
function FeatureCard({ icon, iconColor, title, description, delay }: { icon: string, iconColor: string, title: string, description: string, delay: number }) {
    return (
        <Reveal delay={delay}>
            <motion.div
                className="bg-white/60 backdrop-blur-sm p-10 rounded-[2rem] border border-white/50 relative overflow-hidden group hover-lift"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] opacity-0 group-hover:opacity-30 transition-opacity duration-700" style={{ background: iconColor }} />
                <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 relative" style={{ background: `${iconColor}15` }}>
                    <span className="material-symbols-outlined text-3xl" style={{ color: iconColor, fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                    <div className="absolute inset-0 rounded-[1.5rem] animate-border-glow" style={{ borderColor: `${iconColor}20`, borderWidth: '1px', borderStyle: 'solid' }} />
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>{title}</h3>
                <p className="text-[#4b5563] leading-relaxed">{description}</p>
            </motion.div>
        </Reveal>
    );
}

export default function LandingPage() {
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll();
    const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            router.replace('/dashboard');
        }
    }, [router]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const stats = [
        { value: '2,401', label: 'Hours Tracked', icon: 'schedule', color: '#4f46e5' },
        { value: 'Top 5%', label: 'Deep Work', icon: 'rocket_launch', color: '#a855f7' },
        { value: '98.2%', label: 'ML Accuracy', icon: 'query_stats', color: '#7c3aed' },
        { value: 'No Risk', label: 'Burnout Chance', icon: 'verified_user', color: '#10b981' },
    ];

    return (
        <div className="bg-[#f0f2f5] text-[#1a1d21] antialiased overflow-x-hidden min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* ── Fixed Header ──────────────────────── */}
            <motion.header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-3' : 'py-5'}`}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div className={`max-w-[1440px] mx-auto px-6 md:px-10 flex justify-between items-center rounded-2xl transition-all duration-500 ${scrolled ? 'bg-white/70 backdrop-blur-2xl shadow-lg shadow-black/[0.03] mx-4 px-6 py-2 border border-white/50' : ''}`}>
                    <motion.div
                        className="text-xl font-black tracking-tight gradient-text"
                        style={{ fontFamily: 'Manrope, sans-serif' }}
                        whileHover={{ scale: 1.05 }}
                    >
                        Activity Monitor
                    </motion.div>
                    <nav className="hidden md:flex flex-1 max-w-sm mx-8 items-center bg-white/40 backdrop-blur-xl rounded-full px-2 py-1.5 justify-around border border-white/50">
                        {['Features', 'Journey', 'AI Coach'].map((item, i) => (
                            <a
                                key={item}
                                className={`px-5 py-2 text-sm font-medium transition-all cursor-pointer rounded-full ${i === 2 ? 'font-bold text-white bg-[#4f46e5] shadow-md shadow-[#4f46e5]/20' : 'text-[#4b5563] hover:text-[#4f46e5] hover:bg-white/60'}`}
                                href={`#${item.toLowerCase().replace(' ', '')}`}
                            >
                                {item}
                            </a>
                        ))}
                    </nav>
                    <div className="flex items-center gap-4">
                        <button className="text-[#4b5563] font-semibold text-sm hover:text-[#4f46e5] transition-colors cursor-pointer" onClick={() => router.push('/login')}>Sign In</button>
                        <motion.button
                            className="cta-gradient text-white px-6 py-2.5 rounded-full font-bold text-sm cursor-pointer relative overflow-hidden"
                            onClick={() => router.push('/login')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="relative z-10">Try Demo Free</span>
                        </motion.button>
                    </div>
                </div>
            </motion.header>

            <main className="pt-32 relative">
                <ParticleField />

                {/* ── Ambient Background Orbs ──────── */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[120px] bg-[#4f46e5]/[0.07] morph-blob pointer-events-none" />
                <div className="absolute top-[30%] right-[10%] w-[500px] h-[500px] rounded-full blur-[100px] bg-[#a855f7]/[0.05] float-slow pointer-events-none" />
                <div className="absolute top-[60%] left-[5%] w-[600px] h-[600px] rounded-full blur-[100px] bg-[#7c3aed]/[0.05] float-slow pointer-events-none" style={{ animationDelay: '3s' }} />

                {/* ── Hero Section ─────────────────── */}
                <motion.section ref={heroRef} style={{ opacity: heroOpacity, scale: heroScale }} className="max-w-7xl mx-auto px-6 py-20 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.div
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#4f46e5]/[0.08] border border-[#4f46e5]/20 text-[#4f46e5] text-sm font-semibold mb-8"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            <span className="w-2 h-2 rounded-full bg-[#4f46e5] animate-pulse" />
                            AI-Powered Productivity Analytics
                        </motion.div>
                    </motion.div>

                    <motion.h1
                        className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-[1.05]"
                        style={{ fontFamily: 'Manrope, sans-serif' }}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                    >
                        Understand your <br />
                        <span className="gradient-text">
                            productivity patterns
                        </span>
                    </motion.h1>

                    <motion.p
                        className="max-w-3xl mx-auto text-lg md:text-xl text-[#4b5563] leading-relaxed mb-12"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        Upload your activity logs. Our machine learning models map your focus hours, categorize apps, and predict burnout risk — all with actionable AI coaching.
                    </motion.p>

                    <motion.div
                        className="flex flex-wrap justify-center gap-6"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                    >
                        <motion.button
                            className="cta-gradient text-white px-10 py-5 rounded-2xl font-bold text-lg cursor-pointer relative overflow-hidden group"
                            onClick={() => router.push('/login')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            <span className="relative z-10 flex items-center gap-3">
                                <span className="material-symbols-outlined text-xl">auto_awesome</span>
                                Try Demo Free
                            </span>
                        </motion.button>
                        <motion.button
                            className="bg-white/70 backdrop-blur-xl text-[#4f46e5] px-10 py-5 rounded-2xl font-bold text-lg cursor-pointer border border-white/50 shadow-lg shadow-black/[0.03] hover:shadow-xl hover:bg-white/90 transition-all"
                            onClick={() => router.push('/login')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-xl">login</span>
                                Sign In
                            </span>
                        </motion.button>
                    </motion.div>
                </motion.section>

                {/* ── Stats Bento Grid ────────────── */}
                <Reveal className="max-w-6xl mx-auto px-6 mb-32">
                    <div className="bg-white/50 backdrop-blur-xl rounded-[3rem] p-8 md:p-12 relative overflow-hidden border border-white/50 shadow-xl shadow-black/[0.03]">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-[#4f46e5]/5 blur-[100px] -mr-32 -mt-32 morph-blob" />
                        <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#a855f7]/5 blur-[80px] -ml-20 -mb-20 morph-blob" style={{ animationDelay: '5s' }} />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                            {stats.map((stat, i) => (
                                <Reveal key={stat.label} delay={i * 0.1}>
                                    <motion.div
                                        className="bg-white/70 backdrop-blur-sm rounded-[2rem] p-8 flex flex-col items-center text-center border border-white/60 group"
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    >
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110" style={{ background: `${stat.color}15` }}>
                                            <span className="material-symbols-outlined text-2xl" style={{ color: stat.color, fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                                        </div>
                                        <div className="text-3xl font-black mb-1" style={{ fontFamily: 'Manrope, sans-serif', color: stat.color }}>
                                            {stat.value.includes('%') ? <AnimatedCounter value={stat.value.replace('%', '')} suffix="%" /> : stat.value}
                                        </div>
                                        <div className="text-xs font-bold uppercase tracking-widest text-[#6b7280]">{stat.label}</div>
                                    </motion.div>
                                </Reveal>
                            ))}
                        </div>

                        {/* Bento panels */}
                        <div className="mt-10 grid md:grid-cols-3 gap-6 relative z-10">
                            <motion.div
                                className="md:col-span-2 bg-white/60 backdrop-blur-sm rounded-[2rem] h-[400px] flex items-center justify-center relative group overflow-hidden border border-white/50"
                                whileHover={{ scale: 1.01 }}
                            >
                                <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-700">
                                    <img className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" alt="abstract dashboard interface" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWYJwfEO-3HpNQjBzdKmsgYrDRbziGcK1hbSgrdUh6MkOmzrQLtw2JNp0kqAFBAfsBTxIURetUD6SbAi3q8yij_L1X6hqZrfugi1jN0kQgm8ZCvC734joJJPhW5FTh7FhSm93ZgBKK1kqkBhE48eE8p8q096DA2Y28XU4cIER_eLWiEXEZsE_m9A2p_O9UtT17MbISwFFGukmNvycRisN9ZfGQmhk7NT2w-huzzdI2mECJNsvk0Za9T6o2frbYLK_HLOWSksoMj0A2" />
                                </div>
                                <div className="z-10 text-center p-8 bg-white/80 backdrop-blur-2xl rounded-[2rem] max-w-sm border border-white/60 shadow-xl">
                                    <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Real-time Focus Distribution</h3>
                                    <p className="text-sm text-[#4b5563]">Intelligent mapping of your cognitive load throughout the workday</p>
                                </div>
                            </motion.div>
                            <div className="flex flex-col gap-6">
                                <div className="bg-gradient-to-br from-[#4f46e5]/5 to-[#a855f7]/5 p-6 rounded-[2rem] flex-1 flex flex-col justify-center border border-[#4f46e5]/10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#4f46e5] animate-ping" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-[#4f46e5]">AI Coach Tip</span>
                                    </div>
                                    <p className="text-sm leading-relaxed italic text-[#4b5563]">&quot;Your peak performance aligns with early mornings. Consider moving your deep work blocks to 8 AM.&quot;</p>
                                </div>
                                <motion.div className="bg-white/60 backdrop-blur-sm p-6 rounded-[2rem] flex-1 border border-white/50" whileHover={{ y: -4 }}>
                                    <div className="text-xs font-bold uppercase tracking-widest text-[#7c3aed] mb-4">Focus Score Trend</div>
                                    <div className="h-3 w-full bg-[#e0e4e8] rounded-full overflow-hidden mb-3">
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{ background: 'linear-gradient(90deg, #4f46e5, #a855f7)' }}
                                            initial={{ width: '0%' }}
                                            whileInView={{ width: '80%' }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold text-[#6b7280] uppercase tracking-tighter">
                                        <span>Mon</span>
                                        <span>Fri</span>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </Reveal>

                {/* ── Features Section ────────────── */}
                <Reveal className="max-w-7xl mx-auto px-6 py-24 mb-32 relative" id="features">
                    <div className="text-center mb-20">
                        <motion.div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4f46e5]/[0.08] border border-[#4f46e5]/20 text-[#4f46e5] text-xs font-bold uppercase tracking-widest mb-6">
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                            Core Features
                        </motion.div>
                        <h2 className="text-3xl md:text-5xl font-extrabold mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            Designed for <span className="gradient-text">deep focus</span>
                        </h2>
                        <div className="w-24 h-1.5 mx-auto rounded-full" style={{ background: 'linear-gradient(90deg, #4f46e5, #a855f7)' }} />
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard icon="neurology" iconColor="#4f46e5" title="Pattern Recognition" description="Our ML models identify the specific sequences that lead to your most productive states." delay={0} />
                        <FeatureCard icon="location_on" iconColor="#a855f7" title="Focus Mapping" description="Visual journey of your digital environment, showing exactly where flow is disrupted." delay={0.15} />
                        <FeatureCard icon="smart_toy" iconColor="#7c3aed" title="AI Coaching" description="Personalized behavioral insights delivered just when you need that cognitive nudge." delay={0.3} />
                    </div>
                </Reveal>

                {/* ── Journey Section ─────────────── */}
                <Reveal className="max-w-7xl mx-auto px-6 py-24" id="journey">
                    <div className="grid md:grid-cols-2 gap-20 items-center">
                        <div>
                            <motion.div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#10b981]/[0.08] border border-[#10b981]/20 text-[#10b981] text-xs font-bold uppercase tracking-widest mb-6">
                                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                                Results That Matter
                            </motion.div>
                            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-8" style={{ fontFamily: 'Manrope, sans-serif' }}>
                                Actionable intelligence, <br /><span className="gradient-text">not just more charts</span>
                            </h2>
                            <ul className="space-y-8">
                                {[
                                    { title: 'Burnout Prevention', desc: 'Early warning signs detected through subtle shifts in interaction frequency and speed.' },
                                    { title: 'Contextual Privacy', desc: 'Local-first processing ensures your raw activity data never leaves your device.' },
                                    { title: 'Automated Tagging', desc: 'Apps and sites are categorized by intent, not just name, providing deeper meaning to your time.' },
                                ].map((item, i) => (
                                    <Reveal key={item.title} delay={i * 0.15}>
                                        <li className="flex items-start gap-6 group">
                                            <motion.div
                                                className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#4f46e5]/10 to-[#a855f7]/10 border border-[#4f46e5]/10"
                                                whileHover={{ scale: 1.15, rotate: 5 }}
                                            >
                                                <span className="material-symbols-outlined text-[#4f46e5]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                            </motion.div>
                                            <div>
                                                <h4 className="text-lg font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>{item.title}</h4>
                                                <p className="text-[#4b5563] leading-relaxed">{item.desc}</p>
                                            </div>
                                        </li>
                                    </Reveal>
                                ))}
                            </ul>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { value: '+24%', label: 'Focus Gain', color: '#4f46e5', delay: 0 },
                                { value: 'High', label: 'Flow Quality', color: '#7c3aed', delay: 0.1 },
                                { value: '-12h', label: 'Idle Weekly', color: '#a855f7', delay: 0.2 },
                                { value: '92%', label: 'Retention Rate', color: '#10b981', delay: 0.3 },
                            ].map((stat, i) => (
                                <Reveal key={stat.label} delay={stat.delay}>
                                    <motion.div
                                        className={`bg-white/60 backdrop-blur-sm p-8 rounded-[2rem] border border-white/50 ${i === 3 ? 'h-56 flex flex-col justify-end' : ''} ${i === 0 ? 'mt-12' : ''}`}
                                        whileHover={{ y: -8, scale: 1.02 }}
                                    >
                                        <div className="font-black text-3xl mb-1" style={{ fontFamily: 'Manrope, sans-serif', color: stat.color }}>{stat.value}</div>
                                        <div className="text-xs font-bold uppercase text-[#6b7280] tracking-widest">{stat.label}</div>
                                    </motion.div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </Reveal>

                {/* ── CTA Section ─────────────────── */}
                <Reveal className="max-w-7xl mx-auto px-6 py-32" id="aicoach">
                    <motion.div
                        className="rounded-[3rem] p-16 text-center relative overflow-hidden border border-white/30"
                        style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.06) 0%, rgba(168,85,247,0.04) 50%, rgba(79,70,229,0.06) 100%)' }}
                        whileHover={{ scale: 1.005 }}
                    >
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#4f46e5]/[0.05] blur-[100px] morph-blob" />
                        </div>
                        <motion.div
                            className="relative z-10"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <motion.div
                                className="w-20 h-20 mx-auto mb-8 rounded-3xl flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, #4f46e5, #a855f7)' }}
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <span className="material-symbols-outlined text-[40px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                            </motion.div>
                            <h2 className="text-4xl md:text-6xl font-black mb-8" style={{ fontFamily: 'Manrope, sans-serif' }}>
                                Start your <span className="gradient-text">journey</span>
                            </h2>
                            <p className="text-xl text-[#4b5563] max-w-2xl mx-auto mb-12">
                                Join 15,000+ knowledge workers reclaiming their focus through behavioral science.
                            </p>
                            <div className="flex flex-wrap justify-center gap-6">
                                <motion.button
                                    className="cta-gradient text-white px-12 py-5 rounded-2xl font-bold text-lg cursor-pointer relative overflow-hidden group"
                                    onClick={() => router.push('/login')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                    <span className="relative z-10">Try Demo Free</span>
                                </motion.button>
                                <motion.button
                                    className="bg-white/70 backdrop-blur-xl text-[#4f46e5] px-12 py-5 rounded-2xl font-bold text-lg cursor-pointer border border-white/50 shadow-lg"
                                    onClick={() => router.push('/login')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Contact Sales
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                </Reveal>
            </main>

            {/* ── Footer ─────────────────────────── */}
            <footer className="relative z-20 mt-24">
                <div className="max-w-7xl mx-auto px-8 md:px-16">
                    <div className="bg-white/50 backdrop-blur-xl rounded-t-[3rem] border border-white/50 border-b-0 px-8 md:px-16 py-16">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <div className="text-xl font-black gradient-text mb-8 md:mb-0" style={{ fontFamily: 'Manrope, sans-serif' }}>
                                Activity Monitor
                            </div>
                            <div className="flex flex-wrap justify-center gap-8 text-[#6b7280] text-xs uppercase tracking-widest font-bold">
                                {['Privacy Policy', 'Terms', 'Status', 'Contact'].map((link) => (
                                    <a key={link} className="hover:text-[#4f46e5] transition-colors cursor-pointer">{link}</a>
                                ))}
                            </div>
                            <div className="mt-8 md:mt-0 text-[#9ca3af] text-[10px] font-bold uppercase tracking-widest">
                                © 2026 Activity Monitor. Sculpted for Precision.
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
