import React, { useState } from 'react';
import { Wallet, WalletType } from '../types';
import { 
  CreditCard, 
  Smartphone, 
  Banknote, 
  Edit2, 
  Landmark, 
  Eye, 
  EyeOff, 
  Wifi, 
  QrCode, 
  Globe, 
  Wallet as WalletIcon 
} from 'lucide-react';

interface WalletCardProps {
  wallet: Wallet;
  onEdit?: (wallet: Wallet) => void;
}

const formatPHP = (amount: number) => {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
};

// Enhanced Icon Logic
const getIcon = (type: WalletType) => {
  switch (type) {
    case WalletType.CASH:
      return <Banknote className="w-5 h-5 text-white" />;
    case WalletType.GCASH:
    case WalletType.MAYA:
      return <QrCode className="w-5 h-5 text-white" />;
    case WalletType.PAYPAL:
    case WalletType.WISE:
      return <Globe className="w-5 h-5 text-white" />;
    case WalletType.SEABANK:
    case WalletType.MARIBANK:
    case WalletType.GOTYME:
    case WalletType.TONIK:
    case WalletType.KOMO:
    case WalletType.CIMB:
    case WalletType.OWNBANK:
      return <Smartphone className="w-5 h-5 text-white" />;
    case WalletType.BDO:
    case WalletType.BPI:
    case WalletType.METROBANK:
    case WalletType.LANDBANK:
    case WalletType.CHINABANK:
    case WalletType.UNIONBANK:
    case WalletType.RCBC:
    case WalletType.PNB:
    case WalletType.SECURITYBANK:
    case WalletType.EASTWEST:
      return <Landmark className="w-5 h-5 text-white" />;
    default:
      return <WalletIcon className="w-5 h-5 text-white" />;
  }
};

// Stylized Bank Text Logos
const getBankLogo = (type: WalletType) => {
    switch (type) {
        case WalletType.GCASH: 
            return <span className="font-bold tracking-tighter text-2xl font-sans text-white drop-shadow-md">GCash</span>;
        case WalletType.MAYA: 
            return <span className="font-bold tracking-widest text-2xl uppercase font-sans text-white drop-shadow-md">Maya</span>;
        case WalletType.BDO: 
            return <span className="font-black tracking-widest text-2xl uppercase font-sans text-white drop-shadow-md">BDO</span>;
        case WalletType.BPI: 
            return <span className="font-bold tracking-wide text-2xl font-serif text-white drop-shadow-md">BPI</span>;
        case WalletType.METROBANK: 
            return <span className="font-bold tracking-wide text-xl italic uppercase text-white drop-shadow-md">Metrobank</span>;
        case WalletType.SEABANK: 
            return <span className="font-bold tracking-tighter text-xl text-orange-50 drop-shadow-md">SeaBank</span>;
        case WalletType.MARIBANK: 
            return <span className="font-bold tracking-tight text-xl text-white drop-shadow-md">MariBank</span>;
        case WalletType.GOTYME:
            return <span className="font-bold tracking-tight text-xl font-sans text-white drop-shadow-md">GoTyme</span>;
        case WalletType.CASH:
            return <span className="font-bold tracking-[0.3em] text-xl uppercase text-white/90 drop-shadow-md">CASH</span>;
        case WalletType.PAYPAL:
            return <span className="font-bold tracking-tight text-xl italic text-white drop-shadow-md">PayPal</span>;
        case WalletType.WISE:
            return <span className="font-bold tracking-tight text-xl text-lime-50 drop-shadow-md">Wise</span>;
        default: 
            return <span className="font-bold tracking-widest text-sm uppercase text-white drop-shadow-md">{type}</span>;
    }
};

