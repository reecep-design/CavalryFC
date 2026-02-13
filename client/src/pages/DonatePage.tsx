import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function DonatePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const canceled = searchParams.get('canceled');

  // If session_id is present, show success view
  if (sessionId) {
    return <DonateSuccess sessionId={sessionId} />;
  }

  return <DonateForm canceled={canceled === 'true'} />;
}

function DonateForm({ canceled }: { canceled: boolean }) {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const dollars = parseFloat(amount);
    if (isNaN(dollars) || dollars < 1) {
      setError('Please enter a valid amount ($1.00 minimum).');
      return;
    }

    const amountCents = Math.round(dollars * 100);

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/donations/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountCents,
          donorName: donorName || undefined,
          donorEmail: donorEmail || undefined,
          comment: comment || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        setSubmitting(false);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch {
      setError('Failed to connect to server.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Decorative Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-amber-100/40 blur-3xl"></div>
        <div className="absolute top-[20%] -left-[10%] w-[400px] h-[400px] rounded-full bg-blue-50/60 blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-4 sm:px-6 py-16">
        {/* Back link */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-700 text-sm font-medium mb-8 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          Back to Home
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-blue-900 tracking-tight">
            Support Cavalry FC
          </h1>
          <p className="mt-3 text-slate-500 text-base">
            Your donation helps fund equipment, uniforms, and field costs for our youth players.
          </p>
        </div>

        {canceled && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm font-medium">
            Donation was canceled. Feel free to try again.
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
          {/* Amount */}
          <div>
            <label className="block text-sm font-bold text-blue-900 mb-2">
              Donation Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</span>
              <input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="25.00"
                required
                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-lg font-semibold text-blue-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              />
            </div>
            {/* Preset amounts */}
            <div className="flex gap-2 mt-3">
              {[10, 25, 50, 100].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.toString())}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold border transition-all ${
                    amount === preset.toString()
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-gray-50 text-slate-600 border-gray-200 hover:border-amber-300 hover:bg-amber-50'
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-blue-900 mb-2">
              Your Name <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="John Smith"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-blue-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-blue-900 mb-2">
              Email <span className="text-slate-400 font-normal">(optional, for receipt)</span>
            </label>
            <input
              type="email"
              value={donorEmail}
              onChange={(e) => setDonorEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-blue-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-bold text-blue-900 mb-2">
              Message <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Go Cavalry!"
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-blue-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
          >
            {submitting ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                Donate{amount ? ` $${parseFloat(amount).toFixed(2)}` : ''}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function DonateSuccess({ sessionId }: { sessionId: string }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [donation, setDonation] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`${API_URL}/donations/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        const data = await res.json();
        if (data.status === 'paid' && data.donation) {
          setDonation(data.donation);
        } else {
          setError('Payment could not be verified. Please contact us if you were charged.');
        }
      } catch {
        setError('Failed to verify payment. Please contact us.');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [sessionId]);

  const formatAmount = (cents: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-blue-900 font-medium animate-pulse">
        Verifying your donation...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-emerald-100/40 blur-3xl"></div>
        <div className="absolute top-[20%] -left-[10%] w-[400px] h-[400px] rounded-full bg-blue-50/60 blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          {error ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>
              </div>
              <h2 className="text-2xl font-black text-blue-900 mb-3">Verification Issue</h2>
              <p className="text-slate-500 mb-6">{error}</p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h2 className="text-2xl font-black text-blue-900 mb-3">Thank You!</h2>
              <p className="text-slate-500 mb-6">
                Your generous donation of{' '}
                <span className="font-bold text-emerald-600">{formatAmount(donation.amountCents)}</span>{' '}
                has been received.
              </p>
              {donation.donorName && (
                <p className="text-slate-500 text-sm mb-1">
                  From: <span className="font-semibold text-blue-900">{donation.donorName}</span>
                </p>
              )}
              {donation.comment && (
                <p className="text-slate-400 text-sm italic mb-4">"{donation.comment}"</p>
              )}
              <p className="text-slate-400 text-sm">
                Your support helps our youth soccer players thrive. Thank you for being part of the Cavalry FC family!
              </p>
            </>
          )}

          <button
            onClick={() => navigate('/')}
            className="mt-8 inline-flex items-center gap-2 bg-blue-800 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
