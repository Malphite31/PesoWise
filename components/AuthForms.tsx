
import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle, HelpCircle, Inbox } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface LoginViewProps {
  onLoginSuccess: () => void;
  onSwitchToSignup: () => void;
  initialError?: string | null;
}

interface SignupViewProps {
  onSignupSuccess: () => void;
  onSwitchToLogin: () => void;
}

// Helper for strength
const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length > 5) score += 1;
    if (pass.length > 9) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9!@#$%^&*]/.test(pass)) score += 1;
    return score; // Max 4
};

const PasswordStrengthMeter: React.FC<{ password: string }> = ({ password }) => {
    const strength = getPasswordStrength(password);
    const getColor = () => {
        if (strength <= 2) return 'bg-red-500';
        if (strength === 3) return 'bg-yellow-500';
        return 'bg-emerald-500';
    };
    const getLabel = () => {
        if (strength === 0) return '';
        if (strength <= 2) return 'Weak';
        if (strength === 3) return 'Medium';
        return 'Strong';
    };

    return (
        <div className="space-y-1 mt-2">
            <div className="flex gap-1 h-1">
                {[1, 2, 3, 4].map((level) => (
                    <div 
                        key={level} 
                        className={`flex-1 rounded-full transition-all duration-300 ${
                            strength >= level ? getColor() : 'bg-slate-700/30'
                        }`} 
                    />
                ))}
            </div>
            {strength > 0 && (
                <p className={`text-[10px] text-right font-medium transition-colors ${
                    strength <= 2 ? 'text-red-500' : strength === 3 ? 'text-yellow-500' : 'text-emerald-500'
                }`}>
                    {getLabel()}
                </p>
            )}
        </div>
    );
};

