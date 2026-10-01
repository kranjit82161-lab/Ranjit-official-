import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  Zap,
  Crown,
  Star,
  Shield,
  Film,
  Video,
  Scissors,
  Calendar,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Lock,
  Receipt,
} from 'lucide-react';
import { SubscriptionPlan, SubscriptionPlanId, UserSubscription } from '../types/jarvis.ts';
import { soundEffects } from '../utils/audioEffects.ts';
import { speakJarvis } from '../utils/speech.ts';
import { PaymentCheckoutModal } from './PaymentCheckoutModal.tsx';
import { JarvisPromoShowcase } from './JarvisPromoShowcase.tsx';

interface PlansPricingPanelProps {
  currentPlanId?: SubscriptionPlanId;
  onSelectPlan?: (planId: SubscriptionPlanId) => void;
  speechVoiceLanguage: 'hi-IN' | 'en-IN' | 'en-US';
  onOpenAdminAudit?: () => void;
  userEmail?: string;
  userName?: string;
}

export const JARVIS_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'FREE',
    badge: 'STARTER',
    price: '₹0',
    period: '/month',
    description: 'Jarvis ke basic features test karne ke liye',
    features: [
      'Basic Voice Assistant',
      'Basic AI Chat',
      'Basic Commands (Torch, Battery, Time)',
      'Community Support',
    ],
    popular: false,
    highlightColor: 'border-slate-700 bg-slate-900/80 text-slate-300',
    glowClass: 'shadow-none',
    buttonText: 'Current Plan',
  },
  {
    id: 'pro',
    name: 'PRO',
    badge: 'POPULAR CHOICE',
    price: '₹360',
    period: '/महीना',
    description: 'Regular creators & active users ke liye complete suite',
    features: [
      'Voice Commands (Hindi / English)',
      'Video Editing Assistance (CapCut & InShot)',
      'AI Video Generation',
      'YouTube Upload (Direct API / Intent)',
      'Daily Schedule & Reminders Sync',
      'Phone App Assistance (Call, WhatsApp, Apps)',
    ],
    popular: false,
    highlightColor: 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300',
    glowClass: 'shadow-[0_0_20px_rgba(6,182,212,0.25)]',
    buttonText: 'Upgrade to PRO',
  },
  {
    id: 'creator',
    name: 'CREATOR',
    badge: '⭐ सबसे ज्यादा इस्तेमाल होने वाला',
    price: '₹500',
    period: '/महीना',
    description: 'Pro content creators aur automated channel workflows ke liye best',
    features: [
      'Pro के सभी फीचर शामिल',
      'ज्यादा AI Video Generation (High Quota)',
      'Advanced Video Editing (CapCut 9:16 + Captions)',
      'Daily YouTube Automation (Autopost 6:00 PM)',
      'YouTube + Instagram Workflow',
      'Priority Processing & Faster Responses',
      'Dedicated Autonomous App Bridge Access',
    ],
    popular: true,
    highlightColor: 'border-amber-400/80 bg-gradient-to-b from-amber-950/60 via-slate-900 to-slate-950 text-amber-200',
    glowClass: 'shadow-[0_0_30px_rgba(245,158,11,0.35)]',
    buttonText: 'Get CREATOR Plan',
  },
];

