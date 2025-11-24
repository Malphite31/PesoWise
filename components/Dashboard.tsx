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
import { TrendingUp, CheckCircle2, Target, Plus, Edit2 } from 'lucide-react';

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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white text-slate-900">
                My Wallets
            </h2>
            {wallets.length > 0 ? (
                <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar snap-x">
                    {wallets.map(wallet => (
                        <div key={wallet.id} className="min-w-[280px] snap-center">
                            <WalletCard wallet={wallet} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="h-40 glass-panel rounded-2xl flex items-center justify-center text-slate-500">
                    No wallets yet. Add one to get started!
                </div>
            )}
        </div>
        
        <div className="space-y-4">
             <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-blue-500/20 transition-all"></div>
                <div className="flex items-center gap-3 mb-2 relative z-10">
                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold text-slate-400">Total Balance</span>
                </div>
                <h3 className="text-3xl font-bold relative z-10 dark:text-white text-slate-900">
                    {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(totalBalance)}
                </h3>
             </div>
             
             <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-400">Upcoming Bills</span>
                    <span className="text-xs font-bold bg-red-500/20 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full">
                        {bills.filter(b => !b.isPaid).length} Due
                    </span>
                </div>
                <div className="space-y-3">
                    {bills.filter(b => !b.isPaid).slice(0, 2).map(bill => (
                        <div key={bill.id} className="flex justify-between items-center text-sm p-2 rounded-lg border dark:bg-white/5 dark:border-white/5 bg-slate-50 border-slate-100">
                            <span className="dark:text-slate-300 text-slate-700">{bill.name}</span>
                            <span className="font-semibold dark:text-white text-slate-900">₱{bill.amount.toLocaleString()}</span>
                        </div>
                    ))}
                    {bills.filter(b => !b.isPaid).length === 0 && <span className="text-sm text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> All paid!</span>}
                </div>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 space-y-8">
             {/* Budgets Progress */}
             <div className="glass-panel p-6 rounded-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold dark:text-white text-slate-900">Budget Status</h3>
                    {onAddBudget && (
                        <button 
                            onClick={onAddBudget}
                            className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <div className="space-y-6">
                    {budgets.map((budget) => (
                        <div 
                            key={budget.id} 
                            onClick={() => onEditBudget && onEditBudget(budget)}
                            className="group cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 p-2 -mx-2 rounded-lg transition-colors"
                        >
                            <div className="flex justify-between text-sm mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium dark:text-slate-300 text-slate-700 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{budget.category}</span>
                                    <Edit2 className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <span className="text-slate-500">₱{budget.spent.toLocaleString()} <span className="text-slate-400">/</span> ₱{budget.limit.toLocaleString()}</span>
                            </div>
                            <div className="h-2 w-full dark:bg-slate-800 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${
                                        (budget.spent / budget.limit) > 0.9 ? 'bg-red-500' : 'bg-blue-500'
                                    }`}
                                    style={{ 
                                        width: `${Math.min((budget.spent / budget.limit) * 100, 100)}%`,
                                        backgroundColor: budget.color
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))}
                    {budgets.length === 0 && <div className="text-center text-slate-500 text-sm">No budgets set.</div>}
                </div>
             </div>

            <TransactionList transactions={transactions.slice(0, 5)} />
        </div>

        {/* Sidebar / Secondary Stats */}
        <div className="space-y-8">
            {/* Expense Trends Chart */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col">
                <h3 className="font-bold dark:text-white text-slate-900 mb-6">Expense Trends</h3>
                <div className="h-[300px] w-full -ml-2">
                    {chartData.length > 0 && displayedCategories.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#64748b" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis 
                                    stroke="#64748b" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tickFormatter={(value) => `₱${value}`}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                                        borderColor: 'rgba(255,255,255,0.1)', 
                                        color: '#fff', 
                                        borderRadius: '12px',
                                        backdropFilter: 'blur(8px)'
                                    }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                                />
                                <Legend 
                                    wrapperStyle={{ paddingTop: '20px' }}
                                    iconType="circle"
                                />
                                {displayedCategories.map((cat, index) => (
                                    <Line 
                                        key={cat}
                                        type="monotone" 
                                        dataKey={cat} 
                                        stroke={getCategoryColor(cat, index)} 
                                        strokeWidth={3}
                                        dot={{ r: 4, strokeWidth: 2, fill: '#0f172a' }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-600 text-sm">
                            Not enough data to show trends
                        </div>
                    )}
                </div>
            </div>

            {/* Savings Goals Mini */}
            {goals.length > 0 && (
                <div className="glass-panel p-6 rounded-2xl">
                    <h3 className="font-bold dark:text-white text-slate-900 mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-purple-500" /> Savings Goals
                    </h3>
                    <div className="space-y-4">
                        {goals.slice(0, 3).map(goal => (
                            <div key={goal.id}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="dark:text-slate-300 text-slate-700">{goal.name}</span>
                                    <span className="text-slate-400">{Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</span>
                                </div>
                                <div className="h-1.5 w-full dark:bg-slate-800 bg-slate-200 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-purple-500 rounded-full"
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