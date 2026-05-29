import { useState } from 'react';
import { useLang } from '../../lib/LanguageContext';
import { overrideCase } from '../../lib/api';
import type { CaseDetailResponse } from '../../lib/types';

interface Props {
  caseId: string;
  currentAmount?: number;
  currentDuration?: number;
  onClose: () => void;
  onSuccess: (updated: CaseDetailResponse) => void;
}

export default function OverrideModal({
  caseId,
  currentAmount,
  currentDuration,
  onClose,
  onSuccess,
}: Props) {
  const { t } = useLang();
  const [staffId, setStaffId] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [justification, setJustification] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const charCount = justification.length;
  const charOk = charCount >= 20;

  async function handleSubmit() {
    setError('');
    if (!staffId.trim()) { setError(t('fieldRequired') + ': ' + t('staffId')); return; }
    if (!charOk) { setError(t('justificationHint')); return; }

    setLoading(true);
    try {
      const result = await overrideCase(caseId, {
        staff_id: staffId.trim(),
        new_amount: newAmount ? Number(newAmount) : undefined,
        new_duration: newDuration ? Number(newDuration) : undefined,
        justification: justification.trim(),
      });
      onSuccess(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('overrideFailed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{t('overrideTitle')}</h2>
              <p className="text-sm text-gray-500 mt-1">{t('overrideSubtitle')}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none mt-0.5">
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="form-label">{t('staffId')} *</label>
            <input
              type="text"
              className="form-input"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              placeholder="STAFF-001"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">
                {t('newAmount')}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="form-input"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder={currentAmount ? String(currentAmount) : '0.00'}
              />
              <p className="text-xs text-gray-400 mt-1">{t('overrideOptional')}</p>
            </div>
            <div>
              <label className="form-label">
                {t('newDuration')}
              </label>
              <input
                type="number"
                min="1"
                step="1"
                className="form-input"
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
                placeholder={currentDuration ? String(currentDuration) : ''}
              />
              <p className="text-xs text-gray-400 mt-1">{t('overrideOptional')}</p>
            </div>
          </div>

          <div>
            <label className="form-label">{t('justificationLabel')} *</label>
            <textarea
              rows={3}
              className="form-input resize-none"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder={t('justificationHint')}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-400">{t('justificationHint')}</span>
              <span className={`text-xs font-medium ${charOk ? 'text-approved' : 'text-gray-400'}`}>
                {charCount}/20
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="p-6 pt-0 flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="btn-secondary">
            {t('cancelBtn')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !charOk}
            className="btn-primary"
          >
            {loading ? '...' : t('confirmOverride')}
          </button>
        </div>
      </div>
    </div>
  );
}
