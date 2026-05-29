import { ChangeEvent, useRef } from 'react';
import { useLang } from '../../lib/LanguageContext';
import CompletenessChecklist from '../CompletenessChecklist';

export interface DocumentFiles {
  salary_certificate?: File;
  bank_statement?: File;
  emirates_id?: File;
}

interface Props {
  files: DocumentFiles;
  onChange: (type: keyof DocumentFiles, file: File | undefined) => void;
}

export default function StepDocuments({ files, onChange }: Props) {
  const { t } = useLang();

  return (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <p className="text-sm text-gray-600">{t('documentsSubtitle')}</p>
      </div>

      <UploadRow
        id="salary-upload"
        label={t('salaryCertificate')}
        file={files.salary_certificate}
        onFile={(f) => onChange('salary_certificate', f)}
      />
      <UploadRow
        id="bank-upload"
        label={t('bankStatement')}
        file={files.bank_statement}
        onFile={(f) => onChange('bank_statement', f)}
      />
      <UploadRow
        id="id-upload"
        label={t('emiratesIdDocument')}
        file={files.emirates_id}
        onFile={(f) => onChange('emirates_id', f)}
      />

      <div className="mt-6">
        <CompletenessChecklist
          hasSalary={!!files.salary_certificate}
          hasBank={!!files.bank_statement}
          hasId={!!files.emirates_id}
        />
      </div>
    </div>
  );
}

interface UploadRowProps {
  id: string;
  label: string;
  file?: File;
  onFile: (f: File | undefined) => void;
}

function UploadRow({ id, label, file, onFile }: UploadRowProps) {
  const { t } = useLang();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    onFile(e.target.files?.[0]);
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <DocumentIcon hasFile={!!file} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800">{label}</p>
            <p className="text-xs text-gray-500 truncate max-w-xs">
              {file ? file.name : t('noFileChosen')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {file && (
            <button
              type="button"
              onClick={() => {
                onFile(undefined);
                if (inputRef.current) inputRef.current.value = '';
              }}
              className="text-xs text-red-500 hover:text-red-700 font-medium"
            >
              ✕
            </button>
          )}
          <label
            htmlFor={id}
            className="cursor-pointer px-4 py-2 text-sm font-semibold text-primary border border-primary rounded-lg hover:bg-surface transition-colors"
          >
            {t('chooseFile')}
          </label>
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            className="sr-only"
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
}

function DocumentIcon({ hasFile }: { hasFile: boolean }) {
  return (
    <div
      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
        hasFile ? 'bg-approved bg-opacity-10' : 'bg-gray-100'
      }`}
    >
      <svg
        className={`w-5 h-5 ${hasFile ? 'text-approved' : 'text-gray-400'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
        />
      </svg>
    </div>
  );
}
