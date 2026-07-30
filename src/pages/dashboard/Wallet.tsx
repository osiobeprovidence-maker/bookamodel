import { motion } from 'framer-motion';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, CreditCard, History } from 'lucide-react';

const WalletPage = () => {
  const transactions = [
    { type: 'credit', amount: 25000, description: 'Booking payment - Fashion Shoot', date: '2026-07-28', status: 'completed' },
    { type: 'debit', amount: 5000, description: 'Withdrawal to bank', date: '2026-07-25', status: 'completed' },
    { type: 'credit', amount: 15000, description: 'Booking payment - Catalog', date: '2026-07-20', status: 'completed' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Wallet</h1>
        <p className="text-gray-400 mt-1">Manage your earnings and payouts</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-[#D4AF37]/20 to-black/40 rounded-2xl border border-[#D4AF37]/30 p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-[#D4AF37]/20">
            <WalletIcon className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Available Balance</p>
            <p className="text-3xl font-bold text-white">NGN 45,000</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] text-black font-semibold text-sm hover:bg-[#C5A032] transition-colors">
            <ArrowUpRight className="w-4 h-4" /> Withdraw
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-colors">
            <CreditCard className="w-4 h-4" /> Add Bank
          </button>
        </div>
      </motion.div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-white">Transaction History</h2>
        </div>
        <div className="space-y-3">
          {transactions.map((tx, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${tx.type === 'credit' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  {tx.type === 'credit' ? <ArrowDownLeft className="w-4 h-4 text-green-400" /> : <ArrowUpRight className="w-4 h-4 text-red-400" />}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{tx.description}</p>
                  <p className="text-gray-500 text-xs">{tx.date}</p>
                </div>
              </div>
              <span className={`font-semibold text-sm ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                {tx.type === 'credit' ? '+' : '-'}NGN {tx.amount.toLocaleString()}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
