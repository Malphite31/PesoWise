
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Wallet as WalletIcon, 
  Receipt, 
  CreditCard, 
  Plus, 
  Bell, 
  UserCircle,
  Target,
  Edit2,
  Trash2,
  CheckCircle,
  Calendar as CalendarIcon,
  PieChart,
  Banknote,
  ArrowRight,
  Grid,
  X,
  AlertCircle,
  Check,
  Info,
  TrendingUp,
  LogOut,
  Mail,
  User,
  Settings,
  Moon,
  Sun,
  Download,
  Upload,
  Printer,
  Lock,
  FileJson,
  List,
  Loader2
} from 'lucide-react';
import { supabase, isSupabaseConfigured, clearSupabaseConfig } from './lib/supabaseClient';
import { api } from './services/api';
import { Dashboard } from './components/Dashboard';
import { Transaction, Wallet, WalletType, BudgetCategory, Bill, Loan, View, SavingsGoal, AppNotification, Investment, UserProfile } from './types';
import { AddTransactionModal } from './components/AddTransactionModal';
import { WalletCard } from './components/WalletCard';
import { WalletModal, BillModal, GoalModal, BudgetModal, LoanModal, CelebrationModal, QuickUpdateModal, InvestmentModal, PrintOptionsModal, PrintOptions } from './components/DataModals';
import { LoginView, SignupView } from './components/AuthForms';
import { ReportDocument } from './components/ReportDocument';
import { TransactionCalendar } from './components/TransactionCalendar';
import { SupabaseConnect } from './components/SupabaseConnect';

const INITIAL_PROFILE: UserProfile = {
    name: "User",
    email: "",
    avatarUrl: null, // Default
    currency: "PHP"
};

