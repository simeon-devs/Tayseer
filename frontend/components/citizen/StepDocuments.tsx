import { ChangeEvent, useRef, useState, DragEvent } from 'react';
import { useLang } from '../../lib/LanguageContext';

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
    <div className="space-y-6">
      {/* Upload Zone Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Card 1: Salary Certificate */}
        <UploadCard
          id="salary_certificate"
          title={t('salaryCertificate')}
          subtitle="salary_statement_2024.pdf (2.4 MB)" // Mock file size representation
          icon="salary"
          file={files.salary_certificate}
          onFileChange={(file) => onChange('salary_certificate', file)}
        />

        {/* Card 2: Bank Statement */}
        <UploadCard
          id="bank_statement"
          title={t('bankStatement')}
          subtitle="Drag and drop or click to upload"
          icon="bank"
          file={files.bank_statement}
          onFileChange={(file) => onChange('bank_statement', file)}
        />

        {/* Card 3: Emirates ID Document */}
        <UploadCard
          id="emirates_id"
          title={t('emiratesIdDocument')}
          subtitle="Copy of front and back sides"
          icon="id"
          file={files.emirates_id}
          onFileChange={(file) => onChange('emirates_id', file)}
        />

        {/* Card 4: Add Other Document (Optional Mock) */}
        <UploadCard
          id="other"
          title="Add Other Document (Optional)"
          subtitle=""
          icon="add"
          onFileChange={() => {}}
        />
      </div>
    </div>
  );
}

interface UploadCardProps {
  id: keyof DocumentFiles | 'other';
  title: string;
  subtitle: string;
  icon: 'salary' | 'bank' | 'id' | 'add';
  file?: File;
  onFileChange: (file: File | undefined) => void;
}

function UploadCard({ id, title, subtitle, icon, file, onFileChange }: UploadCardProps) {
  const { t } = useLang();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleClick = () => {
    if (id === 'other') return; // Mock zone
    inputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileChange(selectedFile);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (id === 'other') return;
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (id === 'other') return;

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      onFileChange(droppedFile);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileChange(undefined);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  // Check if this card represents a mock or actual uploaded file
  const isUploaded = !!file || (id === 'salary_certificate' && !file && false); // Keep clean logic

  if (file) {
    // Determine a formatted mock size for visual accuracy (matching the screenshot)
    const formattedSize = file.size
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : '2.4 MB';

    return (
      <div
        onClick={handleClick}
        className="border-2 border-dashed border-[#027A48] border-opacity-40 bg-[#EAF5EE] rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-opacity-80 transition-all select-none relative group h-48"
      >
        {/* Green Checked Icon */}
        <div className="w-12 h-12 rounded-full bg-[#027A48] flex items-center justify-center mb-3 text-white">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Title */}
        <p className="text-sm font-bold text-[#027A48] mb-1">{title}</p>
        
        {/* Filename and Size */}
        <p className="text-xs text-[#027A48] text-opacity-80 truncate max-w-xs px-2 mb-3">
          {file.name} ({formattedSize})
        </p>

        {/* Replace Link */}
        <button
          type="button"
          onClick={handleRemove}
          className="text-xs font-semibold text-[#027A48] underline hover:text-opacity-85"
        >
          Replace File
        </button>

        {/* Hidden Input */}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="sr-only"
          onChange={handleFileChange}
        />
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all h-48 select-none ${
        id === 'other'
          ? 'border-gray-200 bg-[#FAFBFD] cursor-default'
          : isDragOver
          ? 'border-gold bg-gold bg-opacity-5 cursor-pointer'
          : 'border-gray-200 bg-white hover:border-gold hover:bg-[#FAF9F5] cursor-pointer'
      }`}
    >
      {/* Icon Area */}
      <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4 text-gray-400 group-hover:text-gold transition-colors">
        {icon === 'salary' && <SalaryIcon />}
        {icon === 'bank' && <BankIcon />}
        {icon === 'id' && <IdIcon />}
        {icon === 'add' && <AddIcon />}
      </div>

      {/* Texts */}
      <p className="text-sm font-bold text-gray-700 mb-1">{title}</p>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}

      {/* Hidden Input */}
      {id !== 'other' && (
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="sr-only"
          onChange={handleFileChange}
        />
      )}
    </div>
  );
}

/* Icon components for visual excellence */
function SalaryIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function BankIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function IdIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
    </svg>
  );
}

function AddIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}
