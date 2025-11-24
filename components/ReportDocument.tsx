import React, { useEffect } from 'react';
import { Transaction, Wallet, UserProfile } from '../types';
import { PrintOptions } from './DataModals';
import { X, ArrowRight } from 'lucide-react';

interface ReportDocumentProps {
    data: {
        transactions: Transaction[];
        wallets: Wallet[];
        userProfile: UserProfile;
    };
    options: PrintOptions;
    onClose: () => void;
}

export const ReportDocument: React.FC<ReportDocumentProps> = ({ data, options, onClose }) => {
    
    // Auto print when mounted
    useEffect(() => {
        const timer = setTimeout(() => {
            window.print();
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    // Filter transactions
    const filteredTransactions = data.transactions.filter(t => {
        const date = t.date.split('T')[0];
        return date >= options.startDate && date <= options.endDate;
    });

    const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const netChange = totalIncome - totalExpense;
    
    // Group Expenses by Category
    const expensesByCategory = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans p-8 print:p-0 fixed inset-0 z-[100] overflow-y-auto">
            {/* Action Bar (Hidden when printing) */}
            <div className="fixed top-0 left-0 right-0 p-4 bg-slate-900 text-white flex justify-between items-center no-print shadow-xl z-50">
                <div className="flex items-center gap-2">
                    <span className="font-bold">Print Preview</span>
                    <span className="text-slate-400 text-sm">| {options.startDate} to {options.endDate}</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold transition-colors">Print Again</button>
                    <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors">
                        <X className="w-4 h-4" /> Close
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto pt-16 print:pt-0">
                {/* Header */}
                <div className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">Financial Report</h1>
                        <p className="text-slate-500 mt-1">Generated via PesoWise</p>
                    </div>
                    <div className="text-right">
                        <h3 className="font-bold text-lg">{data.userProfile.name}</h3>
                        <p className="text-slate-500 text-sm">{data.userProfile.email}</p>
                        <p className="text-slate-900 font-mono mt-2 text-sm bg-slate-100 px-2 py-1 rounded inline-block">
                            {options.startDate} <span className="text-slate-400 mx-1">to</span> {options.endDate}
                        </p>
                    </div>
                </div>

                {/* Summary Section */}
                {options.includeSummary && (
                    <div className="mb-10">
                        <h2 className="text-xl font-bold border-l-4 border-blue-600 pl-3 mb-4 uppercase tracking-wider text-slate-800">Financial Summary</h2>
                        <div className="grid grid-cols-3 gap-6">
                            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Income</p>
                                <p className="text-2xl font-bold text-emerald-600">+{totalIncome.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}</p>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Expenses</p>
                                <p className="text-2xl font-bold text-red-600">-{totalExpense.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}</p>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Net Change</p>
                                <p className={`text-2xl font-bold ${netChange >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                    {netChange >= 0 ? '+' : ''}{netChange.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Wallets Section */}
                {options.includeWallets && (
                    <div className="mb-10 print:break-inside-avoid">
                        <h2 className="text-xl font-bold border-l-4 border-slate-800 pl-3 mb-4 uppercase tracking-wider text-slate-800">Current Wallet Balances</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {data.wallets.map(w => (
                                <div key={w.id} className="flex justify-between items-center p-3 border-b border-dashed border-slate-300">
                                    <span className="font-semibold text-slate-700">{w.name} ({w.type})</span>
                                    <span className="font-mono font-bold">₱{w.balance.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Charts / Categorization Summary */}
                {options.includeCharts && (
                    <div className="mb-10 print:break-inside-avoid">
                        <h2 className="text-xl font-bold border-l-4 border-purple-600 pl-3 mb-4 uppercase tracking-wider text-slate-800">Expense Breakdown</h2>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                             {Object.entries(expensesByCategory)
                                .sort(([,a], [,b]) => b - a)
                                .map(([cat, amount]) => (
                                    <div key={cat} className="flex items-center gap-4 mb-2">
                                        <div className="flex-1">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-semibold">{cat}</span>
                                                <span>₱{amount.toLocaleString()}</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-slate-600" 
                                                    style={{ width: `${(amount / totalExpense) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="w-12 text-right text-xs text-slate-500 font-mono">
                                            {((amount / totalExpense) * 100).toFixed(1)}%
                                        </div>
                                    </div>
                             ))}
                        </div>
                    </div>
                )}

                {/* Transaction History */}
                {options.includeTransactions && (
                    <div className="mb-10">
                        <h2 className="text-xl font-bold border-l-4 border-slate-800 pl-3 mb-4 uppercase tracking-wider text-slate-800">Transaction History</h2>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-xs tracking-wider">
                                <tr>
                                    <th className="p-3 rounded-tl-lg">Date</th>
                                    <th className="p-3">Description</th>
                                    <th className="p-3">Category</th>
                                    <th className="p-3">Type</th>
                                    <th className="p-3 text-right rounded-tr-lg">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredTransactions.map((t, idx) => (
                                    <tr key={t.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                        <td className="p-3 font-mono text-slate-500">{t.date.split('T')[0]}</td>
                                        <td className="p-3 font-semibold text-slate-800">{t.description}</td>
                                        <td className="p-3 text-slate-600">{t.category}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${t.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                {t.type}
                                            </span>
                                        </td>
                                        <td className={`p-3 text-right font-mono font-bold ${t.type === 'income' ? 'text-emerald-700' : 'text-red-700'}`}>
                                            {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredTransactions.length === 0 && (
                            <p className="text-center py-8 text-slate-400 italic">No transactions found in this period.</p>
                        )}
                    </div>
                )}
                
                <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between text-xs text-slate-400 uppercase tracking-widest">
                    <span>PesoWise Financial Report</span>
                    <span>Printed on {new Date().toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
};