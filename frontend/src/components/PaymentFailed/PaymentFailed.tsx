import { XCircle, Bus as BusIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PaymentFailed() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 max-w-xl w-full p-10 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Payment Failed</h1>
        <p className="text-slate-600 mb-8">
          Your payment was not completed. You can try again or choose another bus.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/passenger')}
            className="px-6 py-3 bg-[#264b8d] text-white rounded-xl font-semibold hover:bg-[#1e3a6d]"
          >
            Back to Search
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-white border-2 border-[#264b8d] text-[#264b8d] rounded-xl font-semibold hover:bg-[#264b8d]/5"
          >
            Go to Dashboard
          </button>
        </div>
        <div className="mt-8 flex items-center justify-center gap-2 text-slate-500">
          <BusIcon className="w-5 h-5" />
          <span>QuickSeat Support is here if you need help.</span>
        </div>
      </div>
    </div>
  );
}
