import { ERROR_MESSAGES } from '../utils/errors'

export const validateBreaks = (includeBreaks, mealStates) => {
  const errors = {}

  if (includeBreaks === null || includeBreaks === undefined) {
    errors.breakChoice = ERROR_MESSAGES.BREAKS_REQUIRED
    return errors
  }

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
