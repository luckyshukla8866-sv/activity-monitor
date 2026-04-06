'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
        <div className="min-h-screen flex items-center justify-center px-4 py-12 font-manrope bg-[#f5f7f9] text-slate-800">
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
                        className="w-16 h-16 mx-auto rounded-3xl bg-white border border-slate-200 flex items-center justify-center shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[32px] text-indigo-600">monitoring</span>
                    </motion.div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                        Activity Monitor
                    </h1>
                    <p className="text-sm text-slate-500 font-inter">AI-powered productivity analytics</p>
                </div>

                {/* Main Card */}
                <div className="extrusion p-7 space-y-6 bg-white rounded-[2.5rem]">
                    {/* Demo Button — always visible */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDemoLogin}
                        disabled={anyLoading}
                        className="w-full py-3.5 px-5 rounded-2xl font-bold text-[15px]
                                   bg-indigo-600 hover:bg-indigo-700
                                   text-white shadow-md shadow-indigo-600/30
                                   disabled:opacity-60 disabled:cursor-not-allowed
                                   flex items-center justify-center gap-2.5
                                   transition-all duration-200 cursor-pointer
                                   relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        {isDemoLoading ? (
                            <>
                                <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                                Signing in…
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                                Try Demo — One Click Access
                            </>
                        )}
                    </motion.button>

                    {/* Feature pills */}
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                            <span className="material-symbols-outlined text-[14px] text-amber-500">bolt</span> Instant setup
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                            <span className="material-symbols-outlined text-[14px] text-emerald-500">shield</span> Pre-loaded data
                        </span>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">or</span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* Tab Switcher */}
                    <div className="relative flex recessed bg-[#f5f7f9] rounded-xl p-1.5">
                        {/* Animated background pill */}
                        <motion.div
                            className="absolute top-1.5 bottom-1.5 rounded-lg bg-white shadow-sm border border-slate-100"
                            layout
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                            style={{
                                width: 'calc(50% - 6px)',
                                left: tab === 'login' ? '6px' : 'calc(50%)',
                            }}
                        />
                        <button
                            onClick={() => switchTab('login')}
                            className={`relative z-10 flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                                tab === 'login' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">login</span>
                            Sign In
                        </button>
                        <button
                            onClick={() => switchTab('signup')}
                            className={`relative z-10 flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                                tab === 'signup' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">person_add</span>
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
                                    <label htmlFor="login-username" className="text-xs text-slate-500 font-bold uppercase tracking-wider">
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
                                                 recessed bg-[#f5f7f9] border-none
                                                 text-sm text-slate-800 placeholder:text-slate-400
                                                 outline-none focus:ring-2 focus:ring-indigo-500/30
                                                 transition-all disabled:opacity-50 font-medium"
                                    />
                                </div>

                                {/* Password */}
                                <div className="space-y-1.5">
                                    <label htmlFor="login-password" className="text-xs text-slate-500 font-bold uppercase tracking-wider">
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
                                                     recessed bg-[#f5f7f9] border-none
                                                     text-sm text-slate-800 placeholder:text-slate-400
                                                     outline-none focus:ring-2 focus:ring-indigo-500/30
                                                     transition-all disabled:opacity-50 font-medium"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer flex items-center justify-center p-1"
                                            tabIndex={-1}
                                        >
                                            <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Error */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="px-4 py-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 font-medium text-sm"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={anyLoading}
                                    className="w-full py-3.5 px-5 rounded-2xl font-bold text-[15px]
                                             bg-slate-800 text-white hover:bg-slate-700
                                             disabled:opacity-50 disabled:cursor-not-allowed
                                             flex items-center justify-center gap-2
                                             transition-all duration-200 cursor-pointer shadow-md shadow-slate-800/10 active:scale-95"
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
                                </button>

                                {/* Link to sign up */}
                                <p className="text-center text-xs text-slate-500 font-inter">
                                    Don&apos;t have an account?{' '}
                                    <button type="button" onClick={() => switchTab('signup')} className="text-indigo-600 hover:text-indigo-700 font-bold cursor-pointer transition-colors">
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
                                    <label htmlFor="signup-username" className="text-xs text-slate-500 font-bold uppercase tracking-wider">
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
                                                 recessed bg-[#f5f7f9] border-none
                                                 text-sm text-slate-800 placeholder:text-slate-400
                                                 outline-none focus:ring-2 focus:ring-indigo-500/30
                                                 transition-all disabled:opacity-50 font-medium"
                                    />
                                </div>

                                {/* Password */}
                                <div className="space-y-1.5">
                                    <label htmlFor="signup-password" className="text-xs text-slate-500 font-bold uppercase tracking-wider">
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
                                                     recessed bg-[#f5f7f9] border-none
                                                     text-sm text-slate-800 placeholder:text-slate-400
                                                     outline-none focus:ring-2 focus:ring-indigo-500/30
                                                     transition-all disabled:opacity-50 font-medium"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer flex items-center justify-center p-1"
                                            tabIndex={-1}
                                        >
                                            <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-1.5">
                                    <label htmlFor="signup-confirm" className="text-xs text-slate-500 font-bold uppercase tracking-wider">
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
                                                     recessed bg-[#f5f7f9] border-none
                                                     text-sm text-slate-800 placeholder:text-slate-400
                                                     outline-none focus:ring-2 focus:ring-indigo-500/30
                                                     transition-all disabled:opacity-50 font-medium"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer flex items-center justify-center p-1"
                                            tabIndex={-1}
                                        >
                                            <span className="material-symbols-outlined text-[20px]">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Password strength hint */}
                                {password.length > 0 && password.length < 6 && (
                                    <p className="text-[11px] text-amber-500 font-medium">Password needs at least 6 characters</p>
                                )}

                                {/* Match indicator */}
                                {confirmPassword.length > 0 && password === confirmPassword && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-bold"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">check_circle</span> Passwords match
                                    </motion.div>
                                )}
                                {confirmPassword.length > 0 && password !== confirmPassword && (
                                    <p className="text-[11px] text-rose-500 font-medium">Passwords do not match</p>
                                )}

                                {/* Success */}
                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="px-4 py-2.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 font-medium text-sm flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[20px] shrink-0">check_circle</span>
                                        {success}
                                    </motion.div>
                                )}

                                {/* Error */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="px-4 py-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 font-medium text-sm"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={anyLoading}
                                    className="w-full py-3.5 px-5 rounded-2xl font-bold text-[15px]
                                             bg-teal-50 text-teal-700 border border-teal-200
                                             hover:bg-teal-100 hover:border-teal-300
                                             disabled:opacity-50 disabled:cursor-not-allowed
                                             flex items-center justify-center gap-2
                                             transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
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
                                </button>

                                {/* Link to sign in */}
                                <p className="text-center text-xs text-slate-500 font-inter">
                                    Already have an account?{' '}
                                    <button type="button" onClick={() => switchTab('login')} className="text-indigo-600 hover:text-indigo-700 font-bold cursor-pointer transition-colors">
                                        Sign in
                                    </button>
                                </p>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <p className="text-center text-[12px] text-slate-400 tracking-wide font-mono">
                    Activity Monitor v2.0 • Secured with JWT
                </p>
            </motion.div>
        </div>
    );
}
