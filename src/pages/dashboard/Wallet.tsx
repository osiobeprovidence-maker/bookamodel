import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAction, useMutation, useQuery } from 'convex/react';
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  History,
  Loader2,
  Landmark,
} from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '../../contexts/UserContext';
import { useToast } from '../../components/ui/Toast';
import { loadPaystackScript } from '../../lib/paystack';
import { cn } from '../../lib/utils';

const MIN_FUNDING_AMOUNT = 1000;
const MIN_FUNDING_CREDIT = 900;
const MODEL_MIN_WITHDRAWAL = 5000;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);

const WalletPage = () => {
  const { convexUser } = useUser();
  const { toast } = useToast();
  const [fundAmount, setFundAmount] = useState(String(MIN_FUNDING_AMOUNT));
  const [withdrawAmount, setWithdrawAmount] = useState(String(MODEL_MIN_WITHDRAWAL));
  const [bankForm, setBankForm] = useState({ bankName: '', accountNumber: '', accountName: '' });
  const [isFunding, setIsFunding] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const walletData = useQuery(
    api.wallets.getWallet,
    convexUser ? { userId: convexUser._id as any } : 'skip'
  );
  const ensureWallet = useMutation(api.wallets.ensureWallet);
  const createFundingSession = useMutation(api.wallets.createFundingSession);
  const verifyAndCreditFunding = useAction(api.wallets.verifyAndCreditFunding);
  const requestWithdrawal = useMutation(api.wallets.requestWithdrawal);

  const isModel = convexUser?.role === 'model';
  const transactions = walletData?.transactions ?? [];
  const balance = walletData?.wallet.balance ?? 0;

  const fundAmountNumber = useMemo(() => Number(fundAmount.replace(/,/g, '')) || 0, [fundAmount]);
  const withdrawalAmountNumber = useMemo(() => Number(withdrawAmount.replace(/,/g, '')) || 0, [withdrawAmount]);
  const creditPreview = fundAmountNumber >= MIN_FUNDING_AMOUNT
    ? (fundAmountNumber === MIN_FUNDING_AMOUNT ? MIN_FUNDING_CREDIT : fundAmountNumber - 100)
    : 0;

  useEffect(() => {
    if (!convexUser || (convexUser.role !== 'model' && convexUser.role !== 'business')) return;
    ensureWallet({ userId: convexUser._id as any }).catch(() => {
      toast('Unable to create wallet', 'error');
    });
  }, [convexUser, ensureWallet, toast]);

  const handleFundWallet = async () => {
    if (!convexUser || isFunding) return;
    if (fundAmountNumber < MIN_FUNDING_AMOUNT) {
      toast(`Minimum funding is ${formatCurrency(MIN_FUNDING_AMOUNT)}`, 'warning');
      return;
    }

    setIsFunding(true);
    try {
      const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';
      if (!paystackKey) {
        throw new Error('Paystack is not configured. Please set VITE_PAYSTACK_PUBLIC_KEY in your environment.');
      }

      const session = await createFundingSession({
        userId: convexUser._id as any,
        amount: fundAmountNumber,
        provider: 'paystack',
      });

      await loadPaystackScript();

      const paystackHandler = (window as any).PaystackPop.setup({
        key: paystackKey,
        email: convexUser.email || '',
        amount: (session as any).amount * 100,
        currency: 'NGN',
        ref: (session as any).reference,
        metadata: {
          custom_fields: [
            { display_name: 'Wallet Transaction', variable_name: 'wallet_transaction_id', value: (session as any).transactionId },
            { display_name: 'Credit Amount', variable_name: 'credit_amount', value: (session as any).creditAmount },
          ],
        },
        callback: (response: { reference: string }) => {
          verifyAndCreditFunding({
            transactionId: (session as any).transactionId,
            reference: response.reference,
            provider: 'paystack',
          }).then(() => {
            toast(`Wallet funded. ${formatCurrency((session as any).creditAmount)} credited.`, 'success');
            setIsFunding(false);
          }).catch((err: any) => {
            toast(err.message || 'Payment verification failed', 'error');
            setIsFunding(false);
          });
        },
        onClose: () => {
          toast('Payment was cancelled', 'info');
          setIsFunding(false);
        },
      });

      paystackHandler.openIframe();
    } catch (err: any) {
      toast(err.message || 'Unable to start wallet funding', 'error');
      setIsFunding(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!convexUser || !isModel || isWithdrawing) return;
    if (withdrawalAmountNumber < MODEL_MIN_WITHDRAWAL) {
      toast(`Minimum withdrawal is ${formatCurrency(MODEL_MIN_WITHDRAWAL)}`, 'warning');
      return;
    }
    if (withdrawalAmountNumber > balance) {
      toast('Insufficient wallet balance', 'warning');
      return;
    }

    setIsWithdrawing(true);
    try {
      await requestWithdrawal({
        userId: convexUser._id as any,
        amount: withdrawalAmountNumber,
        bankName: bankForm.bankName || undefined,
        accountNumber: bankForm.accountNumber || undefined,
        accountName: bankForm.accountName || undefined,
      });
      toast('Withdrawal request submitted', 'success');
      setWithdrawAmount(String(MODEL_MIN_WITHDRAWAL));
      setBankForm({ bankName: '', accountNumber: '', accountName: '' });
    } catch (err: any) {
      toast(err.message || 'Unable to request withdrawal', 'error');
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (!convexUser || walletData === undefined) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#111111]">Wallet</h1>
        <p className="mt-1 text-sm text-gray-500">
          {isModel ? 'Manage your earnings, funding, and payout requests.' : 'Fund your business account for bookings and campaign activity.'}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-[#D4AF37]/30 bg-[#111111] p-6 text-white shadow-sm sm:p-8"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#D4AF37]/20 p-3">
              <WalletIcon className="h-6 w-6 text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Available Balance</p>
              <p className="text-3xl font-bold">{formatCurrency(balance)}</p>
            </div>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-3 text-sm text-gray-200">
            Paystack funding only. Minimum funding is {formatCurrency(MIN_FUNDING_AMOUNT)} and credits {formatCurrency(MIN_FUNDING_CREDIT)}.
          </div>
        </div>
      </motion.div>

      <div className={cn('grid gap-6', isModel ? 'lg:grid-cols-2' : 'lg:grid-cols-1')}>
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-green-50 p-2">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="font-bold text-[#111111]">Fund Wallet</h2>
              <p className="text-xs text-gray-400">Processed with Paystack only</p>
            </div>
          </div>

          <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-400">Amount (NGN)</label>
          <input
            value={fundAmount}
            onChange={(event) => setFundAmount(event.target.value)}
            inputMode="numeric"
            className="mb-3 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-[#D4AF37]"
          />
          <p className="mb-5 text-xs text-gray-500">
            You will pay {formatCurrency(fundAmountNumber || 0)} and receive {formatCurrency(creditPreview)} in wallet credit.
          </p>

          <button
            onClick={handleFundWallet}
            disabled={isFunding}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-bold text-white transition-all hover:bg-[#C5A028] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isFunding ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDownLeft className="h-4 w-4" />}
            Fund with Paystack
          </button>
        </section>

        {isModel && (
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2">
                <Landmark className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-[#111111]">Withdraw</h2>
                <p className="text-xs text-gray-400">Minimum withdrawal is {formatCurrency(MODEL_MIN_WITHDRAWAL)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <input value={withdrawAmount} onChange={(event) => setWithdrawAmount(event.target.value)} inputMode="numeric" placeholder="Amount"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-[#D4AF37]" />
              <input value={bankForm.bankName} onChange={(event) => setBankForm((form) => ({ ...form, bankName: event.target.value }))} placeholder="Bank name"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-[#D4AF37]" />
              <input value={bankForm.accountNumber} onChange={(event) => setBankForm((form) => ({ ...form, accountNumber: event.target.value }))} placeholder="Account number"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-[#D4AF37]" />
              <input value={bankForm.accountName} onChange={(event) => setBankForm((form) => ({ ...form, accountName: event.target.value }))} placeholder="Account name"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-[#D4AF37]" />
            </div>

            <button
              onClick={handleWithdrawal}
              disabled={isWithdrawing}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#111111] px-5 py-3 text-sm font-bold text-white transition-all hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isWithdrawing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />}
              Request Withdrawal
            </button>
          </section>
        )}
      </div>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <History className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-[#111111]">Transaction History</h2>
        </div>
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
              <WalletIcon className="mx-auto mb-3 h-8 w-8 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">No wallet transactions yet</p>
            </div>
          ) : (
            transactions.map((tx: any, index: number) => (
              <motion.div
                key={tx._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className={cn('rounded-lg p-2', tx.direction === 'credit' ? 'bg-green-50' : 'bg-red-50')}>
                    {tx.direction === 'credit'
                      ? <ArrowDownLeft className="h-4 w-4 text-green-600" />
                      : <ArrowUpRight className="h-4 w-4 text-red-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#111111]">{tx.description}</p>
                    <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString()} - {tx.status}</p>
                  </div>
                </div>
                <span className={cn('text-sm font-semibold', tx.direction === 'credit' ? 'text-green-600' : 'text-red-600')}>
                  {tx.direction === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
              </motion.div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default WalletPage;
