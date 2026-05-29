import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../../components/Header';
import CaseFilters from '../../../components/staff/CaseFilters';
import StatusBadge from '../../../components/staff/StatusBadge';
import { useLang } from '../../../lib/LanguageContext';
import { listCases } from '../../../lib/api';
import type { CaseListItem } from '../../../lib/types';

export default function StaffCaseQueue() {
  const { t, lang } = useLang();
  const [cases, setCases] = useState<CaseListItem[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function fetchCases(status: string) {
    setLoading(true);
    setError('');
    listCases(status || undefined)
      .then(setCases)
      .catch(() => setError(t('submissionFailed')))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchCases(''); }, []);

  function handleFilterChange(status: string) {
    setFilter(status);
    fetchCases(status);
  }

  return (
    <>
      <Head>
        <title>{t('appName')} - {t('staffDashboard')}</title>
      </Head>
      <div className="min-h-screen bg-surface">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('staffDashboard')}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{t('staffNote')}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <CaseFilters selected={filter} onSelect={handleFilterChange} />
            </div>

            {loading && (
              <div className="py-16 text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            )}

            {error && !loading && (
              <div className="p-6 text-center text-red-600 text-sm">{error}</div>
            )}

            {!loading && !error && cases.length === 0 && (
              <div className="p-12 text-center text-gray-500 text-sm">{t('noCasesFound')}</div>
            )}

            {!loading && !error && cases.length > 0 && (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <Th>{t('caseReference')}</Th>
                        <Th>{t('citizen')}</Th>
                        <Th>{t('emiratesId')}</Th>
                        <Th>{t('statusCol')}</Th>
                        <Th>{t('arrearsCol')}</Th>
                        <Th>{t('decisionCol')}</Th>
                        <Th>{t('actionsCol')}</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {cases.map((c) => (
                        <tr key={c.id} className="border-b border-gray-50 hover:bg-surface transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-gray-500">
                            {c.id.split('-')[0].toUpperCase()}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {lang === 'ar' ? c.citizen_name_ar : c.citizen_name_en}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-gray-600">{c.emirates_id}</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={c.status} />
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {c.arrears_amount != null
                              ? `${c.arrears_amount.toLocaleString('en-AE', { minimumFractionDigits: 0 })}`
                              : '—'}
                          </td>
                          <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                            {c.decision_summary ?? (
                              <span className="text-gray-400 italic">{t('noDecision')}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              href={`/staff/cases/${c.id}`}
                              className="text-primary font-semibold hover:underline text-sm"
                            >
                              {t('viewDetails')}
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden divide-y divide-gray-100">
                  {cases.map((c) => (
                    <div key={c.id} className="p-4 flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusBadge status={c.status} />
                          <span className="font-mono text-xs text-gray-400">
                            {c.id.split('-')[0].toUpperCase()}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {lang === 'ar' ? c.citizen_name_ar : c.citizen_name_en}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {c.emirates_id}
                          {c.arrears_amount != null && (
                            <span className="ms-2 font-medium">
                              {t('aed')} {c.arrears_amount.toLocaleString('en-AE')}
                            </span>
                          )}
                        </p>
                      </div>
                      <Link
                        href={`/staff/cases/${c.id}`}
                        className="text-primary font-semibold text-sm flex-shrink-0 hover:underline"
                      >
                        {t('viewDetails')}
                      </Link>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wide">
      {children}
    </th>
  );
}
