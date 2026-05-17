import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProgressBar from './ProgressBar'
import { useTripPlan } from '../contexts/TripPlanContext'

/**
 * PageLayout — shared wrapper used across all wizard pages.
 *
 * @param {{ currentStep: string, title: string, subtitle?: string, contentClassName?: string, children: React.ReactNode }} props
 */
export default function PageLayout({ currentStep, title, subtitle, contentClassName = 'max-w-xl', children }) {
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
    <div className="min-h-screen bg-gray-50">
      {/* Back to Dashboard */}
      <div className="px-6 pt-5">
        <button
          onClick={handleBackToDashboard}
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
      <div className={`${contentClassName} mx-auto px-4 pb-12`}>
        {children}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Go Back to Dashboard?</h2>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to go back to the dashboard? Your trip plan data will be cleared.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelBack}
                className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 text-gray-700 font-semibold hover:border-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBack}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
