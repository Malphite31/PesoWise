
export type TransactionType = 'income' | 'expense';

export enum WalletType {
  CASH = 'Cash',
  GCASH = 'GCash',
  MAYA = 'Maya',
  PAYPAL = 'PayPal',
  WISE = 'Wise',
  // Digital Banks
  SEABANK = 'SeaBank',
  MARIBANK = 'MariBank',
  CIMB = 'CIMB',
  GOTYME = 'GoTyme',
  KOMO = 'Komo',
  OWNBANK = 'OwnBank',
  TONIK = 'Tonik',
  // Traditional Banks
  BDO = 'BDO',
  BPI = 'BPI',
  METROBANK = 'Metrobank',
  LANDBANK = 'LandBank',
  CHINABANK = 'China Bank',
  UNIONBANK = 'UnionBank',
  RCBC = 'RCBC',
  PNB = 'PNB',
  SECURITYBANK = 'Security Bank',
  EASTWEST = 'EastWest',
  OTHER = 'Other'
}

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  color: string; // Tailwind class mostly or hex
  accountNumber?: string;
  accountName?: string;
  expiryDate?: string;
  cvv?: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  walletId: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  category: string;
}

export type LoanType = 'borrow' | 'lent';

export interface Loan {
  id: string;
  name: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  interestRate: number; // Percentage
  type: LoanType;
}

export interface BudgetCategory {
  id: string;
  category: string;
  limit: number;
  spent: number;
  color: string;
}

export type GoalCategory = 'tech' | 'travel' | 'emergency' | 'shopping' | 'vehicle' | 'home' | 'education' | 'other';

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  color: string;
  icon: string;
  category: GoalCategory;
}

export type InvestmentType = 'stock' | 'crypto' | 'bond' | 'real_estate' | 'fund' | 'other';

export interface Investment {
  id: string;
  name: string;
  type: InvestmentType;
  investedAmount: number;
  currentValue: number;
  symbol?: string; // e.g., AAPL, BTC
  color: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string | null;
  currency: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  type: 'info' | 'warning' | 'success' | 'alert';
}

export type View = 'dashboard' | 'transactions' | 'wallets' | 'budget' | 'bills' | 'loans' | 'goals' | 'investments' | 'profile';
