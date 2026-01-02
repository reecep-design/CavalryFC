import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [registration, setRegistration] = useState<any>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    // Call verify endpoint
    fetch(`${API_URL}/registrations/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'paid') {
          setStatus('success');
          setRegistration(data.registration);
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, [sessionId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 print:bg-white print:p-0">
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 w-full max-w-md print:shadow-none print:border-none print:w-full print:max-w-none">
        {status === 'verifying' && <p className="text-center">Verifying payment...</p>}

        {status === 'success' && (
          <div className="text-left">
            <div className="text-center mb-8 print:hidden">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-900">Registration Confirmed!</h2>
              <p className="text-gray-600">A receipt has been sent to your email.</p>
            </div>

            {/* Printable Receipt Section */}
            {registration && (
              <div className="border-t border-b border-gray-100 py-6 mb-6 namespace-receipt">
                <h3 className="text-lg font-bold text-gray-800 mb-4 uppercase tracking-wider border-b pb-2">Receipt</h3>

                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div className="text-gray-500">Player Name</div>
                  <div className="font-semibold text-right">{registration.playerFirstName} {registration.playerLastName}</div>

                  <div className="text-gray-500">Team</div>
                  <div className="font-semibold text-right">{registration.teamName}</div>

                  <div className="text-gray-500">Parent/Guardian</div>
                  <div className="font-semibold text-right">{registration.guardian1Name}</div>

                  <div className="text-gray-500">Date</div>
                  <div className="font-semibold text-right">{new Date().toLocaleDateString()}</div>

                  <div className="text-gray-500 pt-2 border-t mt-2">Total Paid</div>
                  <div className="font-bold text-xl text-green-600 text-right pt-2 border-t mt-2">
                    ${(registration.amountCents / 100).toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 print:hidden">
              <button
                onClick={handlePrint}
                className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                </svg>
                Print Receipt
              </button>
              <button onClick={() => navigate('/')} className="text-blue-600 font-medium hover:underline py-2">
                Back to Home
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-6">We couldn't verify the payment.</p>
            <button onClick={() => navigate('/')} className="text-blue-600 font-medium hover:underline">
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
