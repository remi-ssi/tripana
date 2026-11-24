import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import ProgressBar from '../components/ProgressBar'
import { useTripPlan } from '../contexts/TripPlanContext'

/**
 * PageLayout — shared wrapper used across all wizard pages.
 *
 * @param {{ currentStep: string, title: string, subtitle?: string, contentClassName?: string, children: React.ReactNode }} props
 */
export default function PageLayout({ currentStep, title, subtitle, contentClassName = 'max-w-3xl', children }) {
  const navigate = useNavigate()
  const { clearFormData } = useTripPlan()
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const handleBackToDashboard = () => {
    setShowConfirmModal(true)
  }

  const handleConfirmBack = () => {
    clearFormData()
    navigate('/dashboard')
    setShowConfirmModal(false)
  }

  const handleCancelBack = () => {
    setShowConfirmModal(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Bar */}
      <header className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <button
          type="button"
          onClick={handleBackToDashboard}
          className="group inline-flex items-center gap-2 px-3 py-2 -ml-3 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2] transition-transform duration-200 group-hover:-translate-x-0.5" />
          Back to Dashboard
        </button>
      </header>

      {/* Page Header */}
      <div className="max-w-3xl mx-auto text-center px-4 pt-3 pb-2">
        <h1
          className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm sm:text-base text-slate-600 mt-1.5 max-w-xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <ProgressBar currentStep={currentStep} />

      {/* Page Content */}
      <main className={`${currentStep === 'summary' ? 'max-w-6xl' : contentClassName} mx-auto px-4 sm:px-6 pb-16`}>
        {children}
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={handleCancelBack}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0 text-red-600">
                <AlertTriangle className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="flex-1">
                <h2
                  className="text-lg font-semibold text-slate-900"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  Return to Dashboard?
                </h2>
                <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                  Leaving now will clear your current trip setup progress. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancelBack}
                className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={handleConfirmBack}
                className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              >
                Discard &amp; Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
