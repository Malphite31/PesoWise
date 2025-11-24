import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { Wallet, Transaction, BudgetCategory, Bill, Loan, SavingsGoal } from '../types';
import { WalletCard } from './WalletCard';
import { TransactionList } from './TransactionList';
import { TrendingUp, CheckCircle2, Target, Plus, Edit2, Wallet as WalletIcon } from 'lucide-react';

interface DashboardProps {
  wallets: Wallet[];
  transactions: Transaction[];
  budgets: BudgetCategory[];
  bills: Bill[];
  loans: Loan[];
  goals: SavingsGoal[];
  onAddBudget?: () => void;
  onEditBudget?: (budget: BudgetCategory) => void;
}

const LINE_COLORS = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#ef4444', // Red
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#84cc16', // Lime
  '#d946ef', // Fuchsia
];

export const Dashboard: React.FC<DashboardProps> = ({ 
  wallets, 
  transactions, 
  budgets, 
  bills, 
  loans, 
  goals,
  onAddBudget,
  onEditBudget 
}) => {
  const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);
  
  // --- Data Processing for Line Chart ---
  const txCategories = transactions.filter(t => t.type === 'expense').map(t => t.category);
  const budgetCats = budgets.map(b => b.category);
  const allCategories = Array.from(new Set([...txCategories, ...budgetCats]));

  const expenseTotals = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const displayedCategories = allCategories
    .sort((a, b) => (expenseTotals[b] || 0) - (expenseTotals[a] || 0));

  const uniqueDates: string[] = Array.from<string>(new Set(transactions.map(t => t.date))).sort();
  
  const chartData = uniqueDates.map(date => {
    const dayTransactions = transactions.filter(t => t.date === date && t.type === 'expense');
    const displayDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const dataPoint: any = { name: displayDate };
    
    displayedCategories.forEach(cat => {
      const amount = dayTransactions
        .filter(t => t.category === cat)
        .reduce((sum, t) => sum + t.amount, 0);
      dataPoint[cat] = amount;
    });
    
    return dataPoint;
  });

  const getCategoryColor = (category: string, index: number) => {
    const budget = budgets.find(b => b.category === category);
    return budget ? budget.color : LINE_COLORS[index % LINE_COLORS.length];
  };

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN (Main Content) */}
        <div className="xl:col-span-2 space-y-8">
            
            {/* Wallets Section */}
            <div>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white text-slate-900">
                    My Wallets
                </h2>
                {wallets.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {wallets.map(wallet => (
                            <WalletCard key={wallet.id} wallet={wallet} />
                        ))}
                    </div>
                ) : (
                    <div className="h-32 glass-panel rounded-2xl flex flex-col items-center justify-center text-slate-500 gap-2 border-dashed">
                        <WalletIcon className="w-8 h-8 opacity-50" />
                        <p>No wallets yet. Add one to get started!</p>
                    </div>
                )}
            </div>

            {/* Expense Trends Chart */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold dark:text-white text-slate-900">Expense Trends</h3>
                    <select className="bg-transparent text-xs font-medium text-slate-500 border-none outline-none cursor-pointer hover:text-blue-500 transition-colors">
                        <option>Last 30 Days</option>
                    </select>
                </div>
                <div className="h-[300px] w-full -ml-2">
                    {chartData.length > 0 && displayedCategories.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                             <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#94a3b8" 
                                    fontSize={11} 
                                    tickLine={false} 
                                    axisLine={false}
                                    dy={10}
                                    minTickGap={30}
                                />
                                <YAxis 
                                    stroke="#94a3b8" 
                                    fontSize={11} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tickFormatter={(value) => `₱${value}`}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                                        borderColor: 'rgba(255,255,255,0.05)', 
                                        color: '#fff', 
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
                                        backdropFilter: 'blur(8px)'
                                    }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}/>
                                {displayedCategories.map((cat, index) => (
                                    <Line 
                                        key={cat}
                                        type="monotone" 
                                        dataKey={cat} 
                                        stroke={getCategoryColor(cat, index)} 
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                            <TrendingUp className="w-8 h-8 opacity-20" />
                            <p className="text-sm">No expense data to visualize yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Transactions */}
            <TransactionList transactions={transactions.slice(0, 5)} />
        </div>

        {/* RIGHT COLUMN (Sidebar Stats) */}
        <div className="space-y-8">
            
            {/* Total Balance Card */}
             <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group bg-gradient-to-br from-blue-600 to-blue-700 border-none shadow-xl shadow-blue-900/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1 text-blue-100">
                        <span className="text-sm font-medium">Total Balance</span>
                    </div>
                    <h3 className="text-4xl font-bold text-white mb-6 tracking-tight">
                        {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(totalBalance)}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-xs font-medium text-blue-200 bg-blue-800/30 w-fit px-3 py-1.5 rounded-full border border-blue-500/30">
                        <TrendingUp className="w-3 h-3" />
                        <span>Net Worth Overview</span>
                    </div>
                </div>
             </div>

             {/* Upcoming Bills */}
             {bills.some(b => !b.isPaid) && (
                <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-red-500">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold dark:text-white text-slate-900">Upcoming Bills</h3>
                        <span className="text-xs font-bold bg-red-500/10 text-red-500 px-2.5 py-1 rounded-full">
                            {bills.filter(b => !b.isPaid).length} Due
                        </span>
                    </div>
                    <div className="space-y-3">
                        {bills.filter(b => !b.isPaid).slice(0, 3).map(bill => (
                            <div key={bill.id} className="flex justify-between items-center text-sm pb-3 border-b dark:border-white/5 border-slate-100 last:border-0 last:pb-0">
                                <div>
                                    <p className="font-medium dark:text-slate-200 text-slate-700">{bill.name}</p>
                                    <p className="text-xs text-slate-500">Due {new Date(bill.dueDate).toLocaleDateString()}</p>
                                </div>
                                <span className="font-bold dark:text-white text-slate-900">₱{bill.amount.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
             )}

             {/* Budgets List */}
             <div className="glass-panel p-6 rounded-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold dark:text-white text-slate-900">Budgets</h3>
                    {onAddBudget && (
                        <button 
                            onClick={onAddBudget}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <div className="space-y-5">
                    {budgets.map((budget) => (
                        <div 
                            key={budget.id} 
                            onClick={() => onEditBudget && onEditBudget(budget)}
                            className="cursor-pointer group"
                        >
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="font-semibold dark:text-slate-300 text-slate-700 group-hover:text-blue-500 transition-colors">{budget.category}</span>
                                <span className="text-slate-500">
                                    {Math.round((budget.spent / budget.limit) * 100)}%
                                </span>
                            </div>
                            <div className="h-2 w-full dark:bg-slate-800 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${
                                        (budget.spent / budget.limit) > 0.9 ? 'bg-red-500' : 'bg-blue-500'
                                    }`}
                                    style={{ 
                                        width: `${Math.min((budget.spent / budget.limit) * 100, 100)}%`,
                                        backgroundColor: budget.color
                                    }}
                                ></div>
                            </div>
                             <div className="flex justify-between mt-1">
                                <span className="text-[10px] text-slate-500">₱{budget.spent.toLocaleString()}</span>
                                <span className="text-[10px] text-slate-500">₱{budget.limit.toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                    {budgets.length === 0 && (
                        <div className="text-center py-6 text-slate-500 text-sm border border-dashed dark:border-white/10 border-slate-200 rounded-xl">
                            <p>No budgets set.</p>
                        </div>
                    )}
                </div>
             </div>

            {/* Savings Goals */}
            {goals.length > 0 && (
                <div className="glass-panel p-6 rounded-2xl">
                    <h3 className="font-bold dark:text-white text-slate-900 mb-6 flex items-center gap-2">
                         Savings Goals
                    </h3>
                    <div className="space-y-6">
                        {goals.slice(0, 3).map(goal => (
                            <div key={goal.id} className="relative">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`w-8 h-8 rounded-lg ${goal.color} flex items-center justify-center text-white shadow-lg`}>
                                        <Target className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold dark:text-white text-slate-800">{goal.name}</p>
                                        <p className="text-xs text-slate-500">Target: ₱{goal.targetAmount.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="h-1.5 w-full dark:bg-slate-800 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${goal.color}`}
                                        style={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};