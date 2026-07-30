import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown, Check, Star, TrendingUp, Shield, Zap,
  MessageSquare, FileText, BarChart3, Headphones,
  X, CreditCard, ChevronDown, ChevronUp, Download,
  Receipt, Loader2, CheckCircle2, AlertCircle, Sparkles,
} from 'lucide-react';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '../../contexts/UserContext';

const benefits = [
  { icon: FileText, title: 'Unlimited Portfolio Uploads', description: 'Upload as many photos as you want to showcase your work.' },
  { icon: Star, title: 'Priority Brand Invitations', description: 'Get invited by top brands before other models.' },
  { icon: Shield, title: 'Verified Pro Badge', description: 'Stand out with a verified badge on your profile.' },
  { icon: TrendingUp, title: 'Featured in Search Results', description: 'Appear at the top of brand search results.' },
  { icon: Zap, title: 'Higher Profile Visibility', description: 'Your profile gets 3x more views from brands.' },
  { icon: BarChart3, title: 'Advanced Analytics', description: 'Track your profile views, impressions, and engagement.' },
  { icon: MessageSquare, title: 'Direct Brand Messaging', description: 'Message brands directly without waiting for invitations.' },
  { icon: FileText, title: 'Unlimited Applications', description: 'Apply to as many casting calls as you want.' },
  { icon: BarChart3, title: 'Portfolio Performance Reports', description: 'See which photos get the most views and engagement.' },
  { icon: Headphones, title: 'Faster Customer Support', description: 'Get priority support with 2-hour response times.' },
];

const plans = [
  {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    price: '5,000',
    period: '/month',
    description: 'Perfect for getting started with Pro features.',
    features: ['Unlimited portfolio uploads', 'Verified Pro badge', 'Priority brand invitations', 'Advanced analytics', 'Direct brand messaging', 'Priority support'],
    popular: false,
  },
  {
    id: 'pro_quarterly',
    name: 'Pro Quarterly',
    price: '13,500',
    period: '/quarter',
    description: 'Best value - save 10% compared to monthly.',
    features: ['Everything in Pro Monthly', 'Save ₦1,500 vs monthly', 'Performance reports', 'Early access to features'],
    popular: false,
    save: 'Save 10%',
  },
  {
    id: 'pro_yearly',
    name: 'Pro Yearly',
    price: '50,000',
    period: '/year',
    description: 'Maximum savings for serious models.',
    features: ['Everything in Pro Quarterly', 'Save ₦10,000 vs monthly', 'Priority customer support', 'Exclusive event invitations'],
    popular: true,
    save: 'Save 17%',
  },
];

const paymentProviders = [
  { id: 'paystack', name: 'Paystack', description: 'Pay with card, USSD, bank transfer' },
];

const billingHistory: { date: string; plan: string; amount: string; method: string; invoice: string; status: string }[] = [];

const faqs = [
  { q: 'What happens if I cancel?', a: 'You can cancel your Pro subscription at any time. Your Pro features will remain active until the end of your current billing period. After that, your account will revert to the Free plan.' },
  { q: 'Can I switch plans?', a: 'Yes! You can upgrade from Free to Pro Monthly or Pro Annual at any time. If you\'re on Pro Monthly, you can switch to Pro Annual and we\'ll prorate the difference.' },
  { q: 'Is my payment secure?', a: 'Absolutely. We use industry-standard encryption and partner with Paystack, Flutterwave, and Stripe to process payments. We never collect your card details on our servers.' },
  { q: 'Will my portfolio remain active?', a: 'Yes. All your portfolio items will remain visible. However, if you downgrade from Pro, you may need to remove items if you exceed the Free plan limit of 10 uploads.' },
  { q: 'Can I get a refund?', a: 'We offer a 7-day money-back guarantee. If you\'re not satisfied with Pro within 7 days of upgrading, contact support for a full refund.' },
  { q: 'Do I need a verified badge?', a: 'While not required, the Verified Pro badge significantly increases your chances of being noticed by brands. Models with verified badges receive 5x more invitations on average.' },
];

type Step = 'select_plan' | 'select_provider' | 'processing' | 'success' | 'error';

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

