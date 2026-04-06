'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

type AuthTab = 'login' | 'signup';

/* ── Floating Orbs Background ──────────────── */
function LoginBackground() {
    return (
        <div className="fixed inset-0 bg-[#f0f2f5] overflow-hidden pointer-events-none">
            {/* Gradient mesh */}
            <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full blur-[120px] morph-blob" style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.12), transparent 70%)', animationDuration: '15s' }} />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full blur-[100px] morph-blob" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.1), transparent 70%)', animationDuration: '18s', animationDelay: '4s' }} />
            <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] rounded-full blur-[80px] morph-blob" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.08), transparent 70%)', animationDuration: '20s', animationDelay: '8s' }} />
            {/* Subtle grid */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(79,70,229,1) 1px, transparent 1px), linear-gradient(90deg, rgba(79,70,229,1) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
            {/* Floating particles */}
            {[...Array(8)].map((_, i) => (
                <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        width: `${Math.random() * 3 + 2}px`,
                        height: `${Math.random() * 3 + 2}px`,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        background: `rgba(79, 70, 229, ${Math.random() * 0.25 + 0.1})`,
                        animation: `float ${Math.random() * 8 + 6}s ease-in-out infinite`,
                        animationDelay: `${Math.random() * 5}s`,
                    }}
                />
            ))}
        </div>
    );
}

