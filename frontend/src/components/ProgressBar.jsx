import { useNavigate } from 'react-router-dom'
import { MapPin, SlidersHorizontal, Compass, Clock, FileText, Check } from 'lucide-react'

const steps = [
  {
    key: 'trip-plan',
    label: 'Trip Plan',
    path: '/trip-plan',
    Icon: MapPin,
  },
  {
    key: 'preference',
    label: 'Preferences',
    path: '/preference',
    Icon: SlidersHorizontal,
  },
  {
    key: 'attractions',
    label: 'Attractions',
    path: '/attractions',
    Icon: Compass,
  },
  {
    key: 'break',
    label: 'Schedule',
    path: '/break',
    Icon: Clock,
  },
  {
    key: 'summary',
    label: 'Summary',
    path: '/summary',
    Icon: FileText,
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
    <nav aria-label="Trip planning progress" className="w-full max-w-3xl mx-auto px-4 py-6">
      <ol className="flex items-center justify-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex
          const isActive = index === currentIndex
          const isClickable = index < currentIndex
          const StepIcon = step.Icon

          return (
            <li key={step.key} className="flex items-center">
              <div
                onClick={() => isClickable && navigate(step.path)}
                className={`group flex flex-col items-center ${
                  isClickable
                    ? 'cursor-pointer'
                    : isActive
                    ? 'cursor-default'
                    : 'cursor-not-allowed'
                }`}
              >
                <button
                  type="button"
                  disabled={!isClickable && !isActive}
                  aria-current={isActive ? 'step' : undefined}
                  aria-label={`Step ${index + 1}: ${step.label}`}
                  className={`
                    relative flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2
                    ${isActive
                      ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100 cursor-default'
                      : isCompleted
                      ? 'bg-blue-600 border-blue-600 text-white cursor-pointer group-hover:bg-blue-700 group-hover:border-blue-700'
                      : 'bg-white border-slate-200 text-slate-400 cursor-not-allowed'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[2.25]" />
                  ) : (
                    <StepIcon className="w-4 h-4 stroke-[1.75]" />
                  )}
                </button>
                <span
                  className={`mt-2 text-xs font-medium whitespace-nowrap transition-colors duration-200 ${
                    isActive
                      ? 'text-blue-600 font-semibold'
                      : isCompleted
                      ? 'text-slate-700 group-hover:text-blue-600'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 w-8 sm:w-14 md:w-20 mx-1.5 sm:mx-2 mb-6 transition-colors duration-300 rounded-full ${
                    index < currentIndex ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
