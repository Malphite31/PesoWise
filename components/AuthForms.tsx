
import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle, HelpCircle, Inbox } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface LoginViewProps {
  onLoginSuccess: () => void;
  onSwitchToSignup: () => void;
}

interface SignupViewProps {
  onSignupSuccess: () => void;
  onSwitchToLogin: () => void;
}

// Google Logo SVG Component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

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
    let msg = err.message || "Authentication failed";
    const lowerMsg = msg.toLowerCase();
    
    if (lowerMsg.includes("failed to fetch")) {
        msg = "Connection error: Unable to reach the database. Please check your Supabase URL configuration and internet connection.";
    } else if (lowerMsg.includes("email not confirmed")) {
        msg = "📧 Email not confirmed. Please check your inbox.";
    } else if (lowerMsg.includes("invalid login credentials")) {
        msg = "Invalid email or password. Please try again.";
    } else if (lowerMsg.includes("provider is not enabled") || lowerMsg.includes("unsupported provider")) {
        msg = "Google Sign-In is disabled. Please enable the Google provider in your Supabase Authentication settings.";
    }
    return msg;
};

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) throw error;
    } catch (err: any) {
        setError(handleAuthError(err));
        setIsGoogleLoading(false);
    }
  };

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
                    
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isGoogleLoading || isLoading}
                        className="w-full py-3.5 bg-white text-slate-800 font-bold rounded-xl transition-all hover:bg-slate-100 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed mb-4"
                    >
                        {isGoogleLoading ? <Loader2 className="w-5 h-5 animate-spin text-slate-600" /> : <GoogleIcon />}
                        <span>Sign in with Google</span>
                    </button>

                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-white/10"></div>
                        <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase tracking-wider">Or continue with</span>
                        <div className="flex-grow border-t border-white/10"></div>
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
                        disabled={isLoading || isGoogleLoading}
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
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showVerificationSent, setShowVerificationSent] = useState(false);
  
    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
        } catch (err: any) {
            setError(handleAuthError(err));
            setIsGoogleLoading(false);
        }
    };

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
                            <div className={`p-4 rounded-xl flex items-start gap-3 text-sm border ${error.includes('Google') ? 'bg-orange-500/10 border-orange-500/20 text-orange-200' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> 
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={isGoogleLoading || isLoading}
                            className="w-full py-3.5 bg-white text-slate-800 font-bold rounded-xl transition-all hover:bg-slate-100 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed mb-4"
                        >
                            {isGoogleLoading ? <Loader2 className="w-5 h-5 animate-spin text-slate-600" /> : <GoogleIcon />}
                            <span>Sign up with Google</span>
                        </button>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-white/10"></div>
                            <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase tracking-wider">Or register with email</span>
                            <div className="flex-grow border-t border-white/10"></div>
                        </div>

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
                            disabled={isLoading || isGoogleLoading}
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