export const PlansPricingPanel: React.FC<PlansPricingPanelProps> = ({
  currentPlanId = 'creator',
  onSelectPlan,
  speechVoiceLanguage,
  onOpenAdminAudit,
  userEmail = 'kranjit82161@gmail.com',
  userName = 'Ranjit Kumar',
}) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId>(currentPlanId);
  const [activatedSuccessMessage, setActivatedSuccessMessage] = useState<string | null>(null);
  const [checkoutModalPlan, setCheckoutModalPlan] = useState<SubscriptionPlan | null>(null);

  const handlePlanClick = (plan: SubscriptionPlan) => {
    soundEffects.playClick();

    // If it's a paid tier (Pro / Creator), initiate PhonePe / UPI Checkout
    if (plan.id === 'pro' || plan.id === 'creator') {
      setCheckoutModalPlan(plan);
      speakJarvis(`${plan.name} plan ke liye secure PhonePe checkout open kar raha hu, Sir.`, {
        lang: speechVoiceLanguage,
      });
      return;
    }

    // Free Plan switch
    setSelectedPlan('free');
    if (onSelectPlan) {
      onSelectPlan('free');
    }
    const confirmMsg = `FREE plan select kiya gaya hai, Sir.`;
    setActivatedSuccessMessage(confirmMsg);
    speakJarvis(confirmMsg, { lang: speechVoiceLanguage });
    soundEffects.playJarvisConfirm();

    setTimeout(() => {
      setActivatedSuccessMessage(null);
    }, 4000);
  };

  const handlePaymentSuccess = (subscription: UserSubscription) => {
    setSelectedPlan(subscription.planId);
    if (onSelectPlan) {
      onSelectPlan(subscription.planId);
    }
    setActivatedSuccessMessage(
      `Payment successful. आपका ${subscription.planName} plan 30 dino ke liye activate ho gaya hai.`
    );
    setCheckoutModalPlan(null);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Banner */}
      <div className="relative p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-cyan-950/60 border border-amber-500/40 glow-arc overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 z-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-cyan-500 flex items-center justify-center text-slate-950 font-black shadow-[0_0_20px_rgba(245,158,11,0.5)]">
            <Crown className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-orbitron font-extrabold text-base sm:text-xl text-white tracking-wide">
                🤖 JARVIS PLANS & PRICING
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-mono-tech">
                OFFICIAL TIERS
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans mt-0.5">
              Apni zaroorat ke anusaar plan chunein: Voice Assistant, Video Editing aur Daily Automations.
            </p>
          </div>
        </div>

        {/* Highlight badge */}
        <div className="z-10 flex items-center gap-2 bg-slate-950/90 px-3.5 py-1.5 rounded-xl border border-amber-400/40 text-amber-300 text-xs font-mono-tech shadow-md">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="font-bold">CREATOR @ ₹500/mo (Most Popular)</span>
        </div>
      </div>

      {/* Activated Success Toast */}
      {activatedSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-between text-xs text-emerald-200 font-mono-tech shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{activatedSuccessMessage}</span>
          </div>
          <span className="text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-400/30">
            ACTIVE
          </span>
        </div>
      )}

      {/* Official Promotional Showcase Poster & Features Banner */}
      <JarvisPromoShowcase
        onExplorePlans={() => {
          // scroll or focus into plans
          const el = document.getElementById('jarvis-plans-selection');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 3 Plans Grid */}
      <div id="jarvis-plans-selection" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {JARVIS_PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-5 border flex flex-col justify-between transition-all duration-300 ${
                plan.highlightColor
              } ${plan.glowClass} ${
                plan.popular ? 'ring-2 ring-amber-400/80 scale-[1.02]' : ''
              }`}
            >
              {/* Popular Star Tag */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-orbitron font-extrabold text-[10px] tracking-wider px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                  <Star className="w-3 h-3 fill-slate-950" />
                  <span>{plan.badge}</span>
                </div>
              )}

              <div>
                {/* Plan Header */}
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-orbitron font-black text-lg text-white">
                    {plan.name}
                  </h4>
                  {!plan.popular && plan.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono-tech">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 mb-4 font-sans min-h-[32px]">
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="mb-4 pb-4 border-b border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="font-orbitron font-extrabold text-3xl text-white">
                      {plan.price}
                    </span>
                    <span className="text-xs text-slate-400 font-mono-tech">
                      {plan.period}
                    </span>
                  </div>
                </div>

                {/* Feature List */}
                <div className="flex flex-col gap-2.5 mb-6">
                  <span className="text-[10px] font-mono-tech uppercase tracking-wider text-slate-400">
                    Features Included:
                  </span>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          plan.popular
                            ? 'bg-amber-500/20 text-amber-400'
                            : plan.id === 'pro'
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span className="leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handlePlanClick(plan)}
                className={`w-full py-2.5 px-4 rounded-xl font-orbitron font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black shadow-[0_0_18px_rgba(245,158,11,0.5)]'
                    : plan.id === 'pro'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <span>{isSelected ? '✓ Plan Selected' : plan.buttonText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Comparison & Details Card */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <h4 className="font-orbitron font-bold text-xs sm:text-sm text-white">
              Plan Comparison & Transparent Guarantees
            </h4>
          </div>

          {onOpenAdminAudit && (
            <button
              onClick={onOpenAdminAudit}
              className="px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 text-[11px] font-mono-tech flex items-center gap-1.5 hover:bg-indigo-900/60 transition-all"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Admin Payment History</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
            <span className="font-bold text-white block mb-1">FREE (₹0)</span>
            <span className="text-[11px] text-slate-400">
              Basic exploration ke liye. Standard local device voice recognition aur simple commands.
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
            <span className="font-bold text-cyan-300 block mb-1">PRO (₹360/mo)</span>
            <span className="text-[11px] text-slate-400">
              Voice commands, video editing workbench, YouTube automated metadata aur phone apps launcher.
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-amber-400/30">
            <span className="font-bold text-amber-300 block mb-1">CREATOR (₹500/mo) ⭐</span>
            <span className="text-[11px] text-slate-400">
              Daily autonomous 6PM YouTube post, CapCut 9:16 Shorts pipeline, Instagram kit aur priority speed.
            </span>
          </div>
        </div>
      </div>

      {/* PhonePe & UPI Payment Checkout Modal */}
      {checkoutModalPlan && (
        <PaymentCheckoutModal
          plan={checkoutModalPlan}
          isOpen={!!checkoutModalPlan}
          onClose={() => setCheckoutModalPlan(null)}
          onPaymentSuccess={handlePaymentSuccess}
          userEmail={userEmail}
          userName={userName}
          speechVoiceLanguage={speechVoiceLanguage}
        />
      )}
    </div>
  );
};
