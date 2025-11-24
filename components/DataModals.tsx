
import React, { useState, useEffect } from 'react';
import { Wallet, WalletType, Bill, SavingsGoal, BudgetCategory, Loan, LoanType, GoalCategory, Investment, InvestmentType } from '../types';
import { X, Trash2, Check, Palette, PartyPopper, ShoppingBag, Plane, Shield, Car, Home, GraduationCap, Smartphone, Target, CreditCard, ChevronDown, Plus, TrendingUp, Printer, Calendar } from 'lucide-react';
import { generateUUID } from '../lib/supabaseClient';

// --- Shared Components ---
const ModalWrapper: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-md dark:bg-slate-900 bg-white border dark:border-white/10 border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="p-4 border-b dark:border-white/5 border-slate-100 flex justify-between items-center dark:bg-white/5 bg-slate-50 sticky top-0 z-10 backdrop-blur-md">
                    <h3 className="font-bold dark:text-white text-slate-900">{title}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full text-slate-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

const InputGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">{label}</label>
        {children}
    </div>
);

const ActionButtons: React.FC<{ onDelete?: () => void; onSaveLabel?: string }> = ({ onDelete, onSaveLabel = 'Save' }) => (
    <div className="flex gap-3 pt-4 border-t dark:border-white/5 border-slate-100 mt-4">
        {onDelete && (
            <button
                type="button"
                onClick={onDelete}
                className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-medium transition-colors"
            >
                <Trash2 className="w-5 h-5" />
            </button>
        )}
        <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex justify-center items-center gap-2"
        >
            <Check className="w-4 h-4" /> {onSaveLabel}
        </button>
    </div>
);

// --- Print Options Modal ---
export interface PrintOptions {
    startDate: string;
    endDate: string;
    includeSummary: boolean;
    includeTransactions: boolean;
    includeWallets: boolean;
    includeCharts: boolean;
}

interface PrintOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (options: PrintOptions) => void;
}

