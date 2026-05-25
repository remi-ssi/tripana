//routes for the app, using react-router-dom
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Auth from './pages/auth'
import Dashboard from './pages/Dashboard'
import TravelStylePage from './pages/user_preference'
import TripPlanPage from './pages/TripPlanPage'
import AttractionsPage from './pages/AttractionsPage'
import PreferencePage from './pages/PreferencePage'
import BreakPage from './pages/BreakPage'
import SummaryPage from './pages/SummaryPage'
import ForgotPassword from './pages/forgotPassword'
import ChangePasswordFull from './pages/changePass'
import LandingPage from './pages/landing_page'
import PrivacyPolicy from './pages/privacy'
import TermsAndConditions from './pages/termsAndCondition'
import { AuthOnlyRoute, GuestOnlyRoute } from './routes/guards'
import { TripPlanProvider } from './contexts/TripPlanContext'

function App() {
  return (
    <TripPlanProvider>
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
          path="/forgot-password"
          element={
            <GuestOnlyRoute>
              <ForgotPassword />
            </GuestOnlyRoute>
          }
        />
        {/* Added: shared change-password page for logged-in and forgot-password flows. */}
        <Route path="/change-password" element={<ChangePasswordFull />} />
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
        <Route
          path="/trip-plan"
          element={
            <AuthOnlyRoute requirePreferences={true}>
              <TripPlanPage />
            </AuthOnlyRoute>
          }
        />
        <Route
          path="/attractions"
          element={
            <AuthOnlyRoute requirePreferences={true}>
              <AttractionsPage />
            </AuthOnlyRoute>
          }
        />
        <Route
          path="/preference"
          element={
            <AuthOnlyRoute requirePreferences={true}>
              <PreferencePage />
            </AuthOnlyRoute>
          }
        />
        <Route
          path="/break"
          element={
            <AuthOnlyRoute requirePreferences={true}>
              <BreakPage />
            </AuthOnlyRoute>
          }
        />
        <Route
          path="/summary"
          element={
            <AuthOnlyRoute requirePreferences={true}>
              <SummaryPage />
            </AuthOnlyRoute>
          }
        />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
    </TripPlanProvider>
  )
}

export default App

