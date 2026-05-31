import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout } from './components/AuthLayout'
import { AppLayout } from './components/AppLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { TutorialRouteGuard } from './components/TutorialRouteGuard'
import { TutorialProvider } from './contexts/TutorialContext'
import { DashboardPage } from './pages/DashboardPage'
import { FeedPage } from './pages/FeedPage'
import { GraphPage } from './pages/GraphPage'
import { GroupDetailPage } from './pages/GroupDetailPage'
import { GroupsPage } from './pages/GroupsPage'
import { LoginPage } from './pages/LoginPage'
import { MemberGraphPage } from './pages/MemberGraphPage'
import { RegisterPage } from './pages/RegisterPage'
import { UnderstandingPage } from './pages/UnderstandingPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<TutorialProvider><AppLayout /></TutorialProvider>}>
            <Route element={<TutorialRouteGuard />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/graph" element={<GraphPage />} />
              <Route path="/dashboard" element={<UnderstandingPage />} />
              <Route path="/groups" element={<GroupsPage />} />
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/groups/:id" element={<GroupDetailPage />} />
              <Route path="/groups/:id/members/:userId" element={<MemberGraphPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
