import { itineraryService } from './iteneraryService'

export const generateItinerary = (formData) =>
  itineraryService.generate(formData)