export const PrintOptionsModal: React.FC<PrintOptionsModalProps> = ({ isOpen, onClose, onGenerate }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [includeSummary, setIncludeSummary] = useState(true);
    const [includeTransactions, setIncludeTransactions] = useState(true);
    const [includeWallets, setIncludeWallets] = useState(true);
    const [includeCharts, setIncludeCharts] = useState(true);

    useEffect(() => {
        if (isOpen) {
            // Default to current month
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            setStartDate(firstDay.toISOString().split('T')[0]);
            setEndDate(lastDay.toISOString().split('T')[0]);
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate({
            startDate,
            endDate,
            includeSummary,
            includeTransactions,
            includeWallets,
            includeCharts
        });
        onClose();
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title="Generate Report">
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="bg-blue-500/10 p-4 rounded-xl flex items-start gap-3">
                    <Printer className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-blue-500">PDF Report Generation</h4>
                        <p className="text-xs text-slate-500 mt-1">Select the date range and data you want to include in your printed report.</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Start Date">
                        <div className="relative">
                            <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full rounded-xl dark:bg-slate-950 bg-white border dark:border-white/10 border-slate-300 px-4 py-3 text-sm dark:text-white text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none" />
                        </div>
                    </InputGroup>
                    <InputGroup label="End Date">
                        <div className="relative">
                            <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full rounded-xl dark:bg-slate-950 bg-white border dark:border-white/10 border-slate-300 px-4 py-3 text-sm dark:text-white text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none" />
                        </div>
                    </InputGroup>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Include Sections</label>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-slate-950 bg-white cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            <input type="checkbox" checked={includeSummary} onChange={e => setIncludeSummary(e.target.checked)} className="w-5 h-5 rounded text-blue-500 focus:ring-blue-500 border-slate-300" />
                            <span className="text-sm font-medium dark:text-white text-slate-900">Financial Summary</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-slate-950 bg-white cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            <input type="checkbox" checked={includeWallets} onChange={e => setIncludeWallets(e.target.checked)} className="w-5 h-5 rounded text-blue-500 focus:ring-blue-500 border-slate-300" />
                            <span className="text-sm font-medium dark:text-white text-slate-900">Wallet Balances</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-slate-950 bg-white cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            <input type="checkbox" checked={includeTransactions} onChange={e => setIncludeTransactions(e.target.checked)} className="w-5 h-5 rounded text-blue-500 focus:ring-blue-500 border-slate-300" />
                            <span className="text-sm font-medium dark:text-white text-slate-900">Transaction History</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-slate-950 bg-white cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            <input type="checkbox" checked={includeCharts} onChange={e => setIncludeCharts(e.target.checked)} className="w-5 h-5 rounded text-blue-500 focus:ring-blue-500 border-slate-300" />
                            <span className="text-sm font-medium dark:text-white text-slate-900">Charts & Graphs</span>
                        </label>
                    </div>
                </div>

                <div className="pt-4 border-t dark:border-white/5 border-slate-100 mt-4">
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex justify-center items-center gap-2"
                    >
                        <Printer className="w-4 h-4" /> Generate & Print
                    </button>
                </div>
            </form>
        </ModalWrapper>
    );
};

// --- Quick Update Modal ---
interface QuickUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (amount: number, walletId: string) => void;
    title: string;
    item?: { name: string; current: number; target: number; unit?: string } | null;
    wallets: Wallet[];
    type?: 'budget' | 'loan' | 'goal' | 'bill' | null;
}

export const QuickUpdateModal: React.FC<QuickUpdateModalProps> = ({ isOpen, onClose, onSave, title, item, wallets, type }) => {
    const [amount, setAmount] = useState('');
    const [walletId, setWalletId] = useState('');

    useEffect(() => {
        if (isOpen && wallets.length > 0 && !walletId) {
            setWalletId(wallets[0].id);
        }
        if (isOpen && type === 'bill' && item) {
             setAmount(item.target.toString());
        }
        if (!isOpen) {
            setAmount('');
        }
    }, [isOpen, wallets, type, item]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const val = parseFloat(amount);
        if (!isNaN(val) && walletId) {
            onSave(val, walletId);
        }
        setAmount('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                 {item && (
                    <div className="dark:bg-white/5 bg-slate-50 p-4 rounded-xl mb-4 border dark:border-white/5 border-slate-100">
                        <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Current Status</p>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-lg font-bold dark:text-white text-slate-900 truncate pr-4">{item.name}</span>
                            <span className="text-sm font-mono dark:text-slate-300 text-slate-600 whitespace-nowrap">
                                {item.unit || '₱'}{item.current.toLocaleString()} <span className="text-slate-400">/</span> {item.unit || '₱'}{item.target.toLocaleString()}
                            </span>
                        </div>
                        <div className="h-1.5 dark:bg-slate-800 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 transition-all" style={{ width: `${Math.min((item.current / item.target) * 100, 100)}%` }}></div>
                        </div>
                    </div>
                 )}
                 
                 <InputGroup label="Source / Destination Wallet">
                    <div className="relative">
                        <select
                            value={walletId}
                            onChange={(e) => setWalletId(e.target.value)}
                            required
                            className="w-full rounded-xl dark:bg-slate-950 bg-white border dark:border-white/10 border-slate-300 px-4 py-3 text-sm dark:text-white text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none cursor-pointer"
                        >
                            {wallets.map(w => (
                                <option key={w.id} value={w.id} className="dark:bg-slate-900 bg-white">
                                    {w.name} (₱{w.balance.toLocaleString()})
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>
                 </InputGroup>

                 {type === 'bill' ? (
                     <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 text-center">
                        <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Amount to Pay</p>
                        <p className="text-3xl font-bold dark:text-white text-slate-900">
                            ₱{parseFloat(amount || '0').toLocaleString()}
                        </p>
                     </div>
                 ) : (
                    <InputGroup label="Amount">
                        <div className="relative">
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg">₱</span>
                            <input 
                                type="number" 
                                required 
                                step="0.01" 
                                min="0.01"
                                value={amount} 
                                onChange={e => setAmount(e.target.value)} 
                                className="w-full text-3xl font-bold dark:text-white text-slate-900 border-b-2 dark:border-white/10 border-slate-200 focus:border-blue-500 outline-none py-2 pl-6 bg-transparent placeholder-slate-400 transition-colors"
                                placeholder="0.00"
                                autoFocus
                            />
                        </div>
                    </InputGroup>
                 )}
                
                <div className="flex gap-3 pt-4">
                    <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white dark:hover:bg-white/5 hover:bg-slate-100 transition-colors font-medium">Cancel</button>
                    <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex justify-center items-center gap-2">
                         <Plus className="w-5 h-5" /> {type === 'bill' ? 'Pay Now' : 'Confirm Update'}
                    </button>
                </div>
            </form>
        </ModalWrapper>
    );
};

// --- Wallet Modal ---
interface WalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (wallet: Wallet) => void;
    onDelete: (id: string) => void;
    initialData?: Wallet | null;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onSave, onDelete, initialData }) => {
    const [name, setName] = useState('');
    const [balance, setBalance] = useState('');
    const [type, setType] = useState<WalletType>(WalletType.BDO);
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setBalance(initialData.balance.toString());
            setType(initialData.type);
            setAccountNumber(initialData.accountNumber || '');
            setAccountName(initialData.accountName || '');
            setExpiryDate(initialData.expiryDate || '');
            setCvv(initialData.cvv || '');
        } else {
            setName('');
            setBalance('');
            setType(WalletType.BDO);
            setAccountNumber('');
            setAccountName('');
            setExpiryDate('');
            setCvv('');
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const colors: Record<WalletType, string> = {
            [WalletType.CASH]: 'bg-gradient-to-r from-amber-500 to-orange-400',
            [WalletType.GCASH]: 'bg-gradient-to-r from-blue-600 to-cyan-500',
            [WalletType.MAYA]: 'bg-gradient-to-r from-green-500 to-emerald-400',
            [WalletType.PAYPAL]: 'bg-gradient-to-r from-blue-700 to-indigo-600',
            [WalletType.WISE]: 'bg-gradient-to-r from-lime-500 to-emerald-500',
            [WalletType.SEABANK]: 'bg-gradient-to-r from-orange-500 to-amber-500',
            [WalletType.MARIBANK]: 'bg-gradient-to-r from-orange-600 to-red-500',
            [WalletType.CIMB]: 'bg-gradient-to-r from-red-700 to-red-600',
            [WalletType.GOTYME]: 'bg-gradient-to-r from-zinc-400 to-zinc-500',
            [WalletType.TONIK]: 'bg-gradient-to-r from-purple-600 to-purple-400',
            [WalletType.KOMO]: 'bg-gradient-to-r from-blue-500 to-teal-400',
            [WalletType.OWNBANK]: 'bg-gradient-to-r from-red-500 to-orange-500',
            [WalletType.BDO]: 'bg-gradient-to-r from-blue-800 to-blue-600',
            [WalletType.BPI]: 'bg-gradient-to-r from-red-900 to-red-700',
            [WalletType.METROBANK]: 'bg-gradient-to-r from-blue-700 to-indigo-800',
            [WalletType.LANDBANK]: 'bg-gradient-to-r from-green-700 to-green-600',
            [WalletType.CHINABANK]: 'bg-gradient-to-r from-red-900 to-red-800',
            [WalletType.UNIONBANK]: 'bg-gradient-to-r from-orange-600 to-orange-500',
            [WalletType.RCBC]: 'bg-gradient-to-r from-blue-700 to-cyan-600',
            [WalletType.PNB]: 'bg-gradient-to-r from-blue-800 to-blue-700',
            [WalletType.SECURITYBANK]: 'bg-gradient-to-r from-blue-600 to-green-500',
            [WalletType.EASTWEST]: 'bg-gradient-to-r from-purple-800 to-fuchsia-700',
            [WalletType.OTHER]: 'bg-gradient-to-r from-slate-600 to-slate-500',
        };

        onSave({
            id: initialData?.id || generateUUID(),
            name: name || type,
            balance: parseFloat(balance),
            type,
            color: colors[type],
            accountNumber,
            accountName,
            expiryDate,
            cvv,
        });
        onClose();
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Wallet' : 'Add Wallet'}>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <InputGroup label="Bank / Wallet Provider">
                    <div className="relative">
                        <select 
                            value={type} 
                            onChange={e => {
                                setType(e.target.value as WalletType);
                                if (!initialData) setName(e.target.value);
                            }} 
                            className="w-full rounded-xl dark:bg-slate-950 bg-white border dark:border-white/10 border-slate-300 px-4 py-3 text-sm dark:text-white text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none cursor-pointer"
                        >
                            <optgroup label="Common">
                                <option value={WalletType.GCASH}>GCash</option>
                                <option value={WalletType.MAYA}>Maya</option>
                                <option value={WalletType.CASH}>Cash</option>
                            </optgroup>
                            <optgroup label="International / Digital">
                                <option value={WalletType.PAYPAL}>PayPal</option>
                                <option value={WalletType.WISE}>Wise</option>
                            </optgroup>
                            <optgroup label="Digital Banks">
                                <option value={WalletType.SEABANK}>SeaBank</option>
                                <option value={WalletType.MARIBANK}>MariBank</option>
                                <option value={WalletType.CIMB}>CIMB</option>
                                <option value={WalletType.GOTYME}>GoTyme</option>
                                <option value={WalletType.TONIK}>Tonik</option>
                                <option value={WalletType.KOMO}>Komo</option>
                                <option value={WalletType.OWNBANK}>OwnBank</option>
                            </optgroup>
                            <optgroup label="Traditional Banks">
                                <option value={WalletType.BDO}>BDO</option>
                                <option value={WalletType.BPI}>BPI</option>
                                <option value={WalletType.METROBANK}>Metrobank</option>
                                <option value={WalletType.LANDBANK}>LandBank</option>
                                <option value={WalletType.CHINABANK}>China Bank</option>
                                <option value={WalletType.UNIONBANK}>UnionBank</option>
                                <option value={WalletType.RCBC}>RCBC</option>
                                <option value={WalletType.PNB}>PNB</option>
                                <option value={WalletType.SECURITYBANK}>Security Bank</option>
                                <option value={WalletType.EASTWEST}>EastWest</option>
                            </optgroup>
                            <option value={WalletType.OTHER}>Other</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>
                </InputGroup>

                <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Wallet Name">
                        <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full rounded-xl dark:bg-slate-950 bg-white border dark:border-white/10 border-slate-300 px-4 py-3 text-sm dark:text-white text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder="e.g. Personal Savings" />
                    </InputGroup>
                    <InputGroup label="Current Balance">
                        <input type="number" required step="0.01" value={balance} onChange={e => setBalance(e.target.value)} className="w-full rounded-xl dark:bg-slate-950 bg-white border dark:border-white/10 border-slate-300 px-4 py-3 text-sm dark:text-white text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder="0.00" />
                    </InputGroup>
                </div>

                {type !== WalletType.CASH && (
                    <div className="space-y-4 pt-2 border-t dark:border-white/5 border-slate-100 animate-in fade-in duration-300">
                        <p className="text-xs font-bold text-blue-500 flex items-center gap-1">
                            <CreditCard className="w-3 h-3"/> Bank / Card Details
                        </p>
                        <InputGroup label="Account Holder Name">
                            <input type="text" value={accountName} onChange={e => setAccountName(e.target.value)} className="w-full rounded-xl dark:bg-slate-950 bg-white border dark:border-white/10 border-slate-300 px-4 py-3 text-sm dark:text-white text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder="Name on card" />
                        </InputGroup>
                        <InputGroup label="Account / Card No.">
                            <input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="w-full rounded-xl dark:bg-slate-950 bg-white border dark:border-white/10 border-slate-300 px-4 py-3 text-sm dark:text-white text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder="XXXX-XXXX-XXXX-XXXX" />
                        </InputGroup>
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="Expiry Date">
                                <input type="text" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="w-full rounded-xl dark:bg-slate-950 bg-white border dark:border-white/10 border-slate-300 px-4 py-3 text-sm dark:text-white text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder="MM/YY" />
                            </InputGroup>
                            <InputGroup label="CVV">
                                <input type="text" value={cvv} onChange={e => setCvv(e.target.value)} className="w-full rounded-xl dark:bg-slate-950 bg-white border dark:border-white/10 border-slate-300 px-4 py-3 text-sm dark:text-white text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder="123" maxLength={4} />
                            </InputGroup>
                        </div>
                    </div>
                )}

                <ActionButtons onDelete={initialData ? () => { onDelete(initialData.id); onClose(); } : undefined} />
            </form>
        </ModalWrapper>
    );
};