export default function LoginPage() {
    const router = useRouter();
    const [tab, setTab] = useState<AuthTab>('login');

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isDemoLoading, setIsDemoLoading] = useState(false);

    const [confirmPassword, setConfirmPassword] = useState('');
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            router.replace('/dashboard');
        }
    }, [router]);

    const switchTab = (newTab: AuthTab) => {
        setTab(newTab);
        setError(null);
        setSuccess(null);
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

    const doLogin = async (user: string, pass: string, isDemo = false) => {
        const setLoader = isDemo ? setIsDemoLoading : setIsLoading;
        setLoader(true);
        setError(null);
        setSuccess(null);

        try {
            const formData = new URLSearchParams();
            formData.append('username', user);
            formData.append('password', pass);

            const response = await axios.post('/auth/login', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });

            const { access_token } = response.data;
            localStorage.setItem('access_token', access_token);
            router.push('/dashboard');
        } catch (err: any) {
            const detail = err?.response?.data?.detail;
            if (err?.code === 'ERR_NETWORK' || err?.message?.includes('Network Error')) {
                setError('Cannot connect to server. It may be starting up — please wait 30s and try again.');
            } else if (detail) {
                setError(typeof detail === 'string' ? detail : 'Login failed. Please check your credentials.');
            } else {
                setError('Login failed. Please try again.');
            }
        } finally {
            setLoader(false);
        }
    };

    const handleDemoLogin = () => doLogin('cloud_user', 'default_password', true);

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            setError('Please enter both username and password.');
            return;
        }
        doLogin(username, password, false);
    };

    const handleSignupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const trimmedUser = username.trim();

        if (!trimmedUser || !password || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }
        if (trimmedUser.length < 3) {
            setError('Username must be at least 3 characters.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);

        try {
            await axios.post('/auth/register', {
                username: trimmedUser,
                password,
            });

            setSuccess('Account created! Signing you in…');
            setTimeout(() => {
                doLogin(trimmedUser, password, false);
            }, 800);
        } catch (err: any) {
            const detail = err?.response?.data?.detail;
            if (err?.code === 'ERR_NETWORK' || err?.message?.includes('Network Error')) {
                setError('Cannot connect to server. It may be starting up — please wait 30s.');
            } else if (detail) {
                setError(typeof detail === 'string' ? detail : 'Registration failed.');
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const anyLoading = isLoading || isDemoLoading;

    const inputClasses = `w-full px-4 py-3.5 rounded-xl
        bg-[#e8ebef] border border-transparent
        text-sm text-[#1a1d21] placeholder:text-[#9ca3af]
        outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5]/20 focus:bg-[#eef0f5]
        transition-all duration-300 disabled:opacity-50 font-medium`;

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative" style={{ fontFamily: "'Inter', sans-serif" }}>
            <LoginBackground />

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="w-full max-w-[440px] space-y-6 relative z-10"
            >
                {/* Logo / Brand */}
                <motion.div className="text-center space-y-3 mb-2">
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                        className="w-18 h-18 mx-auto rounded-3xl flex items-center justify-center shadow-xl relative overflow-hidden"
                        style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)' }}
                    >
                        <span className="material-symbols-outlined text-[36px] text-white relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                    </motion.div>
                    <motion.h1
                        className="text-3xl font-bold tracking-tight"
                        style={{ fontFamily: 'Manrope, sans-serif' }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <span className="gradient-text">Activity Monitor</span>
                    </motion.h1>
                    <motion.p
                        className="text-sm text-[#6b7280]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        AI-powered productivity analytics
                    </motion.p>
                </motion.div>

                {/* Main Card */}
                <motion.div
                    className="p-8 space-y-6 bg-white/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/50 shadow-xl shadow-black/[0.04]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.6 }}
                >
                    {/* Demo Button */}
                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleDemoLogin}
                        disabled={anyLoading}
                        className="w-full py-4 px-5 rounded-2xl font-bold text-[15px]
                                   cta-gradient text-white
                                   disabled:opacity-60 disabled:cursor-not-allowed
                                   flex items-center justify-center gap-2.5
                                   transition-all duration-300 cursor-pointer
                                   relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                        {isDemoLoading ? (
                            <>
                                <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                                Signing in…
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                Try Demo — One Click Access
                            </>
                        )}
                    </motion.button>

                    {/* Feature pills */}
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <motion.span
                            className="flex items-center gap-1.5 text-[10px] text-[#6b7280] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <span className="material-symbols-outlined text-[14px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span> Instant setup
                        </motion.span>
                        <motion.span
                            className="flex items-center gap-1.5 text-[10px] text-[#6b7280] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <span className="material-symbols-outlined text-[14px] text-emerald-500" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span> Pre-loaded data
                        </motion.span>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#d4d8dd] to-transparent" />
                        <span className="text-xs text-[#9ca3af] uppercase tracking-widest font-bold">or</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#d4d8dd] to-transparent" />
                    </div>

                    {/* Tab Switcher */}
                    <div className="relative flex bg-[#e8ebef] rounded-xl p-1.5">
                        <motion.div
                            className="absolute top-1.5 bottom-1.5 rounded-lg bg-white shadow-md"
                            layout
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                            style={{
                                width: 'calc(50% - 6px)',
                                left: tab === 'login' ? '6px' : 'calc(50%)',
                            }}
                        />
                        <button
                            onClick={() => switchTab('login')}
                            className={`relative z-10 flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                                tab === 'login' ? 'text-[#1a1d21]' : 'text-[#9ca3af] hover:text-[#6b7280]'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">login</span>
                            Sign In
                        </button>
                        <button
                            onClick={() => switchTab('signup')}
                            className={`relative z-10 flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                                tab === 'signup' ? 'text-[#1a1d21]' : 'text-[#9ca3af] hover:text-[#6b7280]'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">person_add</span>
                            Sign Up
                        </button>
                    </div>

                    {/* Form Area */}
                    <AnimatePresence mode="wait">
                        {tab === 'login' ? (
                            <motion.form
                                key="login-form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                                onSubmit={handleLoginSubmit}
                                className="space-y-4"
                            >
                                <div className="space-y-1.5">
                                    <label htmlFor="login-username" className="text-xs text-[#6b7280] font-bold uppercase tracking-wider">Username</label>
                                    <input
                                        id="login-username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter your username"
                                        autoComplete="username"
                                        disabled={anyLoading}
                                        className={inputClasses}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="login-password" className="text-xs text-[#6b7280] font-bold uppercase tracking-wider">Password</label>
                                    <div className="relative">
                                        <input
                                            id="login-password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                            disabled={anyLoading}
                                            className={`${inputClasses} pr-12`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#4f46e5] transition-colors cursor-pointer flex items-center justify-center p-1"
                                            tabIndex={-1}
                                        >
                                            <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-medium text-sm flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">error</span>
                                        {error}
                                    </motion.div>
                                )}

                                <motion.button
                                    type="submit"
                                    disabled={anyLoading}
                                    className="w-full py-3.5 px-5 rounded-2xl font-bold text-[15px]
                                             bg-[#1a1d21] text-white hover:bg-[#111317]
                                             disabled:opacity-50 disabled:cursor-not-allowed
                                             flex items-center justify-center gap-2
                                             transition-all duration-300 cursor-pointer shadow-lg shadow-black/10"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                                            Signing in…
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[20px]">login</span>
                                            Sign In
                                        </>
                                    )}
                                </motion.button>

                                <p className="text-center text-xs text-[#6b7280]">
                                    Don&apos;t have an account?{' '}
                                    <button type="button" onClick={() => switchTab('signup')} className="text-[#4f46e5] hover:text-[#4338ca] font-bold cursor-pointer transition-colors">
                                        Create one
                                    </button>
                                </p>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="signup-form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                                onSubmit={handleSignupSubmit}
                                className="space-y-4"
                            >
                                <div className="space-y-1.5">
                                    <label htmlFor="signup-username" className="text-xs text-[#6b7280] font-bold uppercase tracking-wider">Username</label>
                                    <input
                                        id="signup-username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Choose a username"
                                        autoComplete="username"
                                        disabled={anyLoading}
                                        className={inputClasses}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="signup-password" className="text-xs text-[#6b7280] font-bold uppercase tracking-wider">Password</label>
                                    <div className="relative">
                                        <input
                                            id="signup-password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Min. 6 characters"
                                            autoComplete="new-password"
                                            disabled={anyLoading}
                                            className={`${inputClasses} pr-12`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#4f46e5] transition-colors cursor-pointer flex items-center justify-center p-1"
                                            tabIndex={-1}
                                        >
                                            <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="signup-confirm" className="text-xs text-[#6b7280] font-bold uppercase tracking-wider">Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            id="signup-confirm"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Re-enter password"
                                            autoComplete="new-password"
                                            disabled={anyLoading}
                                            className={`${inputClasses} pr-12`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#4f46e5] transition-colors cursor-pointer flex items-center justify-center p-1"
                                            tabIndex={-1}
                                        >
                                            <span className="material-symbols-outlined text-[20px]">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                                        </button>
                                    </div>
                                </div>

                                {password.length > 0 && password.length < 6 && (
                                    <p className="text-[11px] text-amber-500 font-medium flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">info</span>
                                        Password needs at least 6 characters
                                    </p>
                                )}
                                {confirmPassword.length > 0 && password === confirmPassword && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-bold">
                                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> Passwords match
                                    </motion.div>
                                )}
                                {confirmPassword.length > 0 && password !== confirmPassword && (
                                    <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">error</span>
                                        Passwords do not match
                                    </p>
                                )}

                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium text-sm flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[20px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                        {success}
                                    </motion.div>
                                )}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-medium text-sm flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">error</span>
                                        {error}
                                    </motion.div>
                                )}

                                <motion.button
                                    type="submit"
                                    disabled={anyLoading}
                                    className="w-full py-3.5 px-5 rounded-2xl font-bold text-[15px]
                                             bg-emerald-500 text-white hover:bg-emerald-600
                                             disabled:opacity-50 disabled:cursor-not-allowed
                                             flex items-center justify-center gap-2
                                             transition-all duration-300 cursor-pointer shadow-lg shadow-emerald-500/20"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                                            Creating account…
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[20px]">person_add</span>
                                            Create Account
                                        </>
                                    )}
                                </motion.button>

                                <p className="text-center text-xs text-[#6b7280]">
                                    Already have an account?{' '}
                                    <button type="button" onClick={() => switchTab('login')} className="text-[#4f46e5] hover:text-[#4338ca] font-bold cursor-pointer transition-colors">
                                        Sign in
                                    </button>
                                </p>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Footer */}
                <motion.p
                    className="text-center text-[12px] text-[#9ca3af] tracking-wide font-mono"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    Activity Monitor v2.0 • Secured with JWT
                </motion.p>
            </motion.div>
        </div>
    );
}
