import { useState } from 'react'
import { validateTripPlan } from '../validators/tripPlanValidator'

/**
 * Custom hook to manage trip plan form state, validation, and error handling
 */
export function useFormHandler(tripType, updateFormDataToContext) {
  const [form, setForm] = useState({
    city: '',
    hotel: '',
    date: '',
    startTime: '',
    startDate: '',
    endDate: '',
    maxAttractions: '',
  })

  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Load saved data from context
  const loadFormData = (formData) => {
    if (formData && Object.keys(formData).some((key) => formData[key])) {
      setForm(formData)
    }
  }

  // Handle field change with validation
  const handleChange = (field, value) => {
    const updatedForm = { ...form, [field]: value }
    const newErrors = validateTripPlan(updatedForm, tripType)
    setForm(updatedForm)
    updateFormDataToContext(field, value)
    setTouched((prev) => ({ ...prev, [field]: true }))

    // Update errors for relevant fields
    setErrors((prev) => {
      const next = { ...prev }
      const fieldsToCheck =
        field === 'startDate' || field === 'endDate'
          ? [field, 'startDate', 'endDate']
          : [field]
      fieldsToCheck.forEach((f) => {
        if (newErrors[f]) next[f] = newErrors[f]
        else delete next[f]
      })
      return next
    })
  }

  // Validate entire form
  const validateForm = () => {
    const newErrors = validateTripPlan(form, tripType)
    const fieldsToTouch =
      tripType === 'day'
        ? ['city', 'date', 'startTime']
        : ['city', 'hotel', 'startDate', 'endDate', 'maxAttractions']
    setTouched(
      fieldsToTouch.reduce((acc, field) => ({ ...acc, [field]: true }), {})
    )
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Clear specific field
  const clearField = (field) => {
    handleChange(field, '')
  }

  return {
    form,
    errors,
    touched,
    handleChange,
    validateForm,
    clearField,
    loadFormData,
  }
}