// ... (BillModal, BudgetModal, LoanModal, InvestmentModal, GoalModal follow the same pattern - just swapping classes)

interface BillModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (bill: Bill) => void;
    onDelete: (id: string) => void;
    initialData?: Bill | null;
}

export const BillModal: React.FC<BillModalProps> = ({ isOpen, onClose, onSave, onDelete, initialData }) => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [category, setCategory] = useState('Utilities');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setAmount(initialData.amount.toString());
            setDueDate(initialData.dueDate);
            setCategory(initialData.category);
        } else {
            setName('');
            setAmount('');
            setDueDate('');
            setCategory('Utilities');
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: initialData?.id || generateUUID(),
            name,
            amount: parseFloat(amount),
            dueDate,
            category,
            isPaid: initialData?.isPaid || false,
        });
        onClose();
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Bill' : 'Add Bill'}>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <InputGroup label="Bill Name">
                    <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full rounded-xl dark:bg-slate-950 bg-white border dark:border-white/10 border-slate-300 px-4 py-3 text-sm dark:text-white text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder="e.g. Meralco" />
                </InputGroup>
                <InputGroup label="Amount">
                    <input type="number" required step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full rounded-xl dark:bg-slate-950 bg-white border dark:border-white/10 border-slate-300 px-4 py-3 text-sm dark:text-white text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder="0.00" />
                </InputGroup>
                <InputGroup label="Due Date">
                    <input type="date" required value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full rounded-xl dark:bg-slate-950 bg-white border dark:border-white/10 border-slate-300 px-4 py-3 text-sm dark:text-white text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none" />
                </InputGroup>
                <InputGroup label="Category">
                    <input type="text" required value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-xl dark:bg-slate-950 bg-white border dark:border-white/10 border-slate-300 px-4 py-3 text-sm dark:text-white text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder="e.g. Utilities" />
                </InputGroup>
                <ActionButtons onDelete={initialData ? () => { onDelete(initialData.id); onClose(); } : undefined} />
            </form>
        </ModalWrapper>
    );
};

