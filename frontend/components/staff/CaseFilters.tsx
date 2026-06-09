import { useLang } from '../../lib/LanguageContext';

const STATUSES = ['', 'pending', 'processing', 'approved', 'escalated', 'overridden', 'closed'];

interface Props {
  selected: string;
  onSelect: (status: string) => void;
  counts?: Record<string, number>;
}

export default function CaseFilters({ selected, onSelect, counts }: Props) {
  const { t } = useLang();

  return (
    <div className="flex flex-wrap gap-2 p-1.5 bg-gray-50/80 rounded-2xl border border-gray-200/50 w-full overflow-x-auto no-scrollbar">
      {STATUSES.map((s) => {
        const isActive = selected === s;
        const label = s === '' ? t('allCases') : t(s);
        
        let count = 0;
        if (counts) {
          count = s === '' ? (counts['all'] || 0) : (counts[s] || 0);
        }

        return (
          <button
            key={s}
            onClick={() => onSelect(s)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap active:scale-[0.98] ${
              isActive
                ? 'bg-primary text-white shadow-sm shadow-primary/20'
                : 'text-gray-600 hover:text-primary hover:bg-white border border-transparent hover:border-gray-200/60'
            }`}
          >
            <span>{label}</span>
            {counts && (
              <span
                className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200/80 text-gray-700'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
