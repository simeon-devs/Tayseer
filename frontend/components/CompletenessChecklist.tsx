import { useLang } from '../lib/LanguageContext';

interface DocStatus {
  key: string;
  labelKey: string;
  uploaded: boolean;
}

interface CompletenessChecklistProps {
  hasSalary: boolean;
  hasBank: boolean;
  hasId: boolean;
}

export default function CompletenessChecklist({
  hasSalary,
  hasBank,
  hasId,
}: CompletenessChecklistProps) {
  const { t } = useLang();

  const docs: DocStatus[] = [
    { key: 'salary', labelKey: 'salaryCertificate', uploaded: hasSalary },
    { key: 'bank', labelKey: 'bankStatement', uploaded: hasBank },
    { key: 'id', labelKey: 'emiratesIdDocument', uploaded: hasId },
  ];

  const uploadedCount = docs.filter((d) => d.uploaded).length;

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">{t('completenessTitle')}</h3>
        <span className="text-xs font-medium text-gray-500">
          {uploadedCount}/{docs.length}
        </span>
      </div>
      <ul className="space-y-2">
        {docs.map((doc) => (
          <li key={doc.key} className="flex items-center gap-2">
            <span
              className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                doc.uploaded ? 'bg-approved text-white' : 'bg-gray-200'
              }`}
            >
              {doc.uploaded ? (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </span>
            <span className={`text-sm ${doc.uploaded ? 'text-gray-800' : 'text-gray-500'}`}>
              {t(doc.labelKey)}
            </span>
            <span
              className={`ms-auto text-xs font-medium ${
                doc.uploaded ? 'text-approved' : 'text-gray-400'
              }`}
            >
              {doc.uploaded ? t('uploaded') : t('missing')}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