// ... Celebration Modal ...
interface CelebrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    goal: SavingsGoal | null;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({ isOpen, onClose, goal }) => {
    if (!isOpen || !goal) return null;

    const getCelebrationMessage = (category: GoalCategory) => {
        switch (category) {
            case 'tech': return { title: "New Gadget Day?", message: `Congratulations on saving enough for your ${goal.name}! Are you heading to the store now?` };
            case 'travel': return { title: "Bon Voyage! ✈️", message: `Your travel fund for ${goal.name} is ready! Have you booked your tickets yet?` };
            case 'vehicle': return { title: "Vroom Vroom! 🚗", message: `You've hit the target for your ${goal.name}. Ready to ride?` };
            default: return { title: "Goal Crushed! 🎯", message: `You did it! You reached your goal: ${goal.name}.` };
        }
    };
    const content = getCelebrationMessage(goal.category);

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-800 to-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 text-center p-8">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg shadow-orange-500/30 text-white animate-bounce">
                        <PartyPopper className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">{content.title}</h2>
                        <p className="text-slate-300 leading-relaxed">{content.message}</p>
                    </div>
                    <div className="flex flex-col w-full gap-3 mt-4">
                        <button onClick={onClose} className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95">Yes, I did it!</button>
                        <button onClick={onClose} className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-medium rounded-xl transition-all">Not yet, just saving</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ... Goal Modal ...
interface GoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (goal: SavingsGoal) => void;
    onDelete: (id: string) => void;
    initialData?: SavingsGoal | null;
}

