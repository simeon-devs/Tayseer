import { useLang } from '../../lib/LanguageContext';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-gray-50 text-gray-600 border border-gray-200/65',
  processing: 'bg-blue-50 text-blue-700 border border-blue-200/50',
  approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50',
  escalated: 'bg-amber-50 text-amber-800 border border-amber-200/50',
  overridden: 'bg-purple-50 text-purple-700 border border-purple-200/50',
  closed: 'bg-gray-100 text-gray-600 border border-gray-200/60',
  rejected: 'bg-red-50 text-red-700 border border-red-200/50',
  additional_info_required: 'bg-cyan-50 text-cyan-700 border border-cyan-200/50',
};

const STATUS_DOT: Record<string, string> = {
  pending: 'bg-gray-400',
  processing: 'bg-blue-500',
  approved: 'bg-emerald-500',
  escalated: 'bg-amber-500',
  overridden: 'bg-purple-500',
  closed: 'bg-gray-500',
  rejected: 'bg-red-500',
  additional_info_required: 'bg-cyan-500',
};

interface Props {
  status: string;
}

export default function StatusBadge({ status }: Props) {
  const { t } = useLang();
  const style = STATUS_STYLES[status] ?? 'bg-gray-50 text-gray-600 border border-gray-200';
  const dot = STATUS_DOT[status] ?? 'bg-gray-400';
  const label = t(status) !== status ? t(status) : status;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      <span>{label}</span>
    </span>
  );
}
