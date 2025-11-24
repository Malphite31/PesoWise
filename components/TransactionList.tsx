import React from 'react';
import { Transaction } from '../types';
import { ArrowUpRight, ArrowDownLeft, Coffee, ShoppingBag, Zap, Home } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
}

const formatPHP = (amount: number) => {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
};

const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('food')) return <Coffee className="w-4 h-4" />;
  if (cat.includes('shop')) return <ShoppingBag className="w-4 h-4" />;
  if (cat.includes('util') || cat.includes('bill')) return <Zap className="w-4 h-4" />;
  return <Home className="w-4 h-4" />;
};

export const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      <div className="p-6 border-b dark:border-white/5 border-slate-100 flex justify-between items-center">
        <h3 className="font-bold dark:text-white text-slate-900">Recent Transactions</h3>
        <button className="text-sm text-blue-500 font-medium hover:text-blue-400 transition-colors">View All</button>
      </div>
      <div className="divide-y dark:divide-white/5 divide-slate-100">
        {transactions.map((t) => (
          <div key={t.id} className="p-4 flex items-center justify-between dark:hover:bg-white/5 hover:bg-slate-50 transition-colors group">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl transition-all ${
                  t.type === 'income' 
                  ? 'bg-emerald-500/10 text-emerald-500' 
                  : 'bg-red-500/10 text-red-500'
              }`}>
                {t.type === 'income' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-semibold dark:text-slate-200 text-slate-800">{t.description}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    {getCategoryIcon(t.category)} {t.category}
                  </span>
                  <span className="opacity-50">•</span>
                  <span>{new Date(t.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className={`font-bold ${t.type === 'income' ? 'text-emerald-500' : 'dark:text-slate-200 text-slate-800'}`}>
              {t.type === 'income' ? '+' : '-'}{formatPHP(t.amount)}
            </div>
          </div>
        ))}
        {transactions.length === 0 && (
            <div className="p-8 text-center text-slate-500">No transactions yet.</div>
        )}
      </div>
    </div>
  );
};