const GOAL_CATEGORIES: { value: GoalCategory; label: string; icon: string }[] = [
    { value: 'tech', label: 'Tech & Gadgets', icon: 'Smartphone' },
    { value: 'travel', label: 'Travel & Adventure', icon: 'Plane' },
    { value: 'vehicle', label: 'Car & Vehicle', icon: 'Car' },
    { value: 'home', label: 'Home & Living', icon: 'Home' },
    { value: 'shopping', label: 'Shopping & Gifts', icon: 'ShoppingBag' },
    { value: 'emergency', label: 'Emergency Fund', icon: 'Shield' },
    { value: 'education', label: 'Education', icon: 'GraduationCap' },
    { value: 'other', label: 'General / Other', icon: 'Target' },
];

export const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, onSave, onDelete, initialData }) => {
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [currentAmount, setCurrentAmount] = useState('');
    const [deadline, setDeadline] = useState('');
    const [category, setCategory] = useState<GoalCategory>('other');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setTargetAmount(initialData.targetAmount.toString());
            setCurrentAmount(initialData.currentAmount.toString());
            setDeadline(initialData.deadline);
            setCategory(initialData.category);
        } else {
            setName('');
            setTargetAmount('');
            setCurrentAmount('0');
            setDeadline('');
            setCategory('other');
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedCat = GOAL_CATEGORIES.find(c => c.value === category);
        const icon = selectedCat?.icon || 'Target';
        const colorMap: Record<string, string> = { tech: 'bg-indigo-500', travel: 'bg-cyan-500', vehicle: 'bg-red-500', home: 'bg-emerald-500', shopping: 'bg-pink-500', emergency: 'bg-amber-500', education: 'bg-blue-500', other: 'bg-purple-500' };

        onSave({
            id: initialData?.id || generateUUID(),
            name,
            targetAmount: parseFloat(targetAmount),
            currentAmount: parseFloat(currentAmount),
            deadline,
            color: colorMap[category] || 'bg-blue-500',
            icon,
            category
        });
        onClose();
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Goal' : 'Add Savings Goal'}>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <InputGroup label="Goal Name">
                    <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full rounded-xl dark:bg-slate-950 bg-white border dark:border-white/10 border-slate-300 px-4 py-3 text-sm dark:text-white text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder="e.g. New Laptop" />
                </InputGroup>
                <InputGroup label="Category">
                    <select value={category} onChange={(e) => setCategory(e.target.value as GoalCategory)} className="w-full rounded-xl dark:bg-slate-950 bg-white border dark:border-white/10 border-slate-300 px-4 py-3 text-sm dark:text-white text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none cursor-pointer">
                        {GOAL_CATEGORIES.map(cat => (
                            <option key={cat.value} value={cat.value} className="dark:bg-slate-900 bg-white">{cat.label}</option>
                        ))}
                    </select>
                </InputGroup>
                <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Target Amount">
                        <input type="number" required step="0.01" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} className="w-full rounded-xl dark:bg-slate-950 bg-white border dark:border-white/10 border-slate-300 px-4 py-3 text-sm dark:text-white text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder="0.00" />
                    </InputGroup>
                    <InputGroup label="Saved So Far">
                        <input type="number" required step="0.01" value={currentAmount} onChange={e => setCurrentAmount(e.target.value)} className="w-full rounded-xl dark:bg-slate-950 bg-white border dark:border-white/10 border-slate-300 px-4 py-3 text-sm dark:text-white text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder="0.00" />
                    </InputGroup>
                </div>
                <InputGroup label="Target Date">
                    <input type="date" required value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full rounded-xl dark:bg-slate-950 bg-white border dark:border-white/10 border-slate-300 px-4 py-3 text-sm dark:text-white text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none" />
                </InputGroup>
                <ActionButtons onDelete={initialData ? () => { onDelete(initialData.id); onClose(); } : undefined} />
            </form>
        </ModalWrapper>
    );
};

