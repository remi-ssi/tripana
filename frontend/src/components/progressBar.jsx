import { useNavigate } from 'react-router-dom'

const steps = [
  {
    key: 'trip-plan',
    label: 'Trip Plan',
    path: '/trip-plan',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.083 3.701-5.125 3.701-9.077 0-4.715-3.73-8.293-8-8.293s-8 3.578-8 8.293c0 3.952 1.757 6.994 3.701 9.077a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    key: 'preference',
    label: 'Preference',
    path: '/preference',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    key: 'attractions',
    label: 'Attractions',
    path: '/attractions',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M8.25 10.875a2.625 2.625 0 115.25 0 2.625 2.625 0 01-5.25 0z" />
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.125 4.5a4.125 4.125 0 102.338 7.524l2.007 2.006a.75.75 0 101.06-1.06l-2.006-2.007a4.125 4.125 0 00-3.399-6.463z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    key: 'break',
    label: 'Break',
    path: '/break',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    key: 'summary',
    label: 'Summary',
    path: '/summary',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75-6.75a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5z" clipRule="evenodd" />
      </svg>
    ),
  },
]

/**
 * ProgressBar — reusable step indicator for the Trip Planner wizard.
 *
 * @param {{ currentStep: string }} props
 *   currentStep — one of: 'trip-plan' | 'attractions' | 'preference' | 'break' | 'summary'
 */
export default function ProgressBar({ currentStep }) {
  const navigate = useNavigate()
  const currentIndex = steps.findIndex((s) => s.key === currentStep)

  return (
    <div className="flex items-center justify-center w-full px-4 py-6">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex
        const isActive = index === currentIndex
        const isClickable = index < currentIndex // allow going back to completed steps

        return (
          <div key={step.key} className="flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => isClickable && navigate(step.path)}
                disabled={!isClickable && !isActive}
                className={`
                  relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                  ${isActive
                    ? 'bg-blue-700 border-blue-700 text-white shadow-lg shadow-blue-200'
                    : isCompleted
                    ? 'bg-blue-700 border-blue-700 text-white cursor-pointer hover:bg-blue-800'
                    : 'bg-white border-gray-300 text-gray-400 cursor-default'
                  }
                `}
                aria-label={step.label}
              >
                {step.icon}
              </button>
              <span
                className={`mt-2 text-xs font-medium whitespace-nowrap transition-colors duration-300 ${
                  isActive
                    ? 'text-blue-700'
                    : isCompleted
                    ? 'text-blue-600'
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line — don't render after last step */}
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 w-12 sm:w-16 md:w-20 mx-1 mb-5 transition-colors duration-300 ${
                  index < currentIndex ? 'bg-blue-700' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
