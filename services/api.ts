import { supabase } from '../lib/supabaseClient';
import { Wallet, Transaction, BudgetCategory, Bill, Loan, SavingsGoal, Investment, UserProfile } from '../types';

// Helper to map DB snake_case to TS camelCase if needed, 
// but we will try to write to DB matching our needs or map manually.

export const api = {
  // --- Auth & Profile ---
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
    
    return {
        name: data.full_name || 'User',
        email: data.email || '',
        avatarUrl: data.avatar_url,
        currency: data.currency || 'PHP'
    };
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.full_name = updates.name;
    if (updates.avatarUrl) dbUpdates.avatar_url = updates.avatarUrl;
    
    const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', userId);
        
    if (error) throw error;
  },

  // --- Wallets ---
  async getWallets() {
    const { data, error } = await supabase.from('wallets').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    // Map DB snake_case to camelCase
    return data.map((w: any) => ({
      ...w,
      accountNumber: w.account_number,
      accountName: w.account_name,
      expiryDate: w.expiry_date
    })) as Wallet[];
  },

  async upsertWallet(wallet: Wallet, userId: string) {
    // Map camelCase to snake_case for DB
    const dbData = {
        id: wallet.id, // Supabase will ignore this on insert if we let it gen_random, but we handle ID in App or let DB handle it. 
        // Better: let DB handle ID on insert, but we need to handle the update logic.
        // For simplicity in migration, we assume ID is passed.
        user_id: userId,
        name: wallet.name,
        type: wallet.type,
        balance: wallet.balance,
        color: wallet.color,
        account_number: wallet.accountNumber,
        account_name: wallet.accountName,
        expiry_date: wallet.expiryDate,
        cvv: wallet.cvv
    };

    // If ID looks like a UUID (length 36), we upsert. If it's short (math.random), we omit ID to let DB gen new one.
    // However, logic in App.tsx generates IDs. 
    // We will use upsert.
    const { data, error } = await supabase.from('wallets').upsert(dbData).select().single();
    if (error) throw error;
    
    return {
        ...data,
        accountNumber: data.account_number,
        accountName: data.account_name,
        expiryDate: data.expiry_date
    } as Wallet;
  },

  async deleteWallet(id: string) {
    const { error } = await supabase.from('wallets').delete().eq('id', id);
    if (error) throw error;
  },

  // --- Transactions ---
  async getTransactions() {
    const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false });
    if (error) throw error;
    return data.map((t: any) => ({
        ...t,
        walletId: t.wallet_id
    })) as Transaction[];
  },

  async addTransaction(tx: Transaction, userId: string) {
     const dbData = {
         user_id: userId,
         date: tx.date,
         description: tx.description,
         amount: tx.amount,
         type: tx.type,
         category: tx.category,
         wallet_id: tx.walletId
     };
     // We do not pass ID, let DB generate UUID
     const { data, error } = await supabase.from('transactions').insert(dbData).select().single();
     if (error) throw error;
     return { ...data, walletId: data.wallet_id } as Transaction;
  },

  // --- Budgets ---
  async getBudgets() {
      const { data, error } = await supabase.from('budgets').select('*');
      if (error) throw error;
      return data as BudgetCategory[];
  },

  async upsertBudget(budget: BudgetCategory, userId: string) {
      const dbData = {
          id: budget.id.length > 10 ? budget.id : undefined, // quick check for valid uuid vs random
          user_id: userId,
          category: budget.category,
          limit: budget.limit,
          spent: budget.spent,
          color: budget.color
      };
      const { data, error } = await supabase.from('budgets').upsert(dbData).select().single();
      if (error) throw error;
      return data as BudgetCategory;
  },

  async deleteBudget(id: string) {
      const { error } = await supabase.from('budgets').delete().eq('id', id);
      if (error) throw error;
  },

  // --- Bills ---
  async getBills() {
      const { data, error } = await supabase.from('bills').select('*');
      if (error) throw error;
      return data.map((b: any) => ({
          ...b,
          dueDate: b.due_date,
          isPaid: b.is_paid
      })) as Bill[];
  },

  async upsertBill(bill: Bill, userId: string) {
      const dbData = {
          id: bill.id.length > 10 ? bill.id : undefined,
          user_id: userId,
          name: bill.name,
          amount: bill.amount,
          due_date: bill.dueDate,
          is_paid: bill.isPaid,
          category: bill.category
      };
      const { data, error } = await supabase.from('bills').upsert(dbData).select().single();
      if (error) throw error;
      return { ...data, dueDate: data.due_date, isPaid: data.is_paid } as Bill;
  },

  async deleteBill(id: string) {
      const { error } = await supabase.from('bills').delete().eq('id', id);
      if (error) throw error;
  },

  // --- Loans ---
  async getLoans() {
      const { data, error } = await supabase.from('loans').select('*');
      if (error) throw error;
      return data.map((l: any) => ({
          ...l,
          totalAmount: l.total_amount,
          paidAmount: l.paid_amount,
          dueDate: l.due_date,
          interestRate: l.interest_rate
      })) as Loan[];
  },

  async upsertLoan(loan: Loan, userId: string) {
      const dbData = {
          id: loan.id.length > 10 ? loan.id : undefined,
          user_id: userId,
          name: loan.name,
          total_amount: loan.totalAmount,
          paid_amount: loan.paidAmount,
          due_date: loan.dueDate,
          interest_rate: loan.interestRate,
          type: loan.type
      };
      const { data, error } = await supabase.from('loans').upsert(dbData).select().single();
      if (error) throw error;
      return { ...data, totalAmount: data.total_amount, paidAmount: data.paid_amount, dueDate: data.due_date, interestRate: data.interest_rate } as Loan;
  },

  async deleteLoan(id: string) {
      const { error } = await supabase.from('loans').delete().eq('id', id);
      if (error) throw error;
  },

  // --- Goals ---
  async getGoals() {
      const { data, error } = await supabase.from('goals').select('*');
      if (error) throw error;
      return data.map((g: any) => ({
          ...g,
          targetAmount: g.target_amount,
          currentAmount: g.current_amount
      })) as SavingsGoal[];
  },

  async upsertGoal(goal: SavingsGoal, userId: string) {
      const dbData = {
          id: goal.id.length > 10 ? goal.id : undefined,
          user_id: userId,
          name: goal.name,
          target_amount: goal.targetAmount,
          current_amount: goal.currentAmount,
          deadline: goal.deadline,
          color: goal.color,
          icon: goal.icon,
          category: goal.category
      };
      const { data, error } = await supabase.from('goals').upsert(dbData).select().single();
      if (error) throw error;
      return { ...data, targetAmount: data.target_amount, currentAmount: data.current_amount } as SavingsGoal;
  },

  async deleteGoal(id: string) {
      const { error } = await supabase.from('goals').delete().eq('id', id);
      if (error) throw error;
  },

  // --- Investments ---
  async getInvestments() {
      const { data, error } = await supabase.from('investments').select('*');
      if (error) throw error;
      return data.map((i: any) => ({
          ...i,
          investedAmount: i.invested_amount,
          currentValue: i.current_value
      })) as Investment[];
  },

  async upsertInvestment(inv: Investment, userId: string) {
      const dbData = {
          id: inv.id.length > 10 ? inv.id : undefined,
          user_id: userId,
          name: inv.name,
          type: inv.type,
          invested_amount: inv.investedAmount,
          current_value: inv.currentValue,
          symbol: inv.symbol,
          color: inv.color
      };
      const { data, error } = await supabase.from('investments').upsert(dbData).select().single();
      if (error) throw error;
      return { ...data, investedAmount: data.invested_amount, currentValue: data.current_value } as Investment;
  },

  async deleteInvestment(id: string) {
      const { error } = await supabase.from('investments').delete().eq('id', id);
      if (error) throw error;
  }
};
