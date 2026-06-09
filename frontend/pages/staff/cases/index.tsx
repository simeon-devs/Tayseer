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
  const { t, lang, isRtl } = useLang();
  const [allCases, setAllCases] = useState<CaseListItem[]>([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Sorting states
  const [sortField, setSortField] = useState<'created_at' | 'arrears_amount' | 'citizen_name'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  function fetchCases() {
    setLoading(true);
    setError('');
    // Fetch all cases to do instant client-side filtering, sorting, counting, and pagination
    listCases('')
      .then((data) => {
        setAllCases(data);
        setLastUpdated(new Date());
      })
      .catch(() => setError(t('submissionFailed')))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchCases();
  }, []);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search]);

  // Handle status filter change
  function handleFilterChange(status: string) {
    setFilter(status);
  }

  // Calculate live counts from allCases
  const counts = {
    all: allCases.length,
    pending: allCases.filter((c) => c.status === 'pending').length,
    processing: allCases.filter((c) => c.status === 'processing').length,
    approved: allCases.filter((c) => c.status === 'approved').length,
    escalated: allCases.filter((c) => c.status === 'escalated').length,
    overridden: allCases.filter((c) => c.status === 'overridden').length,
    closed: allCases.filter((c) => c.status === 'closed').length,
  };

  // Filter cases in memory
  const filteredCases = allCases.filter((c) => {
    const matchesStatus = filter === '' ? true : c.status === filter;
    
    const searchLower = search.toLowerCase();
    const matchesSearch = search === '' ? true : (
      c.id.toLowerCase().includes(searchLower) ||
      c.emirates_id.includes(searchLower) ||
      c.citizen_name_en.toLowerCase().includes(searchLower) ||
      c.citizen_name_ar.includes(searchLower)
    );
    
    return matchesStatus && matchesSearch;
  });

  // Sort filtered cases
  const sortedCases = [...filteredCases].sort((a, b) => {
    let aVal: any = '';
    let bVal: any = '';

    if (sortField === 'citizen_name') {
      aVal = lang === 'ar' ? a.citizen_name_ar : a.citizen_name_en;
      bVal = lang === 'ar' ? b.citizen_name_ar : b.citizen_name_en;
    } else if (sortField === 'arrears_amount') {
      aVal = a.arrears_amount ?? 0;
      bVal = b.arrears_amount ?? 0;
    } else {
      aVal = a.created_at ?? '';
      bVal = b.created_at ?? '';
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate sorted cases
  const totalItems = sortedCases.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedCases = sortedCases.slice(startIndex, endIndex);

  // Toggle sort field or direction
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // Default to descending
    }
  };

  // Format last updated time
  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString(lang === 'ar' ? 'ar-AE' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Determine dynamic risk metric counts
  const highRiskCount = allCases.filter((c) => c.status === 'escalated').length;
  const mediumRiskCount = allCases.filter((c) => c.status === 'pending' || c.status === 'processing').length;
  const safeZoneCount = allCases.filter((c) => c.status === 'approved' || c.status === 'overridden').length;

  return (
    <>
      <Head>
        <title>{t('appName')} - {t('staffDashboard')}</title>
      </Head>
      <div className="min-h-screen bg-slate-50/50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          
          {/* Header section */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-950 font-arabic-safe">
                {t('staffDashboard')}
              </h1>
              <p className="text-sm font-medium text-gray-500 mt-1">
                {t('tagline')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                href="/staff/analytics" 
                className="inline-flex items-center gap-2 bg-gold text-white font-semibold text-sm py-2.5 px-5 rounded-xl hover:bg-gold-dark shadow-sm hover:shadow transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
                {t('analyticsTitle')}
              </Link>
            </div>
          </div>

          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {/* High Risk Card */}
            <div className="bg-white rounded-2xl border-s-4 border-red-600 shadow-sm border border-gray-200/50 p-6 relative overflow-hidden flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="space-y-1">
                <span className="text-xs font-bold text-red-600 tracking-wider uppercase">{t('highRisk')}</span>
                <p className="text-4xl font-black text-gray-900 leading-tight">{highRiskCount}</p>
                <p className="text-xs font-semibold text-gray-400">{t('highRiskDesc')}</p>
              </div>
              <div className="text-red-100 opacity-80 absolute right-4 bottom-4 rtl:left-4 rtl:right-auto pointer-events-none">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            {/* Medium Risk Card */}
            <div className="bg-white rounded-2xl border-s-4 border-amber-500 shadow-sm border border-gray-200/50 p-6 relative overflow-hidden flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-600 tracking-wider uppercase">{t('mediumRisk')}</span>
                <p className="text-4xl font-black text-gray-900 leading-tight">{mediumRiskCount}</p>
                <p className="text-xs font-semibold text-gray-400">{t('mediumRiskDesc')}</p>
              </div>
              <div className="text-amber-100 opacity-80 absolute right-4 bottom-4 rtl:left-4 rtl:right-auto pointer-events-none">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
              </div>
            </div>

            {/* Safe Zone Card */}
            <div className="bg-white rounded-2xl border-s-4 border-emerald-500 shadow-sm border border-gray-200/50 p-6 relative overflow-hidden flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase">{t('safeZone')}</span>
                <p className="text-4xl font-black text-gray-900 leading-tight">{safeZoneCount}</p>
                <p className="text-xs font-semibold text-gray-400">{t('safeZoneDesc')}</p>
              </div>
              <div className="text-emerald-100 opacity-80 absolute right-4 bottom-4 rtl:left-4 rtl:right-auto pointer-events-none">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Main Card with filters and queue table */}
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden mb-12">
            
            {/* Filters Header Section */}
            <div className="p-5 border-b border-gray-200/60 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gray-50/20">
              <div className="w-full md:w-auto">
                <CaseFilters selected={filter} onSelect={handleFilterChange} counts={counts} />
              </div>
              
              {/* Last Updated Timestamp & Refresh */}
              <div className="flex items-center gap-3 self-end md:self-center text-xs text-gray-500 font-medium">
                {lastUpdated && (
                  <span>
                    {t('lastAnalyzed')}: {formatTime(lastUpdated)}
                  </span>
                )}
                <button
                  onClick={fetchCases}
                  disabled={loading}
                  className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 bg-white shadow-sm flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                  aria-label="Refresh Case Queue"
                >
                  <svg 
                    className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth={2.2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" />
                  </svg>
                  <span>{t('refreshBtn')}</span>
                </button>
              </div>
            </div>

            {/* Search, Sort, and Heading Sub-header */}
            <div className="px-6 py-5 border-b border-gray-100/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 font-arabic-safe">
                  {t('allCases')}
                </h2>
                <p className="text-xs font-semibold text-gray-400 mt-0.5">
                  {t('staffNote')}
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {/* Search reference */}
                <div className="relative flex-1 sm:flex-initial sm:min-w-[280px]">
                  <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-gray-400 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0x" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('searchPlaceholder')}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all bg-white placeholder-gray-400/80 rtl:pl-4 rtl:pr-9"
                  />
                </div>

                {/* Sorting options */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-400 uppercase hidden md:inline">{t('sortBy')}:</span>
                  <select
                    value={sortField}
                    onChange={(e) => handleSort(e.target.value as any)}
                    className="text-sm font-semibold border border-gray-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold text-gray-700"
                  >
                    <option value="created_at">{t('createdCol')}</option>
                    <option value="arrears_amount">{t('arrearsCol')}</option>
                    <option value="citizen_name">{t('citizen')}</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors bg-white shadow-sm flex items-center justify-center"
                    title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  >
                    {sortOrder === 'asc' ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Table or Loading state */}
            {loading && (
              <div className="py-24 text-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-500">Loading cases queue...</p>
              </div>
            )}

            {error && !loading && (
              <div className="p-8 text-center bg-red-50/50 border-y border-red-100 text-red-600 text-sm font-semibold">
                {error}
              </div>
            )}

            {!loading && !error && paginatedCases.length === 0 && (
              <div className="py-20 text-center text-gray-400 font-semibold text-sm">
                {search || filter ? t('noCasesMatch') : t('noCasesFound')}
              </div>
            )}

            {!loading && !error && paginatedCases.length > 0 && (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-150 bg-gray-50/40 text-gray-500">
                        <Th>{t('caseReference')}</Th>
                        <Th>{t('citizen')}</Th>
                        <Th>{t('emiratesId')}</Th>
                        <Th>{t('statusCol')}</Th>
                        <Th>{t('arrearsCol')}</Th>
                        <Th>{t('decisionCol')}</Th>
                        <Th>{t('actionsCol')}</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/70">
                      {paginatedCases.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-6 py-4.5 font-mono text-xs text-gray-500 font-semibold">
                            {c.id.split('-')[0].toUpperCase()}
                          </td>
                          <td className="px-6 py-4.5 font-semibold text-gray-900">
                            {lang === 'ar' ? c.citizen_name_ar : c.citizen_name_en}
                          </td>
                          <td className="px-6 py-4.5 font-mono text-xs text-gray-600 font-medium">
                            {c.emirates_id}
                          </td>
                          <td className="px-6 py-4.5">
                            <StatusBadge status={c.status} />
                          </td>
                          <td className="px-6 py-4.5 font-bold text-gray-900">
                            {c.arrears_amount != null ? (
                              <div className="flex items-center gap-1.5">
                                <span>{c.arrears_amount.toLocaleString(lang === 'ar' ? 'ar-AE' : 'en-US')}</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{t('aed')}</span>
                              </div>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4.5 text-gray-600 max-w-sm truncate text-xs font-medium">
                            {c.decision_summary ?? (
                              <span className="text-gray-400 italic font-normal">{t('noDecision')}</span>
                            )}
                          </td>
                          <td className="px-6 py-4.5">
                            <Link
                              href={`/staff/cases/${c.id}`}
                              className="inline-flex items-center gap-1 text-gold font-bold hover:text-gold-dark text-sm group"
                            >
                              <span>{t('viewDetails')}</span>
                              <svg className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile version */}
                <div className="md:hidden divide-y divide-gray-150">
                  {paginatedCases.map((c) => (
                    <div key={c.id} className="p-5 flex flex-col gap-3.5 hover:bg-slate-50/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-gray-400 font-semibold">
                          {c.id.split('-')[0].toUpperCase()}
                        </span>
                        <StatusBadge status={c.status} />
                      </div>
                      
                      <div>
                        <p className="font-bold text-gray-900 text-sm">
                          {lang === 'ar' ? c.citizen_name_ar : c.citizen_name_en}
                        </p>
                        <p className="text-xs text-gray-500 font-medium mt-1">
                          {c.emirates_id}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('arrearsCol')}</p>
                          <p className="font-extrabold text-gray-950 text-sm mt-0.5">
                            {c.arrears_amount != null
                              ? `${c.arrears_amount.toLocaleString(lang === 'ar' ? 'ar-AE' : 'en-US')} ${t('aed')}`
                              : '—'}
                          </p>
                        </div>
                        <Link
                          href={`/staff/cases/${c.id}`}
                          className="inline-flex items-center gap-1 bg-gold text-white font-bold text-xs py-2 px-4 rounded-xl hover:bg-gold-dark shadow-sm active:scale-95"
                        >
                          <span>{t('viewDetails')}</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls Footer */}
                <div className="px-6 py-4.5 border-t border-gray-200/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50/20 text-sm">
                  <div className="text-gray-500 font-semibold text-xs text-center sm:text-start">
                    {t('showingEntries')
                      .replace('{start}', (startIndex + 1).toString())
                      .replace('{end}', endIndex.toString())
                      .replace('{total}', totalItems.toString())}
                  </div>
                  
                  <div className="flex items-center justify-center gap-1.5">
                    {/* Previous page */}
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-500 disabled:opacity-40 disabled:hover:bg-transparent shadow-sm bg-white transition-colors flex items-center justify-center min-w-[36px] h-9"
                    >
                      <svg className="w-4 h-4 transform rotate-180 rtl:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      const isPageActive = currentPage === page;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-9 h-9 text-xs font-bold rounded-xl shadow-sm transition-all ${
                            isPageActive
                              ? 'bg-primary text-white'
                              : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}

                    {/* Next page */}
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-500 disabled:opacity-40 disabled:hover:bg-transparent shadow-sm bg-white transition-colors flex items-center justify-center min-w-[36px] h-9"
                    >
                      <svg className="w-4 h-4 transform rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
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
    <th className="px-6 py-3.5 text-start text-[10px] font-bold text-gray-400 uppercase tracking-widest">
      {children}
    </th>
  );
}
