'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Eye, EyeOff, LogIn, Loader2, Activity, ArrowRight, Shield, Zap } from 'lucide-react';
import axios from 'axios';
import GradientText from '@/components/GradientText';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDemoLoading, setIsDemoLoading] = useState(false);

    // If already logged in, redirect to dashboard
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            router.replace('/dashboard');
        }
    }, [router]);

    const doLogin = async (user: string, pass: string, isDemo: boolean = false) => {
        const setLoader = isDemo ? setIsDemoLoading : setIsLoading;
        setLoader(true);
        setError(null);

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
                setError('Cannot connect to server. It may be starting up — please wait 30 seconds and try again.');
            } else if (detail) {
                setError(typeof detail === 'string' ? detail : 'Login failed. Please check your credentials.');
            } else {
                setError('Login failed. Please try again.');
            }
        } finally {
            setLoader(false);
        }
    };

    const handleDemoLogin = () => {
        doLogin('cloud_user', 'default_password', true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            setError('Please enter both username and password.');
            return;
        }
        doLogin(username, password, false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 font-['Outfit',sans-serif]">
            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-[420px] space-y-6"
            >
                {/* Logo / Brand */}
                <div className="text-center space-y-3 mb-2">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                        className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center backdrop-blur-md"
                    >
                        <Activity className="w-8 h-8 text-indigo-400" />
                    </motion.div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        <GradientText>Activity Monitor</GradientText>
                    </h1>
                    <p className="text-sm text-white/35">AI-powered productivity analytics</p>
                </div>

                {/* Main Card */}
                <div className="glass-card p-7 space-y-6 border border-white/[0.06] rounded-2xl backdrop-blur-xl">
                    {/* Demo Button — prominent */}
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDemoLogin}
                        disabled={isDemoLoading || isLoading}
                        className="w-full py-3.5 px-5 rounded-xl font-semibold text-[15px]
                                   bg-gradient-to-r from-indigo-500 to-violet-500
                                   hover:from-indigo-400 hover:to-violet-400
                                   text-white shadow-lg shadow-indigo-500/25
                                   disabled:opacity-60 disabled:cursor-not-allowed
                                   flex items-center justify-center gap-2.5
                                   transition-all duration-200 cursor-pointer
                                   relative overflow-hidden group"
                    >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        {isDemoLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Signing in…
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Try Demo — One Click Access
                            </>
                        )}
                    </motion.button>

                    {/* Feature pills under demo */}
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1 text-[10px] text-white/30 uppercase tracking-wider">
                            <Zap className="w-3 h-3 text-amber-400/60" /> Instant setup
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-white/30 uppercase tracking-wider">
                            <Shield className="w-3 h-3 text-emerald-400/60" /> Pre-loaded data
                        </span>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-white/[0.06]" />
                        <span className="text-xs text-white/25 uppercase tracking-widest font-medium">or sign in</span>
                        <div className="flex-1 h-px bg-white/[0.06]" />
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username */}
                        <div className="space-y-1.5">
                            <label htmlFor="username" className="text-xs text-white/40 font-medium uppercase tracking-wider">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                autoComplete="username"
                                disabled={isLoading || isDemoLoading}
                                className="w-full px-4 py-3 rounded-xl
                                         bg-white/[0.03] border border-white/[0.08]
                                         text-sm text-white/80 placeholder:text-white/20
                                         outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20
                                         transition-all disabled:opacity-50"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label htmlFor="password" className="text-xs text-white/40 font-medium uppercase tracking-wider">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    disabled={isLoading || isDemoLoading}
                                    className="w-full px-4 py-3 pr-12 rounded-xl
                                             bg-white/[0.03] border border-white/[0.08]
                                             text-sm text-white/80 placeholder:text-white/20
                                             outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20
                                             transition-all disabled:opacity-50"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2
                                             text-white/25 hover:text-white/50 transition-colors cursor-pointer"
                                    tabIndex={-1}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading || isDemoLoading}
                            className="w-full py-3 px-5 rounded-xl font-semibold text-sm
                                     bg-white/[0.06] border border-white/[0.08]
                                     text-white/70 hover:text-white/90 hover:bg-white/[0.10]
                                     disabled:opacity-50 disabled:cursor-not-allowed
                                     flex items-center justify-center gap-2
                                     transition-all duration-200 cursor-pointer"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Signing in…
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4" />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-[11px] text-white/15 tracking-wide">
                    Activity Monitor v1.0 • Secured with JWT
                </p>
            </motion.div>
        </div>
    );
}
