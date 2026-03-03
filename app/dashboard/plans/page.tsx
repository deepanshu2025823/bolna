// app/dashboard/plans/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';

export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch('/api/admin/plans'); 
        const data = await res.json();
        if (data.success) {
          setPlans(data.data);
        }
      } catch (error) {
        console.error('Failed to load plans');
      }
      setIsLoading(false);
    };
    fetchPlans();
  }, []);

  const handlePayment = async (plan: any) => {
    setProcessingId(plan.id);
    try {
      const res = await fetch('/api/user/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: plan.price })
      });
      const orderData = await res.json();

      if (!orderData.success) {
        alert('Failed to initialize payment.');
        setProcessingId(null);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_SMPZWp9Km7zQyf', 
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'AI Portal Pro',
        description: `Purchase ${plan.name} Plan ${isAutoPlayEnabled ? '(Auto-Renewing)' : ''}`,
        order_id: orderData.order.id,
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/user/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              minutesToAdd: plan.allocated_credits,
              planName: plan.name
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            alert(`Success! ${plan.allocated_credits} Minutes added to your wallet.`);
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
      rzp.on('payment.failed', function (response: any) {
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
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Simple, Transparent Pricing</h2>
        <p className="text-slate-500 mt-3 font-medium text-lg">Top up your wallet with minutes to execute AI calls. No hidden fees.</p>
        
        <div className="mt-8 flex items-center justify-center">
          <div className="flex items-center space-x-3 bg-white px-5 py-2.5 rounded-full shadow-sm border border-gray-200">
            <span className={`text-sm font-bold ${!isAutoPlayEnabled ? 'text-slate-900' : 'text-slate-400'}`}>Pay Once</span>
            <button 
              onClick={() => setIsAutoPlayEnabled(!isAutoPlayEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isAutoPlayEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAutoPlayEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className={`text-sm font-bold flex items-center ${isAutoPlayEnabled ? 'text-slate-900' : 'text-slate-400'}`}>
              Auto-pay (Monthly)
              <span className="ml-2 bg-emerald-100 text-emerald-700 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md font-extrabold">Save 10%</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 pt-6">
        {plans.map((plan, i) => {
          const isThisProcessing = processingId === plan.id;
          const isAnyProcessing = processingId !== null;
          
          const displayPrice = isAutoPlayEnabled ? (plan.price * 0.9).toFixed(2) : plan.price;

          return (
            <div key={plan.id} className={`bg-white rounded-3xl p-8 border transition-all duration-300 relative flex flex-col ${i === 1 ? 'border-blue-500 shadow-2xl shadow-blue-500/20 scale-105 z-10' : 'border-gray-200 shadow-lg hover:shadow-xl hover:-translate-y-1'}`}>
              {i === 1 && (
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-extrabold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-sm flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    Recommended
                  </span>
                </div>
              )}
              
              <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
              <div className="mt-4 flex items-end">
                <span className="text-4xl font-extrabold text-slate-900"><span className="text-3xl mr-1 text-slate-400">$</span>{displayPrice}</span>
                <span className="text-slate-500 font-medium ml-2 mb-1">/ month</span>
              </div>
              
              {isAutoPlayEnabled && (
                <p className="text-emerald-600 text-xs font-bold mt-2">Billed monthly (Cancel anytime)</p>
              )}
              {!isAutoPlayEnabled && (
                <p className="text-slate-500 text-xs font-medium mt-2">Billed once</p>
              )}

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
                {isThisProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  isAutoPlayEnabled ? `Subscribe for $${displayPrice}` : `Buy ${plan.allocated_credits} Minutes`
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}