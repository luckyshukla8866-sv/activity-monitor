'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useInView } from 'framer-motion';

function Reveal({ children, className = '' }: { children: React.ReactNode, className?: string }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "0px 0px -50px 0px" });

    return (
        <div ref={ref} className={`${className} reveal ${isInView ? 'visible' : ''}`}>
            {children}
        </div>
    );
}

export default function LandingPage() {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            router.replace('/dashboard');
        }
    }, [router]);

    return (
        <div className="bg-[#f5f7f9] text-[#2c2f31] antialiased overflow-x-hidden min-h-screen" style={{fontFamily: "'Inter', sans-serif"}}>
            <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-10 py-4 mt-2 mx-auto w-full max-w-[1440px] bg-transparent">
                <div className="text-xl font-black text-[#2444eb] tracking-tight" style={{fontFamily: 'Manrope, sans-serif'}}>
                    <span style={{ letterSpacing: '-1px' }}>Ethereal Analytics</span>
                </div>
                <nav className="hidden md:flex flex-1 max-w-sm mx-8 items-center neumorphic-inset rounded-full px-2 py-1.5 justify-around">
                    <a className="px-5 py-2 text-sm font-medium text-[#595c5e] hover:text-[#2444eb] transition-colors cursor-pointer" href="#features">Features</a>
                    <a className="px-5 py-2 text-sm font-medium text-[#595c5e] hover:text-[#2444eb] transition-colors cursor-pointer" href="#journey">Journey</a>
                    <a className="px-5 py-2 text-sm font-bold text-[#2444eb] nav-button-active rounded-full transition-all cursor-pointer" href="#coach">AI Coach</a>
                </nav>
                <div className="flex items-center gap-4">
                    <button className="text-[#595c5e] font-semibold text-sm hover:text-[#2444eb] transition-colors cursor-pointer" onClick={() => router.push('/login')}>Sign In</button>
                    <button className="cta-gradient text-white px-6 py-2.5 rounded-full font-bold text-sm cursor-pointer" onClick={() => router.push('/login')}>Try Demo Free</button>
                </div>
            </header>

            <main className="pt-32">
                <Reveal className="max-w-7xl mx-auto px-6 py-20 text-center">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[#2c2f31] mb-8 leading-[1.1] soft-text" style={{fontFamily: 'Manrope, sans-serif'}}>
                        Understand your <br />
                        <span className="text-[#2444eb] extrusion bg-[#f5f7f9] px-8 py-3 rounded-2xl inline-block mt-4 interactive-card">
                            productivity patterns
                        </span>
                    </h1>
                    <p className="max-w-3xl mx-auto text-lg md:text-xl text-[#595c5e] leading-relaxed mb-12">
                        Upload your activity logs. Our machine learning models map your focus hours, categorize apps, and predict burnout risk — all with actionable AI coaching.
                    </p>
                    <div className="flex flex-wrap justify-center gap-8">
                        <button className="cta-gradient text-white px-10 py-5 rounded-xl font-bold text-lg hover:scale-105 transition-transform cursor-pointer" onClick={() => router.push('/login')}>
                            Try Demo Free
                        </button>
                        <button className="extrusion bg-[#f5f7f9] text-[#2444eb] px-10 py-5 rounded-xl font-bold text-lg interactive-card cursor-pointer" onClick={() => router.push('/login')}>
                            Sign In
                        </button>
                    </div>
                </Reveal>

                <Reveal className="max-w-6xl mx-auto px-6 mb-32">
                    <div className="bg-[#f5f7f9] extrusion rounded-[3rem] p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#8999ff]/10 blur-[100px] -mr-32 -mt-32"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                            <div className="bg-[#f5f7f9] recessed rounded-[2rem] p-8 flex flex-col items-center text-center interactive-card">
                                <span className="material-symbols-outlined text-[#2444eb] text-3xl mb-4">schedule</span>
                                <div className="text-3xl font-black text-[#2c2f31] soft-text" style={{fontFamily: 'Manrope, sans-serif'}}>2,401</div>
                                <div className="text-xs font-bold uppercase tracking-widest text-[#595c5e] mt-1">Hours Tracked</div>
                            </div>
                            <div className="bg-[#f5f7f9] recessed rounded-[2rem] p-8 flex flex-col items-center text-center interactive-card">
                                <span className="material-symbols-outlined text-[#93387f] text-3xl mb-4">rocket_launch</span>
                                <div className="text-3xl font-black text-[#2c2f31] soft-text" style={{fontFamily: 'Manrope, sans-serif'}}>Top 5%</div>
                                <div className="text-xs font-bold uppercase tracking-widest text-[#595c5e] mt-1">Deep Work</div>
                            </div>
                            <div className="bg-[#f5f7f9] recessed rounded-[2rem] p-8 flex flex-col items-center text-center interactive-card">
                                <span className="material-symbols-outlined text-[#4647d3] text-3xl mb-4">query_stats</span>
                                <div className="text-3xl font-black text-[#2c2f31] soft-text" style={{fontFamily: 'Manrope, sans-serif'}}>98.2%</div>
                                <div className="text-xs font-bold uppercase tracking-widest text-[#595c5e] mt-1">ML Accuracy</div>
                            </div>
                            <div className="bg-[#f5f7f9] recessed rounded-[2rem] p-8 flex flex-col items-center text-center interactive-card">
                                <span className="material-symbols-outlined text-3xl mb-4" style={{color: '#10b981'}}>verified_user</span>
                                <div className="text-3xl font-black text-[#2c2f31] soft-text" style={{fontFamily: 'Manrope, sans-serif'}}>No Risk</div>
                                <div className="text-xs font-bold uppercase tracking-widest text-[#595c5e] mt-1">Burnout Chance</div>
                            </div>
                        </div>

                        <div className="mt-12 grid md:grid-cols-3 gap-8 relative z-10">
                            <div className="md:col-span-2 extrusion bg-[#f5f7f9] rounded-[2rem] h-[400px] flex items-center justify-center relative group overflow-hidden">
                                <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-700">
                                    <img className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" alt="abstract dashboard interface" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWYJwfEO-3HpNQjBzdKmsgYrDRbziGcK1hbSgrdUh6MkOmzrQLtw2JNp0kqAFBAfsBTxIURetUD6SbAi3q8yij_L1X6hqZrfugi1jN0kQgm8ZCvC734joJJPhW5FTh7FhSm93ZgBKK1kqkBhE48eE8p8q096DA2Y28XU4cIER_eLWiEXEZsE_m9A2p_O9UtT17MbISwFFGukmNvycRisN9ZfGQmhk7NT2w-huzzdI2mECJNsvk0Za9T6o2frbYLK_HLOWSksoMj0A2" />
                                </div>
                                <div className="z-10 text-center p-8 extrusion bg-[#f5f7f9]/90 backdrop-blur-lg rounded-[2rem] max-w-sm border border-white/40">
                                    <h3 className="text-xl font-bold mb-2 soft-text" style={{fontFamily: 'Manrope, sans-serif'}}>Real-time Focus Distribution</h3>
                                    <p className="text-sm text-[#595c5e]">Intelligent mapping of your cognitive load throughout the workday</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-8">
                                <div className="recessed p-6 rounded-[2rem] flex-1 flex flex-col justify-center">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#2444eb] animate-ping"></div>
                                        <span className="text-xs font-bold uppercase tracking-widest opacity-60 text-[#2c2f31]">AI Coach Tip</span>
                                    </div>
                                    <p className="text-sm leading-relaxed italic text-[#595c5e]">&quot;Your peak performance aligns with early mornings. Consider moving your deep work blocks to 8 AM.&quot;</p>
                                </div>
                                <div className="extrusion p-6 rounded-[2rem] flex-1 interactive-card">
                                    <div className="text-xs font-bold uppercase tracking-widest text-[#4647d3] mb-4">Focus Score Trend</div>
                                    <div className="h-3 w-full bg-[#dfe3e6] recessed rounded-full overflow-hidden mb-3">
                                        <div className="h-full bg-[#2444eb] w-4/5 rounded-full shadow-[0_0_10px_rgba(36,68,235,0.3)]"></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold text-[#595c5e] uppercase tracking-tighter">
                                        <span>Mon</span>
                                        <span>Fri</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Reveal>

                <Reveal className="max-w-7xl mx-auto px-6 py-24 bg-[#eef1f3] rounded-[3rem] mb-32" id="features">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-extrabold mb-4 soft-text" style={{fontFamily: 'Manrope, sans-serif'}}>Designed for deep focus</h2>
                        <div className="w-24 h-2 bg-[#2444eb] mx-auto rounded-full extrusion border-0"></div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="bg-[#f5f7f9] extrusion p-10 rounded-[2rem] interactive-card">
                            <div className="w-16 h-16 bg-[#f5f7f9] recessed rounded-[1.5rem] flex items-center justify-center mb-8">
                                <span className="material-symbols-outlined text-[#2444eb] text-3xl">neurology</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4 soft-text" style={{fontFamily: 'Manrope, sans-serif'}}>Pattern Recognition</h3>
                            <p className="text-[#595c5e] leading-relaxed">Our ML models identify the specific sequences that lead to your most productive states.</p>
                        </div>
                        <div className="bg-[#f5f7f9] extrusion p-10 rounded-[2rem] interactive-card">
                            <div className="w-16 h-16 bg-[#f5f7f9] recessed rounded-[1.5rem] flex items-center justify-center mb-8">
                                <span className="material-symbols-outlined text-[#93387f] text-3xl">location_on</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4 soft-text" style={{fontFamily: 'Manrope, sans-serif'}}>Focus Mapping</h3>
                            <p className="text-[#595c5e] leading-relaxed">Visual journey of your digital environment, showing exactly where flow is disrupted.</p>
                        </div>
                        <div className="bg-[#f5f7f9] extrusion p-10 rounded-[2rem] interactive-card">
                            <div className="w-16 h-16 bg-[#f5f7f9] recessed rounded-[1.5rem] flex items-center justify-center mb-8">
                                <span className="material-symbols-outlined text-[#4647d3] text-3xl">smart_toy</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4 soft-text" style={{fontFamily: 'Manrope, sans-serif'}}>AI Coaching</h3>
                            <p className="text-[#595c5e] leading-relaxed">Personalized behavioral insights delivered just when you need that cognitive nudge.</p>
                        </div>
                    </div>
                </Reveal>

                <Reveal className="max-w-7xl mx-auto px-6 py-24" id="journey">
                    <div className="grid md:grid-cols-2 gap-20 items-center">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-8 soft-text" style={{fontFamily: 'Manrope, sans-serif'}}>
                                Actionable intelligence, <br /><span className="text-[#2444eb]">not just more charts</span>
                            </h2>
                            <ul className="space-y-10">
                                <li className="flex items-start gap-6 group">
                                    <div className="flex-shrink-0 w-12 h-12 bg-[#f5f7f9] extrusion rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-[#2444eb]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold mb-2 soft-text" style={{fontFamily: 'Manrope, sans-serif'}}>Burnout Prevention</h4>
                                        <p className="text-[#595c5e] leading-relaxed">Early warning signs detected through subtle shifts in interaction frequency and speed.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-6 group">
                                    <div className="flex-shrink-0 w-12 h-12 bg-[#f5f7f9] extrusion rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-[#2444eb]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold mb-2 soft-text" style={{fontFamily: 'Manrope, sans-serif'}}>Contextual Privacy</h4>
                                        <p className="text-[#595c5e] leading-relaxed">Local-first processing ensures your raw activity data never leaves your device.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-6 group">
                                    <div className="flex-shrink-0 w-12 h-12 bg-[#f5f7f9] extrusion rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-[#2444eb]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold mb-2 soft-text" style={{fontFamily: 'Manrope, sans-serif'}}>Automated Tagging</h4>
                                        <p className="text-[#595c5e] leading-relaxed">Apps and sites are categorized by intent, not just name, providing deeper meaning to your time.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-8 pt-12">
                                <div className="bg-[#f5f7f9] extrusion p-8 rounded-[2rem] interactive-card">
                                    <div className="text-[#2444eb] font-black text-3xl mb-1 soft-text" style={{fontFamily: 'Manrope, sans-serif'}}>+24%</div>
                                    <div className="text-xs font-bold uppercase text-[#595c5e] tracking-widest">Focus Gain</div>
                                </div>
                                <div className="bg-[#f5f7f9] extrusion p-8 rounded-[2rem] interactive-card">
                                    <div className="text-[#93387f] font-black text-3xl mb-1 soft-text" style={{fontFamily: 'Manrope, sans-serif'}}>-12h</div>
                                    <div className="text-xs font-bold uppercase text-[#595c5e] tracking-widest">Idle Weekly</div>
                                </div>
                            </div>
                            <div className="space-y-8">
                                <div className="bg-[#f5f7f9] extrusion p-8 rounded-[2rem] interactive-card">
                                    <div className="text-[#4647d3] font-black text-3xl mb-1 soft-text" style={{fontFamily: 'Manrope, sans-serif'}}>High</div>
                                    <div className="text-xs font-bold uppercase text-[#595c5e] tracking-widest">Flow Quality</div>
                                </div>
                                <div className="bg-[#f5f7f9] extrusion p-8 rounded-[2rem] h-56 flex flex-col justify-end interactive-card">
                                    <div className="text-[#2444eb] font-black text-3xl mb-1 soft-text" style={{fontFamily: 'Manrope, sans-serif'}}>92%</div>
                                    <div className="text-xs font-bold uppercase text-[#595c5e] tracking-widest">Retention Rate</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Reveal>

                <Reveal className="max-w-7xl mx-auto px-6 py-32" id="coach">
                    <div className="bg-[#f5f7f9] extrusion rounded-[3rem] p-16 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#2444eb]/10 to-transparent pointer-events-none"></div>
                        <h2 className="text-4xl md:text-6xl font-black mb-8 soft-text relative z-10" style={{fontFamily: 'Manrope, sans-serif'}}>Start your journey</h2>
                        <p className="text-xl text-[#595c5e] max-w-2xl mx-auto mb-12 relative z-10">
                            Join 15,000+ knowledge workers reclaiming their focus through behavioral science.
                        </p>
                        <div className="flex flex-wrap justify-center gap-6 relative z-10">
                            <button className="cta-gradient text-white px-12 py-5 rounded-xl font-bold text-lg hover:scale-105 transition-transform cursor-pointer" onClick={() => router.push('/login')}>
                                Try Demo Free
                            </button>
                            <button className="extrusion bg-[#f5f7f9] text-[#2444eb] px-12 py-5 rounded-xl font-bold text-lg interactive-card cursor-pointer" onClick={() => router.push('/login')}>
                                Contact Sales
                            </button>
                        </div>
                    </div>
                </Reveal>
            </main>

            <footer className="bg-[#f5f7f9] rounded-t-[4rem] w-full mt-24 shadow-[-20px_-20px_40px_#ffffff,20px_20px_40px_rgba(203,213,225,0.4)] relative z-20">
                <div className="flex flex-col md:flex-row justify-between items-center px-8 md:px-16 py-16 w-full max-w-7xl mx-auto">
                    <div className="text-xl font-black text-[#2444eb] mb-8 md:mb-0 soft-text" style={{fontFamily: 'Manrope, sans-serif'}}>
                        <span style={{ letterSpacing: '-1px' }}>Ethereal Analytics</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-8 text-[#595c5e] text-xs uppercase tracking-widest font-bold">
                        <a className="hover:text-[#2444eb] transition-colors" href="#">Privacy Policy</a>
                        <a className="hover:text-[#2444eb] transition-colors" href="#">Terms</a>
                        <a className="hover:text-[#2444eb] transition-colors" href="#">Status</a>
                        <a className="hover:text-[#2444eb] transition-colors" href="#">Contact</a>
                    </div>
                    <div className="mt-8 md:mt-0 text-[#747779] text-[10px] font-bold uppercase tracking-widest">
                        © 2026 Ethereal Analytics. Sculpted for Precision.
                    </div>
                </div>
            </footer>
        </div>
    );
}