// ... Loan Modal ...
interface LoanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (loan: Loan) => void;
    onDelete: (id: string) => void;
    initialData?: Loan | null;
}

export const LoanModal: React.FC<LoanModalProps> = ({ isOpen, onClose, onSave, onDelete, initialData }) => {
    const [type, setType] = useState<LoanType>('borrow');
    const [name, setName] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [paidAmount, setPaidAmount] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [interestRate, setInterestRate] = useState('');

    useEffect(() => {
        if (initialData) {
            setType(initialData.type);
            setName(initialData.name);
            setTotalAmount(initialData.totalAmount.toString());
            setPaidAmount(initialData.paidAmount.toString());
            setDueDate(initialData.dueDate);
            setInterestRate(initialData.interestRate.toString());
        } else {
            setType('borrow');
            setName('');
            setTotalAmount('');
            setPaidAmount('0');
            setDueDate('');
            setInterestRate('0');
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: initialData?.id || generateUUID(), type, name, totalAmount: parseFloat(totalAmount), paidAmount: parseFloat(paidAmount), dueDate, interestRate: parseFloat(interestRate) });
        onClose();
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Loan' : 'Add Loan / Debt'}>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="flex gap-2 p-1 dark:bg-slate-950 bg-white rounded-xl border dark:border-white/5 border-slate-200">
                    <button type="button" onClick={() => setType('borrow')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${type === 'borrow' ? 'bg-slate-800 text-orange-400 shadow-md border dark:border-white/5 border-transparent' : 'text-slate-500 hover:text-slate-300'}`}>Borrow (I Owe)</button>
                    <button type="button" onClick={() => setType('lent')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${type === 'lent' ? 'bg-slate-800 text-emerald-400 shadow-md border dark:border-white/5 border-transparent' : 'text-slate-500 hover:text-slate-300'}`}>Lent (Owed to Me)</button>
                </div>
                <InputGroup label={type === 'borrow' ? "Lender Name" : "Borrower Name"}>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full rounded-xl dark:bg-slate-950 bg-white border dark:border-white/10 border-slate-300 px-4 py-3 text-sm dark:text-white text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder={type === 'borrow' ? "e.g. Home Credit" : "e.g. John Doe"} />
                </InputGroup>
                <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Total Amount">
                        <input type="number" required step="0.01" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} className="w-full rounded-xl dark:bg-slate-950 bg-white border dark:border-white/10 border-slate-300 px-4 py-3 text-sm dark:text-white text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder="0.00" />
                    </InputGroup>
                    <InputGroup label={type === 'borrow' ? "Paid So Far" : "Received So Far"}>
                        <input type="number" required step="0.01" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} className="w-full rounded-xl dark:bg-slate-950 bg-white border dark:border-white/10 border-slate-300 px-4 py-3 text-sm dark:text-white text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder="0.00" />
                    </InputGroup>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <InputGroup label="Interest Rate (%)">
                        <input type="number" required step="0.1" value={interestRate} onChange={e => setInterestRate(e.target.value)} className="w-full rounded-xl dark:bg-slate-950 bg-white border dark:border-white/10 border-slate-300 px-4 py-3 text-sm dark:text-white text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder="0.0" />
                    </InputGroup>
                    <InputGroup label="Due Date">
                        <input type="date" required value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full rounded-xl dark:bg-slate-950 bg-white border dark:border-white/10 border-slate-300 px-4 py-3 text-sm dark:text-white text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none" />
                    </InputGroup>
                </div>
                <ActionButtons onDelete={initialData ? () => { onDelete(initialData.id); onClose(); } : undefined} />
            </form>
        </ModalWrapper>
    );
};

