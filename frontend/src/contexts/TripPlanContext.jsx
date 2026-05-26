import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '../hooks/AuthProfile'

const TripPlanContext = createContext()

const initialFormState = {
  tripType: '', // 'day' or 'overnight'
  city: '',
  hotel: '',
  date: '', // for day tour
  startTime: '', // for day tour
  startDate: '', // for overnight
  endDate: '', // for overnight
  maxAttractions: '',
  budget: '',
  paceLevel: 2,
  interests: [],
  attractions: [], // selected attractions from AttractionsPage
}

export function TripPlanProvider({ children }) {
  const [formData, setFormData] = useState(initialFormState)
  const [isLoaded, setIsLoaded] = useState(false)
  const { user } = useAuth() // Monitor auth state

  // Mark as loaded after initial render
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Clear trip data when user logs out (user becomes null)
  useEffect(() => {
    if (isLoaded && user === null) {
      setFormData(initialFormState)
    }
  }, [user, isLoaded])

  const clearFormData = () => {
    setFormData(initialFormState)
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
