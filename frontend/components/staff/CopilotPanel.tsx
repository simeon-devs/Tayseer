import { useState, useRef, useEffect } from 'react';
import { useLang } from '../../lib/LanguageContext';
import { askCopilot } from '../../lib/api';

interface QAPair {
  question: string;
  answer_en: string;
  answer_ar: string;
}

interface Props {
  caseId: string;
}

export default function CopilotPanel({ caseId }: Props) {
  const { t, lang } = useLang();
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<QAPair[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  async function handleAsk() {
    const q = question.trim();
    if (!q || loading) return;
    setQuestion('');
    setError('');
    setLoading(true);
    try {
      const res = await askCopilot(caseId, q);
      setHistory((h) => [...h, { question: q, answer_en: res.answer_en, answer_ar: res.answer_ar }]);
    } catch {
      setError(t('submissionFailed'));
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-primary bg-opacity-5">
        <div className="flex items-center gap-2">
          <CopilotIcon />
          <div>
            <h2 className="font-bold text-gray-900 text-sm">{t('copilotTitle')}</h2>
            <p className="text-xs text-gray-500">{t('copilotSubtitle')}</p>
          </div>
        </div>
      </div>

      <div className="min-h-36 max-h-80 overflow-y-auto p-4 space-y-4">
        {history.length === 0 && !loading && (
          <p className="text-sm text-gray-400 text-center py-6">{t('copilotSubtitle')}</p>
        )}
        {history.map((item, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-end">
              <div className="bg-primary text-white text-sm rounded-2xl rounded-tr-sm px-4 py-2 max-w-xs">
                {item.question}
              </div>
            </div>
            <div className="flex justify-start">
              <div className="bg-surface text-gray-800 text-sm rounded-2xl rounded-tl-sm px-4 py-2 max-w-sm leading-relaxed">
                {lang === 'ar' ? item.answer_ar || item.answer_en : item.answer_en}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-surface text-gray-500 text-sm rounded-2xl rounded-tl-sm px-4 py-2">
              <span className="animate-pulse">{t('copilotThinking')}</span>
            </div>
          </div>
        )}
        {error && (
          <p className="text-red-600 text-xs text-center">{error}</p>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-gray-100">
        <div className="flex gap-2">
          <textarea
            rows={1}
            className="flex-1 form-input resize-none py-2 text-sm"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('copilotPlaceholder')}
            disabled={loading}
          />
          <button
            onClick={handleAsk}
            disabled={!question.trim() || loading}
            className="btn-primary py-2 px-4 text-sm flex-shrink-0"
          >
            {t('copilotSubmit')}
          </button>
        </div>
      </div>
    </div>
  );
}

function CopilotIcon() {
  return (
    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    </div>
  );
}