// ... Budget Modal ...
interface BudgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (budget: BudgetCategory) => void;
    onDelete: (id: string) => void;
    initialData?: BudgetCategory | null;
}

const COLOR_PALETTE = ['#3b82f6', '#10b981', '#a855f7', '#f43f5e', '#f59e0b', '#06b6d4', '#f97316', '#6366f1'];
export const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose, onSave, onDelete, initialData }) => {
    const [category, setCategory] = useState('');
    const [limit, setLimit] = useState('');
    const [spent, setSpent] = useState('');
    const [color, setColor] = useState(COLOR_PALETTE[0]);

    useEffect(() => {
        if (initialData) {
            setCategory(initialData.category);
            setLimit(initialData.limit.toString());
            setSpent(initialData.spent.toString());
            setColor(initialData.color);
        } else {
            setCategory('');
            setLimit('');
            setSpent('0');
            setColor(COLOR_PALETTE[0]);
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: initialData?.id || generateUUID(), category, limit: parseFloat(limit), spent: parseFloat(spent), color });
        onClose();
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Budget' : 'Add Budget Category'}>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <InputGroup label="Category Name">
                    <input type="text" required value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-xl dark:bg-slate-950 bg-white border dark:border-white/10 border-slate-300 px-4 py-3 text-sm dark:text-white text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder="e.g. Groceries" />
                </InputGroup>
                <div className="grid grid-cols-2 gap-4">
                     <InputGroup label="Monthly Limit">
                        <input type="number" required step="0.01" value={limit} onChange={e => setLimit(e.target.value)} className="w-full rounded-xl dark:bg-slate-950 bg-white border dark:border-white/10 border-slate-300 px-4 py-3 text-sm dark:text-white text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder="0.00" />
                    </InputGroup>
                    <InputGroup label="Spent So Far">
                        <input type="number" required step="0.01" value={spent} onChange={e => setSpent(e.target.value)} className="w-full rounded-xl dark:bg-slate-950 bg-white border dark:border-white/10 border-slate-300 px-4 py-3 text-sm dark:text-white text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder="0.00" />
                    </InputGroup>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Color Code</label>
                    <div className="flex flex-wrap gap-3">
                        {COLOR_PALETTE.map((c) => (
                            <button key={c} type="button" onClick={() => setColor(c)} className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-white scale-110' : 'hover:scale-105 opacity-70 hover:opacity-100'}`} style={{ backgroundColor: c }} />
                        ))}
                    </div>
                </div>
                <ActionButtons onDelete={initialData ? () => { onDelete(initialData.id); onClose(); } : undefined} />
            </form>
        </ModalWrapper>
    );
};

