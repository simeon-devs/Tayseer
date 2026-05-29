import { useLang } from '../lib/LanguageContext';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const { t } = useLang();
  const stepKeys = ['stepPersonal', 'stepFinancial', 'stepDocuments'];

  return (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const step = i + 1;
        const isDone = step < currentStep;
        const isActive = step === currentStep;

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${
                  isDone
                    ? 'bg-primary border-primary text-white'
                    : isActive
                    ? 'border-primary text-primary bg-white'
                    : 'border-gray-300 text-gray-400 bg-white'
                }`}
              >
                {isDone ? (
                  <CheckIcon />
                ) : (
                  <span>{step}</span>
                )}
              </div>
              <span
                className={`mt-1 text-xs font-medium hidden sm:block ${
                  isActive ? 'text-primary' : isDone ? 'text-primary' : 'text-gray-400'
                }`}
              >
                {t(stepKeys[i])}
              </span>
            </div>
            {step < totalSteps && (
              <div
                className={`h-0.5 w-12 sm:w-20 mx-1 sm:mx-2 ${
                  isDone ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
