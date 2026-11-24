import { createElement, useEffect, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  Database,
  Loader2,
  Lock,
  Trash2,
} from 'lucide-react'

const STEPS = [
  {
    icon: AlertTriangle,
    tone: 'amber',
    title: 'Deactivate your account?',
    body: 'Are you sure you want to deactivate your account? This will begin the permanent account deletion process.',
    cancelLabel: 'No, keep my account',
    nextLabel: 'Yes, continue',
  },
  {
    icon: Database,
    tone: 'blue',
    title: 'Your data will be deleted',
    body: 'All of your saved itineraries, trip plans, places, and account information will be permanently removed from our system.',
    cancelLabel: 'Cancel',
    nextLabel: 'Next',
  },
  {
    icon: Lock,
    tone: 'blue',
    title: 'This cannot be undone',
    body: 'Once your account is deleted, there is no way to recover it. You will lose access to all features and your data cannot be restored.',
    cancelLabel: 'Cancel',
    nextLabel: 'Next',
  },
  {
    icon: Trash2,
    tone: 'red',
    title: 'Confirm account deletion',
    body: 'This is your final confirmation. Your account and all associated data will be permanently deleted immediately.',
    cancelLabel: 'Cancel',
    confirmLabel: 'Delete my account',
    isFinal: true,
  },
]

export default function DeactivateModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
  error = '',
}) {
  const [step, setStep] = useState(0)

  const handleClose = () => {
    if (!isDeleting) {
      setStep(0)
      onClose?.()
    }
  }

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && !isDeleting) {
        setStep(0)
        onClose?.()
      }
    }
    if (isOpen) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, isDeleting, onClose])

  if (!isOpen) return null

  const currentStep = STEPS[step] || STEPS[0]
  const totalSteps = STEPS.length

  const iconToneClasses =
    currentStep.tone === 'red'
      ? 'bg-red-50 text-red-600'
      : currentStep.tone === 'amber'
        ? 'bg-amber-50 text-amber-600'
        : 'bg-blue-50 text-blue-600'

  const handleNext = () => {
    setStep((s) => Math.min(s + 1, totalSteps - 1))
  }

  const handleConfirm = () => {
    onConfirm?.()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-[1px]"
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="deactivate-modal-title"
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white font-['Poppins'] text-slate-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Progress Bar */}
        <div className="h-1 bg-slate-100">
          <div
            className={`h-1 transition-all duration-300 ${
              currentStep.isFinal ? 'bg-red-600' : 'bg-blue-600'
            }`}
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>

        <div className="p-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-between text-xs text-slate-500 tabular-nums">
            <span>Account Deletion</span>
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, index) => (
                <span
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    index === step
                      ? currentStep.isFinal
                        ? 'w-5 bg-red-600'
                        : 'w-5 bg-blue-600'
                      : index < step
                        ? 'w-1.5 bg-blue-600'
                        : 'w-1.5 bg-slate-200'
                  }`}
                />
              ))}
              <span className="ml-1 font-medium text-slate-600">
                {step + 1}/{totalSteps}
              </span>
            </div>
          </div>

          {/* Icon + Title + Body */}
          <div className="mt-5 flex flex-col items-center text-center">
            <div
              className={`grid h-12 w-12 place-items-center rounded-xl ${iconToneClasses}`}
            >
              {createElement(currentStep.icon, { size: 22, strokeWidth: 1.85 })}
            </div>

            <h2
              id="deactivate-modal-title"
              className="mt-4 font-['Nunito'] text-lg font-semibold text-slate-900"
            >
              {currentStep.title}
            </h2>

            <p
              className={`mt-2 text-sm leading-relaxed ${
                currentStep.isFinal ? 'font-medium text-red-600' : 'text-slate-500'
              }`}
            >
              {currentStep.body}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700"
            >
              <AlertCircle size={15} strokeWidth={1.85} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleClose}
              className="inline-flex min-h-[42px] flex-1 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none disabled:opacity-50"
            >
              {currentStep.cancelLabel}
            </button>

            {currentStep.isFinal ? (
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirm}
                className="inline-flex min-h-[42px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white shadow-2xs transition-colors hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>{currentStep.confirmLabel}</span>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex min-h-[42px] flex-1 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-2xs transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                {currentStep.nextLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
