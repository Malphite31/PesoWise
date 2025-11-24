
import React, { useState } from 'react';
import { saveSupabaseConfig } from '../lib/supabaseClient';
import { Database, Key, Link, Copy, Check, Terminal, AlertTriangle, FileText, Globe } from 'lucide-react';

const SQL_SCHEMA = `-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  currency text default 'PHP',
  updated_at timestamp with time zone
);
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Handle new user signup automatically
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- WALLETS
create table wallets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text,
  type text,
  balance numeric,
  color text,
  account_number text,
  account_name text,
  expiry_date text,
  cvv text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table wallets enable row level security;
create policy "Users can crud own wallets" on wallets for all using (auth.uid() = user_id);

-- TRANSACTIONS
create table transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  wallet_id uuid references wallets(id) on delete cascade,
  date timestamp with time zone,
  description text,
  amount numeric,
  type text,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table transactions enable row level security;
create policy "Users can crud own transactions" on transactions for all using (auth.uid() = user_id);

-- BUDGETS
create table budgets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  category text,
  "limit" numeric,
  spent numeric,
  color text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table budgets enable row level security;
create policy "Users can crud own budgets" on budgets for all using (auth.uid() = user_id);

-- BILLS
create table bills (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text,
  amount numeric,
  due_date text,
  is_paid boolean,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table bills enable row level security;
create policy "Users can crud own bills" on bills for all using (auth.uid() = user_id);

-- LOANS
create table loans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text,
  total_amount numeric,
  paid_amount numeric,
  due_date text,
  interest_rate numeric,
  type text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table loans enable row level security;
create policy "Users can crud own loans" on loans for all using (auth.uid() = user_id);

-- GOALS
create table goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text,
  target_amount numeric,
  current_amount numeric,
  deadline text,
  color text,
  icon text,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table goals enable row level security;
create policy "Users can crud own goals" on goals for all using (auth.uid() = user_id);

-- INVESTMENTS
create table investments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text,
  type text,
  invested_amount numeric,
  current_value numeric,
  symbol text,
  color text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table investments enable row level security;
create policy "Users can crud own investments" on investments for all using (auth.uid() = user_id);
`;

export const SupabaseConnect: React.FC = () => {
    const [url, setUrl] = useState('');
    const [key, setKey] = useState('');
    const [copied, setCopied] = useState(false);
    const [envCopied, setEnvCopied] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);

    const handleConnect = (e: React.FormEvent) => {
        e.preventDefault();
        const cleanUrl = url.trim();
        const cleanKey = key.trim();
        if (cleanUrl && cleanKey) {
            saveSupabaseConfig(cleanUrl, cleanKey);
        }
    };

    const copySQL = () => {
        navigator.clipboard.writeText(SQL_SCHEMA);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const copyEnv = () => {
        const envContent = `VITE_SUPABASE_URL=${url.trim()}\nVITE_SUPABASE_ANON_KEY=${key.trim()}`;
        navigator.clipboard.writeText(envContent);
        setEnvCopied(true);
        setTimeout(() => setEnvCopied(false), 2000);
    };

    const clearConfig = () => {
        localStorage.removeItem('sb_url');
        localStorage.removeItem('sb_key');
        window.location.reload();
    };

    return (
        <div className="fixed inset-0 z-[200] bg-slate-950 flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                <div className="p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                            <Database className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Connect Database</h1>
                            <p className="text-slate-400">Setup Supabase to sync your financial data</p>
                        </div>
                    </div>

                    {step === 1 ? (
                        <div className="space-y-6">
                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-sm flex gap-3">
                                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                <p>PesoWise requires a Supabase backend. Please create a free project at <a href="https://supabase.com" target="_blank" className="underline font-bold hover:text-blue-300">supabase.com</a> to get started.</p>
                            </div>

                            <form onSubmit={handleConnect} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Project URL</label>
                                    <div className="relative">
                                        <Link className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                        <input 
                                            type="url" 
                                            required 
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            placeholder="https://your-project.supabase.co"
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder-slate-600"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Anon / Public Key</label>
                                    <div className="relative">
                                        <Key className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                        <input 
                                            type="text" 
                                            required 
                                            value={key}
                                            onChange={(e) => setKey(e.target.value)}
                                            placeholder="eyJh..."
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder-slate-600"
                                        />
                                    </div>
                                </div>
                                <button 
                                    type="submit"
                                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    Connect App <Database className="w-4 h-4" />
                                </button>
                            </form>

                            {/* .ENV Helper Section */}
                            {(url || key) && (
                                <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-white/10 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-sm font-bold text-slate-400 flex items-center gap-2">
                                            <FileText className="w-4 h-4" /> Permanent Config
                                        </h3>
                                        <button 
                                            onClick={copyEnv}
                                            className={`text-[10px] font-bold px-2 py-1 rounded transition-colors flex items-center gap-1 ${envCopied ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
                                        >
                                            {envCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {envCopied ? 'Copied' : 'Copy'}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mb-2 leading-relaxed">
                                        <strong className="text-slate-300">Localhost:</strong> Create a <code className="text-white bg-white/10 px-1 rounded">.env</code> file in your project root.<br/>
                                        <strong className="text-slate-300">Vercel / Netlify:</strong> Add these as <strong>Environment Variables</strong> in your project settings.
                                    </p>
                                    <pre className="text-[10px] font-mono text-emerald-400 bg-black/50 p-3 rounded-lg overflow-x-auto whitespace-pre">
{`VITE_SUPABASE_URL=${url.trim() || '...'}
VITE_SUPABASE_ANON_KEY=${key.trim() || '...'}`}
                                    </pre>
                                </div>
                            )}

                            <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                                <button onClick={clearConfig} className="text-red-400 hover:text-red-300 text-xs transition-colors">
                                    Reset / Clear Config
                                </button>
                                <button onClick={() => setStep(2)} className="text-slate-500 hover:text-white text-sm font-medium transition-colors flex items-center gap-1">
                                    View SQL Schema Script <Terminal className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="p-4 bg-slate-950 rounded-xl border border-white/10">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                        <Terminal className="w-4 h-4" /> SQL Editor
                                    </div>
                                    <button 
                                        onClick={copySQL}
                                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 ${copied ? 'bg-emerald-500/20 text-emerald-500' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                    >
                                        {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy Code</>}
                                    </button>
                                </div>
                                <div className="h-64 overflow-y-auto custom-scrollbar text-xs font-mono text-slate-300 bg-black/30 p-4 rounded-lg leading-relaxed whitespace-pre">
                                    {SQL_SCHEMA}
                                </div>
                            </div>
                            <p className="text-sm text-slate-400 text-center">
                                Paste this code into your Supabase Project's <span className="text-white font-bold">SQL Editor</span> and click <span className="text-white font-bold">Run</span> to create the necessary tables.
                            </p>
                            <button 
                                onClick={() => setStep(1)}
                                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all"
                            >
                                Back to Connection
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
