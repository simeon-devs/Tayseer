import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../../components/Header';
import CaseFilters from '../../../components/staff/CaseFilters';
import StatusBadge from '../../../components/staff/StatusBadge';
import { useLang } from '../../../lib/LanguageContext';
import { listCases, getRiskSummary, listCitizenRisks } from '../../../lib/api';
import type { CaseListItem, CitizenRiskProfile, RiskSummary } from '../../../lib/types';

type RiskFilter = 'HIGH' | 'MEDIUM' | 'LOW' | null;

function RiskDot({ level }: { level: 'HIGH' | 'MEDIUM' | 'LOW' | undefined }) {
  if (!level || level === 'LOW') return null;
  const cls = level === 'HIGH'
    ? 'w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0'
    : 'w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0';
  return <span className={cls} title={level} />;
}

function RiskZoneCard({
  label,
  count,
  colorClass,
  pulse,
  active,
  onClick,
}: {
  label: string;
  count: number;
  colorClass: string;
  pulse?: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 min-w-0 rounded-xl border-2 px-4 py-3 text-left transition-all focus:outline-none ${
        active ? 'shadow-md scale-[1.02]' : 'opacity-80 hover:opacity-100'
      } ${colorClass}`}
    >
      <div className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${pulse ? 'animate-pulse' : ''} ${
          active ? 'opacity-100' : 'opacity-70'
        } ${
          colorClass.includes('red') ? 'bg-red-500' :
          colorClass.includes('amber') ? 'bg-amber-400' : 'bg-green-500'
        }`} />
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold mt-1">{count}</p>
    </button>
  );
}

export default function StaffCaseQueue() {
  const { t, lang } = useLang();
  const [cases, setCases] = useState<CaseListItem[]>([]);
  const [filter, setFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [riskSummary, setRiskSummary] = useState<RiskSummary | null>(null);
  const [riskMap, setRiskMap] = useState<Map<string, 'HIGH' | 'MEDIUM' | 'LOW'>>(new Map());
  const [riskLoading, setRiskLoading] = useState(true);

  function fetchCases(status: string) {
    setLoading(true);
    setError('');
    listCases(status || undefined)
      .then(setCases)
      .catch(() => setError(t('submissionFailed')))
      .finally(() => setLoading(false));
  }

  const fetchRiskData = useCallback(() => {
    setRiskLoading(true);
    Promise.all([getRiskSummary(), listCitizenRisks()])
      .then(([summary, profiles]) => {
        setRiskSummary(summary);
        const map = new Map<string, 'HIGH' | 'MEDIUM' | 'LOW'>();
        for (const p of profiles) {
          map.set(p.emirates_id, p.risk_level);
        }
        setRiskMap(map);
      })
      .catch(() => {
        setRiskSummary(null);
        setRiskMap(new Map());
      })
      .finally(() => setRiskLoading(false));
  }, []);

  useEffect(() => {
    fetchCases('');
    fetchRiskData();
  }, [fetchRiskData]);

  function handleFilterChange(status: string) {
    setFilter(status);
    fetchCases(status);
  }

  function handleRiskZoneClick(level: RiskFilter) {
    setRiskFilter(prev => (prev === level ? null : level));
  }

  const visibleCases = riskFilter
    ? cases.filter(c => (riskMap.get(c.emirates_id) ?? 'LOW') === riskFilter)
    : cases;

  const lastAnalysedLabel = riskSummary
    ? new Date(riskSummary.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

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
            <Link href="/staff/analytics" className="btn-secondary text-sm py-2">
              {t('analyticsTitle')}
            </Link>
          </div>

          {/* Risk Intelligence Banner */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
            <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-800">{t('riskBannerTitle')}</span>
                {riskFilter && (
                  <button
                    type="button"
                    onClick={() => setRiskFilter(null)}
                    className="text-xs text-primary underline"
                  >
                    {t('clearRiskFilter')}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                {lastAnalysedLabel && (
                  <span>{t('lastAnalysed')}: {lastAnalysedLabel}</span>
                )}
                <button
                  type="button"
                  onClick={fetchRiskData}
                  disabled={riskLoading}
                  className="text-primary font-semibold hover:underline disabled:opacity-50"
                >
                  {t('refreshRisk')}
                </button>
              </div>
            </div>

            {riskLoading && (
              <div className="flex gap-3">
                {[0, 1, 2].map(i => (
                  <div key={i} className="flex-1 h-16 rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            )}

            {!riskLoading && riskSummary && (
              <div className="flex gap-3">
                <RiskZoneCard
                  label={t('highRiskZone')}
                  count={riskSummary.high_risk_count}
                  colorClass="border-red-200 bg-red-50 text-red-700"
                  pulse
                  active={riskFilter === 'HIGH'}
                  onClick={() => handleRiskZoneClick('HIGH')}
                />
                <RiskZoneCard
                  label={t('mediumRiskZone')}
                  count={riskSummary.medium_risk_count}
                  colorClass="border-amber-200 bg-amber-50 text-amber-700"
                  active={riskFilter === 'MEDIUM'}
                  onClick={() => handleRiskZoneClick('MEDIUM')}
                />
                <RiskZoneCard
                  label={t('safeZone')}
                  count={riskSummary.low_risk_count}
                  colorClass="border-green-200 bg-green-50 text-green-700"
                  active={riskFilter === 'LOW'}
                  onClick={() => handleRiskZoneClick('LOW')}
                />
              </div>
            )}

            {!riskLoading && !riskSummary && (
              <p className="text-xs text-gray-400 py-2">{t('noRiskData')}</p>
            )}
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

            {!loading && !error && visibleCases.length === 0 && (
              <div className="p-12 text-center text-gray-500 text-sm">{t('noCasesFound')}</div>
            )}

            {!loading && !error && visibleCases.length > 0 && (
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
                      {visibleCases.map((c) => (
                        <tr key={c.id} className="border-b border-gray-50 hover:bg-surface transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-gray-500">
                            {c.id.split('-')[0].toUpperCase()}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900">
                            <div className="flex items-center gap-1.5">
                              <RiskDot level={riskMap.get(c.emirates_id)} />
                              {lang === 'ar' ? c.citizen_name_ar : c.citizen_name_en}
                            </div>
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
                  {visibleCases.map((c) => (
                    <div key={c.id} className="p-4 flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusBadge status={c.status} />
                          <span className="font-mono text-xs text-gray-400">
                            {c.id.split('-')[0].toUpperCase()}
                          </span>
                          <RiskDot level={riskMap.get(c.emirates_id)} />
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
