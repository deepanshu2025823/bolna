// app/dashboard/plans/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';

export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const [topupMinutes, setTopupMinutes] = useState<number>(1000);
  const [selectedRatePlanId, setSelectedRatePlanId] = useState<string>('');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch('/api/admin/plans'); 
        const data = await res.json();
        if (data.success) {
          setPlans(data.data);
          if (data.data.length > 0) {
            setSelectedRatePlanId(data.data[0].id.toString());
          }
        }
      } catch (error) {
        console.error('Failed to load plans');
      }
      setIsLoading(false);
    };
    fetchPlans();
  }, []);

  const selectedRatePlan = plans.find(p => p.id.toString() === selectedRatePlanId) || plans[0];
  const perMinuteRate = selectedRatePlan ? (selectedRatePlan.price / selectedRatePlan.allocated_credits) : 0;
  const topupCost = (topupMinutes * perMinuteRate).toFixed(2);

  const handlePayment = async (plan: any, isTopup: boolean = false, customAmount?: string, customMinutes?: number) => {
    const targetId = isTopup ? 'topup' : plan.id;
    setProcessingId(targetId as any);
    
    const amountToCharge = isTopup ? Number(customAmount) : plan.price;
    const minutesToGive = isTopup ? customMinutes : plan.allocated_credits;
    const planLabel = isTopup ? `Top-up (${plan.name} Rate)` : plan.name;

    try {
      const res = await fetch('/api/user/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: amountToCharge, 
          planName: planLabel,
          minutesToAdd: minutesToGive,
          isTopup: isTopup
        }) 
      });
      const orderData = await res.json();

      if (!orderData.success) {
        alert('Failed to initialize payment: ' + (orderData.message || 'Error'));
        setProcessingId(null);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_SMPZWp9Km7zQyf', 
        name: 'AI Portal Pro',
        description: isTopup ? `Purchase ${minutesToGive} Additional Minutes` : `Subscribe to ${plan.name} Plan (Monthly)`, 
        subscription_id: !isTopup ? orderData.subscription?.id : undefined, // Backend should adapt to send order_id if topup
        order_id: isTopup ? orderData.order?.id : undefined,
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/user/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_subscription_id: response.razorpay_subscription_id, 
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              minutesToAdd: minutesToGive,
              planName: planLabel,
              isTopup: isTopup
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            alert(`Success! ${minutesToGive} Minutes instantly added to your wallet.`);
            window.location.href = '/dashboard';
          } else {
            alert('Payment verification failed.');
            setProcessingId(null);
          }
        },
        modal: {
          ondismiss: function() {
            setProcessingId(null);
          }
        },
        theme: { color: '#2563eb' }
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on('payment.failed', async function (response: any) {
        alert(`Payment Failed: ${response.error.description}`);
        setProcessingId(null);
      });
      
      rzp.open();

    } catch (error) {
      console.error('Payment error', error);
      alert('Something went wrong. Please try again.');
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><svg className="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>;
  }

  return (
    <div className="space-y-10 animate-fade-in max-w-6xl mx-auto pb-10">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Monthly Subscriptions</h2>
        <p className="text-slate-500 mt-3 font-medium text-lg">Choose a base monthly plan to get your allocated minutes.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 pt-2">
        {plans.map((plan, i) => {
          const isThisProcessing = processingId === plan.id;
          const isAnyProcessing = processingId !== null;
          const displayPrice = Number(plan.price).toFixed(2);

          return (
            <div key={plan.id} className={`bg-white rounded-3xl p-8 border transition-all duration-300 relative flex flex-col ${i === 1 ? 'border-blue-500 shadow-2xl shadow-blue-500/20 scale-105 z-10' : 'border-gray-200 shadow-lg hover:shadow-xl hover:-translate-y-1'}`}>
              {i === 1 && (
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-extrabold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-sm flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.29a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    Recommended
                  </span>
                </div>
              )}
              
              <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
              <div className="mt-4 flex items-end">
                <span className="text-4xl font-extrabold text-slate-900"><span className="text-3xl mr-1 text-slate-400">$</span>{displayPrice}</span>
                <span className="text-slate-500 font-medium ml-2 mb-1">/ month</span>
              </div>
              
              <p className="text-emerald-600 text-xs font-bold mt-2">Billed monthly</p>

              <ul className="mt-8 space-y-4 flex-1">
                <li className="flex items-center text-slate-800 font-bold">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3 shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  {plan.allocated_credits} AI Minutes
                </li>
                
                {plan.features && plan.features.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start text-slate-600 font-medium">
                    <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => handlePayment(plan)}
                disabled={isAnyProcessing}
                className={`mt-8 w-full py-4 rounded-xl font-bold text-sm transition-all ${
                  i === 1 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/30' 
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                } disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center`}
              >
                {isThisProcessing ? 'Processing...' : `Subscribe for $${displayPrice}`}
              </button>
            </div>
          );
        })}
      </div>

      {plans.length > 0 && (
        <div className="mt-12 bg-white rounded-3xl p-8 border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Need Additional Minutes?</h3>
              <p className="text-slate-500 text-sm">Exhausted your monthly limit? Top up instantly based on your current base plan rate.</p>
            </div>
            <div className="bg-slate-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-slate-600">
              Current Rate: <span className="text-blue-600 font-bold">${perMinuteRate.toFixed(4)} / min</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-end">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Select Your Base Plan</label>
              <select
                className="w-full px-4 py-3.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-800 cursor-pointer"
                value={selectedRatePlanId}
                onChange={(e) => setSelectedRatePlanId(e.target.value)}
              >
                {plans.map(p => (
                  <option key={p.id} value={p.id}>{p.name} Tier</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Minutes Required</label>
              <div className="relative">
                <input
                  type="number"
                  min="100"
                  step="100"
                  className="w-full pl-4 pr-16 py-3.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-extrabold text-emerald-600 text-lg"
                  value={topupMinutes}
                  onChange={(e) => setTopupMinutes(Number(e.target.value))}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">MINS</span>
              </div>
            </div>

            <div className="flex flex-col">
              <button 
                onClick={() => handlePayment(selectedRatePlan, true, topupCost, topupMinutes)}
                disabled={processingId !== null || topupMinutes <= 0}
                className="w-full bg-slate-900 text-white h-[52px] rounded-xl font-bold shadow-md hover:bg-slate-800 transition-colors disabled:opacity-50 flex justify-center items-center"
              >
                {processingId === 'topup' as any ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  `Pay $${topupCost}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}