// ... Investment Modal ...
interface InvestmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (investment: Investment) => void;
    onDelete: (id: string) => void;
    initialData?: Investment | null;
}

export const InvestmentModal: React.FC<InvestmentModalProps> = ({ isOpen, onClose, onSave, onDelete, initialData }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<InvestmentType>('stock');
    const [investedAmount, setInvestedAmount] = useState('');
    const [currentValue, setCurrentValue] = useState('');
    const [symbol, setSymbol] = useState('');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setType(initialData.type);
            setInvestedAmount(initialData.investedAmount.toString());
            setCurrentValue(initialData.currentValue.toString());
            setSymbol(initialData.symbol || '');
        } else {
            setName('');
            setType('stock');
            setInvestedAmount('');
            setCurrentValue('');
            setSymbol('');
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const colors: Record<InvestmentType, string> = { 'stock': 'bg-gradient-to-r from-blue-600 to-indigo-600', 'crypto': 'bg-gradient-to-r from-orange-500 to-yellow-500', 'bond': 'bg-gradient-to-r from-emerald-600 to-teal-500', 'real_estate': 'bg-gradient-to-r from-amber-700 to-amber-600', 'fund': 'bg-gradient-to-r from-cyan-600 to-blue-500', 'other': 'bg-gradient-to-r from-slate-600 to-slate-500' };
        onSave({ id: initialData?.id || generateUUID(), name, type, investedAmount: parseFloat(investedAmount), currentValue: parseFloat(currentValue), symbol, color: colors[type] });
        onClose();
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Investment' : 'Add Investment'}>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                 <InputGroup label="Asset Type">
                    <div className="relative">
                        <select value={type} onChange={e => setType(e.target.value as InvestmentType)} className="w-full rounded-xl dark:bg-slate-950 bg-white border dark:border-white/10 border-slate-300 px-4 py-3 text-sm dark:text-white text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none cursor-pointer">
                            <option value="stock">Stock</option>
                            <option value="crypto">Crypto</option>
                            <option value="bond">Bonds / Retail Treasury Bonds</option>
                            <option value="fund">Mutual Fund / UITF / PERA</option>
                            <option value="real_estate">Real Estate</option>
                            <option value="other">Other</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>
                </InputGroup>
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                        <InputGroup label="Asset Name">
                            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full rounded-xl dark:bg-slate-950 bg-white border dark:border-white/10 border-slate-300 px-4 py-3 text-sm dark:text-white text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder="e.g. Apple Inc. or Bitcoin" />
                        </InputGroup>
                    </div>
                    <div className="col-span-1">
                        <InputGroup label="Symbol">
                             <input type="text" value={symbol} onChange={e => setSymbol(e.target.value)} className="w-full rounded-xl dark:bg-slate-950 bg-white border dark:border-white/10 border-slate-300 px-4 py-3 text-sm dark:text-white text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none uppercase" placeholder="AAPL" />
                        </InputGroup>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <InputGroup label="Capital (Invested)">
                        <input type="number" required step="0.01" value={investedAmount} onChange={e => setInvestedAmount(e.target.value)} className="w-full rounded-xl dark:bg-slate-950 bg-white border dark:border-white/10 border-slate-300 px-4 py-3 text-sm dark:text-white text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder="0.00" />
                    </InputGroup>
                    <InputGroup label="Current Market Value">
                        <input type="number" required step="0.01" value={currentValue} onChange={e => setCurrentValue(e.target.value)} className="w-full rounded-xl dark:bg-slate-950 bg-white border dark:border-white/10 border-slate-300 px-4 py-3 text-sm dark:text-white text-slate-900 focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder="0.00" />
                    </InputGroup>
                </div>
                <ActionButtons onDelete={initialData ? () => { onDelete(initialData.id); onClose(); } : undefined} />
            </form>
        </ModalWrapper>
    );
};
