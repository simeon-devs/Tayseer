import { useLang } from '../../lib/LanguageContext';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  processing: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  escalated: 'bg-amber-100 text-amber-800',
  overridden: 'bg-purple-100 text-purple-700',
  closed: 'bg-gray-200 text-gray-600',
  rejected: 'bg-red-100 text-red-700',
  additional_info_required: 'bg-cyan-100 text-cyan-700',
};

const STATUS_DOT: Record<string, string> = {
  pending: 'bg-gray-500',
  processing: 'bg-blue-500',
  approved: 'bg-green-600',
  escalated: 'bg-amber-500',
  overridden: 'bg-purple-500',
  closed: 'bg-gray-400',
  rejected: 'bg-red-500',
  additional_info_required: 'bg-cyan-500',
};

interface Props {
  status: string;
}

export default function StatusBadge({ status }: Props) {
  const { t } = useLang();
  const style = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-700';
  const dot = STATUS_DOT[status] ?? 'bg-gray-500';
  const label = t(status) !== status ? t(status) : status;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      {label}
    </span>
  );
}
