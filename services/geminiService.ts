import { GoogleGenAI } from "@google/genai";
import { Transaction, BudgetCategory, Loan, Bill } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialAdvice = async (
  transactions: Transaction[],
  budgets: BudgetCategory[],
  loans: Loan[],
  bills: Bill[]
): Promise<string> => {
  try {
    const recentTransactions = transactions.slice(0, 20); // Last 20 for context
    
    const prompt = `
      You are a wise and helpful financial advisor for a user in the Philippines.
      Currency is PHP.
      
      Here is the user's financial snapshot:
      
      Budgets Status:
      ${JSON.stringify(budgets.map(b => `${b.category}: ${b.spent}/${b.limit}`))}
      
      Active Loans:
      ${JSON.stringify(loans)}
      
      Upcoming Bills:
      ${JSON.stringify(bills.filter(b => !b.isPaid))}
      
      Recent Transactions:
      ${JSON.stringify(recentTransactions.map(t => `${t.date}: ${t.description} (${t.type}) - ${t.amount}`))}
      
      Please provide a brief, encouraging, and actionable financial analysis (max 3 short paragraphs). 
      Focus on saving tips, debt management, or budget alerts if they are overspending.
      Format the response in Markdown.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a financial expert. Be concise, friendly, and use Philippine financial context where appropriate (e.g., suggesting common local saving methods if relevant).",
        temperature: 0.7,
      }
    });

    return response.text || "I couldn't generate advice right now. Please try again later.";
  } catch (error) {
    console.error("Error fetching financial advice:", error);
    return "Sorry, I'm having trouble connecting to the financial wisdom server right now.";
  }
};

export const categorizeTransaction = async (description: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Categorize this transaction description into a single word category (e.g., Food, Transport, Utilities, Entertainment, Salary, Shopping, Bills): "${description}"`,
        });
        return response.text?.trim() || "General";
    } catch (error) {
        return "General";
    }
}
