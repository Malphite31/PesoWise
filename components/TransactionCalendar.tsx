import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface TransactionCalendarProps {
  transactions: Transaction[];
  onSelectDate: (date: string | null) => void;
  selectedDate: string | null;
}

export const TransactionCalendar: React.FC<TransactionCalendarProps> = ({ transactions, onSelectDate, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Reset selection when month changes
  useEffect(() => {
    onSelectDate(null);
  }, [currentDate.getMonth()]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return days;
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + offset));
    setCurrentDate(new Date(newDate));
  };

  const formatDateKey = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const getDailyTotals = (dateKey: string) => {
    const dayTx = transactions.filter(t => t.date.startsWith(dateKey));
    const income = dayTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = dayTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, count: dayTx.length };
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const daysArray = [...Array(daysInMonth + firstDay)];
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="glass-panel rounded-2xl p-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg dark:text-white text-slate-900">{monthName}</h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => changeMonth(-1)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => { setCurrentDate(new Date()); onSelectDate(null); }}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
          >
            Today
          </button>
          <button 
            onClick={() => changeMonth(1)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {daysArray.map((_, index) => {
          if (index < firstDay) return <div key={`empty-${index}`} />;
          
          const day = index - firstDay + 1;
          const dateKey = formatDateKey(day);
          const { income, expense, count } = getDailyTotals(dateKey);
          const isSelected = selectedDate === dateKey;
          const isToday = formatDateKey(new Date().getDate()) === dateKey && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();

          return (
            <button
              key={day}
              onClick={() => onSelectDate(isSelected ? null : dateKey)}
              className={`
                min-h-[80px] rounded-xl p-2 flex flex-col items-start justify-between transition-all border
                ${isSelected 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105 z-10' 
                  : 'dark:bg-white/5 bg-slate-50 border-transparent hover:border-blue-500/50 dark:hover:bg-white/10 hover:bg-slate-100'
                }
                ${isToday && !isSelected ? 'ring-1 ring-blue-500 ring-offset-1 dark:ring-offset-slate-900' : ''}
              `}
            >
              <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'dark:text-slate-400 text-slate-600'}`}>
                {day}
              </span>
              
              <div className="w-full flex flex-col gap-0.5 items-end">
                {income > 0 && (
                  <span className={`text-[10px] font-bold ${isSelected ? 'text-emerald-200' : 'text-emerald-500'}`}>
                    +{income.toLocaleString('en-PH', { notation: "compact" })}
                  </span>
                )}
                {expense > 0 && (
                  <span className={`text-[10px] font-bold ${isSelected ? 'text-red-200' : 'text-red-500'}`}>
                    -{expense.toLocaleString('en-PH', { notation: "compact" })}
                  </span>
                )}
                {income === 0 && expense === 0 && (
                  <span className="text-[10px] text-slate-400 opacity-0">-</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      {selectedDate && (
        <div className="mt-4 flex justify-between items-center p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <span className="text-sm font-medium text-blue-500">
            Filtering by: <b>{new Date(selectedDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</b>
          </span>
          <button 
            onClick={() => onSelectDate(null)}
            className="p-1 rounded-full hover:bg-blue-500/20 text-blue-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};