export default function GoPro() {
  const { convexUser } = useUser();
  const modelProfile = useQuery(
    api.users.getModelProfile,
    convexUser ? { userId: convexUser._id as any } : 'skip'
  );
  const userPlan = useQuery(
    api.subscriptions.getUserPlan,
    modelProfile ? { modelProfileId: modelProfile._id as any } : 'skip'
  );

  const [step, setStep] = useState<Step>('select_plan');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('paystack');
  const [errorMessage, setErrorMessage] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const sessionRef = useRef<{ subscriptionId: string; reference: string; amount: number } | null>(null);

  const createPaymentSession = useAction(api.subscriptions.createPaymentSession);
  const verifyAndActivate = useAction(api.subscriptions.verifyAndActivate);

  const openModal = (planId: string) => {
    setSelectedPlanId(planId);
    setSelectedProvider('paystack');
    setStep('select_plan');
    setErrorMessage('');
    sessionRef.current = null;
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setStep('select_plan');
    setSelectedPlanId(null);
    sessionRef.current = null;
    setErrorMessage('');
  };

  const plan = plans.find(p => p.id === selectedPlanId);

  const handleContinueToProvider = () => {
    if (selectedPlanId) setStep('select_provider');
  };

  const handlePayNow = async () => {
    if (!convexUser || !selectedPlanId || !modelProfile) return;

    setStep('processing');
    setErrorMessage('');

    try {
      const session = await createPaymentSession({
        userId: convexUser._id as any,
        modelProfileId: modelProfile._id as any,
        planId: selectedPlanId,
        paymentProvider: selectedProvider as any,
      });

      sessionRef.current = {
        subscriptionId: (session as any).subscriptionId,
        reference: (session as any).reference,
        amount: (session as any).amount,
      };

      const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';
      if (!paystackKey) { throw new Error('Paystack is not configured. Please set VITE_PAYSTACK_PUBLIC_KEY in your environment.'); }

      await loadScript('https://js.paystack.co/v1/inline.js');

      const paystackHandler = (window as any).PaystackPop.setup({
        key: paystackKey,
        email: convexUser.email || '',
        amount: (session as any).amount * 100,
        currency: 'NGN',
        ref: (session as any).reference,
        metadata: {
          custom_fields: [
            { display_name: 'Plan ID', variable_name: 'plan_id', value: selectedPlanId },
            { display_name: 'Subscription ID', variable_name: 'subscription_id', value: (session as any).subscriptionId },
          ],
        },
        callback: (response: { reference: string }) => {
          verifyAndActivate({
            subscriptionId: (session as any).subscriptionId,
            transactionReference: response.reference,
            paymentProvider: 'paystack',
          }).then((result: any) => {
            if (result.success) setStep('success');
            else { setErrorMessage('Verification failed'); setStep('error'); }
          }).catch((err: any) => {
            setErrorMessage(err.message || 'Payment verification failed');
            setStep('error');
          });
        },
        onClose: () => {
          setErrorMessage('Payment was cancelled');
          setStep('select_provider');
        },
      });
      paystackHandler.openIframe();
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong');
      setStep('error');
    }
  };

  if (!convexUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <header className="mb-6 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#111111]">Go Pro</h1>
        <p className="text-gray-400 font-medium text-sm mt-1">
          Unlock premium features and grow your modeling career.
        </p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl p-4 sm:p-10 mb-6 sm:mb-10"
        style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #B8960C 50%, #D4AF37 100%)' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
          <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shrink-0">
            <Crown className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight mb-2">{userPlan?.isPro ? 'You are a Pro Model' : 'Become a Pro Model'}</h2>
            <p className="text-white/80 text-xs sm:text-sm font-medium max-w-lg">
              {userPlan?.isPro
                ? 'Enjoy all the premium features. Your Pro benefits are active.'
                : 'Join thousands of top Nigerian models who use BOOKAMODEL Pro to connect with premium brands, get priority invitations, and grow their careers.'}
            </p>
          </div>
          {!userPlan?.isPro && (
            <button
              onClick={() => openModal('pro_monthly')}
              className="w-full sm:w-auto bg-white text-[#D4AF37] px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95 shrink-0"
            >
              Upgrade Now
            </button>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-8 mb-6 sm:mb-10"
      >
        <h3 className="text-lg font-bold tracking-tight text-[#111111] mb-6">Current Plan</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${userPlan?.isPro ? 'bg-[#D4AF37]/10' : 'bg-gray-100'}`}>
              {userPlan?.isPro ? <Crown className="w-6 h-6 text-[#D4AF37]" /> : <span className="text-lg font-black text-gray-400">F</span>}
            </div>
            <div>
              <p className="text-sm font-bold text-[#111111]">{userPlan?.isPro ? (userPlan.subscription?.planName || 'Pro Plan') : 'Free Plan'}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {userPlan?.isPro && userPlan.subscription?.expiresAt
                  ? `Renewal: ${new Date(userPlan.subscription.expiresAt).toLocaleDateString()}`
                  : 'No renewal date'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${userPlan?.isPro ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'bg-green-50 text-green-700'}`}>
              {userPlan?.isPro ? 'Pro' : 'Active'}
            </span>
            {!userPlan?.isPro && (
              <button
                onClick={() => openModal('pro_monthly')}
                className="bg-[#D4AF37] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#c9a430] transition-all active:scale-95"
              >
                Upgrade
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="mb-6 sm:mb-10"
      >
        <h3 className="text-lg font-bold tracking-tight text-[#111111] mb-6">Pro Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + i * 0.04 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-[#D4AF37]/30 transition-colors"
            >
              <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center mb-4">
                <b.icon className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <h4 className="text-sm font-bold text-[#111111] mb-1">{b.title}</h4>
              <p className="text-xs text-gray-400 leading-relaxed">{b.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-6 sm:mb-10"
      >
        <h3 className="text-lg font-bold tracking-tight text-[#111111] mb-6">Pricing Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 + i * 0.08 }}
              className={`relative bg-white rounded-2xl border shadow-sm p-4 sm:p-8 ${
                p.popular ? 'border-[#D4AF37] shadow-[#D4AF37]/10' : 'border-gray-100'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Most Popular
                </div>
              )}
              {p.save && (
                <div className="absolute -top-3 right-6 bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {p.save}
                </div>
              )}
              <h4 className="text-sm font-bold text-[#111111] uppercase tracking-widest mb-2">{p.name}</h4>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-black text-[#111111]">₦{p.price}</span>
                <span className="text-xs text-gray-400 font-medium">{p.period}</span>
              </div>
              <p className="text-xs text-gray-400 mb-6">{p.description}</p>
              <ul className="space-y-3 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-xs text-gray-600">
                    <Check className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => openModal(p.id)}
                className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  p.popular
                    ? 'bg-[#D4AF37] text-white hover:bg-[#c9a430] active:scale-95 shadow-xl shadow-[#D4AF37]/20'
                    : 'bg-[#111111] text-white hover:bg-black active:scale-95'
                }`}
              >
                Upgrade
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-8 mb-6 sm:mb-10"
      >
        <h3 className="text-lg font-bold tracking-tight text-[#111111] mb-6">Billing History</h3>
        {billingHistory.length > 0 ? (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Date', 'Plan', 'Amount', 'Method', 'Invoice', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 sm:px-0 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {billingHistory.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="py-4 text-xs text-gray-500 px-4 sm:px-0 whitespace-nowrap">{row.date}</td>
                    <td className="py-4 text-xs font-medium text-[#111111] px-4 sm:px-0">{row.plan}</td>
                    <td className="py-4 text-xs text-gray-500 px-4 sm:px-0 whitespace-nowrap">{row.amount}</td>
                    <td className="py-4 text-xs text-gray-500 px-4 sm:px-0">{row.method}</td>
                    <td className="py-4 text-xs text-gray-500 px-4 sm:px-0">{row.invoice}</td>
                    <td className="py-4 px-4 sm:px-0">
                      <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase">{row.status}</span>
                    </td>
                    <td className="py-4 px-4 sm:px-0">
                      <div className="flex gap-2 whitespace-nowrap">
                        <button className="text-[10px] font-bold text-gray-400 hover:text-[#111111] uppercase tracking-widest flex items-center gap-1 min-h-[44px]">
                          <Download className="w-3 h-3" /> Receipt
                        </button>
                        <button className="text-[10px] font-bold text-gray-400 hover:text-[#111111] uppercase tracking-widest flex items-center gap-1 min-h-[44px]">
                          <Receipt className="w-3 h-3" /> Invoice
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Receipt className="w-10 h-10 text-gray-200 mx-auto mb-4" />
            <p className="text-sm text-gray-400">No billing history yet.</p>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="mb-6 sm:mb-10"
      >
        <h3 className="text-lg font-bold tracking-tight text-[#111111] mb-6">Frequently Asked Questions</h3>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 sm:p-6 text-left min-h-[44px]"
              >
                <span className="text-sm font-bold text-[#111111]">{faq.q}</span>
                {expandedFaq === i ? (
                  <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                )}
              </button>
              <AnimatePresence>
                {expandedFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                      <p className="text-xs text-gray-500 leading-relaxed">{faq.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="mx-4 w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {step === 'success' ? (
                <div className="p-6 sm:p-10 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </motion.div>
                  <h2 className="text-2xl font-black text-[#111111] mb-2">Upgrade Successful!</h2>
                  <p className="text-sm text-gray-400 mb-1">Your subscription has been activated successfully.</p>
                  <p className="text-xs text-gray-400 mb-8">{plan?.name} &middot; ₦{plan?.price}{plan?.period}</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={closeModal}
                      className="bg-[#D4AF37] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#c9a430] transition-all"
                    >
                      Go to Dashboard
                    </button>
                    <button
                      onClick={closeModal}
                      className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-all"
                    >
                      View Subscription
                    </button>
                  </div>
                </div>
              ) : step === 'error' ? (
                <div className="p-6 sm:p-10 text-center">
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                  </div>
                  <h2 className="text-2xl font-black text-[#111111] mb-2">Payment Failed</h2>
                  <p className="text-sm text-gray-400 mb-6">{errorMessage || 'Something went wrong. Please try again.'}</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => { setStep('select_provider'); setErrorMessage(''); }}
                      className="bg-[#111111] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={closeModal}
                      className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : step === 'processing' ? (
                <div className="p-6 sm:p-10 text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-[#D4AF37] mx-auto mb-6" />
                  <h2 className="text-xl font-bold text-[#111111] mb-2">Preparing Checkout</h2>
                  <p className="text-sm text-gray-400">Please wait while we set up your secure payment session...</p>
                </div>
              ) : step === 'select_provider' ? (
                <>
                  <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                      <h2 className="text-lg font-bold text-[#111111]">Choose Payment Method</h2>
                      <p className="text-xs text-gray-400 mt-0.5">{plan?.name} &middot; ₦{plan?.price}{plan?.period}</p>
                    </div>
                    <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    <p className="text-xs font-medium text-gray-500">Select your preferred payment provider. You will be redirected to their secure checkout.</p>
                    {paymentProviders.map((pp) => (
                      <button
                        key={pp.id}
                        onClick={() => setSelectedProvider(pp.id)}
                        className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all text-left ${
                          selectedProvider === pp.id
                            ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                          selectedProvider === pp.id ? 'bg-[#D4AF37] text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#111111]">{pp.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{pp.description}</p>
                        </div>
                        {selectedProvider === pp.id && (
                          <div className="ml-auto">
                            <Check className="w-5 h-5 text-[#D4AF37]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-100">
                    <button
                      onClick={() => setStep('select_plan')}
                      className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePayNow}
                      className="flex-1 bg-[#D4AF37] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#c9a430] transition-all active:scale-95"
                    >
                      Pay Now &middot; ₦{plan?.price}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                      <h2 className="text-lg font-bold text-[#111111]">Select Plan</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Choose a subscription plan</p>
                    </div>
                    <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 space-y-3">
                    {plans.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPlanId(p.id)}
                        className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all text-left ${
                          selectedPlanId === p.id
                            ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                          selectedPlanId === p.id ? 'bg-[#D4AF37] text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <Crown className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-[#111111]">{p.name}</p>
                            {p.save && <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-bold">{p.save}</span>}
                          </div>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-lg font-black text-[#111111]">₦{p.price}</span>
                            <span className="text-xs text-gray-400">{p.period}</span>
                          </div>
                        </div>
                        {selectedPlanId === p.id && (
                          <div className="w-6 h-6 rounded-full bg-[#D4AF37] flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-100">
                    <button
                      onClick={closeModal}
                      className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleContinueToProvider}
                      disabled={!selectedPlanId}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                        selectedPlanId
                          ? 'bg-[#D4AF37] text-white hover:bg-[#c9a430] active:scale-95'
                          : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
