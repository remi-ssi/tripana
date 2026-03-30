//routes for the app, using react-router-dom
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Auth from './pages/auth'
import Dashboard from './pages/Dashboard'
import TravelStylePage from './pages/user_preference'
import { AuthOnlyRoute, GuestOnlyRoute } from './routes/guards'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <GuestOnlyRoute>
              <Auth />
            </GuestOnlyRoute>
          }
        />
        <Route
          path="/user-preference"
          element={
            <AuthOnlyRoute requirePreferences={false}>
              <TravelStylePage />
            </AuthOnlyRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <AuthOnlyRoute requirePreferences={true}>
              <Dashboard />
            </AuthOnlyRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

