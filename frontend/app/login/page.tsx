'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Eye, EyeOff, LogIn, Loader2, Activity,
    Shield, Zap, UserPlus, CheckCircle
} from 'lucide-react';
import axios from 'axios';
import GradientText from '@/components/GradientText';

type AuthTab = 'login' | 'signup';

export default function LoginPage() {
    const router = useRouter();
    const [tab, setTab] = useState<AuthTab>('login');

    // Shared
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Loading states
    const [isLoading, setIsLoading] = useState(false);
    const [isDemoLoading, setIsDemoLoading] = useState(false);

    // Sign-up extras
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // If already logged in, redirect to dashboard
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            router.replace('/dashboard');
        }
    }, [router]);

    // Clear form state when switching tabs
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

    // ── Login ────────────────────────────────────────────────────────
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

    // ── Sign Up ──────────────────────────────────────────────────────
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

            // Auto-login after a short delay so the user sees the success message
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
                    {/* Demo Button — always visible */}
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDemoLogin}
                        disabled={anyLoading}
                        className="w-full py-3.5 px-5 rounded-xl font-semibold text-[15px]
                                   bg-gradient-to-r from-indigo-500 to-violet-500
                                   hover:from-indigo-400 hover:to-violet-400
                                   text-white shadow-lg shadow-indigo-500/25
                                   disabled:opacity-60 disabled:cursor-not-allowed
                                   flex items-center justify-center gap-2.5
                                   transition-all duration-200 cursor-pointer
                                   relative overflow-hidden group"
                    >
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

                    {/* Feature pills */}
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
                        <span className="text-xs text-white/25 uppercase tracking-widest font-medium">or</span>
                        <div className="flex-1 h-px bg-white/[0.06]" />
                    </div>

                    {/* Tab Switcher */}
                    <div className="relative flex bg-white/[0.03] rounded-xl p-1 border border-white/[0.06]">
                        {/* Animated background pill */}
                        <motion.div
                            className="absolute top-1 bottom-1 rounded-lg bg-white/[0.08] border border-white/[0.06]"
                            layout
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                            style={{
                                width: 'calc(50% - 4px)',
                                left: tab === 'login' ? '4px' : 'calc(50%)',
                            }}
                        />
                        <button
                            onClick={() => switchTab('login')}
                            className={`relative z-10 flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                                tab === 'login' ? 'text-white/90' : 'text-white/35 hover:text-white/50'
                            }`}
                        >
                            <LogIn className="w-3.5 h-3.5" />
                            Sign In
                        </button>
                        <button
                            onClick={() => switchTab('signup')}
                            className={`relative z-10 flex-1 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                                tab === 'signup' ? 'text-white/90' : 'text-white/35 hover:text-white/50'
                            }`}
                        >
                            <UserPlus className="w-3.5 h-3.5" />
                            Sign Up
                        </button>
                    </div>

                    {/* Form Area — animated transition */}
                    <AnimatePresence mode="wait">
                        {tab === 'login' ? (
                            <motion.form
                                key="login-form"
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 16 }}
                                transition={{ duration: 0.2 }}
                                onSubmit={handleLoginSubmit}
                                className="space-y-4"
                            >
                                {/* Username */}
                                <div className="space-y-1.5">
                                    <label htmlFor="login-username" className="text-xs text-white/40 font-medium uppercase tracking-wider">
                                        Username
                                    </label>
                                    <input
                                        id="login-username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter your username"
                                        autoComplete="username"
                                        disabled={anyLoading}
                                        className="w-full px-4 py-3 rounded-xl
                                                 bg-white/[0.03] border border-white/[0.08]
                                                 text-sm text-white/80 placeholder:text-white/20
                                                 outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20
                                                 transition-all disabled:opacity-50"
                                    />
                                </div>

                                {/* Password */}
                                <div className="space-y-1.5">
                                    <label htmlFor="login-password" className="text-xs text-white/40 font-medium uppercase tracking-wider">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="login-password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                            disabled={anyLoading}
                                            className="w-full px-4 py-3 pr-12 rounded-xl
                                                     bg-white/[0.03] border border-white/[0.08]
                                                     text-sm text-white/80 placeholder:text-white/20
                                                     outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20
                                                     transition-all disabled:opacity-50"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors cursor-pointer"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                                    disabled={anyLoading}
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

                                {/* Link to sign up */}
                                <p className="text-center text-xs text-white/30">
                                    Don&apos;t have an account?{' '}
                                    <button type="button" onClick={() => switchTab('signup')} className="text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer transition-colors">
                                        Create one
                                    </button>
                                </p>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="signup-form"
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -16 }}
                                transition={{ duration: 0.2 }}
                                onSubmit={handleSignupSubmit}
                                className="space-y-4"
                            >
                                {/* Username */}
                                <div className="space-y-1.5">
                                    <label htmlFor="signup-username" className="text-xs text-white/40 font-medium uppercase tracking-wider">
                                        Username
                                    </label>
                                    <input
                                        id="signup-username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Choose a username"
                                        autoComplete="username"
                                        disabled={anyLoading}
                                        className="w-full px-4 py-3 rounded-xl
                                                 bg-white/[0.03] border border-white/[0.08]
                                                 text-sm text-white/80 placeholder:text-white/20
                                                 outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20
                                                 transition-all disabled:opacity-50"
                                    />
                                </div>

                                {/* Password */}
                                <div className="space-y-1.5">
                                    <label htmlFor="signup-password" className="text-xs text-white/40 font-medium uppercase tracking-wider">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="signup-password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Min. 6 characters"
                                            autoComplete="new-password"
                                            disabled={anyLoading}
                                            className="w-full px-4 py-3 pr-12 rounded-xl
                                                     bg-white/[0.03] border border-white/[0.08]
                                                     text-sm text-white/80 placeholder:text-white/20
                                                     outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20
                                                     transition-all disabled:opacity-50"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors cursor-pointer"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-1.5">
                                    <label htmlFor="signup-confirm" className="text-xs text-white/40 font-medium uppercase tracking-wider">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="signup-confirm"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Re-enter password"
                                            autoComplete="new-password"
                                            disabled={anyLoading}
                                            className="w-full px-4 py-3 pr-12 rounded-xl
                                                     bg-white/[0.03] border border-white/[0.08]
                                                     text-sm text-white/80 placeholder:text-white/20
                                                     outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20
                                                     transition-all disabled:opacity-50"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors cursor-pointer"
                                            tabIndex={-1}
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Password strength hint */}
                                {password.length > 0 && password.length < 6 && (
                                    <p className="text-[11px] text-amber-400/70">Password needs at least 6 characters</p>
                                )}

                                {/* Match indicator */}
                                {confirmPassword.length > 0 && password === confirmPassword && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex items-center gap-1.5 text-emerald-400 text-[11px]"
                                    >
                                        <CheckCircle className="w-3 h-3" /> Passwords match
                                    </motion.div>
                                )}
                                {confirmPassword.length > 0 && password !== confirmPassword && (
                                    <p className="text-[11px] text-red-400/70">Passwords do not match</p>
                                )}

                                {/* Success */}
                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4 shrink-0" />
                                        {success}
                                    </motion.div>
                                )}

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
                                    disabled={anyLoading}
                                    className="w-full py-3 px-5 rounded-xl font-semibold text-sm
                                             bg-gradient-to-r from-emerald-500/20 to-teal-500/20
                                             border border-emerald-500/20
                                             text-emerald-300 hover:from-emerald-500/30 hover:to-teal-500/30
                                             disabled:opacity-50 disabled:cursor-not-allowed
                                             flex items-center justify-center gap-2
                                             transition-all duration-200 cursor-pointer"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Creating account…
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-4 h-4" />
                                            Create Account
                                        </>
                                    )}
                                </button>

                                {/* Link to sign in */}
                                <p className="text-center text-xs text-white/30">
                                    Already have an account?{' '}
                                    <button type="button" onClick={() => switchTab('login')} className="text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer transition-colors">
                                        Sign in
                                    </button>
                                </p>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <p className="text-center text-[11px] text-white/15 tracking-wide">
                    Activity Monitor v1.0 • Secured with JWT
                </p>
            </motion.div>
        </div>
    );
}
