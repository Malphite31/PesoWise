import React, { useState, useEffect } from 'react';
import { TransactionType, Wallet } from '../types';
import { X, ChevronDown } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  wallets: Wallet[];
}

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Gift', 'Allowance', 'Other'];
const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Health', 'Education', 'Bills', 'Groceries', 'Other'];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onSave, wallets }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [walletId, setWalletId] = useState(wallets[0]?.id || '');
  
  // Category State
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // Update category options when transaction type changes
  useEffect(() => {
    if (type === 'income') {
        setCategory(INCOME_CATEGORIES[0]);
    } else {
        setCategory(EXPENSE_CATEGORIES[0]);
    }
    setIsCustomCategory(false);
    setCustomCategory('');
  }, [type]);

  // Update wallet selection if wallets change or are empty
  useEffect(() => {
    if (wallets.length > 0 && !walletId) {
        setWalletId(wallets[0].id);
    }
  }, [wallets, walletId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Determine final category
    let finalCategory = category;
    if (isCustomCategory) {
        finalCategory = customCategory.trim() || 'General';
    }

    onSave({
      description,
      amount: parseFloat(amount),
      type,
      walletId,
      category: finalCategory,
      date: new Date().toISOString(),
    });

    // Reset Form
    setDescription('');
    setAmount('');
    setCategory(type === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
    setCustomCategory('');
    setIsCustomCategory(false);
    onClose();
  };

  const currentCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="fixed inset-0 z-[60] flex items-end lg:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-t-2xl lg:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 lg:fade-in lg:zoom-in duration-300">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h3 className="font-bold text-white">New Transaction</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-white/5">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${type === 'expense' ? 'bg-slate-800 text-red-400 shadow-md border border-white/5' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${type === 'income' ? 'bg-slate-800 text-emerald-400 shadow-md border border-white/5' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Income
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Amount (PHP)</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-3xl font-bold text-white border-b-2 border-white/10 focus:border-blue-500 outline-none py-2 bg-transparent placeholder-slate-700 transition-colors"
              placeholder="0.00"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Description</label>
            <input
            type="text"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl bg-slate-950 border border-white/10 px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none transition-all placeholder-slate-600"
            placeholder="e.g. Jollibee Lunch"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Category</label>
              <div className="space-y-2">
                  <div className="relative">
                    <select
                        value={isCustomCategory ? 'custom_new' : category}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'custom_new') {
                                setIsCustomCategory(true);
                                setCategory('');
                            } else {
                                setIsCustomCategory(false);
                                setCategory(val);
                            }
                        }}
                        className="w-full rounded-xl bg-slate-950 border border-white/10 px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none appearance-none transition-all cursor-pointer"
                    >
                        {currentCategories.map(cat => (
                            <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                        ))}
                        <option value="custom_new" className="bg-slate-900 text-blue-400 font-medium">+ Add New Category</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                        <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                  
                  {isCustomCategory && (
                    <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="w-full rounded-xl bg-slate-900 border border-white/10 px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none transition-all placeholder-slate-600 animate-in slide-in-from-top-2 fade-in duration-200"
                        placeholder="Enter category name..."
                        required={isCustomCategory}
                    />
                  )}
              </div>
            </div>
            
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Wallet</label>
              <div className="relative">
                <select
                    value={walletId}
                    onChange={(e) => setWalletId(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-white/10 px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none appearance-none transition-all cursor-pointer"
                >
                    {wallets.map(w => (
                    <option key={w.id} value={w.id} className="bg-slate-900 text-white">{w.name}</option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
          >
            Save Transaction
          </button>
        </form>
      </div>
    </div>
  );
};