const PasswordStrengthMeter: React.FC<{ password: string }> = ({ password }) => {
    const getStrength = (pass: string) => {
        let score = 0;
        if (!pass) return 0;
        if (pass.length > 5) score += 1;
        if (pass.length > 9) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[0-9!@#$%^&*]/.test(pass)) score += 1;
        return score;
    };
    
    const strength = getStrength(password);
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

const App: React.FC = () => {
  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(true);

  const [showSplash, setShowSplash] = useState(true);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Notification States
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Modal States
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [walletModal, setWalletModal] = useState<{ open: boolean; data: Wallet | null }>({ open: false, data: null });
  const [billModal, setBillModal] = useState<{ open: boolean; data: Bill | null }>({ open: false, data: null });
  const [goalModal, setGoalModal] = useState<{ open: boolean; data: SavingsGoal | null }>({ open: false, data: null });
  const [budgetModal, setBudgetModal] = useState<{ open: boolean; data: BudgetCategory | null }>({ open: false, data: null });
  const [loanModal, setLoanModal] = useState<{ open: boolean; data: Loan | null }>({ open: false, data: null });
  const [investmentModal, setInvestmentModal] = useState<{ open: boolean; data: Investment | null }>({ open: false, data: null });
  const [celebrationModal, setCelebrationModal] = useState<{ open: boolean; data: SavingsGoal | null }>({ open: false, data: null });
  const [quickUpdateModal, setQuickUpdateModal] = useState<{ open: boolean; type: 'budget' | 'loan' | 'goal' | 'bill' | null; data: any }>({ open: false, type: null, data: null });

  // Print States
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printOptions, setPrintOptions] = useState<PrintOptions | null>(null);

  // Transaction View States
  const [txViewMode, setTxViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedTxDate, setSelectedTxDate] = useState<string | null>(null);

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // App State
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<BudgetCategory[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);

  // --- THEME ---
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // --- AUTH & INITIAL DATA FETCHING ---
  useEffect(() => {
    if (!isSupabaseConfigured()) {
        setIsConfigured(false);
        return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            setIsAuthenticated(true);
            setUserId(session.user.id);
            fetchUserData(session.user.id);
        } else {
            setIsAuthenticated(false);
            setUserId(null);
        }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
            setIsAuthenticated(true);
            setUserId(session.user.id);
            fetchUserData(session.user.id);
        } else {
            setIsAuthenticated(false);
            setUserId(null);
            setWallets([]);
            setTransactions([]);
        }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (uid: string) => {
    setIsLoadingData(true);
    try {
        const [prof, w, t, b, bl, l, g, inv] = await Promise.all([
            api.getProfile(uid),
            api.getWallets(),
            api.getTransactions(),
            api.getBudgets(),
            api.getBills(),
            api.getLoans(),
            api.getGoals(),
            api.getInvestments()
        ]);

        if (prof) setUserProfile(prof);
        if (w) setWallets(w);
        if (t) setTransactions(t);
        if (b) setBudgets(b);
        if (bl) setBills(bl);
        if (l) setLoans(l);
        if (g) setGoals(g);
        if (inv) setInvestments(inv);

    } catch (error) {
        console.error("Error loading data", error);
        addNotification("Sync Error", "Could not load latest data. Please check connection.", "alert");
    } finally {
        setIsLoadingData(false);
    }
  };

  // --- SPLASH SCREEN ---
  useEffect(() => {
    const timer = setTimeout(() => {
        setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // --- NOTIFICATION LOGIC ---
  useEffect(() => {
    const newNotifications: AppNotification[] = [];
    const today = new Date();

    bills.forEach(bill => {
      if (!bill.isPaid) {
        const dueDate = new Date(bill.dueDate);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 3 && diffDays >= 0) {
            newNotifications.push({
                id: `bill-${bill.id}`,
                title: 'Bill Due Soon',
                message: `${bill.name} is due on ${dueDate.toLocaleDateString()}. Amount: ₱${bill.amount}`,
                date: new Date().toISOString(),
                isRead: false,
                type: 'warning'
            });
        }
      }
    });

    setNotifications(prev => {
        const combined = [...prev, ...newNotifications.filter(n => !prev.some(p => p.id === n.id))];
        return combined;
    });

  }, [bills]);

  const addNotification = (title: string, message: string, type: 'info' | 'warning' | 'success' | 'alert') => {
      const newNotif: AppNotification = {
          id: Math.random().toString(36).substr(2, 9),
          title,
          message,
          date: new Date().toISOString(),
          isRead: false,
          type
      };
      setNotifications(prev => [newNotif, ...prev]);
  };

  // --- EXPORT / IMPORT / PRINT ---
  const handleExportData = () => {
    const data = {
        wallets,
        transactions,
        budgets,
        bills,
        loans,
        goals,
        investments,
        userProfile,
        timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PesoWise_Backup_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const json = JSON.parse(e.target?.result as string);
            alert("Importing local backup for viewing only. This data is not synced to the cloud in this version.");
            
            if (json.wallets) setWallets(json.wallets);
            if (json.transactions) setTransactions(json.transactions);
            if (json.budgets) setBudgets(json.budgets);
            if (json.bills) setBills(json.bills);
            if (json.loans) setLoans(json.loans);
            if (json.goals) setGoals(json.goals);
            if (json.investments) setInvestments(json.investments);
            if (json.userProfile) setUserProfile(json.userProfile);
            
        } catch (error) {
            console.error("Import error", error);
            alert("Failed to import data. Invalid file format.");
        }
    };
    reader.readAsText(file);
  };

  const handlePrintRequest = () => {
    setIsPrintModalOpen(true);
  };

  const handleGenerateReport = (options: PrintOptions) => {
      setPrintOptions(options);
      setIsPrinting(true);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
        alert("New passwords do not match!");
        return;
    }
    
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
        alert("Error updating password: " + error.message);
    } else {
        alert("Password updated successfully!");
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setAuthView('login');
    setActiveView('dashboard');
  };

  // --- CRUD Operations ---
  const handleAddTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    if (!userId) return;

    try {
        // Optimistic UI update for transaction
        const tempId = Math.random().toString();
        const optimisticTx: Transaction = { ...newTx, id: tempId };
        
        const savedTx = await api.addTransaction(optimisticTx, userId);
        setTransactions(prev => [savedTx, ...prev]);

        const wallet = wallets.find(w => w.id === newTx.walletId);
        if (wallet) {
            const newBalance = newTx.type === 'income' ? wallet.balance + newTx.amount : wallet.balance - newTx.amount;
            const updatedWallet = { ...wallet, balance: newBalance };
            
            await api.upsertWallet(updatedWallet, userId);
            setWallets(prev => prev.map(w => w.id === wallet.id ? updatedWallet : w));
        }

        if (newTx.type === 'expense') {
            const targetBudget = budgets.find(b => b.category.toLowerCase() === newTx.category.toLowerCase());
            
            if (targetBudget) {
                const oldSpent = targetBudget.spent;
                const newSpent = oldSpent + newTx.amount;
                const limit = targetBudget.limit;
                
                const oldPercentage = oldSpent / limit;
                const newPercentage = newSpent / limit;

                if (newPercentage >= 1.0 && oldPercentage < 1.0) {
                    addNotification('Budget Alert 🚨', `You have exceeded your ${targetBudget.category} budget limit!`, 'alert');
                } else if (newPercentage >= 0.8 && oldPercentage < 0.8) {
                    addNotification('Budget Warning ⚠️', `You have used 80% of your ${targetBudget.category} budget.`, 'warning');
                }

                const updatedBudget = { ...targetBudget, spent: newSpent };
                await api.upsertBudget(updatedBudget, userId);
                setBudgets(prev => prev.map(b => b.id === targetBudget.id ? updatedBudget : b));
            }
        }
    } catch (e) {
        console.error("Failed to add transaction", e);
        addNotification("Error", "Failed to save transaction", "alert");
    }
  };
  
  const saveWallet = async (wallet: Wallet) => {
      if (!userId) return;
      try {
          const saved = await api.upsertWallet(wallet, userId);
          if (wallets.some(w => w.id === wallet.id)) setWallets(wallets.map(w => w.id === wallet.id ? saved : w));
          else setWallets([...wallets, saved]);
      } catch(e) { console.error(e); }
  };

  const deleteWallet = async (id: string) => {
      try {
        await api.deleteWallet(id);
        setWallets(wallets.filter(w => w.id !== id));
      } catch (e) { console.error(e); }
  };
  
  const saveBill = async (bill: Bill) => {
      if (!userId) return;
      try {
          const saved = await api.upsertBill(bill, userId);
          if (bills.some(b => b.id === bill.id)) setBills(bills.map(b => b.id === bill.id ? saved : b));
          else setBills([...bills, saved]);
      } catch (e) { console.error(e); }
  };
  const deleteBill = async (id: string) => {
      try {
          await api.deleteBill(id);
          setBills(bills.filter(b => b.id !== id));
      } catch(e) { console.error(e); }
  };
  
  const initiateBillPayment = (bill: Bill) => {
      if (bill.isPaid) return; 
      setQuickUpdateModal({ open: true, type: 'bill', data: bill });
  };
  
  const saveGoal = async (goal: SavingsGoal) => {
      if (!userId) return;
      try {
          const saved = await api.upsertGoal(goal, userId);
          if (goals.some(g => g.id === goal.id)) setGoals(goals.map(g => g.id === goal.id ? saved : g));
          else setGoals([...goals, saved]);
          if (goal.currentAmount >= goal.targetAmount) setCelebrationModal({ open: true, data: saved });
      } catch(e) { console.error(e); }
  };
  const deleteGoal = async (id: string) => {
      try {
        await api.deleteGoal(id);
        setGoals(goals.filter(g => g.id !== id));
      } catch(e) { console.error(e); }
  };
  
  const saveBudget = async (budget: BudgetCategory) => {
      if (!userId) return;
      try {
        const saved = await api.upsertBudget(budget, userId);
        if (budgets.some(b => b.id === budget.id)) setBudgets(budgets.map(b => b.id === budget.id ? saved : b));
        else setBudgets([...budgets, saved]);
      } catch(e) { console.error(e); }
  };
  const deleteBudget = async (id: string) => {
      try {
          await api.deleteBudget(id);
          setBudgets(budgets.filter(b => b.id !== id));
      } catch(e) { console.error(e); }
  };
  
  const saveLoan = async (loan: Loan) => {
      if (!userId) return;
      try {
        const saved = await api.upsertLoan(loan, userId);
        if (loans.some(l => l.id === loan.id)) setLoans(loans.map(l => l.id === loan.id ? saved : l));
        else setLoans([...loans, saved]);
      } catch(e) { console.error(e); }
  };
  const deleteLoan = async (id: string) => {
      try {
          await api.deleteLoan(id);
          setLoans(loans.filter(l => l.id !== id));
      } catch(e) { console.error(e); }
  };
  
  const saveInvestment = async (investment: Investment) => {
      if (!userId) return;
      try {
        const saved = await api.upsertInvestment(investment, userId);
        if (investments.some(i => i.id === investment.id)) setInvestments(investments.map(i => i.id === investment.id ? saved : i));
        else setInvestments([...investments, saved]);
      } catch(e) { console.error(e); }
  };
  const deleteInvestment = async (id: string) => {
      try {
          await api.deleteInvestment(id);
          setInvestments(investments.filter(i => i.id !== id));
      } catch(e) { console.error(e); }
  };

  const handleQuickUpdateSave = async (amount: number, walletId: string) => {
    if (!userId) return;
    const { type, data } = quickUpdateModal;
    const wallet = wallets.find(w => w.id === walletId);
    if (!wallet || !type || !data) return;

    const newTx: Transaction = {
        id: Math.random().toString(), 
        date: new Date().toISOString(),
        amount: amount,
        walletId: walletId,
        type: 'expense',
        description: '',
        category: 'General'
    };

    try {
        if (type === 'budget') {
            newTx.type = 'expense';
            newTx.category = data.category;
            newTx.description = `Spending: ${data.category}`;
            const updated = { ...data, spent: data.spent + amount };
            await saveBudget(updated);

        } else if (type === 'loan') {
            const isBorrow = data.type === 'borrow';
            if (isBorrow) {
                newTx.type = 'expense';
                newTx.category = 'Debt Repayment';
                newTx.description = `Payment for ${data.name}`;
            } else {
                newTx.type = 'income';
                newTx.category = 'Debt Collection';
                newTx.description = `Received from ${data.name}`;
            }
            const updated = { ...data, paidAmount: data.paidAmount + amount };
            await saveLoan(updated);

        } else if (type === 'goal') {
            newTx.type = 'expense';
            newTx.category = 'Savings';
            newTx.description = `Deposit to ${data.name}`;
            const updated = { ...data, currentAmount: data.currentAmount + amount };
            await saveGoal(updated);

        } else if (type === 'bill') {
            newTx.type = 'expense';
            newTx.category = data.category;
            newTx.description = `Paid Bill: ${data.name}`;
            const updated = { ...data, isPaid: true };
            await saveBill(updated);
        }

        const savedTx = await api.addTransaction(newTx, userId);
        setTransactions([savedTx, ...transactions]);

        const newBalance = newTx.type === 'income' ? wallet.balance + amount : wallet.balance - amount;
        const updatedWallet = { ...wallet, balance: newBalance };
        await api.upsertWallet(updatedWallet, userId);
        setWallets(wallets.map(w => w.id === walletId ? updatedWallet : w));

    } catch (e) {
        console.error("Quick Update Failed", e);
    }
  };

  const handleProfileUpdate = async (updatedProfile: Partial<UserProfile>) => {
    if (!userId) return;
    try {
        await api.updateProfile(userId, updatedProfile);
        setUserProfile(prev => ({ ...prev, ...updatedProfile }));
    } catch(e) { console.error(e); }
  };

  const getInitials = (name: string) => {
    return name
      ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
      : 'U';
  };

  const allNavItems = [
    { view: 'dashboard' as View, icon: LayoutDashboard, label: 'Home' },
    { view: 'transactions' as View, icon: Receipt, label: 'History' },
    { view: 'wallets' as View, icon: WalletIcon, label: 'Wallets' },
    { view: 'budget' as View, icon: PieChart, label: 'Budget' },
    { view: 'bills' as View, icon: CreditCard, label: 'Bills' },
    { view: 'loans' as View, icon: Banknote, label: 'Loans' },
    { view: 'goals' as View, icon: Target, label: 'Goals' },
    { view: 'investments' as View, icon: TrendingUp, label: 'Investments' },
  ];
  const mobilePrimaryNav = allNavItems.slice(0, 3);
  const mobileSecondaryNav = allNavItems.slice(3);

  const totalWalletBalance = wallets.reduce((acc, w) => acc + w.balance, 0);
  const totalInvestments = investments.reduce((acc, i) => acc + i.currentValue, 0);
  const totalOwedToMe = loans.filter(l => l.type === 'lent').reduce((acc, l) => acc + (l.totalAmount - l.paidAmount), 0);
  const totalAssets = totalWalletBalance + totalInvestments + totalOwedToMe;
  const totalLiabilities = loans.filter(l => l.type === 'borrow').reduce((acc, l) => acc + (l.totalAmount - l.paidAmount), 0);
  const netWorth = totalAssets - totalLiabilities;

  const getQuickUpdateModalProps = () => {
      const { type, data } = quickUpdateModal;
      if (type === 'budget') return { title: 'Update Budget Spending', item: { name: data.category, current: data.spent, target: data.limit } };
      else if (type === 'loan') return { title: data.type === 'borrow' ? 'Record Payment' : 'Record Received Payment', item: { name: data.name, current: data.paidAmount, target: data.totalAmount } };
      else if (type === 'goal') return { title: 'Add Savings to Goal', item: { name: data.name, current: data.currentAmount, target: data.targetAmount } };
      else if (type === 'bill') return { title: 'Pay Bill', item: { name: data.name, current: 0, target: data.amount } };
      return { title: '', item: null };
  };
  const quickUpdateProps = getQuickUpdateModalProps();

  const displayedTransactions = selectedTxDate 
    ? transactions.filter(t => t.date.startsWith(selectedTxDate))
    : transactions;

  // RENDER
  if (showSplash) {
      return (
          <div className="fixed inset-0 bg-slate-950 z-[100] flex flex-col items-center justify-center animate-out fade-out duration-700">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-6 animate-pulse">
                  <span className="text-white font-bold text-5xl font-sans">₱</span>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-2">PesoWise</h1>
              <p className="text-slate-400">Loading your finances...</p>
          </div>
      );
  }

  if (!isConfigured) {
      return <SupabaseConnect />;
  }

  if (!isAuthenticated) {
      if (authView === 'login') {
          return <LoginView onLoginSuccess={() => {}} onSwitchToSignup={() => setAuthView('signup')} />;
      } else {
          return <SignupView onSignupSuccess={() => setAuthView('login')} onSwitchToLogin={() => setAuthView('login')} />;
      }
  }

  if (isPrinting && printOptions) {
      return (
          <ReportDocument 
              data={{ transactions, wallets, userProfile }} 
              options={printOptions} 
              onClose={() => setIsPrinting(false)} 
          />
      );
  }

  if (isLoadingData) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <div className="text-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-slate-400">Syncing with cloud...</p>
            </div>
        </div>
      );
  }

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col w-64 h-full border-r no-print relative z-20 ${theme === 'dark' ? 'glass-panel border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex flex-col p-6 h-full">
          <div className="flex items-center gap-3 px-2 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold text-xl font-sans">₱</span>
            </div>
            <h1 className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>PesoWise</h1>
          </div>

          <nav className="flex-1 space-y-2">
            {allNavItems.map((item) => (
              <button
                key={item.view}
                onClick={() => setActiveView(item.view)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeView === item.view 
                  ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' 
                  : `${theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-4">
             <div className={`rounded-xl p-4 border relative overflow-hidden group ${theme === 'dark' ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-white/5' : 'bg-slate-50 border-slate-200 shadow-inner'}`}>
                <p className="text-xs font-medium text-slate-400 mb-1">Net Worth</p>
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(netWorth)}
                </h3>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-blue-500/5 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 blur-[120px] pointer-events-none"></div>

        <header className="h-20 flex items-center justify-between px-6 lg:px-8 z-10 shrink-0 relative no-print">
            <div className="flex items-center gap-4">
                <h2 className={`text-xl font-bold capitalize ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {activeView === 'profile' ? 'My Account' : activeView}
                </h2>
            </div>
            <div className="flex items-center gap-4">
                <button
                    onClick={handlePrintRequest}
                    className={`p-2.5 rounded-full transition-all ${theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
                    title="Generate PDF Report"
                >
                    <Printer className="w-5 h-5" />
                </button>

                <button
                    onClick={toggleTheme}
                    className={`p-2.5 rounded-full transition-all ${theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
                    title="Toggle Theme"
                >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <div className="relative">
                    <button 
                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                        className={`p-2.5 rounded-full transition-all relative ${theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
                    >
                        <Bell className="w-5 h-5" />
                        {notifications.filter(n=>!n.isRead).length > 0 && (
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full shadow-lg shadow-red-500/50 border border-slate-950"></span>
                        )}
                    </button>
                    {isNotificationOpen && (
                        <div className={`absolute right-0 mt-3 w-80 border rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in slide-in-from-top-2 fade-in duration-200 backdrop-blur-3xl ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
                             <div className={`p-4 border-b flex justify-between items-center ${theme === 'dark' ? 'border-white/5 bg-white/5' : 'border-slate-100 bg-slate-50'}`}>
                                <h3 className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Notifications</h3>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                {notifications.length > 0 ? (
                                    notifications.map(n => (
                                        <div 
                                            key={n.id} 
                                            className={`p-4 border-b transition-colors cursor-pointer flex gap-3 relative ${theme === 'dark' ? 'border-white/5 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'}`}
                                        >
                                            <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${n.type === 'alert' ? 'bg-red-500' : n.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                                            <div>
                                                <h4 className={`text-sm font-semibold mb-0.5 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{n.title}</h4>
                                                <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-slate-500 text-sm">No notifications yet.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <button 
                    onClick={() => setActiveView('profile')}
                    className="p-1 rounded-full transition-all flex items-center gap-2"
                >
                    <div className={`w-10 h-10 rounded-full border-2 overflow-hidden flex items-center justify-center ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                         <span className="font-bold text-sm">{getInitials(userProfile.name)}</span>
                    </div>
                </button>
                <button 
                    onClick={() => setIsAddTxOpen(true)}
                    className="hidden lg:flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-600/20 border border-blue-500/50 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    <span>New Transaction</span>
                </button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 pb-24 lg:p-8 lg:pb-8 scroll-smooth" onClick={() => setIsNotificationOpen(false)}>
            <div className="max-w-7xl mx-auto space-y-6">
                
                {activeView === 'dashboard' && (
                    <Dashboard 
                        wallets={wallets} 
                        transactions={transactions} 
                        budgets={budgets} 
                        bills={bills} 
                        loans={loans}
                        goals={goals}
                        onAddBudget={() => setBudgetModal({ open: true, data: null })}
                        onEditBudget={(b) => setBudgetModal({ open: true, data: b })}
                    />
                )}

                {activeView === 'transactions' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center bg-white/5 p-1 rounded-xl w-fit">
                          <button 
                            onClick={() => setTxViewMode('list')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${txViewMode === 'list' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                          >
                            <List className="w-4 h-4" /> List
                          </button>
                          <button 
                            onClick={() => setTxViewMode('calendar')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${txViewMode === 'calendar' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                          >
                            <CalendarIcon className="w-4 h-4" /> Calendar
                          </button>
                        </div>

                        {txViewMode === 'calendar' && (
                          <TransactionCalendar 
                            transactions={transactions} 
                            onSelectDate={setSelectedTxDate}
                            selectedDate={selectedTxDate}
                          />
                        )}

                        <div className="glass-panel rounded-2xl overflow-hidden">
                            <div className="p-6 border-b dark:border-white/5 border-slate-100 flex justify-between items-center">
                              <h3 className="font-bold dark:text-white text-slate-900">
                                {selectedTxDate 
                                  ? `Transactions on ${new Date(selectedTxDate).toLocaleDateString()}` 
                                  : 'All Transactions'
                                }
                              </h3>
                              {selectedTxDate && (
                                <button 
                                  onClick={() => setSelectedTxDate(null)}
                                  className="text-xs text-blue-500 font-medium hover:underline"
                                >
                                  Clear Filter
                                </button>
                              )}
                            </div>
                            {displayedTransactions.length > 0 ? (
                                displayedTransactions.map((t) => (
                                    <div key={t.id} className={`p-4 border-b flex items-center justify-between last:border-0 transition-colors ${theme === 'dark' ? 'border-white/5 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'}`}>
                                        <div className="flex flex-col">
                                            <span className={`font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{t.description}</span>
                                            <span className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString()} • {t.category}</span>
                                        </div>
                                        <span className={`font-bold ${t.type === 'income' ? 'text-emerald-500' : theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                                            {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-slate-500">
                                  No transactions found.
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {activeView === 'wallets' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...wallets]
                                .sort((a, b) => (a.type === WalletType.CASH ? -1 : b.type === WalletType.CASH ? 1 : 0))
                                .map(wallet => (
                                <WalletCard 
                                    key={wallet.id} 
                                    wallet={wallet} 
                                    onEdit={(w) => setWalletModal({ open: true, data: w })}
                                />
                            ))}
                             <button 
                                onClick={() => setWalletModal({ open: true, data: null })}
                                className={`h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all group no-print ${theme === 'dark' ? 'border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5' : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'}`}
                            >
                                <div className={`p-3 rounded-full transition-colors ${theme === 'dark' ? 'bg-white/5 group-hover:bg-blue-500/20' : 'bg-slate-100 group-hover:bg-blue-100'}`}>
                                    <Plus className="w-6 h-6 text-slate-400 group-hover:text-blue-400" />
                                </div>
                                <span className="font-medium text-slate-400 group-hover:text-blue-500">Add New Wallet</span>
                            </button>
                        </div>
                    </div>
                )}
                
                {activeView === 'budget' && (
                     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {budgets.map((budget) => (
                                <div key={budget.id} className="glass-panel p-6 rounded-2xl relative overflow-hidden group cursor-pointer hover:shadow-md transition-all" onClick={() => setBudgetModal({ open: true, data: budget })}>
                                     <div className="flex justify-between items-center mb-4">
                                        <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{budget.category}</h3>
                                        <div className="p-2 rounded-full bg-white/5">
                                            <PieChart className="w-5 h-5 text-slate-400" />
                                        </div>
                                     </div>
                                     <div className={`h-2 w-full rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}>
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
                                    <p className="text-slate-400 text-sm mt-3 flex justify-between">
                                        <span>Spent: ₱{budget.spent.toLocaleString()}</span>
                                        <span>Limit: ₱{budget.limit.toLocaleString()}</span>
                                    </p>
                                </div>
                            ))}
                            <button onClick={() => setBudgetModal({ open: true, data: null })} className={`h-full min-h-[180px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all group no-print ${theme === 'dark' ? 'border-white/10 hover:bg-blue-500/5' : 'border-slate-300 hover:bg-blue-50'}`}>
                                <Plus className="w-6 h-6 text-slate-400" /> <span className="text-slate-400">Add Budget</span>
                            </button>
                        </div>
                     </div>
                )}

                {activeView === 'bills' && (
                     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bills.map((bill) => (
                                <div key={bill.id} className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{bill.category}</p>
                                            <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{bill.name}</h3>
                                        </div>
                                        <button onClick={() => setBillModal({ open: true, data: bill })} className="p-2 rounded-full hover:bg-white/10 text-slate-400"><Edit2 className="w-4 h-4"/></button>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-sm text-slate-400">Due Date: {new Date(bill.dueDate).toLocaleDateString()}</p>
                                            <p className={`text-xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>₱{bill.amount.toLocaleString()}</p>
                                        </div>
                                        <button 
                                            onClick={() => initiateBillPayment(bill)}
                                            disabled={bill.isPaid}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${bill.isPaid ? 'bg-emerald-500/10 text-emerald-500 cursor-default' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                                        >
                                            {bill.isPaid ? 'Paid' : 'Pay Now'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => setBillModal({ open: true, data: null })} className={`h-full min-h-[160px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all group no-print ${theme === 'dark' ? 'border-white/10 hover:bg-blue-500/5' : 'border-slate-300 hover:bg-blue-50'}`}>
                                <Plus className="w-6 h-6 text-slate-400" /> <span className="text-slate-400">Add Bill</span>
                            </button>
                        </div>
                     </div>
                )}

                {activeView === 'loans' && (
                     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {loans.map((loan) => (
                                <div key={loan.id} className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${loan.type === 'borrow' ? 'bg-orange-500/10 text-orange-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                {loan.type === 'borrow' ? 'I Owe' : 'Owed to Me'}
                                            </span>
                                            <h3 className={`text-lg font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{loan.name}</h3>
                                        </div>
                                        <button onClick={() => setLoanModal({ open: true, data: loan })} className="p-2 rounded-full hover:bg-white/10 text-slate-400"><Edit2 className="w-4 h-4"/></button>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm text-slate-400">
                                            <span>Paid: ₱{loan.paidAmount.toLocaleString()}</span>
                                            <span>Total: ₱{loan.totalAmount.toLocaleString()}</span>
                                        </div>
                                        <div className={`h-2 w-full rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}>
                                            <div 
                                                className={`h-full rounded-full transition-all ${loan.type === 'borrow' ? 'bg-orange-500' : 'bg-emerald-500'}`}
                                                style={{ width: `${Math.min((loan.paidAmount / loan.totalAmount) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                     <button 
                                        onClick={() => setQuickUpdateModal({ open: true, type: 'loan', data: loan })}
                                        className={`w-full mt-4 py-2 rounded-lg text-sm font-medium transition-colors ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'}`}
                                    >
                                        Update Payment
                                    </button>
                                </div>
                            ))}
                            <button onClick={() => setLoanModal({ open: true, data: null })} className={`h-full min-h-[180px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all group no-print ${theme === 'dark' ? 'border-white/10 hover:bg-blue-500/5' : 'border-slate-300 hover:bg-blue-50'}`}>
                                <Plus className="w-6 h-6 text-slate-400" /> <span className="text-slate-400">Add Loan</span>
                            </button>
                        </div>
                     </div>
                )}

                {activeView === 'goals' && (
                     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {goals.map((goal) => (
                                <div key={goal.id} className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2.5 rounded-xl ${goal.color} text-white`}>
                                                <Target className="w-5 h-5" />
                                            </div>
                                            <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{goal.name}</h3>
                                        </div>
                                        <button onClick={() => setGoalModal({ open: true, data: goal })} className="p-2 rounded-full hover:bg-white/10 text-slate-400"><Edit2 className="w-4 h-4"/></button>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>₱{goal.currentAmount.toLocaleString()} <span className="text-sm text-slate-400 font-normal">/ ₱{goal.targetAmount.toLocaleString()}</span></h4>
                                        <div className={`h-2 w-full rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}>
                                            <div 
                                                className={`h-full rounded-full transition-all ${goal.color}`}
                                                style={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                        <button 
                                            onClick={() => setQuickUpdateModal({ open: true, type: 'goal', data: goal })}
                                            className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'}`}
                                        >
                                            Add Savings
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => setGoalModal({ open: true, data: null })} className={`h-full min-h-[200px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all group no-print ${theme === 'dark' ? 'border-white/10 hover:bg-blue-500/5' : 'border-slate-300 hover:bg-blue-50'}`}>
                                <Plus className="w-6 h-6 text-slate-400" /> <span className="text-slate-400">New Goal</span>
                            </button>
                        </div>
                     </div>
                )}
                
                {activeView === 'investments' && (
                     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {investments.map((inv) => (
                                <div key={inv.id} className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{inv.type}</p>
                                            <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{inv.name} <span className="text-sm text-slate-400 font-normal">{inv.symbol}</span></h3>
                                        </div>
                                        <button onClick={() => setInvestmentModal({ open: true, data: inv })} className="p-2 rounded-full hover:bg-white/10 text-slate-400"><Edit2 className="w-4 h-4"/></button>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-sm text-slate-400">Current Value</p>
                                                <h4 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>₱{inv.currentValue.toLocaleString()}</h4>
                                            </div>
                                            <div className={`text-sm font-bold ${inv.currentValue >= inv.investedAmount ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {inv.currentValue >= inv.investedAmount ? '+' : ''}{(((inv.currentValue - inv.investedAmount) / inv.investedAmount) * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                        <div className="w-full h-px bg-slate-200 dark:bg-white/10"></div>
                                        <p className="text-xs text-slate-500">Invested: ₱{inv.investedAmount.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => setInvestmentModal({ open: true, data: null })} className={`h-full min-h-[160px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all group no-print ${theme === 'dark' ? 'border-white/10 hover:bg-blue-500/5' : 'border-slate-300 hover:bg-blue-50'}`}>
                                <Plus className="w-6 h-6 text-slate-400" /> <span className="text-slate-400">Add Investment</span>
                            </button>
                        </div>
                     </div>
                )}

                {activeView === 'profile' && (
                    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                        <div className="glass-panel rounded-3xl overflow-hidden relative">
                            <div className="h-32 bg-gradient-to-r from-blue-600 to-cyan-500 relative">
                                <div className="absolute inset-0 bg-black/10"></div>
                            </div>
                            
                            <div className="px-8 pb-8">
                                <div className="relative flex justify-between items-end -mt-12 mb-6">
                                    <div className="relative group">
                                        <div className={`w-32 h-32 rounded-3xl border-4 overflow-hidden shadow-2xl flex items-center justify-center text-4xl font-bold ${theme === 'dark' ? 'bg-blue-600 border-slate-900 text-white' : 'bg-blue-500 border-white text-white'}`}>
                                            {getInitials(userProfile.name)}
                                        </div>
                                    </div>
                                    <div className="mb-4 hidden sm:block">
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                            Standard Plan
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                    <div className="lg:col-span-2 space-y-6">
                                        <div>
                                            <h2 className={`text-2xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{userProfile.name}</h2>
                                            <p className="text-slate-500">{userProfile.email}</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Display Name</label>
                                                <div className="relative">
                                                    <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                                    <input 
                                                        type="text" 
                                                        value={userProfile.name} 
                                                        onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                                                        onBlur={() => handleProfileUpdate({ name: userProfile.name })}
                                                        className={`w-full rounded-xl py-3 pl-12 pr-4 outline-none border focus:ring-2 focus:ring-blue-500/50 transition-all ${theme === 'dark' ? 'bg-slate-900/50 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                                    <input 
                                                        type="email" 
                                                        disabled
                                                        value={userProfile.email} 
                                                        className={`w-full rounded-xl py-3 pl-12 pr-4 outline-none border transition-all opacity-60 cursor-not-allowed ${theme === 'dark' ? 'bg-slate-900/50 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                                        <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-slate-500">Account Summary</h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium">Currency</span>
                                                <span className="text-sm text-slate-500">PHP (₱)</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium">Data Backup</span>
                                                <span className="text-xs text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Cloud Sync Active</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="glass-panel p-8 rounded-3xl flex flex-col h-full">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                                        <Lock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Security</h3>
                                        <p className="text-sm text-slate-500">Manage your password</p>
                                    </div>
                                </div>

                                <form onSubmit={handleChangePassword} className="space-y-4 flex-1">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
                                        <input 
                                            type="password" 
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className={`w-full rounded-xl py-3 px-4 outline-none border focus:ring-2 focus:ring-blue-500/50 transition-all ${theme === 'dark' ? 'bg-slate-900/50 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                            placeholder="••••••••"
                                        />
                                        <PasswordStrengthMeter password={newPassword} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm Password</label>
                                        <input 
                                            type="password" 
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className={`w-full rounded-xl py-3 px-4 outline-none border focus:ring-2 focus:ring-blue-500/50 transition-all ${theme === 'dark' ? 'bg-slate-900/50 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="pt-4 mt-auto">
                                        <button type="submit" className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'}`}>
                                            Update Password
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="glass-panel p-8 rounded-3xl flex flex-col h-full">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                                        <Settings className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Data & Preferences</h3>
                                        <p className="text-sm text-slate-500">Control your data</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <button 
                                        onClick={handleExportData}
                                        className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-3 text-center transition-all group ${theme === 'dark' ? 'border-white/10 hover:bg-white/5 hover:border-blue-500/50' : 'border-slate-200 hover:bg-slate-50 hover:border-blue-500'}`}
                                    >
                                        <Download className="w-8 h-8 text-blue-500 mb-1 group-hover:scale-110 transition-transform" />
                                        <div>
                                            <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Export Data</p>
                                            <p className="text-[10px] text-slate-500">JSON Format</p>
                                        </div>
                                    </button>

                                    <label className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-3 text-center transition-all cursor-pointer group ${theme === 'dark' ? 'border-white/10 hover:bg-white/5 hover:border-emerald-500/50' : 'border-slate-200 hover:bg-slate-50 hover:border-emerald-500'}`}>
                                        <Upload className="w-8 h-8 text-emerald-500 mb-1 group-hover:scale-110 transition-transform" />
                                        <div>
                                            <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Import Data</p>
                                            <p className="text-[10px] text-slate-500">View Backup</p>
                                        </div>
                                        <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                                    </label>

                                    <button 
                                        onClick={handlePrintRequest}
                                        className={`col-span-2 p-4 rounded-2xl border flex items-center justify-between px-6 transition-all group ${theme === 'dark' ? 'border-white/10 hover:bg-white/5 hover:border-purple-500/50' : 'border-slate-200 hover:bg-slate-50 hover:border-purple-500'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                                <Printer className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Generate Report</p>
                                                <p className="text-[10px] text-slate-500">PDF / Print</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                                
                                <div className="mt-auto pt-4 border-t border-dashed border-white/10 space-y-2">
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full py-3 font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4" /> Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        
        {activeView === 'dashboard' && !isMobileMenuOpen && (
            <button
                onClick={() => setIsAddTxOpen(true)}
                className="lg:hidden fixed bottom-24 right-6 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl z-40"
            >
                <Plus className="w-8 h-8" />
            </button>
        )}

         <nav className={`lg:hidden fixed bottom-4 left-4 right-4 h-20 rounded-2xl flex items-center justify-between px-2 z-50 shadow-2xl no-print ${theme === 'dark' ? 'glass-panel' : 'bg-white shadow-lg border border-slate-200'}`}>
             {mobilePrimaryNav.map((item) => (
                <button
                    key={item.view}
                    onClick={() => { setActiveView(item.view); setIsMobileMenuOpen(false); }}
                    className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-200 ${
                        activeView === item.view 
                        ? 'text-blue-500' 
                        : theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <item.icon className={`w-6 h-6 transition-transform duration-200 ${activeView === item.view ? 'scale-110' : ''}`} strokeWidth={activeView === item.view ? 2.5 : 2} />
                    <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
                </button>
            ))}
            <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-200 ${
                    isMobileMenuOpen 
                    ? 'text-blue-500' 
                    : theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                {isMobileMenuOpen ? <X className="w-6 h-6" strokeWidth={2.5} /> : <Grid className="w-6 h-6" strokeWidth={2} />}
                <span className="text-[10px] font-bold tracking-wide">More</span>
            </button>
        </nav>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
            <>
                <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
                <div className={`lg:hidden fixed bottom-28 left-4 right-4 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300`}>
                    <div className={`p-4 rounded-3xl shadow-2xl border grid grid-cols-4 gap-4 ${theme === 'dark' ? 'glass-panel border-white/10 bg-slate-900/90' : 'bg-white border-slate-200'}`}>
                        {mobileSecondaryNav.map((item) => (
                             <button
                                key={item.view}
                                onClick={() => { setActiveView(item.view); setIsMobileMenuOpen(false); }}
                                className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all ${
                                    activeView === item.view 
                                    ? 'bg-blue-600/20 text-blue-500' 
                                    : theme === 'dark' ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                <div className={`p-2 rounded-lg ${activeView === item.view ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </>
        )}

      </main>

      <AddTransactionModal 
        isOpen={isAddTxOpen} 
        onClose={() => setIsAddTxOpen(false)} 
        onSave={handleAddTransaction}
        wallets={wallets}
      />
      
      <WalletModal 
        isOpen={walletModal.open}
        onClose={() => setWalletModal({ ...walletModal, open: false })}
        onSave={saveWallet}
        onDelete={deleteWallet}
        initialData={walletModal.data}
      />

      <BillModal 
        isOpen={billModal.open}
        onClose={() => setBillModal({ ...billModal, open: false })}
        onSave={saveBill}
        onDelete={deleteBill}
        initialData={billModal.data}
      />

      <GoalModal
        isOpen={goalModal.open}
        onClose={() => setGoalModal({ ...goalModal, open: false })}
        onSave={saveGoal}
        onDelete={deleteGoal}
        initialData={goalModal.data}
      />

      <BudgetModal
        isOpen={budgetModal.open}
        onClose={() => setBudgetModal({ ...budgetModal, open: false })}
        onSave={saveBudget}
        onDelete={deleteBudget}
        initialData={budgetModal.data}
      />

      <LoanModal
        isOpen={loanModal.open}
        onClose={() => setLoanModal({ ...loanModal, open: false })}
        onSave={saveLoan}
        onDelete={deleteLoan}
        initialData={loanModal.data}
      />
      
      <InvestmentModal
        isOpen={investmentModal.open}
        onClose={() => setInvestmentModal({ ...investmentModal, open: false })}
        onSave={saveInvestment}
        onDelete={deleteInvestment}
        initialData={investmentModal.data}
      />

      <CelebrationModal
        isOpen={celebrationModal.open}
        onClose={() => setCelebrationModal({ ...celebrationModal, open: false })}
        goal={celebrationModal.data}
      />

      <QuickUpdateModal
        isOpen={quickUpdateModal.open}
        onClose={() => setQuickUpdateModal({ ...quickUpdateModal, open: false })}
        onSave={handleQuickUpdateSave}
        title={quickUpdateProps.title}
        item={quickUpdateProps.item}
        wallets={wallets}
        type={quickUpdateModal.type}
      />

      <PrintOptionsModal 
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        onGenerate={handleGenerateReport}
      />
    </div>
  );
};

export default App;
