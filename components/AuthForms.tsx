import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface LoginViewProps {
  onLoginSuccess: () => void;
  onSwitchToSignup: () => void;
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

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        onLoginSuccess();
    } catch (err: any) {
        setError(err.message || "Failed to login");
    } finally {
        setIsLoading(false);
    }
  };

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
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-center gap-2 text-sm">
                            <AlertCircle className="w-4 h-4" /> {error}
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
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
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
      setSuccessMessage(null);

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

        // If user is created but no session, it usually means email verification is enabled.
        if (data.user && !data.session) {
             setSuccessMessage("Account created successfully! Please check your email to verify your account before logging in.");
             setPassword('');
             setConfirmPassword('');
        } else {
             setSuccessMessage("Account created successfully! Redirecting...");
             setTimeout(() => {
                 onSignupSuccess();
             }, 1500);
        }
      } catch (err: any) {
        setError(err.message || "Failed to create account");
      } finally {
        setIsLoading(false);
      }
    };
  
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
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-center gap-2 text-sm">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </div>
                        )}
                        
                        {successMessage && (
                             <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-start gap-3 text-sm animate-in zoom-in duration-300">
                                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> 
                                <div>
                                    <p className="font-bold mb-1">Success!</p>
                                    <p>{successMessage}</p>
                                </div>
                            </div>
                        )}

                        {!successMessage && (
                            <>
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
                            </>
                        )}
                        
                        {successMessage && !isLoading && (
                            <button 
                                type="button"
                                onClick={onSwitchToLogin}
                                className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                Proceed to Login <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
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