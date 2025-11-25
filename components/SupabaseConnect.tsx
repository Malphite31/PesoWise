
import React, { useState, useEffect } from 'react';
import { saveSupabaseConfig } from '../lib/supabaseClient';
import { Database, Key, Link, Copy, Check, Terminal, Activity, ChevronRight, ChevronDown } from 'lucide-react';

export const SQL_SCHEMA = `-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  currency text default 'PHP',
  updated_at timestamp with time zone
);
alter table profiles enable row level security;

-- Safe Policy Creation
do $$
begin
    if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'Users can view own profile') then
        create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
    end if;
    if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'Users can update own profile') then
        create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
    end if;
end
$$;

-- Handle new user signup automatically
-- Enhanced to handle Google Login metadata correctly
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger refresh
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- WALLETS
create table if not exists wallets (
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
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'wallets' and policyname = 'Users can crud own wallets') then
    create policy "Users can crud own wallets" on wallets for all using (auth.uid() = user_id);
  end if;
end $$;

-- TRANSACTIONS
create table if not exists transactions (
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
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'transactions' and policyname = 'Users can crud own transactions') then
    create policy "Users can crud own transactions" on transactions for all using (auth.uid() = user_id);
  end if;
end $$;

-- BUDGETS
create table if not exists budgets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  category text,
  "limit" numeric,
  spent numeric,
  color text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table budgets enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'budgets' and policyname = 'Users can crud own budgets') then
    create policy "Users can crud own budgets" on budgets for all using (auth.uid() = user_id);
  end if;
end $$;

-- BILLS
create table if not exists bills (
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
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'bills' and policyname = 'Users can crud own bills') then
    create policy "Users can crud own bills" on bills for all using (auth.uid() = user_id);
  end if;
end $$;

-- LOANS
create table if not exists loans (
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
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'loans' and policyname = 'Users can crud own loans') then
    create policy "Users can crud own loans" on loans for all using (auth.uid() = user_id);
  end if;
end $$;

-- GOALS
create table if not exists goals (
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
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'goals' and policyname = 'Users can crud own goals') then
    create policy "Users can crud own goals" on goals for all using (auth.uid() = user_id);
  end if;
end $$;

-- INVESTMENTS
create table if not exists investments (
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
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'investments' and policyname = 'Users can crud own investments') then
    create policy "Users can crud own investments" on investments for all using (auth.uid() = user_id);
  end if;
end $$;
`;

export const SupabaseConnect: React.FC = () => {
    const [url, setUrl] = useState('');
    const [key, setKey] = useState('');
    const [copied, setCopied] = useState(false);
    const [envCopied, setEnvCopied] = useState(false);
    const [view, setView] = useState<'connect' | 'sql'>('connect');
    const [showDebug, setShowDebug] = useState(false);
    
    // Debug state to check if env vars are visible
    const [envStatus, setEnvStatus] = useState({
        urlFound: false,
        keyFound: false,
        urlValue: ''
    });

    useEffect(() => {
        // @ts-ignore
        const url = import.meta.env?.VITE_SUPABASE_URL;
        // @ts-ignore
        const key = import.meta.env?.VITE_SUPABASE_ANON_KEY;
        setEnvStatus({
            urlFound: !!url,
            keyFound: !!key,
            urlValue: url ? `${url.substring(0, 15)}...` : 'Missing'
        });
    }, []);

    const handleConnect = (e: React.FormEvent) => {
        e.preventDefault();
        let cleanUrl = url.trim();
        const cleanKey = key.trim();
        
        if (!cleanUrl || !cleanKey) return;

        // Auto-fix common URL mistakes
        if (!cleanUrl.startsWith('http')) {
            cleanUrl = `https://${cleanUrl}`;
        }

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
        const envContent = `VITE_SUPABASE_URL=${url.trim() || 'YOUR_SUPABASE_URL'}\nVITE_SUPABASE_ANON_KEY=${key.trim() || 'YOUR_SUPABASE_ANON_KEY'}`;
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
            <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <Database className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Connect Database</h1>
                            <p className="text-slate-400">Setup connection to start</p>
                        </div>
                    </div>

                    {view === 'connect' && (
                        <div className="space-y-6 animate-in slide-in-from-left-4 fade-in">
                            <p className="text-sm text-slate-400">
                                Enter your Supabase credentials below. This allows the app to sync your data to the cloud.
                            </p>

                            <form onSubmit={handleConnect} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Supabase URL</label>
                                    <div className="relative">
                                        <Link className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                        <input 
                                            type="text" 
                                            required 
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            placeholder="https://your-project.supabase.co"
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder-slate-600"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1 pl-1">Dashboard &gt; Settings &gt; API &gt; Project URL</p>
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
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder-slate-600"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1 pl-1">Dashboard &gt; Settings &gt; API &gt; Project API Keys</p>
                                </div>
                                <button 
                                    type="submit"
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    Connect & Continue <ChevronRight className="w-4 h-4" />
                                </button>
                            </form>

                            {/* Debug / Vercel Info Toggle */}
                            <div className="pt-4 border-t border-white/5">
                                <button 
                                    onClick={() => setShowDebug(!showDebug)}
                                    className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-colors w-full"
                                >
                                    {showDebug ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                    Troubleshooting & Debug Info
                                </button>

                                {showDebug && (
                                    <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 fade-in">
                                        <div className="bg-slate-950 rounded-xl border border-white/5 p-4 space-y-3">
                                            <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                                <Activity className="w-3 h-3" /> Environment Status
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className={`p-3 rounded-lg border flex flex-col items-center justify-center text-center gap-1 ${envStatus.urlFound ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                                    <span className="text-xs font-bold">URL</span>
                                                    <span className="text-[10px] font-mono">{envStatus.urlFound ? 'DETECTED' : 'MISSING'}</span>
                                                </div>
                                                <div className={`p-3 rounded-lg border flex flex-col items-center justify-center text-center gap-1 ${envStatus.keyFound ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                                    <span className="text-xs font-bold">KEY</span>
                                                    <span className="text-[10px] font-mono">{envStatus.keyFound ? 'DETECTED' : 'MISSING'}</span>
                                                </div>
                                            </div>
                                            {!envStatus.urlFound && (
                                                <div className="text-[11px] text-slate-500 space-y-2 mt-2 pt-2 border-t border-white/5">
                                                    <p><strong className="text-slate-400">Vercel Users:</strong> If you used Auto-Connect, Vercel named your variables <code>SUPABASE_URL</code>.</p>
                                                    <p>This app requires <code>VITE_SUPABASE_URL</code>. Go to Vercel Settings &gt; Environment Variables to fix this and redeploy.</p>
                                                    <button 
                                                        onClick={copyEnv}
                                                        className={`w-full py-2 mt-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${envCopied ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                                    >
                                                        {envCopied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy Correct Key Names</>}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                             <button onClick={clearConfig} className="text-red-400 hover:text-red-300 transition-colors">
                                                Reset Local Config
                                            </button>
                                             <button onClick={() => setView('sql')} className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                                                View SQL Schema <Terminal className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {view === 'sql' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 fade-in">
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
                            <button 
                                onClick={() => setView('connect')}
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
