import { useState } from 'react';
import { acceptProposal } from '../../lib/api';

interface Props {
  caseId: string;
  extensionMonths: number;
  extensionAmount: number;
  lang: 'en' | 'ar';
  onAccepted: () => void;
}

function defaultStartDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
}

export default function ProposedPlanPanel({ caseId, extensionMonths, extensionAmount, lang, onAccepted }: Props) {
  const [editMode, setEditMode] = useState(false);
  const [months, setMonths] = useState(extensionMonths);
  const [amount, setAmount] = useState(extensionAmount);
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  async function handleAccept() {
    setLoading(true);
    setError('');
    try {
      const result = await acceptProposal(caseId, months, amount, startDate);
      setSuccess(result.message);
      onAccepted();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to accept proposal');
    } finally {
      setLoading(false);
    }
  }

  const label = (en: string, ar: string) => lang === 'ar' ? ar : en;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-5">
      <h2 className="font-bold text-amber-900 text-base">
        {label('Proposed Repayment Plan', 'خطة السداد المقترحة')}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">
            {label('Proposed Duration (months)', 'المدة المقترحة (شهراً)')}
          </label>
          {editMode ? (
            <input
              type="number"
              min={1}
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          ) : (
            <p className="text-lg font-bold text-gray-900">{months} {label('months', 'شهراً')}</p>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">
            {label('Proposed Monthly Amount (AED)', 'المبلغ الشهري المقترح (درهم)')}
          </label>
          {editMode ? (
            <input
              type="number"
              min={1}
              step={0.01}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          ) : (
            <p className="text-lg font-bold text-gray-900">
              AED {amount.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-1">
          {label('Proposed Start Date', 'تاريخ البدء المقترح')}
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border border-amber-300 rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {success ? (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700 font-medium">
          {success}
        </div>
      ) : (
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleAccept}
            disabled={loading}
            className="bg-[#8E702E] hover:bg-[#7a5f27] text-white font-bold text-sm py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? label('Processing…', 'جارٍ المعالجة…') : label('Accept Proposed Plan', 'قبول الخطة المقترحة')}
          </button>
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="border border-amber-400 text-amber-800 hover:bg-amber-100 font-semibold text-sm py-2.5 px-6 rounded-lg transition-colors"
            >
              {label('Edit Plan', 'تعديل الخطة')}
            </button>
          )}
          {editMode && (
            <button
              onClick={() => setEditMode(false)}
              className="border border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold text-sm py-2.5 px-6 rounded-lg transition-colors"
            >
              {label('Cancel Edit', 'إلغاء التعديل')}
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}
