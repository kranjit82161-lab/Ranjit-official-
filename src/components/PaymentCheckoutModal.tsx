import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Smartphone,
  QrCode,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Lock,
  RefreshCw,
  Copy,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { SubscriptionPlan, UserSubscription, PaymentOrder } from '../types/jarvis.ts';
import { soundEffects } from '../utils/audioEffects.ts';
import { speakJarvis } from '../utils/speech.ts';

interface PaymentCheckoutModalProps {
  plan: SubscriptionPlan;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (subscription: UserSubscription) => void;
  userEmail?: string;
  userName?: string;
  speechVoiceLanguage: 'hi-IN' | 'en-IN' | 'en-US';
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  plan,
  isOpen,
  onClose,
  onPaymentSuccess,
  userEmail = 'kranjit82161@gmail.com',
  userName = 'Valued User',
  speechVoiceLanguage,
}) => {
  const [step, setStep] = useState<'create' | 'pay' | 'verifying' | 'success' | 'failed'>('create');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [upiIntentUrl, setUpiIntentUrl] = useState<string>('');
  const [phonePeUrl, setPhonePeUrl] = useState<string>('');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(600); // 10 minutes session

  const amountNumber = plan.id === 'creator' ? 500 : 360;

  // Initialize payment order
  const handleInitiateOrder = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          planName: plan.name,
          amount: amountNumber,
          userEmail,
          userName,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to initialize checkout');
      }

      setOrder(data.order);
      setUpiIntentUrl(data.order.upiIntentUrl);
      setPhonePeUrl(data.order.phonePeCheckoutUrl || data.order.upiIntentUrl);
      setStep('pay');
      soundEffects.playJarvisConfirm();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Payment server offline. Please retry.');
      setStep('failed');
      soundEffects.playActionFail();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setStep('create');
      setErrorMessage(null);
      setUtrNumber('');
      setTimerSeconds(600);
      handleInitiateOrder();
    }
  }, [isOpen, plan.id]);

  // Session timer countdown
  useEffect(() => {
    if (step !== 'pay') return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setStep('failed');
          setErrorMessage('Payment session expired. Please restart checkout.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  // Verify Payment Status on Server
  const handleVerifyPayment = async () => {
    if (!order) return;
    setLoading(true);
    setStep('verifying');
    setErrorMessage(null);
    soundEffects.playClick();

    try {
      const res = await fetch('/api/payment/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.orderId,
          transactionRef: utrNumber.trim() || `UTR_${Date.now()}`,
          paymentMode: 'PHONEPE_UPI_CHECKOUT',
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.status === 'SUCCESS') {
        setStep('success');
        soundEffects.playActionSuccess();
        const successMsg = 'Payment successful. आपका plan activate हो गया है।';
        speakJarvis(successMsg, { lang: speechVoiceLanguage });
        onPaymentSuccess(data.subscription);
      } else {
        setStep('failed');
        const reason = data.message || 'Payment verification failed. Bank Gateway ne confirm nahi kiya.';
        setErrorMessage(reason);
        soundEffects.playActionFail();
      }
    } catch (err: any) {
      setStep('failed');
      setErrorMessage(err?.message || 'Server-side payment verification timeout.');
      soundEffects.playActionFail();
    } finally {
      setLoading(false);
    }
  };

  const copyUpiLink = () => {
    if (upiIntentUrl) {
      navigator.clipboard.writeText(upiIntentUrl);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col overflow-hidden">
        
        {/* Header HUD */}
        <div className="p-4 bg-gradient-to-r from-purple-950/60 via-slate-900 to-amber-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-amber-500 flex items-center justify-center text-white font-bold shadow-md">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-orbitron font-extrabold text-sm text-white">
                  PhonePe & UPI Checkout
                </h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono-tech border border-purple-500/30">
                  SECURE 256-BIT
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Official Gateway • Server-Side Verification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-all"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col gap-4">

          {/* Plan Summary Card */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-mono-tech uppercase">Selected Plan</span>
              <div className="font-orbitron font-bold text-base text-amber-300 flex items-center gap-1.5">
                <span>{plan.name}</span>
                <span className="text-xs text-slate-400 font-normal font-sans">/ 30 Days</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-mono-tech uppercase">Amount Payable</span>
              <div className="font-orbitron font-extrabold text-xl text-white">
                ₹{amountNumber}
              </div>
            </div>
          </div>

          {/* Step 1: Loading / Order Creation */}
          {loading && step === 'create' && (
            <div className="py-10 flex flex-col items-center justify-center gap-3 text-slate-300">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
              <span className="text-xs font-mono-tech">Connecting to PhonePe / UPI Payment Node...</span>
            </div>
          )}

          {/* Step 2: Payment Options & QR */}
          {step === 'pay' && order && (
            <div className="flex flex-col gap-4">
              {/* Timer Bar */}
              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono-tech">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Session Expiry:</span>
                </div>
                <span className="text-amber-400 font-bold">{formatTimer(timerSeconds)}</span>
              </div>

              {/* Direct App Launchers */}
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={phonePeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white flex flex-col items-center justify-center text-center gap-1 shadow-lg active:scale-95 transition-all"
                >
                  <Smartphone className="w-5 h-5" />
                  <span className="text-xs font-bold font-sans">Pay via PhonePe</span>
                  <span className="text-[10px] opacity-80">Instant App Open</span>
                </a>

                <a
                  href={upiIntentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white flex flex-col items-center justify-center text-center gap-1 shadow-lg active:scale-95 transition-all"
                >
                  <QrCode className="w-5 h-5" />
                  <span className="text-xs font-bold font-sans">Any UPI App</span>
                  <span className="text-[10px] opacity-80">GPay, Paytm, BHIM</span>
                </a>
              </div>

              {/* UPI Deep-link copy */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex flex-col overflow-hidden mr-2">
                  <span className="text-[10px] text-slate-400 font-mono-tech">ORDER ID:</span>
                  <span className="font-mono-tech text-slate-200 truncate">{order.orderId}</span>
                </div>
                <button
                  onClick={copyUpiLink}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 text-[11px] font-mono-tech"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedUpi ? 'Copied' : 'Copy UPI'}</span>
                </button>
              </div>

              {/* UTR / Transaction Reference Input for Server Verification */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono-tech text-slate-300 flex items-center justify-between">
                  <span>Enter UPI Ref / UTR / Transaction ID (from App):</span>
                  <span className="text-amber-400 text-[10px]">Verification Required</span>
                </label>
                <input
                  type="text"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="e.g. 428901238491 or PhonePe TXN ID"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono-tech focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Verification Button */}
              <button
                onClick={handleVerifyPayment}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-orbitron font-extrabold text-xs tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <span>Verify Payment & Activate Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Strict verification: Fake screenshots or unpaid attempts will be rejected.</span>
              </div>
            </div>
          )}

          {/* Step 3: Verifying */}
          {step === 'verifying' && (
            <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
              <RefreshCw className="w-10 h-10 text-amber-400 animate-spin" />
              <div className="font-orbitron font-bold text-sm text-white">
                Verifying Transaction With Bank Gateway...
              </div>
              <p className="text-xs text-slate-400 max-w-xs">
                Checking PhonePe server-side logs and bank UTR reconciliation.
              </p>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="py-6 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="font-orbitron font-black text-base text-white">
                Payment Successful!
              </div>
              <p className="text-xs text-emerald-300 font-sans font-medium px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30">
                “Payment successful. आपका plan activate हो गया है।”
              </p>
              <div className="text-xs text-slate-300 font-mono-tech mt-2">
                Plan: <span className="text-amber-300 font-bold">{plan.name}</span> (30 Days Validity)
              </div>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-orbitron font-bold text-xs"
              >
                Start Using {plan.name}
              </button>
            </div>
          )}

          {/* Step 5: Failed */}
          {step === 'failed' && (
            <div className="py-6 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
                <XCircle className="w-8 h-8" />
              </div>
              <div className="font-orbitron font-bold text-sm text-white">
                Payment Verification Pending or Failed
              </div>
              <p className="text-xs text-rose-300 px-3 py-2 rounded-lg bg-rose-950/50 border border-rose-500/30">
                {errorMessage || 'Bank Gateway ne payment confirm nahi kiya. Plan activate nahi hua.'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={handleInitiateOrder}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono-tech"
                >
                  Retry Payment
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-mono-tech"
                >
                  Close
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
