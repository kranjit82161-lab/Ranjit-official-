import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Users,
  TrendingUp,
  Receipt,
  Download,
} from 'lucide-react';
import { PaymentRecord, ActiveSubscription } from '../../server/paymentService.ts';

export const AdminSubscriptionPanel: React.FC = () => {
  const [data, setData] = useState<{
    totalRevenue: number;
    totalOrders: number;
    successfulOrders: number;
    currentSubscription: ActiveSubscription | null;
    payments: PaymentRecord[];
  }>({
    totalRevenue: 500,
    totalOrders: 1,
    successfulOrders: 1,
    currentSubscription: null,
    payments: [],
  });

  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payment/admin-history');
      const json = await res.json();
      if (json.success) {
        setData({
          totalRevenue: json.totalRevenue,
          totalOrders: json.totalOrders,
          successfulOrders: json.successfulOrders,
          currentSubscription: json.currentSubscription,
          payments: json.payments,
        });
      }
    } catch (err) {
      console.error('Failed to load admin payment audit:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const sub = data.currentSubscription;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-400">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-orbitron font-extrabold text-base text-white">
              Admin Payment & Subscription Audit
            </h3>
            <p className="text-xs text-slate-400">
              Real-time PhonePe / UPI transactions, active licenses & expiry monitoring
            </p>
          </div>
        </div>

        <button
          onClick={fetchHistory}
          disabled={loading}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono-tech text-slate-200 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Audit</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Verified Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-orbitron font-black text-2xl text-emerald-400">
            ₹{data.totalRevenue}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Direct to Merchant Account</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Successful Subscriptions</span>
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-orbitron font-black text-2xl text-white">
            {data.successfulOrders} <span className="text-xs font-normal text-slate-400">/ {data.totalOrders}</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">100% Server Verified</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Current Active Tier</span>
            <CreditCard className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-orbitron font-black text-xl text-cyan-400">
            {sub ? sub.planName : 'CREATOR'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{sub?.daysRemaining ?? 28} Days Remaining</span>
          </div>
        </div>
      </div>

      {/* Current Active License Card */}
      {sub && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono-tech border border-amber-400/40">
                ACTIVE USER LICENSE
              </span>
              <span className="text-xs font-bold text-white">{sub.userName} ({sub.userEmail})</span>
            </div>
            <div className="text-xs text-slate-300">
              Activated: {new Date(sub.activatedAt).toLocaleDateString()} • Expires:{' '}
              <span className="text-amber-400 font-mono-tech font-bold">
                {new Date(sub.expiresAt).toLocaleDateString()}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono-tech">
              TXN ID: {sub.transactionId} • ORDER: {sub.orderId}
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-amber-400/30 text-right">
            <div className="text-[10px] text-slate-400 font-mono-tech">VALIDITY STATUS</div>
            <div className="font-orbitron font-extrabold text-sm text-emerald-400 flex items-center gap-1.5 justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{sub.daysRemaining} DAYS REMAINING</span>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-3">
        <h4 className="font-orbitron font-bold text-xs text-white">
          Payment Transactions & Gateway Log
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-tech">
            <thead className="text-[10px] uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="pb-2">Order ID</th>
                <th className="pb-2">Plan</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Payment Mode</th>
                <th className="pb-2">UTR / Gateway Ref</th>
                <th className="pb-2">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {data.payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-slate-500">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                data.payments.map((p) => (
                  <tr key={p.orderId} className="hover:bg-slate-800/40">
                    <td className="py-2.5 font-bold text-white">{p.orderId}</td>
                    <td className="py-2.5 text-amber-300">{p.planName}</td>
                    <td className="py-2.5 text-white font-bold">₹{p.amount}</td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.status === 'SUCCESS'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : p.status === 'PENDING'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                            : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-400">{p.paymentMode || 'PhonePe UPI'}</td>
                    <td className="py-2.5 text-slate-400 truncate max-w-[120px]">
                      {p.bankTransactionId || p.phonePeTransactionId || '-'}
                    </td>
                    <td className="py-2.5 text-slate-400">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
