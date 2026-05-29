import { useLang } from '../../lib/LanguageContext';

const STATUSES = ['', 'pending', 'processing', 'approved', 'escalated', 'overridden', 'closed'];

interface Props {
  selected: string;
  onSelect: (status: string) => void;
}

export default function CaseFilters({ selected, onSelect }: Props) {
  const { t } = useLang();

  return (
    <div className="flex flex-wrap gap-2">
      {STATUSES.map((s) => {
        const isActive = selected === s;
        const label = s === '' ? t('allCases') : t(s);
        return (
          <button
            key={s}
            onClick={() => onSelect(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