const handleAuthError = (err: any) => {
    // robustly get the message, handling objects with 'msg' (GoTrue), 'message' (Error), or just strings
    let msg = typeof err === 'string' ? err : (err?.msg || err?.message || "Authentication failed");
    
    // Sometimes err is a JSON string
    if (typeof msg === 'string' && msg.startsWith('{')) {
        try {
            const parsed = JSON.parse(msg);
            if (parsed.msg) msg = parsed.msg;
            if (parsed.message) msg = parsed.message;
        } catch(e) {}
    }

    const lowerMsg = msg.toLowerCase();
    
    if (lowerMsg.includes("failed to fetch")) {
        msg = "Connection error: Unable to reach the database. Please check your Supabase URL configuration and internet connection.";
    } else if (lowerMsg.includes("email not confirmed")) {
        msg = "📧 Email not confirmed. Please check your inbox.";
    } else if (lowerMsg.includes("invalid login credentials")) {
        msg = "Invalid email or password. Please try again.";
    } else if (lowerMsg.includes("validation_failed")) {
        msg = "Validation failed. Please check your input.";
    }
    return msg;
};

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onSwitchToSignup, initialError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setNeedsVerification(false);
    
    try {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        onLoginSuccess();
    } catch (err: any) {
        if (err.message && err.message.toLowerCase().includes("email not confirmed")) {
            setNeedsVerification(true);
        } else {
            setError(handleAuthError(err));
        }
    } finally {
        setIsLoading(false);
    }
  };

  if (needsVerification) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-96 bg-blue-900/20 blur-[120px] pointer-events-none"></div>
             <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-900/20 blur-[120px] pointer-events-none"></div>

             <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
                <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden text-center">
                    <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <Inbox className="w-10 h-10 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Verify Your Email</h2>
                    <p className="text-slate-400 mb-6 leading-relaxed">
                        We've sent a confirmation link to <span className="text-white font-medium block mt-1">{email}</span>
                        <br/>
                        You <strong>must</strong> click the link in that email before you can log in.
                    </p>
                    <div className="space-y-3">
                        <button 
                            onClick={() => window.open('https://mail.google.com', '_blank')}
                            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20"
                        >
                            Open Gmail
                        </button>
                         <button 
                            onClick={() => setNeedsVerification(false)}
                            className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-white/5"
                        >
                            Back to Login
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-6">
                        Can't find it? Check your Spam/Junk folder.
                    </p>
                </div>
             </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-96 bg-blue-900/20 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-900/20 blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mx-auto mb-6 transform rotate-3">
                    <span className="text-white font-bold text-4xl font-sans">₱</span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
                <p className="text-slate-400">Sign in to manage your finances</p>
            </div>

            <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                    {error && (
                        <div className={`p-4 rounded-xl flex items-start gap-3 text-sm border ${error.includes('Email') ? 'bg-orange-500/10 border-orange-500/20 text-orange-200' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                            {error.includes('Email') ? <HelpCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                            <span>{error}</span>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                            <input 
                                type="email" 
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder-slate-600" 
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                            <input 
                                type="password" 
                                required 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder-slate-600" 
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> Signing In...
                            </>
                        ) : (
                            <>
                                Sign In <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center relative z-10">
                    <p className="text-slate-400 text-sm">
                        Don't have an account?{' '}
                        <button onClick={onSwitchToSignup} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                            Create Account
                        </button>
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};

export const SignupView: React.FC<SignupViewProps> = ({ onSignupSuccess, onSwitchToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showVerificationSent, setShowVerificationSent] = useState(false);
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (password !== confirmPassword) {
          setError("Passwords do not match");
          return;
      }
      if (getPasswordStrength(password) < 2) {
          setError("Please use a stronger password");
          return;
      }
      setIsLoading(true);
      setError(null);
      setShowVerificationSent(false);

      try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                },
            },
        });

        if (error) throw error;

        if (data.user && !data.session) {
             setShowVerificationSent(true);
        } else {
             setTimeout(() => {
                 onSignupSuccess();
             }, 1000);
        }
      } catch (err: any) {
        setError(handleAuthError(err));
      } finally {
        setIsLoading(false);
      }
    };

    if (showVerificationSent) {
        return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-full h-96 bg-emerald-900/20 blur-[120px] pointer-events-none"></div>
             <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900/20 blur-[120px] pointer-events-none"></div>
             
             <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
                <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden text-center">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Check Your Inbox</h2>
                    <p className="text-slate-400 mb-6">
                        Account created! We've sent a verification link to <span className="text-white font-medium">{email}</span>.
                    </p>
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5 mb-6 text-sm text-slate-300">
                        Please confirm your email address to complete the setup and access your dashboard.
                    </div>
                    <div className="space-y-3">
                         <button 
                            onClick={() => window.open('https://mail.google.com', '_blank')}
                            className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all"
                        >
                            Open Gmail
                        </button>
                        <button 
                            onClick={onSwitchToLogin}
                            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            Proceed to Login <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
             </div>
        </div>
        );
    }
  
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute top-0 right-0 w-full h-96 bg-emerald-900/20 blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900/20 blur-[120px] pointer-events-none"></div>
  
          <div className="w-full max-w-md animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mx-auto mb-6 transform -rotate-3">
                      <span className="text-white font-bold text-4xl font-sans">₱</span>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Create Account</h1>
                  <p className="text-slate-400">Start your journey to financial freedom</p>
              </div>
  
              <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                  <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                        {error && (
                            <div className="p-4 rounded-xl flex items-start gap-3 text-sm border bg-red-500/10 border-red-500/20 text-red-400">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> 
                                <span>{error}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                <input 
                                    type="text" 
                                    required 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder-slate-600" 
                                    placeholder="Juan Dela Cruz"
                                />
                            </div>
                        </div>
    
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                <input 
                                    type="email" 
                                    required 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder-slate-600" 
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>
    
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                <input 
                                    type="password" 
                                    required 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder-slate-600" 
                                    placeholder="Create a password"
                                />
                            </div>
                            <PasswordStrengthMeter password={password} />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                <input 
                                    type="password" 
                                    required 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder-slate-600" 
                                    placeholder="Repeat password"
                                />
                            </div>
                        </div>
    
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" /> Creating Account...
                                </>
                            ) : (
                                <>
                                    Create Account <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                  </form>
  
                  <div className="mt-6 text-center relative z-10">
                      <p className="text-slate-400 text-sm">
                          Already have an account?{' '}
                          <button onClick={onSwitchToLogin} className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                              Sign In
                          </button>
                      </p>
                  </div>
              </div>
          </div>
      </div>
    );
  };
