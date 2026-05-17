import { createContext, useContext, useState, useEffect } from 'react'

const TripPlanContext = createContext()

const STORAGE_KEY = 'tripPlanFormData'

const initialFormState = {
  city: '',
  hotel: '',
  startDate: '',
  endDate: '',
  maxAttractions: '',
  budget: '',
}

export function TripPlanProvider({ children }) {
  const [formData, setFormData] = useState(initialFormState)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setFormData(parsed)
      } catch (error) {
        console.error('Failed to load trip plan data:', error)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
    }
  }, [formData, isLoaded])

  const clearFormData = () => {
    setFormData(initialFormState)
    localStorage.removeItem(STORAGE_KEY)
  }

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updateMultipleFields = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  return (
    <TripPlanContext.Provider
      value={{
        formData,
        updateFormData,
        updateMultipleFields,
        clearFormData,
        isLoaded,
      }}
    >
      {children}
    </TripPlanContext.Provider>
  )
}

export function useTripPlan() {
  const context = useContext(TripPlanContext)
  if (!context) {
    throw new Error('useTripPlan must be used within a TripPlanProvider')
  }
  return context
}
