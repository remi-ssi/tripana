import { ERROR_MESSAGES } from '../utils/errors'

export const validateBreaks = (includeBreaks, mealStates) => {
  const errors = {}

  // Check if includeBreaks is explicitly set (it's always true or false, but we can validate concept)
  // Actually, includeBreaks is always a boolean, so this validation is more about ensuring the user made a conscious choice
  // In this case, we'll consider it valid if they've selected yes or no (which they always have)
  
  if (includeBreaks) {
    // If yes is selected, at least one meal must be selected
    const hasSelectedMeal = Object.values(mealStates).some((meal) => meal.checked)
    if (!hasSelectedMeal) {
      errors.meals = ERROR_MESSAGES.MEALS_REQUIRED
    }

    // If yes is selected, all selected meals must have times
    const hasMissingTime = Object.values(mealStates).some((meal) => meal.checked && !meal.time)
    if (hasMissingTime) {
      errors.mealTime = ERROR_MESSAGES.MEAL_TIME_REQUIRED
    }
  }

  return errors
}

export const isBreaksValid = (errors) => {
  return Object.keys(errors).length === 0
}