export const WalletCard: React.FC<WalletCardProps> = ({ wallet, onEdit }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getMaskedNumber = () => {
    if (!wallet.accountNumber) return '••••';
    return `•••• ${wallet.accountNumber.slice(-4)}`;
  };
  
  const getFormattedNumber = () => {
    if (!wallet.accountNumber) return '•••• •••• •••• ••••';
    const cleaned = wallet.accountNumber.replace(/\D/g, '');
    if (cleaned.length === 11) return cleaned.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };

  return (
    <div 
      className={`
        relative group h-[230px] w-full rounded-3xl overflow-hidden transition-all duration-500 ease-out
        hover:scale-[1.02] hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/20
        ${wallet.color} border border-white/10
        print:break-inside-avoid focus-within:ring-4 focus-within:ring-blue-500/30
      `}
      tabIndex={0}
    >
      {/* Background Sheen Effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10"></div>
      
      {/* Decorative Circles */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none mix-blend-overlay"></div>
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-black/10 rounded-full blur-2xl pointer-events-none mix-blend-soft-light"></div>
      
      {/* Large Watermark Logo */}
      <div className="absolute right-4 bottom-4 opacity-[0.07] scale-[2.5] pointer-events-none select-none z-0 transform origin-bottom-right transition-transform group-hover:scale-[2.7]">
          {getBankLogo(wallet.type)}
      </div>

      <div className="relative z-20 h-full flex flex-col justify-between p-7">
        
        {/* Header Row */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 shadow-sm text-white transition-transform group-hover:rotate-6">
                {getIcon(wallet.type)}
            </div>
            {!showDetails && (
               <div className="opacity-90 animate-in fade-in slide-in-from-left-2 duration-300">
                  {getBankLogo(wallet.type)}
               </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 no-print">
            <button 
                onClick={(e) => { e.stopPropagation(); setShowDetails(!showDetails); }}
                className="p-2 bg-black/10 hover:bg-black/30 text-white/70 hover:text-white rounded-full backdrop-blur-md transition-colors"
                title={showDetails ? "Show Balance" : "Show Card Details"}
            >
                {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            {onEdit && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(wallet); }}
                    className="p-2 bg-black/10 hover:bg-black/30 text-white/70 hover:text-white rounded-full backdrop-blur-md transition-colors"
                    title="Edit Wallet"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
            )}
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 flex flex-col justify-end mt-4">
            {showDetails ? (
                // REAL CARD LAYOUT
                <div className="animate-in fade-in zoom-in duration-300 flex flex-col h-full justify-between">
                     <div className="mt-2 pl-1">
                        <div className="flex justify-between items-center w-full">
                            {/* EMV Chip */}
                            <div className="w-12 h-9 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-500 border border-yellow-300/50 shadow-sm relative overflow-hidden flex items-center justify-center">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arches.png')] opacity-30 mix-blend-multiply"></div>
                                <div className="w-full h-px bg-yellow-800/20 absolute top-1/3"></div>
                                <div className="w-full h-px bg-yellow-800/20 absolute bottom-1/3"></div>
                                <div className="h-full w-px bg-yellow-800/20 absolute left-1/3"></div>
                                <div className="h-full w-px bg-yellow-800/20 absolute right-1/3"></div>
                            </div>
                            
                            {/* Contactless Icon */}
                            <Wifi className="w-6 h-6 rotate-90 text-white/70" />
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="font-mono text-[1.35rem] tracking-[0.14em] text-white drop-shadow-md whitespace-nowrap overflow-hidden text-ellipsis pl-1 py-1">
                            {getFormattedNumber()}
                        </div>
                        
                        <div className="flex justify-between items-end text-white">
                            <div className="max-w-[140px]">
                                <p className="text-[7px] uppercase tracking-widest text-white/70 mb-0.5">Card Holder</p>
                                <p className="text-xs font-bold tracking-widest uppercase truncate">{wallet.accountName || wallet.name}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div>
                                    <p className="text-[7px] uppercase tracking-widest text-white/70 mb-0.5 text-center">Expires</p>
                                    <p className="text-xs font-mono font-semibold">{wallet.expiryDate || 'MM/YY'}</p>
                                </div>
                                <div>
                                    <p className="text-[7px] uppercase tracking-widest text-white/70 mb-0.5 text-center">CVV</p>
                                    <p className="text-xs font-mono font-semibold">{wallet.cvv || '•••'}</p>
                                </div>
                            </div>
                        </div>
                     </div>
                </div>
            ) : (
                // BALANCE LAYOUT
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-2">
                    <div className="mb-auto">
                        <span className="inline-block text-[9px] font-bold uppercase tracking-widest bg-white/20 text-white px-2.5 py-1 rounded-md backdrop-blur-sm border border-white/10 shadow-sm">
                            {wallet.type} Wallet
                        </span>
                    </div>
                    
                    <div>
                        <p className="text-sm font-medium text-white/70 mb-0.5">Total Balance</p>
                        <h3 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">{formatPHP(wallet.balance)}</h3>
                    </div>
                    
                    <div className="flex justify-between items-end pt-2 border-t border-white/10 mt-3">
                        <div className="max-w-[60%]">
                            <p className="text-[9px] uppercase tracking-widest text-white/60 mb-0.5">Account Name</p>
                            <p className="text-xs font-medium tracking-wide truncate text-white/90">{wallet.accountName || wallet.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] uppercase tracking-widest text-white/60 mb-0.5">Account No.</p>
                            <p className="text-sm font-mono tracking-widest text-white/90">{getMaskedNumber()}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};