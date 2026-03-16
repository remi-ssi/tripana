import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ItineraryPage from './pages/ItineraryPage'
import NotFoundPage from './pages/NotFoundPage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/itineraries" element={<ItineraryPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes
