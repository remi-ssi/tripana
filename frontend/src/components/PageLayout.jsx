import { useNavigate } from 'react-router-dom'
import ProgressBar from './ProgressBar'

/**
 * PageLayout — shared wrapper used across all wizard pages.
 *
 * @param {{ currentStep: string, title: string, subtitle?: string, children: React.ReactNode }} props
 */
export default function PageLayout({ currentStep, title, subtitle, children }) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back to Dashboard */}
      <div className="px-6 pt-5">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-700 transition-colors text-sm font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      {/* Page Header */}
      <div className="text-center pt-4 pb-2">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>

      {/* Progress Bar */}
      <ProgressBar currentStep={currentStep} />

      {/* Page Content */}
      <div className="max-w-xl mx-auto px-4 pb-12">
        {children}
      </div>
    </div>
  )
}
