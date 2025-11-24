import { Transaction, BudgetCategory, Loan, Bill } from "../types";

// AI Features removed as per configuration
export const getFinancialAdvice = async (
  transactions: Transaction[],
  budgets: BudgetCategory[],
  loans: Loan[],
  bills: Bill[]
): Promise<string> => {
  return "";
};

export const categorizeTransaction = async (description: string): Promise<string> => {
    return "General";
}